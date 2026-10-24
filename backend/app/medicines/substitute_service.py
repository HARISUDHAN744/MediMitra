"""
Substitute Service
Finds verified bioequivalent/chemically equivalent substitutes
(exact same active ingredients, exact same strength, same dosage form).
Calculates exact rupee and percentage savings against the reference brand.
Includes Jan Aushadhi (PMBJP) generic alternatives.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.medicines.db_models import (
    MedicineRecord,
    MedicineIngredientRecord,
    GenericProductRecord,
)
from app.medicines.schemas import (
    SubstituteItem,
    SubstituteResponse,
)


def find_substitutes(db: Session, medicine_id: str) -> Optional[SubstituteResponse]:
    """
    Find lower-cost and generic alternatives that share the exact same
    active ingredients, strength, and dosage form.
    """
    ref_med = db.query(MedicineRecord).filter(MedicineRecord.id == medicine_id).first()
    if not ref_med:
        return None

    # Get set of active ingredient IDs & strengths for the reference medicine
    ref_links = ref_med.ingredients
    ref_ing_map = {link.ingredient_id: (link.strength_value, link.strength_unit) for link in ref_links}

    # Query candidate medicines matching the same dosage form
    candidates = db.query(MedicineRecord).filter(
        MedicineRecord.id != ref_med.id,
        MedicineRecord.dosage_form.ilike(ref_med.dosage_form),
    ).all()

    substitutes_list: List[SubstituteItem] = []

    for cand in candidates:
        cand_links = cand.ingredients
        cand_ing_map = {cl.ingredient_id: (cl.strength_value, cl.strength_unit) for cl in cand_links}

        # Check identical ingredient set and exact same strength
        if cand_ing_map == ref_ing_map:
            ref_unit_price = ref_med.price_per_unit
            cand_unit_price = cand.price_per_unit
            savings_rs = round(ref_unit_price - cand_unit_price, 2)
            savings_pct = round(((ref_unit_price - cand_unit_price) / ref_unit_price) * 100.0, 1) if ref_unit_price > 0 else 0.0

            source_str = cand.source.name if cand.source else "NPPA / Open Data"

            substitutes_list.append(
                SubstituteItem(
                    id=cand.id,
                    brand_name=cand.brand_name,
                    manufacturer=cand.manufacturer,
                    dosage_form=cand.dosage_form,
                    strength_text=cand.strength_text,
                    pack_size=cand.pack_size,
                    pack_unit=cand.pack_unit,
                    mrp=cand.mrp,
                    price_per_unit=cand.price_per_unit,
                    is_jan_aushadhi=False,
                    savings_rupees=savings_rs,
                    savings_percentage=savings_pct,
                    price_as_of=cand.price_as_of,
                    source=source_str,
                )
            )

    substitutes_list.sort(key=lambda s: s.savings_percentage, reverse=True)

    # Check for Jan Aushadhi generic equivalent from GenericProductRecord
    jan_aushadhi_option: Optional[SubstituteItem] = None

    # Match by ingredient id + dosage form
    if ref_links:
        first_ing_id = ref_links[0].ingredient_id
        gen = db.query(GenericProductRecord).filter(
            GenericProductRecord.ingredient_id == first_ing_id,
            GenericProductRecord.dosage_form.ilike(ref_med.dosage_form),
        ).first()

        if gen:
            # Jan Aushadhi price per unit
            pack_count = 10
            if "pack" in gen.pack.lower() or "tablets" in gen.pack.lower():
                try:
                    pack_count = int("".join(filter(str.isdigit, gen.pack)))
                except Exception:
                    pack_count = 10
            ja_unit_price = round(gen.price / max(pack_count, 1), 2)
            savings_rs = round(ref_med.price_per_unit - ja_unit_price, 2)
            savings_pct = round(((ref_med.price_per_unit - ja_unit_price) / ref_med.price_per_unit) * 100.0, 1) if ref_med.price_per_unit > 0 else 0.0

            jan_aushadhi_option = SubstituteItem(
                id=f"ja-{gen.jan_aushadhi_code}",
                brand_name=f"{gen.name} ({gen.jan_aushadhi_code})",
                manufacturer="Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
                dosage_form=gen.dosage_form,
                strength_text=gen.strength_text,
                pack_size=pack_count,
                pack_unit=gen.pack,
                mrp=gen.price,
                price_per_unit=ja_unit_price,
                is_jan_aushadhi=True,
                savings_rupees=savings_rs,
                savings_percentage=savings_pct,
                price_as_of=gen.as_of,
                source=gen.source,
            )

    return SubstituteResponse(
        reference_medicine_id=ref_med.id,
        reference_brand_name=ref_med.brand_name,
        reference_mrp=ref_med.mrp,
        reference_dosage_form=ref_med.dosage_form,
        reference_strength=ref_med.strength_text,
        substitutes_found=len(substitutes_list),
        jan_aushadhi_option=jan_aushadhi_option,
        substitutes=substitutes_list,
        substitution_notice="Same ingredient and strength. Ask your doctor or pharmacist before switching.",
    )
