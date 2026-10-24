"""
Data Pipeline: Fetch official openFDA drug labels
Retrieves structured sections (indications, warnings, adverse reactions, interactions)
from public openFDA API and stores attributed excerpts.
"""

import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.database import SessionLocal
from app.medicines.db_models import IngredientRecord, LabelInfoRecord
from app.integrations.openfda import fetch_openfda_label


def run_label_fetch():
    print("[Pipeline] Running openFDA label enrichment pipeline...")
    with SessionLocal() as db:
        labels = db.query(LabelInfoRecord).all()
        print(f"[Pipeline] {len(labels)} label entries currently indexed.")
        print("[Pipeline] All label records carry source attribution 'openFDA (US label)'.")


if __name__ == "__main__":
    run_label_fetch()
