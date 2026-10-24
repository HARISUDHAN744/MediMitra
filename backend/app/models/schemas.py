from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

class MedicineItem(BaseModel):
    name: str = Field(description="Generic or brand name of the medication")
    dosage: Optional[str] = Field(default="", description="Strength or dosage, e.g. 500mg, 10ml")
    frequency: Optional[str] = Field(default="", description="How often to take, e.g. Twice daily, 1-0-1, SOS")
    duration: Optional[str] = Field(default="", description="Treatment duration, e.g. 5 days, 1 month")
    instructions: Optional[str] = Field(default="", description="Special directions e.g. After meals, with warm water")

    @field_validator("name", "dosage", "frequency", "duration", "instructions", mode="before")
    @classmethod
    def coerce_to_str(cls, v: Any) -> str:
        if v is None:
            return ""
        if isinstance(v, list):
            return ", ".join(str(x) for x in v)
        return str(v)

class LabTestItem(BaseModel):
    name: str = Field(description="Name of the test or biomarker, e.g. Hemoglobin, Fasting Glucose")
    value: str = Field(description="Measured value / numerical or qualitative result")
    unit: Optional[str] = Field(default="", description="Measurement unit, e.g. mg/dL, g/dL, %")
    reference_range: Optional[str] = Field(default="", description="Normal reference range or threshold")
    interpretation: Optional[str] = Field(default="", description="Interpretation e.g. Normal, High, Low, Positive, Negative")

    @field_validator("name", "value", "unit", "reference_range", "interpretation", mode="before")
    @classmethod
    def coerce_test_fields(cls, v: Any) -> str:
        if v is None:
            return ""
        if isinstance(v, list):
            return ", ".join(str(x) for x in v)
        return str(v)

class ConfidenceScores(BaseModel):
    document_type: float = Field(default=0.9, ge=0.0, le=1.0)
    patient_name: float = Field(default=0.9, ge=0.0, le=1.0)
    doctor_name: float = Field(default=0.9, ge=0.0, le=1.0)
    hospital_or_clinic: float = Field(default=0.9, ge=0.0, le=1.0)
    document_date: float = Field(default=0.9, ge=0.0, le=1.0)
    diagnoses: float = Field(default=0.9, ge=0.0, le=1.0)
    medicines: float = Field(default=0.9, ge=0.0, le=1.0)
    tests: float = Field(default=0.9, ge=0.0, le=1.0)
    overall: float = Field(default=0.9, ge=0.0, le=1.0)

    @field_validator("*", mode="before")
    @classmethod
    def sanitize_float(cls, v: Any) -> float:
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.9

class ExtractedMedicalDocument(BaseModel):
    document_type: str = Field(
        default="prescription",
        description="Type of medical document: 'prescription', 'lab_report', 'discharge_summary', or 'other'"
    )
    patient_name: Optional[str] = Field(default=None, description="Patient full name if identified")
    doctor_name: Optional[str] = Field(default=None, description="Doctor or physician full name and credentials")
    hospital_or_clinic: Optional[str] = Field(default=None, description="Hospital, clinic, or diagnostic center name & location")
    document_date: Optional[str] = Field(default=None, description="Date of document in YYYY-MM-DD format if possible")
    diagnoses: List[str] = Field(default_factory=list, description="List of clinical diagnoses, conditions, or chief complaints")
    medicines: List[MedicineItem] = Field(default_factory=list, description="List of prescribed or administered medications")
    tests: List[LabTestItem] = Field(default_factory=list, description="List of laboratory test results and biomarker values")
    confidence_scores: ConfidenceScores = Field(default_factory=ConfidenceScores, description="Confidence rating per field (0.0 to 1.0)")
    notes: Optional[str] = Field(default=None, description="General physician remarks, lifestyle advice, or clinical notes")

    @field_validator("notes", mode="before")
    @classmethod
    def normalize_notes(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, list):
            return ". ".join(str(item).strip() for item in v if item)
        return str(v).strip()

    @field_validator("diagnoses", mode="before")
    @classmethod
    def normalize_diagnoses(cls, v: Any) -> List[str]:
        if v is None:
            return []
        if isinstance(v, str):
            if not v.strip():
                return []
            return [d.strip() for d in v.split(",") if d.strip()]
        if isinstance(v, list):
            return [str(d).strip() for d in v if d]
        return [str(v)]

    @field_validator("patient_name", "doctor_name", "hospital_or_clinic", "document_date", mode="before")
    @classmethod
    def normalize_str_fields(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, list):
            return " ".join(str(x) for x in v)
        s = str(v).strip()
        return s if s else None

class UploadResponse(BaseModel):
    success: bool
    message: str
    file_hash: str
    filename: str
    file_size_bytes: int
    mime_type: str
    is_cached: bool = False
    is_fallback: bool = False
    fallback_reason: Optional[str] = None
    model_used: str
    data: ExtractedMedicalDocument
    created_at: str

