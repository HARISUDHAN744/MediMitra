import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.database import Base

class DocumentRecord(Base):
    __tablename__ = "document_records"

    id = Column(Integer, primary_key=True, index=True)
    file_hash = Column(String(64), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    document_type = Column(String(50), nullable=True)
    patient_name = Column(String(255), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    hospital_or_clinic = Column(String(255), nullable=True)
    document_date = Column(String(50), nullable=True)
    extracted_json = Column(Text, nullable=False)  # Full JSON serialization of ExtractedMedicalDocument
    is_fallback = Column(Boolean, default=False)
    model_used = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def get_extracted_data(self) -> dict:
        """Parses extracted JSON string into python dict."""
        try:
            return json.loads(self.extracted_json)
        except Exception:
            return {}


class TranslationCacheRecord(Base):
    __tablename__ = "translation_cache"

    id = Column(Integer, primary_key=True, index=True)
    source_text = Column(Text, index=True, nullable=False)
    target_language = Column(String(20), index=True, nullable=False)
    translated_text = Column(Text, nullable=False)
    model_used = Column(String(100), default="gemini")
    created_at = Column(DateTime, default=datetime.utcnow)
