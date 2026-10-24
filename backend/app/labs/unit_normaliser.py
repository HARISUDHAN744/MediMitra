"""
Unit Normalisation and Synonym Resolution for Lab Biomarkers.
Handles parsing strings, resolving common test synonyms, converting SI units
(e.g., mmol/L -> mg/dL, umol/L -> mg/dL), and flagging unit mismatches.
"""

import re
from typing import Dict, Any, Optional, Tuple

SYNONYM_MAP: Dict[str, str] = {
    # Glycaemic
    "sugar fasting": "FBS",
    "fasting sugar": "FBS",
    "fasting blood sugar": "FBS",
    "fasting blood glucose": "FBS",
    "fasting glucose": "FBS",
    "fbs": "FBS",
    "blood sugar fasting": "FBS",
    
    "ppbs": "PPBS",
    "post prandial blood sugar": "PPBS",
    "post-meal glucose": "PPBS",
    "postprandial blood sugar": "PPBS",
    "postprandial glucose": "PPBS",
    "pp blood sugar": "PPBS",
    "post meal sugar": "PPBS",

    "hba1c": "HBA1C",
    "glycated hemoglobin": "HBA1C",
    "glycated haemoglobin": "HBA1C",
    "glycosylated hemoglobin": "HBA1C",
    "a1c": "HBA1C",
    "hba1c (glycated hemoglobin)": "HBA1C",

    # CBC
    "hemoglobin": "HB",
    "haemoglobin": "HB",
    "hb": "HB",
    "hgb": "HB",
    "hemoglobin (hb)": "HB",

    "wbc": "WBC",
    "total leukocyte count": "WBC",
    "tlc": "WBC",
    "white blood cells": "WBC",
    "total white blood cell count": "WBC",
    "total leukocyte count (wbc)": "WBC",

    "platelets": "PLATELETS",
    "platelet count": "PLATELETS",
    "plt": "PLATELETS",

    # Lipids
    "total cholesterol": "TOTAL_CHOLESTEROL",
    "serum total cholesterol": "TOTAL_CHOLESTEROL",
    "cholesterol total": "TOTAL_CHOLESTEROL",
    "serum cholesterol": "TOTAL_CHOLESTEROL",
    "cholesterol": "TOTAL_CHOLESTEROL",

    "ldl": "LDL",
    "ldl cholesterol": "LDL",
    "ldl (bad) cholesterol": "LDL",
    "low density lipoprotein": "LDL",
    "direct ldl cholesterol": "LDL",

    "hdl": "HDL",
    "hdl cholesterol": "HDL",
    "hdl (good) cholesterol": "HDL",
    "high density lipoprotein": "HDL",

    "triglycerides": "TRIGLYCERIDES",
    "serum triglycerides": "TRIGLYCERIDES",
    "tgl": "TRIGLYCERIDES",
    "tg": "TRIGLYCERIDES",

    # Kidney
    "creatinine": "CREATININE",
    "serum creatinine": "CREATININE",
    "s. creatinine": "CREATININE",
    "creatinine serum": "CREATININE",

    "urea": "UREA",
    "blood urea": "UREA",
    "bun": "UREA",
    "blood urea nitrogen": "UREA",
    "blood urea nitrogen (bun)": "UREA",

    "uric acid": "URIC_ACID",
    "serum uric acid": "URIC_ACID",
    "s. uric acid": "URIC_ACID",

    # Thyroid
    "tsh": "TSH",
    "thyroid stimulating hormone": "TSH",
    "s. tsh": "TSH",
    "tsh (thyroid stimulating hormone)": "TSH",

    # Liver
    "sgot": "SGOT",
    "ast": "SGOT",
    "aspartate aminotransferase": "SGOT",
    "sgot / ast": "SGOT",

    "sgpt": "SGPT",
    "alt": "SGPT",
    "alanine aminotransferase": "SGPT",
    "sgpt / alt": "SGPT",

    # Vitamins
    "vitamin d": "VITAMIN_D",
    "vit d": "VITAMIN_D",
    "25-hydroxy vitamin d": "VITAMIN_D",
    "25-oh vitamin d": "VITAMIN_D",
    "vitamin d (25-hydroxy)": "VITAMIN_D",

    "vitamin b12": "VITAMIN_B12",
    "vit b12": "VITAMIN_B12",
    "cobalamin": "VITAMIN_B12",
    "cyanocobalamin": "VITAMIN_B12",
    "vitamin b12 (cobalamin)": "VITAMIN_B12",
}


