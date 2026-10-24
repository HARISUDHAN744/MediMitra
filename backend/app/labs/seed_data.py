"""
Seed Data for Laboratory Diagnostics Demo Patients.
Provides realistic historical clinical time-series for 3 patients:
- Patient 1: Arun Kumar (45M, Glycaemic elevation across 6 reports)
- Patient 2: Deepa Raman (32F, Lipid improvement across 4 reports)
- Patient 3: Master Kavin (10M child, Pediatric normal CBC across 4 reports)
"""

from typing import List, Dict, Any

DEMO_PATIENTS: Dict[str, Dict[str, Any]] = {
    "P101": {
        "id": "P101",
        "name": "Arun Kumar",
        "age": 45,
        "sex": "male",
        "condition_note": "Periodic metabolic monitoring (Fasting glucose & lipid tracking)",
        "prescribed_medications": ["Metformin 500mg", "Atorvastatin 10mg"],
        "reports": [
            {
                "report_id": "REP-P101-01",
                "date": "2025-03-15",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "104", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "142", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "5.9", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "205", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "122", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "42", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "160", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.92", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "14.2", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P101-02",
                "date": "2025-06-20",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "110", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "148", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "6.1", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "210", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "128", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "43", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "165", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.94", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "14.0", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P101-03",
                "date": "2025-09-10",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "114", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "151", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "6.3", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "214", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "132", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "41", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "168", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.95", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.9", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P101-04",
                "date": "2025-11-28",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "116", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "153", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "6.5", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "216", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "135", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "43", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "170", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.95", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.8", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P101-05",
                "date": "2026-01-14",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "117", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "154", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "6.6", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "218", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "136", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "44", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "172", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.96", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.8", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P101-06",
                "date": "2026-02-18",
                "facility": "MedPrime Diagnostic Centre, Salem",
                "tests": [
                    {"name": "Fasting Blood Sugar (FBS)", "value": "118", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Postprandial Blood Sugar (PPBS)", "value": "156", "unit": "mg/dL", "reference_range": "< 140 mg/dL"},
                    {"name": "HbA1c (Glycated Hemoglobin)", "value": "6.8", "unit": "%", "reference_range": "4.0 - 5.6 %"},
                    {"name": "Serum Total Cholesterol", "value": "219", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "138", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "44", "unit": "mg/dL", "reference_range": "> 40 mg/dL"},
                    {"name": "Triglycerides", "value": "174", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "Serum Creatinine", "value": "0.96", "unit": "mg/dL", "reference_range": "0.70 - 1.30 mg/dL"},
                    {"name": "Blood Urea Nitrogen (BUN)", "value": "16", "unit": "mg/dL", "reference_range": "7 - 20 mg/dL"},
                    {"name": "SGPT / ALT", "value": "34", "unit": "U/L", "reference_range": "7 - 56 U/L"},
                    {"name": "SGOT / AST", "value": "28", "unit": "U/L", "reference_range": "10 - 40 U/L"},
                    {"name": "TSH (Thyroid Stimulating Hormone)", "value": "3.15", "unit": "uIU/mL", "reference_range": "0.35 - 4.94 uIU/mL"},
                    {"name": "Total Leukocyte Count (WBC)", "value": "7800", "unit": "/cumm", "reference_range": "4,000 - 11,000 /cumm"},
                    {"name": "Platelet Count", "value": "240000", "unit": "/mcL", "reference_range": "150,000 - 450,000 /mcL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.8", "unit": "g/dL", "reference_range": "13.0 - 17.0 g/dL"},
                ]
            }
        ]
    },
    "P102": {
        "id": "P102",
        "name": "Deepa Raman",
        "age": 32,
        "sex": "female",
        "condition_note": "Cardiovascular wellness & dietary lifestyle improvement",
        "prescribed_medications": [],
        "reports": [
            {
                "report_id": "REP-P102-01",
                "date": "2025-04-12",
                "facility": "LifeCare Clinical Labs, Chennai",
                "tests": [
                    {"name": "Serum Total Cholesterol", "value": "238", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "148", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "Triglycerides", "value": "205", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "44", "unit": "mg/dL", "reference_range": "> 50 mg/dL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "92", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "12.8", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P102-02",
                "date": "2025-07-15",
                "facility": "LifeCare Clinical Labs, Chennai",
                "tests": [
                    {"name": "Serum Total Cholesterol", "value": "222", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "136", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "Triglycerides", "value": "180", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "47", "unit": "mg/dL", "reference_range": "> 50 mg/dL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "90", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.0", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P102-03",
                "date": "2025-10-22",
                "facility": "LifeCare Clinical Labs, Chennai",
                "tests": [
                    {"name": "Serum Total Cholesterol", "value": "208", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "124", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "Triglycerides", "value": "162", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "50", "unit": "mg/dL", "reference_range": "> 50 mg/dL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "89", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.2", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL"},
                ]
            },
            {
                "report_id": "REP-P102-04",
                "date": "2026-01-20",
                "facility": "LifeCare Clinical Labs, Chennai",
                "tests": [
                    {"name": "Serum Total Cholesterol", "value": "194", "unit": "mg/dL", "reference_range": "< 200 mg/dL"},
                    {"name": "LDL (Bad) Cholesterol", "value": "108", "unit": "mg/dL", "reference_range": "< 100 mg/dL"},
                    {"name": "Triglycerides", "value": "142", "unit": "mg/dL", "reference_range": "< 150 mg/dL"},
                    {"name": "HDL (Good) Cholesterol", "value": "53", "unit": "mg/dL", "reference_range": "> 50 mg/dL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "88", "unit": "mg/dL", "reference_range": "70 - 99 mg/dL"},
                    {"name": "Hemoglobin (Hb)", "value": "13.4", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL"},
                ]
            }
        ]
    },
    "P103": {
        "id": "P103",
        "name": "Master Kavin",
        "age": 10,
        "sex": "male",
        "condition_note": "Pediatric school health checkup & complete blood count monitoring",
        "prescribed_medications": [],
        "reports": [
            {
                "report_id": "REP-P103-01",
                "date": "2025-02-10",
                "facility": "Rainbow Children's Hospital Lab, Bengaluru",
                "tests": [
                    {"name": "Hemoglobin (Hb)", "value": "12.4", "unit": "g/dL", "reference_range": "11.5 - 15.5 g/dL"},
                    {"name": "Total Leukocyte Count (WBC)", "value": "8200", "unit": "/cumm", "reference_range": "5,000 - 15,000 /cumm"},
                    {"name": "Platelet Count", "value": "290000", "unit": "/mcL", "reference_range": "150,000 - 450,000 /mcL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "82", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL"},
                ]
            },
            {
                "report_id": "REP-P103-02",
                "date": "2025-06-12",
                "facility": "Rainbow Children's Hospital Lab, Bengaluru",
                "tests": [
                    {"name": "Hemoglobin (Hb)", "value": "12.6", "unit": "g/dL", "reference_range": "11.5 - 15.5 g/dL"},
                    {"name": "Total Leukocyte Count (WBC)", "value": "7900", "unit": "/cumm", "reference_range": "5,000 - 15,000 /cumm"},
                    {"name": "Platelet Count", "value": "285000", "unit": "/mcL", "reference_range": "150,000 - 450,000 /mcL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "85", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL"},
                ]
            },
            {
                "report_id": "REP-P103-03",
                "date": "2025-10-14",
                "facility": "Rainbow Children's Hospital Lab, Bengaluru",
                "tests": [
                    {"name": "Hemoglobin (Hb)", "value": "12.7", "unit": "g/dL", "reference_range": "11.5 - 15.5 g/dL"},
                    {"name": "Total Leukocyte Count (WBC)", "value": "7600", "unit": "/cumm", "reference_range": "5,000 - 15,000 /cumm"},
                    {"name": "Platelet Count", "value": "310000", "unit": "/mcL", "reference_range": "150,000 - 450,000 /mcL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "84", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL"},
                ]
            },
            {
                "report_id": "REP-P103-04",
                "date": "2026-02-05",
                "facility": "Rainbow Children's Hospital Lab, Bengaluru",
                "tests": [
                    {"name": "Hemoglobin (Hb)", "value": "12.9", "unit": "g/dL", "reference_range": "11.5 - 15.5 g/dL"},
                    {"name": "Total Leukocyte Count (WBC)", "value": "7400", "unit": "/cumm", "reference_range": "5,000 - 15,000 /cumm"},
                    {"name": "Platelet Count", "value": "305000", "unit": "/mcL", "reference_range": "150,000 - 450,000 /mcL"},
                    {"name": "Fasting Blood Sugar (FBS)", "value": "86", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL"},
                ]
            }
        ]
    }
}


def get_demo_patient(patient_id: str) -> Dict[str, Any]:
    """Retrieves demo patient dictionary by ID (defaults to P101)."""
    return DEMO_PATIENTS.get(patient_id, DEMO_PATIENTS["P101"])
