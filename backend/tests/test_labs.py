"""
15 Unit and Integration Tests for MediMitra Laboratory Diagnostics.
Covers:
1. Reference range selection by age and sex
2. Unit conversion (mmol/L -> mg/dL)
3. Synonym resolution ("Sugar Fasting" -> FBS)
4. Critical thresholds (Critical-High & Critical-Low)
5. Explainable pattern rules (GLY-01 & LIP-01)
6. Trend prediction with 2, 3, and 6 points
7. Safety verification against forbidden diagnostic / dosing language
8. Downloadable PDF report generation endpoint
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.labs.reference_ranges import evaluate_biomarker, get_demographic_key
from app.labs.unit_normaliser import normalise_biomarker, resolve_canonical_key
from app.labs.insight_engine import process_lab_results
from app.labs.trend_engine import analyze_test_trend
from app.labs.seed_data import get_demo_patient

client = TestClient(app)


# 1. Range selection by age and sex (Adult Male FBS)
def test_range_selection_adult_male_fbs():
    res = evaluate_biomarker(test_key="FBS", value=85.0, age=40, sex="male")
    assert res["status"] == "Normal"
    assert "70 - 99" in res["range_used"]
    assert "Adult Male" in res["range_source"] or "ICMR" in res["range_source"]


# 2. Range selection by sex (Adult Female Hemoglobin has lower threshold)
def test_range_selection_adult_female_hb():
    male_eval = evaluate_biomarker(test_key="HB", value=12.4, age=30, sex="male")
    female_eval = evaluate_biomarker(test_key="HB", value=12.4, age=30, sex="female")
    # 12.4 is Low for adult male (normal is 13.0-17.0)
    assert male_eval["status"] == "Low"
    # 12.4 is Normal for adult female (normal is 12.0-16.0)
    assert female_eval["status"] == "Normal"


# 3. Range selection for Pediatric Child
def test_range_selection_child_wbc():
    demo_key = get_demographic_key(age=8, sex="male")
    assert demo_key == "child"
    child_eval = evaluate_biomarker(test_key="WBC", value=13000.0, age=8, sex="male")
    # 13,000 /cumm is Normal for child (5,000 - 15,000), but High for adult (4,000 - 11,000)
    assert child_eval["status"] == "Normal"


# 4. Unit conversion: Glucose mmol/L -> mg/dL
def test_unit_conversion_glucose_mmol_to_mgdl():
    norm = normalise_biomarker(raw_name="Fasting Blood Sugar", raw_value="7.0", raw_unit="mmol/L")
    assert norm["canonical_key"] == "FBS"
    assert norm["is_converted"] is True
    # 7.0 mmol/L * 18.0182 ~= 126.1 mg/dL
    assert 125.0 <= norm["value"] <= 127.0
    assert norm["unit"] == "mg/dL"


# 5. Unit conversion: Cholesterol mmol/L -> mg/dL
def test_unit_conversion_cholesterol_mmol_to_mgdl():
    norm = normalise_biomarker(raw_name="Serum Total Cholesterol", raw_value="5.5", raw_unit="mmol/L")
    assert norm["canonical_key"] == "TOTAL_CHOLESTEROL"
    assert norm["is_converted"] is True
    # 5.5 mmol/L * 38.67 ~= 212.7 mg/dL
    assert 210.0 <= norm["value"] <= 215.0


# 6. Synonym resolution: "Sugar Fasting" -> FBS
def test_synonym_resolution_sugar_fasting():
    assert resolve_canonical_key("Sugar Fasting") == "FBS"
    assert resolve_canonical_key("Blood Sugar Fasting") == "FBS"
    assert resolve_canonical_key("S. Creatinine") == "CREATININE"
    assert resolve_canonical_key("Haemoglobin") == "HB"
    assert resolve_canonical_key("A1c") == "HBA1C"


# 7. Critical Threshold: Critical-High
def test_critical_threshold_high_fbs():
    res = evaluate_biomarker(test_key="FBS", value=520.0, age=45, sex="male")
    assert res["status"] == "Critical-High"
    assert res["is_critical"] is True
    assert res["severity_colour"] == "darkred"


# 8. Critical Threshold: Critical-Low
def test_critical_threshold_low_hb():
    res = evaluate_biomarker(test_key="HB", value=6.2, age=35, sex="female")
    assert res["status"] == "Critical-Low"
    assert res["is_critical"] is True


# 9. Pattern rule GLY-01 fires correctly
def test_pattern_rule_gly01_fires():
    tests = [
        {"name": "Fasting Blood Sugar", "value": "118", "unit": "mg/dL"},
        {"name": "Postprandial Blood Sugar", "value": "156", "unit": "mg/dL"},
        {"name": "HbA1c", "value": "6.8", "unit": "%"}
    ]
    resp = process_lab_results(raw_tests=tests, patient_id="P101", age=45, sex="male")
    pattern_ids = [p.rule_id for p in resp.patterns_detected]
    assert "GLY-01" in pattern_ids
    gly_pat = [p for p in resp.patterns_detected if p.rule_id == "GLY-01"][0]
    assert "ICMR Guidelines" in gly_pat.guideline_source or "ADA" in gly_pat.guideline_source


# 10. Pattern rule LIP-01 fires correctly
def test_pattern_rule_lip01_fires():
    tests = [
        {"name": "LDL (Bad) Cholesterol", "value": "142", "unit": "mg/dL"},
        {"name": "Triglycerides", "value": "180", "unit": "mg/dL"}
    ]
    resp = process_lab_results(raw_tests=tests, patient_id="P102", age=32, sex="female")
    pattern_ids = [p.rule_id for p in resp.patterns_detected]
    assert "LIP-01" in pattern_ids


# 11. Trend with 2 data points yields insufficient_data
def test_trend_with_2_points_insufficient_data():
    two_points = [
        {"date": "2025-01-10", "value": "5.8", "unit": "%"},
        {"date": "2025-04-12", "value": "6.0", "unit": "%"}
    ]
    trend = analyze_test_trend("HBA1C", two_points)
    assert trend.status == "insufficient_data"
    assert trend.trend_label == "Not Enough Data"
    assert "At least 3" in trend.reason


# 12. Trend with 3 data points computes regression and uncertainty band
def test_trend_with_3_points_sufficient():
    three_points = [
        {"date": "2025-01-10", "value": "5.8", "unit": "%"},
        {"date": "2025-04-12", "value": "6.0", "unit": "%"},
        {"date": "2025-07-15", "value": "6.2", "unit": "%"}
    ]
    trend = analyze_test_trend("HBA1C", three_points)
    assert trend.status == "sufficient_data"
    assert trend.trend_label == "Worsening"  # HbA1c rising
    assert trend.projected_range is not None
    assert trend.projected_range.lower_bound < trend.projected_range.upper_bound
    assert "Trend estimate, not a diagnosis" in trend.disclaimer


# 13. Trend with 6 data points (Patient P101 time-series)
def test_trend_with_6_points_worsening():
    p101 = get_demo_patient("P101")
    history = []
    for r in p101["reports"]:
        for t in r["tests"]:
            if "hba1c" in t["name"].lower():
                history.append({"date": r["date"], "value": t["value"], "unit": t["unit"]})
    assert len(history) == 6
    trend = analyze_test_trend("HBA1C", history, user_age=45, user_sex="male")
    assert trend.status == "sufficient_data"
    assert trend.trend_label == "Worsening"
    assert trend.slope_per_month is not None and trend.slope_per_month > 0


# 14. Safety verification: Output contains NO forbidden diagnostic or dosing phrases
def test_forbidden_phrases_safety_check():
    forbidden_terms = [
        "you have diabetes",
        "pre-diabetic impairment",
        "statin therapy indicated",
        "target < 6.5%",
        "treatment target",
        "recommended dose",
        "start medication",
        "alter dose"
    ]
    resp = client.get("/labs/insights?patient_id=P101")
    assert resp.status_code == 200
    json_text = resp.text.lower()
    for term in forbidden_terms:
        assert term not in json_text, f"Forbidden term '{term}' found in /labs/insights output"

    trend_resp = client.get("/labs/trends?test=HBA1C&patient_id=P101")
    assert trend_resp.status_code == 200
    trend_text = trend_resp.text.lower()
    for term in forbidden_terms:
        assert term not in trend_text, f"Forbidden term '{term}' found in /labs/trends output"


# 15. PDF report generation endpoint returns valid PDF
def test_pdf_report_generation_endpoint():
    res = client.post("/labs/report", json={"patient_id": "P101", "language": "en"})
    assert res.status_code == 200
    assert res.headers.get("content-type") == "application/pdf"
    assert len(res.content) > 1000
    # PDF begins with %PDF header
    assert res.content.startswith(b"%PDF")