def clean_test_name(name: str) -> str:
    """Cleans punctuation, brackets and extra whitespace for matching."""
    s = name.lower().strip()
    s = re.sub(r"[^\w\s\(\)\/\-]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def resolve_canonical_key(raw_name: str) -> Optional[str]:
    """Resolves arbitrary test string to canonical test key e.g. 'FBS'."""
    cleaned = clean_test_name(raw_name)
    if cleaned in SYNONYM_MAP:
        return SYNONYM_MAP[cleaned]
    # Try partial match
    for k, v in SYNONYM_MAP.items():
        if k in cleaned or cleaned in k:
            return v
    return None


def parse_numeric_value(val_str: str) -> Optional[float]:
    """Extracts first valid floating point or integer number from string."""
    if not val_str:
        return None
    # Remove commas
    sanitized = str(val_str).replace(",", "").strip()
    match = re.search(r"[-+]?\d*\.?\d+", sanitized)
    if match:
        try:
            return float(match.group())
        except ValueError:
            return None
    return None


def normalise_biomarker(raw_name: str, raw_value: str, raw_unit: str = "") -> Dict[str, Any]:
    """
    Normalises a biomarker test result:
    - Resolves synonym to canonical key.
    - Parses numeric value.
    - Converts SI units to standard clinical unit if needed.
    - Returns standardized record with conversion flag.
    """
    canonical_key = resolve_canonical_key(raw_name)
    val_num = parse_numeric_value(raw_value)
    clean_unit = (raw_unit or "").strip().lower()

    if canonical_key is None or val_num is None:
        return {
            "canonical_key": canonical_key or "CUSTOM",
            "name": raw_name,
            "value": val_num if val_num is not None else 0.0,
            "unit": raw_unit,
            "is_converted": False,
            "low_confidence": val_num is None,
            "warning": "Could not verify reference mapping for test." if canonical_key is None else None
        }

    converted = False
    warning = None

    # Normalise units
    if canonical_key in ("FBS", "PPBS") and ("mmol" in clean_unit):
        # mmol/L to mg/dL
        val_num = round(val_num * 18.0182, 1)
        clean_unit = "mg/dL"
        converted = True

    elif canonical_key in ("TOTAL_CHOLESTEROL", "LDL", "HDL") and ("mmol" in clean_unit):
        # mmol/L to mg/dL
        val_num = round(val_num * 38.67, 1)
        clean_unit = "mg/dL"
        converted = True

    elif canonical_key == "TRIGLYCERIDES" and ("mmol" in clean_unit):
        # mmol/L to mg/dL
        val_num = round(val_num * 88.57, 1)
        clean_unit = "mg/dL"
        converted = True

    elif canonical_key == "CREATININE" and ("umol" in clean_unit or "µmol" in clean_unit):
        # umol/L to mg/dL
        val_num = round(val_num / 88.4, 2)
        clean_unit = "mg/dL"
        converted = True

    elif canonical_key == "VITAMIN_B12" and ("pmol" in clean_unit):
        # pmol/L to pg/mL
        val_num = round(val_num * 1.355, 1)
        clean_unit = "pg/mL"
        converted = True

    return {
        "canonical_key": canonical_key,
        "name": raw_name,
        "value": val_num,
        "unit": clean_unit or "standard",
        "is_converted": converted,
        "low_confidence": False,
        "warning": warning
    }
