"""
PubChem (National Center for Biotechnology Information / NIH) Integration.
Retrieves molecular chemistry, IUPAC names, and SMILES/InChI structures.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import PUBCHEM_BASE_URL
from app.integrations.http_client import safe_request

PUBCHEM_LICENCE = "National Library of Medicine / NCBI (Public Domain / Open Data)"


def fetch_compound_properties(substance_name: str) -> Dict[str, Any]:
    """
    Fetches chemical formula, molecular weight, and IUPAC nomenclature for an active ingredient.
    """
    clean_name = substance_name.strip()
    url = f"{PUBCHEM_BASE_URL}/compound/name/{clean_name}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON"

    try:
        data = safe_request(provider="pubchem", method="GET", url=url, timeout_sec=8.0)
        table = data.get("PropertyTable", {}).get("Properties", [])
        if not table:
            return {"found": False, "substance": clean_name, "source": "PubChem (NCBI)"}

        prop = table[0]
        return {
            "found": True,
            "substance": clean_name,
            "cid": prop.get("CID"),
            "formula": prop.get("MolecularFormula"),
            "molecular_weight": prop.get("MolecularWeight"),
            "iupac_name": prop.get("IUPACName"),
            "smiles": prop.get("CanonicalSMILES"),
            "source": "PubChem (NCBI / NIH)",
            "licence": PUBCHEM_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "found": False,
            "substance": clean_name,
            "source": "PubChem (NCBI)",
            "error": str(e)
        }
