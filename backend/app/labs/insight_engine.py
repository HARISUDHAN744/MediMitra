"""
Insight Engine: Evaluates biomarkers, generates per-marker insight cards,
detects explainable cross-marker clinical patterns, computes informational wellness overview,
and enforces non-diagnostic safety language.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from app.labs.unit_normaliser import normalise_biomarker
from app.labs.reference_ranges import evaluate_biomarker, REFERENCE_TABLE


class InsightCard(BaseModel):
    test_key: str
    name: str
    panel: str
    value: float
    unit: str
    range_used: str
    range_source: str
    status: Literal["Normal", "Low", "High", "Critical-Low", "Critical-High"]
    severity_colour: str  # green, amber, rose, darkred
    severity_label: str   # Normal, Low, High, Critical Low, Critical High
    is_critical: bool
    what_it_measures: str
    high_low_meaning: str
    non_medical_factors: str
    questions_for_doctor: List[str]
    lifestyle_info: str
    is_converted: bool = False
    low_confidence: bool = False
    warning: Optional[str] = None
    disclaimer: str = "Informational only. Not a medical diagnosis. Please consult a qualified physician."


class CrossMarkerPattern(BaseModel):
    rule_id: str
    panel: str
    title: str
    description: str
    trigger_values: Dict[str, Any]
    guideline_source: str
    recommendation: str


class LabSummary(BaseModel):
    total_markers: int
    normal_count: int
    high_count: int
    low_count: int
    critical_count: int
    top_discussion_items: List[str]
    wellness_score: Optional[int] = None
    wellness_formula: Optional[str] = None
    critical_warning: Optional[str] = None


class InsightsResponse(BaseModel):
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    document_date: Optional[str] = None
    summary: LabSummary
    patterns_detected: List[CrossMarkerPattern]
    insights: List[InsightCard]
    panels: List[str]
    medicines_from_prescription: List[str] = Field(default_factory=list)
    medical_disclaimer: str = (
        "Medical Disclaimer: MediMitra provides automated laboratory reference information and educational summaries. "
        "It does NOT diagnose medical conditions, recommend medical treatments, or alter medications. "
        "Any critical or abnormal values should be evaluated by a certified doctor promptly. In emergencies, call 112 immediately."
    )


# Pattern detection rules
PATTERN_DEFINITIONS = [
    {
        "rule_id": "GLY-01",
        "panel": "Glycaemic Profile",
        "title": "Combined Fasting & Post-Meal Glycaemic Elevation",
        "guideline_source": "ICMR Guidelines (2023) / ADA Standards of Care (2024)",
        "condition": lambda markers: (
            markers.get("FBS", 0) > 99.0 and
            markers.get("PPBS", 0) > 140.0 and
            markers.get("HBA1C", 0) > 5.6
        ),
        "desc": "Fasting blood sugar, post-meal blood sugar, and 3-month HbA1c are all above reference ranges. This cross-marker pattern reflects sustained glucose elevation across acute and quarterly timelines.",
        "rec": "May be worth scheduling a routine consultation with your physician to discuss dietary patterns, daily activity, and glycemic evaluation."
    },
    {
        "rule_id": "LIP-01",
        "panel": "Lipid Panel",
        "title": "Atherogenic Dyslipidemia Pattern (LDL & Triglycerides)",
        "guideline_source": "ACC/AHA Guideline on Cardiovascular Risk (2019) / Lipid Association of India",
        "condition": lambda markers: (
            markers.get("LDL", 0) > 100.0 and
            markers.get("TRIGLYCERIDES", 0) > 150.0
        ),
        "desc": "Both LDL (circulating atherogenic lipoproteins) and triglycerides (storage lipids) are above reference thresholds.",
        "rec": "Reviewing dietary saturated fat, sugar consumption, and heart-healthy physical conditioning with your doctor is recommended."
    },
    {
        "rule_id": "LIP-02",
        "panel": "Lipid Panel",
        "title": "High Triglycerides with Reduced Protective HDL",
        "guideline_source": "NCEP ATP III Guidelines / ADA 2024",
        "condition": lambda markers: (
            markers.get("TRIGLYCERIDES", 0) > 150.0 and
            markers.get("HDL", 100) < 40.0
        ),
        "desc": "Elevated triglycerides coupled with reduced high-density lipoprotein (HDL). This metabolic ratio is commonly linked with sedentary habits or refined carbohydrate intake.",
        "rec": "Aerobic workouts and replacing refined carbohydrates with whole grains support positive lipoprotein shifts."
    },
    {
        "rule_id": "KID-01",
        "panel": "Kidney Function",
        "title": "Renal Excretion Marker Elevation (Creatinine & Urea)",
        "guideline_source": "KDIGO Clinical Practice Guideline / ICMR Nephrology",
        "condition": lambda markers: (
            markers.get("CREATININE", 0) > 1.30 and
            markers.get("UREA", 0) > 20.0
        ),
        "desc": "Both serum creatinine and blood urea nitrogen exceed standard reference bounds, reflecting reduced clearance or acute dehydration.",
        "rec": "Hydration status and medication review with your physician is strongly advised; avoid heavy over-the-counter NSAIDs."
    },
    {
        "rule_id": "LIV-01",
        "panel": "Liver Function",
        "title": "Concomitant Transaminase Elevation (SGOT & SGPT)",
        "guideline_source": "American College of Gastroenterology (ACG) Clinical Guidelines",
        "condition": lambda markers: (
            markers.get("SGOT", 0) > 40.0 and
            markers.get("SGPT", 0) > 56.0
        ),
        "desc": "Both aspartate aminotransferase (SGOT) and alanine aminotransferase (SGPT) enzymes are elevated above reference limits, suggesting hepatocellular metabolic stress.",
        "rec": "Sharing these readings with your physician is advised. Minimize alcohol intake and discuss any recent medications or herbal supplements."
    },
    {
        "rule_id": "CBC-01",
        "panel": "Complete Blood Count",
        "title": "Low Hemoglobin with Preserved/Elevated Platelets",
        "guideline_source": "WHO Nutritional Anemia Guidelines / ICMR Hematology",
        "condition": lambda markers: (
            markers.get("HB", 99) < 12.0 and
            markers.get("PLATELETS", 0) >= 150000
        ),
        "desc": "Circulating hemoglobin is below demographic baseline with intact platelet counts, a profile commonly seen in nutritional iron insufficiency or blood loss.",
        "rec": "Discussing dietary iron sources, vitamin C intake, and ferritin tests with your physician can clarify etiology."
    }
]


def process_lab_results(
    raw_tests: List[Dict[str, Any]],
    patient_id: Optional[str] = None,
    patient_name: Optional[str] = "Demo Patient",
    document_date: Optional[str] = None,
    age: Optional[int] = 35,
    sex: Optional[str] = "male",
    prescribed_meds: Optional[List[str]] = None
) -> InsightsResponse:
    """
    Main processor: parses raw lab tests, normalizes, evaluates against reference ranges,
    detects multi-marker patterns, computes wellness score, and returns complete structured response.
    """
    cards: List[InsightCard] = []
    marker_val_map: Dict[str, float] = {}

    for t in raw_tests:
        name = t.get("name", "")
        raw_val = str(t.get("value", ""))
        raw_unit = t.get("unit", "")
        reported_range = t.get("reference_range", "")

        # Normalise
        norm = normalise_biomarker(name, raw_val, raw_unit)
        key = norm["canonical_key"]
        num_val = norm["value"]

        # If canonical key resolved, track for pattern analysis
        if key and key != "CUSTOM":
            marker_val_map[key] = num_val

        # Evaluate against reference ranges
        eval_res = evaluate_biomarker(
            test_key=key,
            value=num_val,
            reported_range_str=reported_range,
            age=age,
            sex=sex
        )

        card = InsightCard(
            test_key=key,
            name=eval_res.get("canonical_name", name),
            panel=eval_res.get("panel", t.get("category", "General Panel")),
            value=num_val,
            unit=norm["unit"] or eval_res.get("unit", ""),
            range_used=eval_res["range_used"],
            range_source=eval_res["range_source"],
            status=eval_res["status"],
            severity_colour=eval_res["severity_colour"],
            severity_label=eval_res["severity_label"],
            is_critical=eval_res["is_critical"],
            what_it_measures=eval_res.get("what_it_measures", "General physiological health biomarker."),
            high_low_meaning=eval_res.get("high_low_meaning", "Value outside reference range may be worth discussing with your doctor."),
            non_medical_factors=eval_res.get("non_medical_factors", "Hydration, sleep, recent exertion, and dietary intake."),
            questions_for_doctor=eval_res.get("questions_for_doctor", ["Would a follow-up test in a few weeks be recommended?"]),
            lifestyle_info=eval_res.get("lifestyle_info", "Regular exercise, balanced nutrition, and sufficient sleep support metabolic balance."),
            is_converted=norm["is_converted"],
            low_confidence=norm["low_confidence"],
            warning=norm["warning"]
        )
        cards.append(card)

    # Patterns detection
    patterns_detected: List[CrossMarkerPattern] = []
    for pdef in PATTERN_DEFINITIONS:
        try:
            if pdef["condition"](marker_val_map):
                # Extract triggering values
                triggers = {k: v for k, v in marker_val_map.items() if k in pdef["title"] or k in str(pdef["desc"])}
                if not triggers:
                    triggers = {k: v for k, v in marker_val_map.items() if k in ("FBS", "PPBS", "HBA1C", "LDL", "TRIGLYCERIDES", "HDL", "CREATININE", "UREA", "SGOT", "SGPT", "HB", "PLATELETS")}
                patterns_detected.append(
                    CrossMarkerPattern(
                        rule_id=pdef["rule_id"],
                        panel=pdef["panel"],
                        title=pdef["title"],
                        description=pdef["desc"],
                        trigger_values=triggers,
                        guideline_source=pdef["guideline_source"],
                        recommendation=pdef["rec"]
                    )
                )
        except Exception:
            continue

    # Counts
    normal_cnt = sum(1 for c in cards if c.status == "Normal")
    high_cnt = sum(1 for c in cards if c.status == "High")
    low_cnt = sum(1 for c in cards if c.status == "Low")
    crit_cnt = sum(1 for c in cards if c.is_critical)
    total_cnt = len(cards)

    # Top 3 items to discuss with doctor
    abnormal_cards = [c for c in cards if c.status != "Normal"]
    # Sort critical first, then high, then low
    abnormal_cards.sort(key=lambda c: (0 if c.is_critical else 1, 0 if c.status == "High" else 1))
    top_3 = [
        f"{c.name} is {c.value} {c.unit} ({c.status}, reference: {c.range_used})"
        for c in abnormal_cards[:3]
    ]
    if not top_3 and cards:
        top_3 = ["All evaluated biomarkers are within standard reference ranges."]

    # Wellness overview calculation (0 to 100)
    # Starts at 100; -8 per High/Low, -18 per Critical. Floor at 20.
    penalty = (high_cnt + low_cnt) * 8 + crit_cnt * 18
    wellness_score = max(20, 100 - penalty)
    formula_str = (
        "Informational Score = 100 - (8 × abnormal markers) - (18 × critical markers). "
        "Intended solely as a high-level educational summary, not a clinical risk assessment."
    )

    critical_msg = None
    if crit_cnt > 0:
        critical_msg = "Please contact a doctor soon. In an emergency call 112."

    summary = LabSummary(
        total_markers=total_cnt,
        normal_count=normal_cnt,
        high_count=high_cnt,
        low_count=low_cnt,
        critical_count=crit_cnt,
        top_discussion_items=top_3,
        wellness_score=wellness_score,
        wellness_formula=formula_str,
        critical_warning=critical_msg
    )

    # Unique panels
    unique_panels = sorted(list(set(c.panel for c in cards)))

    # Clean prescribed meds list (labelled "from your prescription")
    safe_meds = [m.strip() for m in (prescribed_meds or []) if m and m.strip()]

    return InsightsResponse(
        patient_id=patient_id,
        patient_name=patient_name,
        document_date=document_date,
        summary=summary,
        patterns_detected=patterns_detected,
        insights=cards,
        panels=unique_panels,
        medicines_from_prescription=safe_meds
    )
