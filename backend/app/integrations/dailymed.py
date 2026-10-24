"""
DailyMed (U.S. National Library of Medicine) Integration.
Secondary structured product label source when openFDA has no match.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import DAILYMED_BASE_URL
from app.integrations.http_client import safe_request, ProviderError

DAILYMED_LICENCE = "U.S. National Library of Medicine (Public Domain / Open Access)"


def fetch_dailymed_label(drug_name: str) -> Dict[str, Any]:
    """
    Searches DailyMed REST API for drug SPL label metadata and text.
    Acts as reliable secondary source for FDA approved package inserts.
    """
    clean_name = drug_name.strip()
    url = f"{DAILYMED_BASE_URL}/spls.json"
    params = {"drug_name": clean_name, "page": 1, "pagesize": 1}

    try:
        data = safe_request(provider="dailymed", method="GET", url=url, params=params, timeout_sec=8.0)
        items = data.get("data", [])
        if not items:
            return {"found": False, "drug_name": clean_name, "source": "DailyMed (US label)"}

        spl = items[0]
        setid = spl.get("setid")
        title = spl.get("title", "")

        return {
            "found": True,
            "drug_name": clean_name,
            "title": title,
            "setid": setid,
            "source": "DailyMed (US label)",
            "label_context": "US label, may differ for India",
            "licence": DAILYMED_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "url": f"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid={setid}" if setid else None
        }
    except Exception as e:
        return {
            "found": False,
            "drug_name": clean_name,
            "source": "DailyMed (US label)",
            "error": str(e)
        }
