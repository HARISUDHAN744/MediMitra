"""
ChEMBL (European Bioinformatics Institute / EMBL-EBI) Integration.
Provides drug mechanism of action, therapeutic target classes, and bioactivity annotations.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import CHEMBL_BASE_URL
from app.integrations.http_client import safe_request

CHEMBL_LICENCE = "Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)"


def fetch_drug_mechanism(drug_name: str) -> Dict[str, Any]:
    """
    Queries ChEMBL molecule endpoint to identify primary biological mechanism and target.
    """
    clean_name = drug_name.strip()
    url = f"{CHEMBL_BASE_URL}/molecule/search.json"
    params = {"q": clean_name, "limit": 1}

    try:
        data = safe_request(provider="chembl", method="GET", url=url, params=params, timeout_sec=8.0)
        molecules = data.get("molecules", [])
        if not molecules:
            return {"found": False, "drug_name": clean_name, "source": "ChEMBL (EMBL-EBI)"}

        mol = molecules[0]
        chembl_id = mol.get("molecule_chembl_id")
        props = mol.get("molecule_properties") or {}
        max_phase = mol.get("max_phase")
        atc_classifications = mol.get("atc_classifications", [])

        return {
            "found": True,
            "drug_name": clean_name,
            "chembl_id": chembl_id,
            "max_phase": max_phase,
            "atc_codes": atc_classifications,
            "alogp": props.get("alogp"),
            "full_mwt": props.get("full_mwt"),
            "source": "ChEMBL (EMBL-EBI)",
            "licence": CHEMBL_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "found": False,
            "drug_name": clean_name,
            "source": "ChEMBL (EMBL-EBI)",
            "error": str(e)
        }
