import json
import logging
from pathlib import Path
from app.config import SAMPLES_DIR
from app.models.schemas import ExtractedMedicalDocument

logger = logging.getLogger(__name__)

def load_fallback_sample(filename: str = "") -> ExtractedMedicalDocument:
    """
    Loads a realistic sample medical extraction JSON from the /samples directory.
    Matches sample based on filename keywords (e.g., 'lab', 'blood', 'report', 'prescription'),
    or defaults to sample_prescription_1.json.
    """
    lower_name = (filename or "").lower()
    sample_file: Path
    
    if any(k in lower_name for k in ["lab", "blood", "test", "report", "diagnostic"]):
        sample_file = SAMPLES_DIR / "sample_lab_report_1.json"
    elif any(k in lower_name for k in ["cough", "bronchitis", "acute", "child", "pediatric", "2"]):
        sample_file = SAMPLES_DIR / "sample_prescription_2.json"
    else:
        sample_file = SAMPLES_DIR / "sample_prescription_1.json"
    
    # Fallback default if specific file missing
    if not sample_file.exists():
        files = list(SAMPLES_DIR.glob("*.json"))
        if files:
            sample_file = files[0]
        else:
            # Inline emergency fallback
            logger.warning("No sample json files found in %s, using inline fallback.", SAMPLES_DIR)
            return ExtractedMedicalDocument(
                document_type="prescription",
                patient_name="Demo Patient (Fallback)",
                doctor_name="Dr. Sample Physician, MD",
                hospital_or_clinic="City General Hospital",
                document_date="2026-10-01",
                diagnoses=["General Consultation (Demo Fallback)"],
                medicines=[],
                tests=[],
                notes="This is a demonstration fallback result because no live API extraction or sample file could be loaded."
            )

    try:
        with open(sample_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return ExtractedMedicalDocument.model_validate(data)
    except Exception as e:
        logger.error("Error reading fallback sample file %s: %s", sample_file, e)
        return ExtractedMedicalDocument(
            document_type="prescription",
            patient_name="Demo Patient (Fallback)",
            doctor_name="Dr. Sample Physician, MD",
            hospital_or_clinic="City Health Clinic",
            document_date="2026-10-01",
            diagnoses=["Clinical Observation"],
            medicines=[],
            tests=[],
            notes=f"Fallback loaded due to sample parsing error: {str(e)}"
        )
