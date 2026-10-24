"""
FastAPI Router for Laboratory Diagnostics.
Endpoints:
- GET /labs/insights: Fetches evaluated biomarker insights, patterns, and wellness metrics.
- GET /labs/trends: Computes historical trends and forecasts for a selected test.
- POST /labs/report: Generates and streams downloadable PDF clinical dossier.
- GET /labs/patients: Lists demo patients and their historical reports.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Response, Body, status
from fastapi.responses import Response

from app.labs.insight_engine import process_lab_results, InsightsResponse
from app.labs.trend_engine import analyze_test_trend, TrendResponse
from app.labs.report_builder import build_lab_report_pdf
from app.labs.seed_data import DEMO_PATIENTS, get_demo_patient

router = APIRouter(prefix="/labs", tags=["Lab Diagnostics & Trend Prediction"])


@router.get("/patients", summary="List available demo patients")
def list_demo_patients():
    """Returns metadata for all available demo patients."""
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "age": p["age"],
            "sex": p["sex"],
            "condition_note": p["condition_note"],
            "reports_count": len(p["reports"]),
            "latest_report_date": p["reports"][-1]["date"] if p["reports"] else None
        }
        for p in DEMO_PATIENTS.values()
    ]


@router.get("/insights", response_model=InsightsResponse, summary="Get evaluated lab insights")
def get_lab_insights(
    patient_id: str = Query("P101", description="Demo patient ID (P101, P102, P103)"),
    report_index: Optional[int] = Query(None, description="Index of historical report (defaults to latest)"),
    report_date: Optional[str] = Query(None, description="Specific report date to evaluate (YYYY-MM-DD)")
):
    """
    Evaluates biomarker test results for a patient against demographic reference thresholds.
    Detects explainable cross-marker patterns and calculates informational wellness overview.
    """
    patient = get_demo_patient(patient_id)
    reports = patient.get("reports", [])
    if not reports:
        raise HTTPException(status_code=404, detail="No lab reports found for the specified patient.")

    # Select report
    selected_report = reports[-1]
    if report_date:
        matched = [r for r in reports if r.get("date") == report_date]
        if matched:
            selected_report = matched[0]
    elif report_index is not None and 0 <= report_index < len(reports):
        selected_report = reports[report_index]

    raw_tests = selected_report.get("tests", [])
    meds = patient.get("prescribed_medications", [])

    return process_lab_results(
        raw_tests=raw_tests,
        patient_id=patient["id"],
        patient_name=patient["name"],
        document_date=selected_report.get("date"),
        age=patient.get("age", 35),
        sex=patient.get("sex", "male"),
        prescribed_meds=meds
    )


@router.get("/trends", response_model=TrendResponse, summary="Compute longitudinal trend for a test")
def get_test_trend(
    test: str = Query("HBA1C", description="Test name or key e.g. HbA1c, FBS, LDL, Hemoglobin"),
    patient_id: str = Query("P101", description="Demo patient ID (P101, P102, P103)")
):
    """
    Aggregates historical time-series of a specific test across all stored reports.
    Computes OLS regression trend, stability label, and 60-day forecast uncertainty band.
    Requires at least 3 historical points.
    """
    patient = get_demo_patient(patient_id)
    reports = patient.get("reports", [])

    # Extract historical points for the test
    history = []
    for r in reports:
        r_date = r.get("date")
        for t in r.get("tests", []):
            history.append({
                "date": r_date,
                "value": t.get("value"),
                "unit": t.get("unit"),
                "report_id": r.get("report_id"),
                "name": t.get("name")
            })

    # Filter to matching test
    from app.labs.unit_normaliser import resolve_canonical_key
    target_key = resolve_canonical_key(test) or test.upper()

    matching_points = [
        pt for pt in history
        if resolve_canonical_key(pt.get("name", "")) == target_key or target_key in pt.get("name", "").upper()
    ]

    return analyze_test_trend(
        test_identifier=test,
        raw_history=matching_points,
        user_age=patient.get("age", 35),
        user_sex=patient.get("sex", "male")
    )


@router.post("/report", summary="Generate downloadable PDF clinical report")
def download_pdf_report(
    payload: Dict[str, Any] = Body(
        default={
            "patient_id": "P101",
            "report_date": None,
            "language": "en"
        }
    )
):
    """
    Generates and returns an A4 PDF laboratory diagnostics report.
    Includes summary metrics, patterns, complete table, doctor questions, and consent-based QR code.
    """
    patient_id = payload.get("patient_id", "P101")
    report_date = payload.get("report_date")
    lang = payload.get("language", "en")

    patient = get_demo_patient(patient_id)
    reports = patient.get("reports", [])
    if not reports:
        raise HTTPException(status_code=404, detail="No lab reports found for patient.")

    selected_report = reports[-1]
    if report_date:
        matched = [r for r in reports if r.get("date") == report_date]
        if matched:
            selected_report = matched[0]

    insights_data = process_lab_results(
        raw_tests=selected_report.get("tests", []),
        patient_id=patient["id"],
        patient_name=patient["name"],
        document_date=selected_report.get("date"),
        age=patient.get("age", 35),
        sex=patient.get("sex", "male"),
        prescribed_meds=patient.get("prescribed_medications", [])
    )

    pdf_bytes = build_lab_report_pdf(
        insights_data=insights_data,
        share_token=f"med_{patient_id.lower()}_{selected_report.get('date', '2026').replace('-', '')}",
        language_code=lang
    )

    filename = f"MediMitra_Lab_Report_{patient['name'].replace(' ', '_')}_{selected_report.get('date')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Report-Type": "Clinical-Laboratory-Dossier",
            "X-Patient-ID": patient_id
        }
    )
