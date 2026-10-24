"""
Drug Interaction Service
Cross-checks pairs of medicines against official label disclosures.
SAFETY RULE: Shows ONLY quoted, attributed text from official drug labels.
Never writes dosing instructions or clinical treatment advice.
"""

import re
from typing import List, Optional, Set
from sqlalchemy.orm import Session

from app.medicines.db_models import (
    MedicineRecord,
    LabelInfoRecord,
    IngredientRecord,
)
from app.medicines.schemas import (
    InteractionFinding,
    InteractionCheckResponse,
)


def _extract_quoted_interaction(label_text: str, target_substances: List[str]) -> Optional[str]:
    """
    Search label text for sentences referencing any target substance.
    Extracts the exact sentence without editorializing or rephrasing.
    """
    if not label_text:
        return None

    sentences = re.split(r"(?<=[.!?])\s+", label_text)
    for sentence in sentences:
        clean_sentence = sentence.strip()
        lower_sentence = clean_sentence.lower()
        for target in target_substances:
            # Check target or target's root (e.g. 'atorvastatin' in sentence)
            t_clean = target.lower().split()[0] if target else ""
            if len(t_clean) >= 4 and t_clean in lower_sentence and len(clean_sentence) > 15:
                return clean_sentence

    return None


def check_drug_interactions(
    db: Session,
    medicine_ids: Optional[List[str]] = None,
    medicine_names: Optional[List[str]] = None,
) -> InteractionCheckResponse:
    """
    Cross-check multiple medicines for known drug interactions reported
    in official label disclosures.
    """
    med_list: List[MedicineRecord] = []
    seen_ids: Set[str] = set()

    # 1. Resolve medicine IDs
    if medicine_ids:
        for mid in medicine_ids:
            if mid and mid not in seen_ids:
                med = db.query(MedicineRecord).filter(MedicineRecord.id == mid).first()
                if med:
                    med_list.append(med)
                    seen_ids.add(med.id)

    # 2. Resolve medicine names
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

    med_names = [m.brand_name for m in med_list]
    findings: List[InteractionFinding] = []

    # Check all pairs
    for i in range(len(med_list)):
        for j in range(i + 1, len(med_list)):
            med_a = med_list[i]
            med_b = med_list[j]

            substances_b = [link.ingredient.name for link in med_b.ingredients if link.ingredient]
            substances_b.append(med_b.brand_name)

            substances_a = [link.ingredient.name for link in med_a.ingredients if link.ingredient]
            substances_a.append(med_a.brand_name)

            quote_found = False

            # Check med_a's ingredients' labels
            ing_ids_a = [link.ingredient_id for link in med_a.ingredients]
            labels_a = db.query(LabelInfoRecord).filter(
                LabelInfoRecord.ingredient_id.in_(ing_ids_a),
                LabelInfoRecord.section.ilike("%interaction%"),
            ).all()

            for lbl in labels_a:
                quote = _extract_quoted_interaction(lbl.text, substances_b)
                if quote:
                    findings.append(
                        InteractionFinding(
                            drug_a=med_a.brand_name,
                            drug_b=med_b.brand_name,
                            quoted_sentence=f'"{quote}"',
                            source=lbl.source or "openFDA (US label)",
                            severity_note="Potential Interaction Noted in Official Label",
                        )
                    )
                    quote_found = True
                    break

            if not quote_found:
                ing_ids_b = [link.ingredient_id for link in med_b.ingredients]
                labels_b = db.query(LabelInfoRecord).filter(
                    LabelInfoRecord.ingredient_id.in_(ing_ids_b),
                    LabelInfoRecord.section.ilike("%interaction%"),
                ).all()

                for lbl in labels_b:
                    quote = _extract_quoted_interaction(lbl.text, substances_a)
                    if quote:
                        findings.append(
                            InteractionFinding(
                                drug_a=med_b.brand_name,
                                drug_b=med_a.brand_name,
                                quoted_sentence=f'"{quote}"',
                                source=lbl.source or "openFDA (US label)",
                                severity_note="Potential Interaction Noted in Official Label",
                            )
                        )
                        break

    notice = (
        f"Found {len(findings)} potential interaction disclosure(s) across {len(med_names)} checked medications."
        if findings
        else f"No flagged interactions found in available label records for the {len(med_names)} selected medicines."
    )

    return InteractionCheckResponse(
        medicines_checked=med_names,
        interactions_count=len(findings),
        interactions=findings,
        general_notice=notice,
        disclaimer=(
            "Medical Disclaimer: Interaction checks are based on available label disclosures. "
            "Absence of a flagged interaction does not guarantee clinical safety. Always consult your pharmacist or physician."
        ),
    )
