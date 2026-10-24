"""
Medicine Search Service
Handles fast brand, ingredient, and Jan Aushadhi search with filtering,
price staleness calculation, and full detail lookups.
"""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.medicines.db_models import (
    MedicineRecord,
    MedicineIngredientRecord,
    IngredientRecord,
    LabelInfoRecord,
    GenericProductRecord,
)
from app.medicines.schemas import (
    MedicineSummary,
    MedicineDetail,
    IngredientItem,
)


def _check_stale_price(price_as_of_str: str, threshold_days: int = 90) -> bool:
    """
    Check if a price record is older than threshold_days.
    Date format expected: YYYY-MM-DD
    """
    if not price_as_of_str:
        return True
    try:
        price_date = datetime.strptime(price_as_of_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = (now - price_date).days
        return diff > threshold_days
    except Exception:
        return False


def _build_summary(med: MedicineRecord, db: Optional[Session] = None) -> MedicineSummary:
    """Transform MedicineRecord into Pydantic MedicineSummary."""
    ingredients_list = []
    ja_code = None
    ja_price = None

    for link in med.ingredients:
        ing = link.ingredient
        if ing:
            ingredients_list.append(
                IngredientItem(
                    id=ing.id,
                    name=ing.name,
                    strength_value=link.strength_value,
                    strength_unit=link.strength_unit,
                    rxnorm_id=ing.rxnorm_id,
                    therapeutic_class=ing.therapeutic_class,
                )
            )
            # Check for Jan Aushadhi match from generics relationship or query
            if not ja_code and ing.generics:
                for gen in ing.generics:
                    if gen.dosage_form.lower() == med.dosage_form.lower():
                        ja_code = gen.jan_aushadhi_code
                        ja_price = gen.price
                        break

    is_stale = _check_stale_price(med.price_as_of)
    source_name = med.source.name if med.source else "NPPA / Open Data"

    return MedicineSummary(
        id=med.id,
        brand_name=med.brand_name,
        manufacturer=med.manufacturer,
        dosage_form=med.dosage_form,
        strength_text=med.strength_text,
        pack_size=med.pack_size,
        pack_unit=med.pack_unit,
        mrp=med.mrp,
        price_per_unit=med.price_per_unit,
        rx_or_otc=med.rx_or_otc,
        schedule_h_flag=med.schedule_h_flag,
        nlem_flag=med.nlem_flag,
        nppa_ceiling_price=med.nppa_ceiling_price,
        price_as_of=med.price_as_of,
        source_name=source_name,
        is_stale_price=is_stale,
        jan_aushadhi_code=ja_code,
        jan_aushadhi_price=ja_price,
        ingredients=ingredients_list,
    )


def search_medicines(
    db: Session,
    query: Optional[str] = None,
    rx_filter: Optional[str] = None,
    nlem_only: bool = False,
    jan_aushadhi_only: bool = False,
    limit: int = 50,
) -> List[MedicineSummary]:
    """
    Search medicines database by brand name or constituent active ingredient.
    Supports filtering by Rx/OTC, NLEM ceiling status, or Jan Aushadhi availability.
    """
    stmt = db.query(MedicineRecord)

    if rx_filter:
        clean_rx = rx_filter.strip().upper()
        if clean_rx in ["RX", "OTC"]:
            stmt = stmt.filter(MedicineRecord.rx_or_otc.ilike(clean_rx))

    if nlem_only:
        stmt = stmt.filter(MedicineRecord.nlem_flag.is_(True))

    if query and query.strip():
        q = f"%{query.strip().lower()}%"
        stmt = stmt.outerjoin(MedicineRecord.ingredients).outerjoin(MedicineIngredientRecord.ingredient)
        stmt = stmt.filter(
            or_(
                MedicineRecord.brand_name.ilike(q),
                MedicineRecord.manufacturer.ilike(q),
                IngredientRecord.name.ilike(q),
                MedicineRecord.dosage_form.ilike(q),
            )
        ).distinct()

    results = stmt.limit(limit).all()

    # Sort results: exact brand name matches first, then starts-with, then alphabetized
    if query and query.strip():
        clean_q = query.strip().lower()
        results.sort(
            key=lambda m: (
                0 if m.brand_name.lower() == clean_q else (
                    1 if m.brand_name.lower().startswith(clean_q) else 2
                ),
                m.brand_name.lower(),
            )
        )

    summaries = [_build_summary(med, db) for med in results]
    if jan_aushadhi_only:
        summaries = [s for s in summaries if s.jan_aushadhi_code is not None]

    return summaries


def get_medicine_detail(db: Session, medicine_id: str) -> Optional[MedicineDetail]:
    """
    Fetch full clinical & pricing detail for a medicine, including
    attributed FDA/open label sections, plain-language summary, and substitute counts.
    """
    med = db.query(MedicineRecord).filter(MedicineRecord.id == medicine_id).first()
    if not med:
        return None

    summary = _build_summary(med, db)

    # Label sections from LabelInfoRecord via ingredients
    label_sections = {}
    label_source = "openFDA (US label)"
    label_url = None

    for link in med.ingredients:
        lbls = db.query(LabelInfoRecord).filter(LabelInfoRecord.ingredient_id == link.ingredient_id).all()
        for lbl in lbls:
            if lbl.section not in label_sections:
                label_sections[lbl.section] = lbl.text
            if lbl.source:
                label_source = lbl.source
            if lbl.url:
                label_url = lbl.url

    # Calculate substitute count and max savings
    substitutes_count = 0
    max_savings_percentage = None

    med_ing_links = med.ingredients
    if med_ing_links:
        ing_ids = {link.ingredient_id for link in med_ing_links}
        candidates = db.query(MedicineRecord).filter(
            MedicineRecord.id != med.id,
            MedicineRecord.dosage_form.ilike(med.dosage_form),
            MedicineRecord.strength_text.ilike(med.strength_text),
        ).all()

        matching_subs = []
        for cand in candidates:
            cand_ing_ids = {cl.ingredient_id for cl in cand.ingredients}
            if cand_ing_ids == ing_ids:
                matching_subs.append(cand)

        substitutes_count = len(matching_subs)

        lowest_unit_price = med.price_per_unit
        if summary.jan_aushadhi_price:
            ja_unit_price = summary.jan_aushadhi_price / max(med.pack_size, 1)
            lowest_unit_price = min(lowest_unit_price, ja_unit_price)

        for sub in matching_subs:
            lowest_unit_price = min(lowest_unit_price, sub.price_per_unit)

        if lowest_unit_price < med.price_per_unit and med.price_per_unit > 0:
            savings = ((med.price_per_unit - lowest_unit_price) / med.price_per_unit) * 100.0
            max_savings_percentage = round(savings, 1)

    # Plain language info (no dosing advice!)
    plain_info = (
        f"{med.brand_name} contains "
        + ", ".join([f"{i.name} ({i.strength_value}{i.strength_unit})" for i in summary.ingredients])
        + f". Formulated as {med.dosage_form}."
    )
    if med.schedule_h_flag:
        plain_info += " Regulated under Schedule H (Prescription required by law in India)."
    elif med.rx_or_otc.upper() == "OTC":
        plain_info += " Available Over-The-Counter (OTC)."

    licence_info = med.source.licence if med.source else "Open Access / Government Gazette"
    data_url = med.source.url if med.source else label_url

    return MedicineDetail(
        **summary.model_dump(),
        plain_language_info=plain_info,
        substitutes_count=substitutes_count,
        max_savings_percentage=max_savings_percentage,
        label_sections=label_sections,
        label_source=label_source,
        label_context="US label, may differ for India",
        data_source_url=data_url,
        licence=licence_info,
    )
