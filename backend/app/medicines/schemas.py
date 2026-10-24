"""
Pydantic Schemas for Medicine Knowledge Base, Jan Aushadhi Substitutes,
Drug Interactions, and Prescription Duplicate Checks.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class IngredientItem(BaseModel):
    id: str
    name: str
    strength_value: float
    strength_unit: str
    rxnorm_id: Optional[str] = None
    therapeutic_class: Optional[str] = None


class JanAushadhiGeneric(BaseModel):
    jan_aushadhi_code: str
    name: str
    dosage_form: str
    strength_text: str
    pack: str
    price: float
    as_of: str
    source: str


class MedicineSummary(BaseModel):
    id: str
    brand_name: str
    manufacturer: Optional[str] = None
    dosage_form: str
    strength_text: str
    pack_size: int
    pack_unit: str
    mrp: float
    price_per_unit: float
    rx_or_otc: str
    schedule_h_flag: bool
    nlem_flag: bool
    nppa_ceiling_price: Optional[float] = None
    price_as_of: str
    source_name: str
    is_stale_price: bool = False
    jan_aushadhi_code: Optional[str] = None
    jan_aushadhi_price: Optional[float] = None
    ingredients: List[IngredientItem] = Field(default_factory=list)


class MedicineDetail(MedicineSummary):
    plain_language_info: str
    substitutes_count: int = 0
    max_savings_percentage: Optional[float] = None
    label_sections: Dict[str, str] = Field(default_factory=dict)
    label_source: str = "openFDA (US label)"
    label_context: str = "US label, may differ for India"
    data_source_url: Optional[str] = None
    licence: str = "Open Access / Government Gazette"


class SubstituteItem(BaseModel):
    id: str
    brand_name: str
    manufacturer: Optional[str] = None
    dosage_form: str
    strength_text: str
    pack_size: int
    pack_unit: str
    mrp: float
    price_per_unit: float
    is_jan_aushadhi: bool = False
    savings_rupees: float
    savings_percentage: float
    price_as_of: str
    source: str


class SubstituteResponse(BaseModel):
    reference_medicine_id: str
    reference_brand_name: str
    reference_mrp: float
    reference_dosage_form: str
    reference_strength: str
    substitutes_found: int
    jan_aushadhi_option: Optional[SubstituteItem] = None
    substitutes: List[SubstituteItem]
    substitution_notice: str = "Same ingredient and strength. Ask your doctor or pharmacist before switching."


class InteractionFinding(BaseModel):
    drug_a: str
    drug_b: str
    quoted_sentence: str
    source: str
    severity_note: str = "Potential Interaction Noted in Official Label"


class InteractionCheckRequest(BaseModel):
    medicine_ids: Optional[List[str]] = None
    medicine_names: Optional[List[str]] = None


class InteractionCheckResponse(BaseModel):
    medicines_checked: List[str]
    interactions_count: int
    interactions: List[InteractionFinding]
    general_notice: str
    disclaimer: str = (
        "Medical Disclaimer: Interaction checks are based on available label disclosures. "
        "Absence of a flagged interaction does not guarantee clinical safety. Always consult your pharmacist or physician."
    )


class DuplicateFinding(BaseModel):
    ingredient_name: str
    matched_medicines: List[str]
    warning: str


class DuplicateCheckResponse(BaseModel):
    duplicates_detected: bool
    duplicate_count: int
    findings: List[DuplicateFinding]
    notice: str = "Duplicate active ingredient detected across your medications. Taking duplicate substances increases risk of adverse effects. Ask your doctor."


class ProviderHealthResponse(BaseModel):
    status: str
    timestamp: str
    providers: Dict[str, Any]
