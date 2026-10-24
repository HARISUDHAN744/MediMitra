"""
RxNav (U.S. National Library of Medicine) Integration.
Provides standardized RxCUI identifier resolution, brand-to-ingredient mapping,
and approximate term matching for clinical entity reconciliation.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import RXNAV_BASE_URL
from app.integrations.http_client import safe_request, ProviderError

RXNAV_LICENCE = "U.S. National Library of Medicine (NLM) Terms of Service (Open Access)"


def get_rxcui_by_name(concept_name: str) -> Optional[str]:
    """Resolves medication or active substance name to canonical RxCUI identifier."""
    url = f"{RXNAV_BASE_URL}/rxcui.json"
    params = {"name": concept_name.strip()}

    try:
        data = safe_request(provider="rxnav", method="GET", url=url, params=params, timeout_sec=6.0)
        id_group = data.get("idGroup", {})
        rxnorm_id_list = id_group.get("rxnormId", [])
        if rxnorm_id_list and len(rxnorm_id_list) > 0:
            return str(rxnorm_id_list[0])
    except Exception:
        pass
    return None


def find_approximate_matches(term: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Finds approximate concept matches with candidate RxCUIs and similarity ranks.
    Helpful for noisy prescription OCR strings and misspelled brand names.
    """
    url = f"{RXNAV_BASE_URL}/approximateTerm.json"
    params = {"term": term.strip(), "maxEntries": max_results}

    matches = []
    try:
        data = safe_request(provider="rxnav", method="GET", url=url, params=params, timeout_sec=6.0)
        cand_list = data.get("approximateGroup", {}).get("candidate", [])
        for c in cand_list:
            matches.append({
                "rxcui": c.get("rxcui"),
                "score": c.get("score"),
                "rank": c.get("rank")
            })
    except Exception:
        pass
    return matches


def normalize_ingredient_via_rxnav(raw_name: str) -> Dict[str, Any]:
    """
    Standardizes raw medication/substance string via RxNav,
    returning RxCUI, canonical name, source, and retrieval metadata.
    """
    clean = raw_name.strip()
    rxcui = get_rxcui_by_name(clean)
    approx = []
    if not rxcui:
        approx = find_approximate_matches(clean, max_results=3)
        if approx:
            rxcui = approx[0]["rxcui"]

    return {
        "query": clean,
        "rxcui": rxcui,
        "approximate_candidates": approx,
        "source": "U.S. National Library of Medicine (RxNav)",
        "licence": RXNAV_LICENCE,
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }
