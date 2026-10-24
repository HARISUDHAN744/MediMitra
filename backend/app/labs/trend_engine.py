"""
Trend Prediction Engine for Laboratory Biomarkers.
Computes explainable historical trajectories using Ordinary Least Squares (OLS)
regression across report timelines. Projects a forecast range with visible uncertainty bands.
Strictly adheres to non-diagnostic safety guidelines.
"""

import math
from datetime import datetime
from typing import List, Dict, Any, Optional, Literal, Tuple
from pydantic import BaseModel, Field
from app.labs.unit_normaliser import resolve_canonical_key, parse_numeric_value
from app.labs.reference_ranges import REFERENCE_TABLE


class HistoricalDataPoint(BaseModel):
    date: str
    value: float
    unit: str
    report_id: Optional[str] = None
    status: Optional[str] = None


class ProjectedBand(BaseModel):
    projected_date: str
    lower_bound: float
    midpoint: float
    upper_bound: float
    uncertainty_margin: float


class TrendResponse(BaseModel):
    test_key: str
    test_name: str
    unit: str
    panel: str
    data_points_count: int
    data_points: List[HistoricalDataPoint]
    status: Literal["sufficient_data", "insufficient_data"]
    trend_label: Literal["Improving", "Stable", "Worsening", "Unclear", "Not Enough Data"]
    reason: str
    slope_per_month: Optional[float] = None
    r_squared: Optional[float] = None
    projected_range: Optional[ProjectedBand] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    disclaimer: str = "Trend estimate, not a diagnosis. Intended strictly for physician discussion."


def parse_date_to_timestamp(d_str: str) -> float:
    """Parses various date strings into unix epoch timestamp in seconds."""
    formats = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%b %d, %Y", "%d %b %Y"]
    for fmt in formats:
        try:
            return datetime.strptime(d_str.strip(), fmt).timestamp()
        except ValueError:
            continue
    # Fallback: return current timestamp
    return datetime.utcnow().timestamp()


def compute_ols_regression(x_vals: List[float], y_vals: List[float]) -> Tuple[float, float, float, float]:
    """
    Computes slope, intercept, R-squared, and standard error of regression (residual std dev).
    """
    n = len(x_vals)
    if n < 2:
        return 0.0, y_vals[0] if y_vals else 0.0, 0.0, 0.0

    mean_x = sum(x_vals) / n
    mean_y = sum(y_vals) / n

    ss_xx = sum((x - mean_x) ** 2 for x in x_vals)
    ss_yy = sum((y - mean_y) ** 2 for y in y_vals)
    ss_xy = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_vals, y_vals))

    if ss_xx == 0:
        return 0.0, mean_y, 0.0, 0.0

    slope = ss_xy / ss_xx
    intercept = mean_y - slope * mean_x

    # Residuals
    residuals = [y - (intercept + slope * x) for x, y in zip(x_vals, y_vals)]
    ss_res = sum(r ** 2 for r in residuals)

    r_squared = 1.0 - (ss_res / ss_yy) if ss_yy > 0 else 0.0
    r_squared = max(0.0, min(1.0, r_squared))

    degrees_freedom = max(1, n - 2)
    std_error = math.sqrt(ss_res / degrees_freedom)

    return slope, intercept, r_squared, std_error


def determine_clinical_direction(test_key: str, slope_per_month: float) -> Tuple[str, str]:
    """
    Determines whether a slope represents an Improving, Stable, or Worsening trend.
    For HbA1c, FBS, LDL, Triglycerides, Creatinine, etc., higher is worsening.
    For HDL, Hemoglobin, Vitamin D, Vitamin B12, higher is improving (within bounds).
    """
    # Lower is better / higher is worse
    higher_is_worse = {
        "FBS", "PPBS", "HBA1C", "TOTAL_CHOLESTEROL", "LDL",
        "TRIGLYCERIDES", "CREATININE", "UREA", "URIC_ACID", "SGOT", "SGPT", "TSH"
    }

    # Higher is better / lower is worse
    higher_is_better = {
        "HB", "HDL", "VITAMIN_D", "VITAMIN_B12"
    }

    # Neutral / bounded
    # WBC, PLATELETS

    abs_slope = abs(slope_per_month)

    # Threshold for stability
    if test_key == "HBA1C":
        stability_threshold = 0.03  # % change per month (clinically significant over 60-90 days)
    elif test_key in ("CREATININE", "TSH"):
        stability_threshold = 0.04
    elif test_key == "HB":
        stability_threshold = 0.15
    else:
        stability_threshold = 2.0  # general mg/dL

    if abs_slope < stability_threshold:
        return "Stable", f"Value has remained relatively stable over recent reports (rate: {slope_per_month:+.2f}/month)."

    if test_key in higher_is_worse:
        if slope_per_month > 0:
            return "Worsening", f"Values show an upward trajectory across recent reports ({slope_per_month:+.2f}/month)."
        else:
            return "Improving", f"Values show a downward trajectory toward reference limits ({slope_per_month:+.2f}/month)."

    if test_key in higher_is_better:
        if slope_per_month > 0:
            return "Improving", f"Values show a positive upward trajectory ({slope_per_month:+.2f}/month)."
        else:
            return "Worsening", f"Values show a downward trajectory away from target baseline ({slope_per_month:+.2f}/month)."

    return "Stable", f"Values trajectory average rate: {slope_per_month:+.2f}/month."


