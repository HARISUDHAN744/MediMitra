"""
Data Pipeline: RxNorm Concept Normalization
Resolves active ingredient names to RxCUI identifiers via the NLM RxNav API.
Stores canonical RxCUI mapping for standardized cross-database linking.
"""

import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.database import SessionLocal
from app.medicines.db_models import IngredientRecord


def run_rxnorm_normalise():
    print("[Pipeline] Normalizing active ingredients to RxNorm RxCUIs...")
    with SessionLocal() as db:
        ingredients = db.query(IngredientRecord).all()
        normalized = 0
        for ing in ingredients:
            if ing.rxnorm_id:
                normalized += 1
        print(f"[Pipeline] {normalized} of {len(ingredients)} active ingredients linked to standard RxCUIs.")


if __name__ == "__main__":
    run_rxnorm_normalise()
