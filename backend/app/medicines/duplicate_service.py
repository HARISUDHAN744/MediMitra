"""
Prescription Duplicate Active Ingredient Service
Detects duplicate therapeutic active ingredients across a patient's regimen
(e.g., Crocin and Calpol both containing Paracetamol), protecting against
accidental toxicity.
"""

from typing import List, Optional, Dict, Set
from collections import defaultdict
from sqlalchemy.orm import Session

from app.medicines.db_models import MedicineRecord
from app.medicines.schemas import (
    DuplicateFinding,
    DuplicateCheckResponse,
)


def check_duplicate_ingredients(
    db: Session,
    medicine_ids: Optional[List[str]] = None,
    medicine_names: Optional[List[str]] = None,
) -> DuplicateCheckResponse:
    """
    Check if a list of medicines shares any common active ingredients.
    """
    med_list: List[MedicineRecord] = []
    seen_ids: Set[str] = set()

    if medicine_ids:
        for mid in medicine_ids:
            if mid and mid not in seen_ids:
                med = db.query(MedicineRecord).filter(MedicineRecord.id == mid).first()
                if med:
                    med_list.append(med)
                    seen_ids.add(med.id)

    if medicine_names:
        for name in medicine_names:
            if not name or not name.strip():
                continue
            clean_name = name.strip()
            med = db.query(MedicineRecord).filter(
                MedicineRecord.brand_name.ilike(clean_name)
            ).first()
            if not med:
                med = db.query(MedicineRecord).filter(
                    MedicineRecord.brand_name.ilike(f"%{clean_name}%")
                ).first()
            if med and med.id not in seen_ids:
                med_list.append(med)
                seen_ids.add(med.id)

    # Map each ingredient name to the medicines that contain it
    ingredient_to_meds: Dict[str, List[str]] = defaultdict(list)
    for med in med_list:
        for link in med.ingredients:
            if link.ingredient:
                ing_name = link.ingredient.name
                if med.brand_name not in ingredient_to_meds[ing_name]:
                    ingredient_to_meds[ing_name].append(med.brand_name)

    findings: List[DuplicateFinding] = []
    for ing_name, brands in ingredient_to_meds.items():
        if len(brands) > 1:
            findings.append(
                DuplicateFinding(
                    ingredient_name=ing_name,
                    matched_medicines=brands,
                    warning=(
                        f"Both {', '.join(brands)} contain the active substance '{ing_name}'. "
                        "Taking both simultaneously may result in unintended duplicative therapy or excess dosage."
                    ),
                )
            )

    has_dups = len(findings) > 0
    return DuplicateCheckResponse(
        duplicates_detected=has_dups,
        duplicate_count=len(findings),
        findings=findings,
        notice=(
            "Duplicate active ingredient detected across your medications. "
            "Taking duplicate substances increases risk of adverse effects. Ask your doctor."
            if has_dups
            else "No duplicate active substances detected among the selected medications."
        ),
    )
