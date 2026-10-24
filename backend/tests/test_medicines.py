import sys
from pathlib import Path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.medicines.db_models import (
    DataSourceRecord,
    IngredientRecord,
    MedicineRecord,
    MedicineIngredientRecord,
    GenericProductRecord,
    LabelInfoRecord,
)
from app.medicines.seed_data import populate_seed_data
from app.medicines.search_service import (
    search_medicines,
    get_medicine_detail,
    _check_stale_price,
)
from app.medicines.substitute_service import find_substitutes
from app.medicines.interaction_service import check_drug_interactions
from app.medicines.duplicate_service import check_duplicate_ingredients
from app.medicines.report_service import generate_medicine_pdf
from app.integrations.http_client import get_provider_health


@pytest.fixture(scope="module")
def test_db():
    """Create a temporary in-memory SQLite database populated with seed medicines."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    populate_seed_data(db)
    yield db
    db.close()


def test_search_by_brand_name(test_db):
    """Search for 'Crocin' returns Crocin 650."""
    results = search_medicines(test_db, query="Crocin")
    assert len(results) > 0
    assert any("Crocin" in r.brand_name for r in results)


def test_search_by_active_ingredient(test_db):
    """Searching for 'Metformin' returns Glycomet and other Metformin brands."""
    results = search_medicines(test_db, query="Metformin")
    assert len(results) > 0
    has_metformin = any(
        any("Metformin" in ing.name for ing in r.ingredients) for r in results
    )
    assert has_metformin


def test_search_rx_filter(test_db):
    """Filter by OTC returns only OTC medicines."""
    results = search_medicines(test_db, rx_filter="OTC")
    assert len(results) > 0
    assert all(r.rx_or_otc == "OTC" for r in results)


def test_search_nlem_filter(test_db):
    """Filter by NLEM returns only medicines with NPPA ceiling status."""
    results = search_medicines(test_db, nlem_only=True)
    assert len(results) > 0
    assert all(r.nlem_flag is True for r in results)


def test_search_jan_aushadhi_filter(test_db):
    """Filter for medicines with Jan Aushadhi alternatives."""
    results = search_medicines(test_db, jan_aushadhi_only=True)
    assert len(results) > 0
    assert all(r.jan_aushadhi_code is not None for r in results)


def test_medicine_detail_and_label_attribution(test_db):
    """Medicine detail includes attributed label sections and context note."""
    med = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Crocin%")).first()
    assert med is not None
    detail = get_medicine_detail(test_db, med.id)
    assert detail is not None
    assert detail.brand_name == med.brand_name
    assert detail.label_context == "US label, may differ for India"
    assert "openFDA" in detail.label_source
    assert len(detail.ingredients) > 0


def test_substitute_service_exact_chemical_equivalence(test_db):
    """Substitutes must share identical active ingredient, strength, and dosage form."""
    med = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Crocin%")).first()
    assert med is not None
    subs = find_substitutes(test_db, med.id)
    assert subs is not None
    assert subs.reference_medicine_id == med.id
    # Calpol 650 or Dolo 650 should be found as substitutes
    assert subs.substitutes_found > 0
    for sub in subs.substitutes:
        assert sub.dosage_form.lower() == med.dosage_form.lower()
        assert sub.strength_text == med.strength_text


def test_substitute_savings_calculation(test_db):
    """Savings in rupees and percentage are mathematically consistent."""
    med = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Crocin%")).first()
    subs = find_substitutes(test_db, med.id)
    for sub in subs.substitutes:
        expected_savings = round(med.price_per_unit - sub.price_per_unit, 2)
        assert abs(sub.savings_rupees - expected_savings) < 0.05


def test_substitute_includes_jan_aushadhi_option(test_db):
    """Jan Aushadhi generic alternative is populated with PMBJP pricing."""
    med = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Glycomet 500%")).first()
    assert med is not None
    subs = find_substitutes(test_db, med.id)
    assert subs.jan_aushadhi_option is not None
    assert subs.jan_aushadhi_option.is_jan_aushadhi is True
    assert subs.jan_aushadhi_option.savings_percentage > 0


def test_generic_substitution_notice_mandatory(test_db):
    """Mandatory substitution notice must appear on all substitute responses."""
    med = test_db.query(MedicineRecord).first()
    subs = find_substitutes(test_db, med.id)
    expected_notice = "Same ingredient and strength. Ask your doctor or pharmacist before switching."
    assert subs.substitution_notice == expected_notice


def test_stale_price_detection():
    """Dates older than 90 days are flagged as stale."""
    assert _check_stale_price("2020-01-01", threshold_days=90) is True
    assert _check_stale_price("2099-01-01", threshold_days=90) is False


def test_drug_interaction_service_quoted_disclosure(test_db):
    """Drug interaction quotes official label sentence without prescribing advice."""
    med_aspirin = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Ecosprin%")).first()
    med_ibuprofen = test_db.query(MedicineRecord).filter(MedicineRecord.brand_name.ilike("%Brufen%")).first()
    assert med_aspirin is not None
    assert med_ibuprofen is not None

    res = check_drug_interactions(test_db, medicine_ids=[med_aspirin.id, med_ibuprofen.id])
    assert res.medicines_checked == [med_aspirin.brand_name, med_ibuprofen.brand_name]
    assert "Medical Disclaimer" in res.disclaimer
    assert res.interactions_count > 0
    assert "Concomitant" in res.interactions[0].quoted_sentence


def test_duplicate_active_ingredient_detection(test_db):
    """Prescribing Crocin and Calpol flags Paracetamol duplication."""
    res = check_duplicate_ingredients(test_db, medicine_names=["Crocin 650", "Calpol 650"])
    assert res.duplicates_detected is True
    assert res.duplicate_count >= 1
    assert any("Paracetamol" in f.ingredient_name for f in res.findings)
    assert "Duplicate active ingredient detected" in res.notice


def test_report_generation_pdf(test_db):
    """PDF generation produces valid PDF bytes with medical disclaimer."""
    med = test_db.query(MedicineRecord).first()
    detail = get_medicine_detail(test_db, med.id)
    subs = find_substitutes(test_db, med.id)
    pdf_bytes = generate_medicine_pdf(detail, subs)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")


def test_provider_health_telemetry():
    """Provider health returns initialized registry."""
    health = get_provider_health()
    assert "openfda" in health
    assert "nominatim" in health
    assert "osrm" in health
    assert health["nominatim"]["status"] in ["ready", "healthy", "ok"]
