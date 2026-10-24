"""
MedlinePlus Connect (U.S. National Library of Medicine) Integration.
Provides certified plain-language patient healthcare monographs and drug summaries by RxCUI.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import MEDLINEPLUS_BASE_URL
from app.integrations.http_client import safe_request

MEDLINEPLUS_LICENCE = "U.S. National Library of Medicine / NIH (Public Access)"


def fetch_patient_info_by_rxcui(rxcui: str) -> Dict[str, Any]:
    """
    Queries MedlinePlus Connect web service using standardized RxNorm CUI.
    Returns plain-language consumer monograph entries, links, and summaries.
    """
    url = MEDLINEPLUS_BASE_URL
    params = {
        "mainSearchCriteria.v.cs": "2.16.840.1.113883.6.88",  # OID for RxNorm
        "mainSearchCriteria.v.c": rxcui.strip(),
        "knowledgeResponseType": "application/json"
    }

    try:
        data = safe_request(provider="medlineplus", method="GET", url=url, params=params, timeout_sec=8.0)
        feed = data.get("feed", {})
        entries = feed.get("entry", [])

        if not entries:
            return {
                "found": False,
                "rxcui": rxcui,
                "source": "MedlinePlus Connect (NIH)"
            }

        first = entries[0]
        title = first.get("title", {}).get("_value", "Medication Summary")
        summary = first.get("summary", {}).get("_value", "")
        links = first.get("link", [])
        web_link = links[0].get("href") if links else None

        return {
            "found": True,
            "rxcui": rxcui,
            "title": title,
            "summary": summary,
            "patient_info_url": web_link,
            "source": "MedlinePlus Connect (NIH / NLM)",
            "licence": MEDLINEPLUS_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "found": False,
            "rxcui": rxcui,
            "source": "MedlinePlus Connect (NIH)",
            "error": str(e)
        }
