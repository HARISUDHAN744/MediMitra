"""
SQLAlchemy Models for Medicine Knowledge Base, Jan Aushadhi Generics,
openFDA Clinical Labels, and Provider Response Cache.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, Date, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


class DataSourceRecord(Base):
    """Catalog of official data sources and their open-access licenses."""
    __tablename__ = "data_source"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    licence = Column(String(255), nullable=False)
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    medicines = relationship("MedicineRecord", back_populates="source")


class IngredientRecord(Base):
    """Active pharmacological substances with standardized RxCUI and ATC codes."""
    __tablename__ = "ingredient"

    id = Column(String(100), primary_key=True)  # Normalized lower string e.g. 'paracetamol'
    name = Column(String(255), unique=True, nullable=False, index=True)
    rxnorm_id = Column(String(50), nullable=True, index=True)
    atc_code = Column(String(50), nullable=True)
    therapeutic_class = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    medicine_links = relationship("MedicineIngredientRecord", back_populates="ingredient")
    labels = relationship("LabelInfoRecord", back_populates="ingredient")
    generics = relationship("GenericProductRecord", back_populates="ingredient")


class MedicineRecord(Base):
    """Retail brand medicines and branded formulations with pricing and regulatory flags."""
    __tablename__ = "medicine"

    id = Column(String(100), primary_key=True)
    brand_name = Column(String(255), nullable=False, index=True)
    manufacturer = Column(String(255), nullable=True, index=True)
    dosage_form = Column(String(100), nullable=False, index=True)  # e.g., 'Tablet', 'Capsule', 'Syrup'
    strength_text = Column(String(150), nullable=False)            # e.g., '500 mg', '500mg + 125mg'
    pack_size = Column(Integer, default=10, nullable=False)
    pack_unit = Column(String(50), default="Tablets", nullable=False)
    mrp = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    rx_or_otc = Column(String(10), default="Rx", nullable=False)
    schedule_h_flag = Column(Boolean, default=False)
    nlem_flag = Column(Boolean, default=False)                     # National List of Essential Medicines
    nppa_ceiling_price = Column(Float, nullable=True)             # NPPA DPCO price ceiling if regulated
    source_id = Column(String(50), ForeignKey("data_source.id"), nullable=True)
    price_as_of = Column(String(50), nullable=False)              # e.g., '2025-01-15'
    last_updated = Column(DateTime, default=datetime.utcnow)

    source = relationship("DataSourceRecord", back_populates="medicines")
    ingredients = relationship("MedicineIngredientRecord", back_populates="medicine", cascade="all, delete-orphan")


class MedicineIngredientRecord(Base):
    """Junction model mapping a medicine product to its constituent ingredients with strength."""
    __tablename__ = "medicine_ingredient"

    id = Column(Integer, primary_key=True, autoincrement=True)
    medicine_id = Column(String(100), ForeignKey("medicine.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(String(100), ForeignKey("ingredient.id"), nullable=False, index=True)
    strength_value = Column(Float, nullable=False)
    strength_unit = Column(String(50), nullable=False)             # e.g. 'mg', 'mcg', 'ml', '%'

    medicine = relationship("MedicineRecord", back_populates="ingredients")
    ingredient = relationship("IngredientRecord", back_populates="medicine_links")


class GenericProductRecord(Base):
    """PMBJP Pradhan Mantri Bhartiya Janaushadhi Pariyojana affordable generic formulations."""
    __tablename__ = "generic_product"

    jan_aushadhi_code = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    ingredient_id = Column(String(100), ForeignKey("ingredient.id"), nullable=True, index=True)
    dosage_form = Column(String(100), nullable=False)
    strength_text = Column(String(150), nullable=False)
    pack = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    as_of = Column(String(50), nullable=False)
    source = Column(String(255), default="PMBJP Official Catalog (BPPI)", nullable=False)

    ingredient = relationship("IngredientRecord", back_populates="generics")


class LabelInfoRecord(Base):
    """Attributed clinical drug label text sections from openFDA and DailyMed."""
    __tablename__ = "label_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ingredient_id = Column(String(100), ForeignKey("ingredient.id"), nullable=False, index=True)
    source = Column(String(100), nullable=False)  # 'openFDA (US label)', 'DailyMed'
    section = Column(String(50), nullable=False)  # 'indications', 'warnings', 'contraindications', 'adverse_reactions', 'interactions'
    text = Column(Text, nullable=False)
    url = Column(String(500), nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    ingredient = relationship("IngredientRecord", back_populates="labels")


class ProviderCacheRecord(Base):
    """Persistent SQLite response cache for external API providers with TTL."""
    __tablename__ = "provider_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider = Column(String(50), nullable=False, index=True)
    request_hash = Column(String(64), unique=True, nullable=False, index=True)
    response_json = Column(Text, nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow)
    ttl_seconds = Column(Integer, default=2592000, nullable=False)  # default 30 days
