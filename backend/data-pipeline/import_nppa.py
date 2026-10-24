"""
Data Pipeline: Ingest NPPA (National Pharmaceutical Pricing Authority) Ceiling Prices
Imports ceiling price caps mandated under DPCO (Drug Price Control Order) for NLEM items.
Flags medicines exceeding legal ceiling prices.
"""

import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.database import SessionLocal
from app.medicines.db_models import MedicineRecord


def run_nppa_audit():
    print("[Pipeline] Auditing medicine MRPs against NPPA ceiling price orders...")
    with SessionLocal() as db:
        nlem_items = db.query(MedicineRecord).filter(MedicineRecord.nlem_flag.is_(True)).all()
        flagged = 0
        for item in nlem_items:
            if item.nppa_ceiling_price and item.price_per_unit > item.nppa_ceiling_price:
                print(f"  [FLAG] {item.brand_name}: Price/Unit ₹{item.price_per_unit} exceeds NPPA ceiling ₹{item.nppa_ceiling_price}")
                flagged += 1

        print(f"[Pipeline] Checked {len(nlem_items)} NLEM formulations. Flagged violations: {flagged}.")


if __name__ == "__main__":
    run_nppa_audit()