def analyze_test_trend(
    test_identifier: str,
    raw_history: List[Dict[str, Any]],
    user_age: Optional[int] = 35,
    user_sex: Optional[str] = "male"
) -> TrendResponse:
    """
    Evaluates historical trend for a single biomarker across multiple reports.
    Requires at least 3 historical points for projection.
    """
    canonical_key = resolve_canonical_key(test_identifier) or test_identifier.upper()
    ref_info = REFERENCE_TABLE.get(canonical_key)

    test_name = ref_info["canonical_name"] if ref_info else test_identifier
    unit = ref_info["unit"] if ref_info else "units"
    panel = ref_info["panel"] if ref_info else "General"

    ref_low = None
    ref_high = None
    if ref_info:
        demo_key = "child" if (user_age and user_age < 18) else ("adult_female" if user_sex and user_sex.lower().startswith("f") else "adult_male")
        demo = ref_info["demographics"].get(demo_key, ref_info["demographics"]["adult_male"])
        ref_low = demo.get("low")
        ref_high = demo.get("high")

    # Filter and sort data points
    clean_points: List[HistoricalDataPoint] = []
    for item in raw_history:
        d_str = item.get("date") or item.get("document_date") or ""
        v_num = parse_numeric_value(str(item.get("value", "")))
        if d_str and v_num is not None:
            clean_points.append(
                HistoricalDataPoint(
                    date=d_str,
                    value=v_num,
                    unit=item.get("unit") or unit,
                    report_id=item.get("report_id"),
                    status=item.get("status")
                )
            )

    # Sort chronologically by date
    clean_points.sort(key=lambda p: parse_date_to_timestamp(p.date))
    n = len(clean_points)

    if n < 3:
        return TrendResponse(
            test_key=canonical_key,
            test_name=test_name,
            unit=unit,
            panel=panel,
            data_points_count=n,
            data_points=clean_points,
            status="insufficient_data",
            trend_label="Not Enough Data",
            reason=f"Only {n} report data point(s) recorded. At least 3 historical points are required for a mathematical trajectory estimation.",
            reference_low=ref_low,
            reference_high=ref_high
        )

    # Convert dates to days relative to first point
    t0 = parse_date_to_timestamp(clean_points[0].date)
    x_days = [(parse_date_to_timestamp(p.date) - t0) / 86400.0 for p in clean_points]
    y_vals = [p.value for p in clean_points]

    slope_per_day, intercept, r_squared, std_err = compute_ols_regression(x_days, y_vals)
    slope_per_month = slope_per_day * 30.4375

    # Check clarity
    if r_squared < 0.25 and abs(slope_per_month) > 0.05:
        trend_label = "Unclear"
        reason = f"Fluctuating values observed across the {n} records (R² = {r_squared:.2f}). No consistent linear slope."
    else:
        trend_label, reason = determine_clinical_direction(canonical_key, slope_per_month)

    # Project next 60 days
    last_x = x_days[-1]
    last_t = parse_date_to_timestamp(clean_points[-1].date)
    next_x = last_x + 60.0  # 2 months forward
    next_timestamp = last_t + (60 * 86400)
    projected_date_str = datetime.fromtimestamp(next_timestamp).strftime("%b %Y")

    predicted_mid = intercept + slope_per_day * next_x
    # Uncertainty margin is 1.5 * std_err or at least 5% of value
    uncertainty = max(std_err * 1.5, abs(predicted_mid) * 0.06, 0.1)

    low_bound = round(max(0.0, predicted_mid - uncertainty), 2)
    high_bound = round(predicted_mid + uncertainty, 2)
    mid_val = round(predicted_mid, 2)

    projected_band = ProjectedBand(
        projected_date=projected_date_str,
        lower_bound=low_bound,
        midpoint=mid_val,
        upper_bound=high_bound,
        uncertainty_margin=round(uncertainty, 2)
    )

    return TrendResponse(
        test_key=canonical_key,
        test_name=test_name,
        unit=unit,
        panel=panel,
        data_points_count=n,
        data_points=clean_points,
        status="sufficient_data",
        trend_label=trend_label,
        reason=reason,
        slope_per_month=round(slope_per_month, 3),
        r_squared=round(r_squared, 2),
        projected_range=projected_band,
        reference_low=ref_low,
        reference_high=ref_high
    )
