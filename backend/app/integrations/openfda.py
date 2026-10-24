"""
openFDA Drug Label Provider Integration.
Queries official US FDA structured product labels by generic/active substance name.
Complies with openFDA Terms of Service & CC0 Public Domain attribution.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import OPENFDA_BASE_URL, OPENFDA_API_KEY
from app.integrations.http_client import safe_request, ProviderNotFoundError, ProviderError

OPENFDA_DISCLAIMER = (
    "openFDA is a data service providing public access to official FDA datasets. "
    "Data provided by openFDA is not validated by the FDA for clinical decision making. "
    "US label information may differ from approved indications or formulations in India."
)


def fetch_drug_label(generic_name: str) -> Dict[str, Any]:
    """
    Searches openFDA Drug Label endpoint for an active substance or generic name.
    Extracts clinical sections: indications, contraindications, warnings,
    adverse_reactions, drug_interactions, pregnancy, pediatric and geriatric use.
    """
    clean_name = generic_name.strip()
    params: Dict[str, Any] = {
        "search": f'openfda.generic_name:"{clean_name}"',
        "limit": 1
    }
    if OPENFDA_API_KEY:
        params["api_key"] = OPENFDA_API_KEY

    url = f"{OPENFDA_BASE_URL}/drug/label.json"

    try:
        data = safe_request(provider="openfda", method="GET", url=url, params=params, timeout_sec=8.0)
    except ProviderNotFoundError:
        # Fallback to broader text query
        params["search"] = clean_name
        try:
            data = safe_request(provider="openfda", method="GET", url=url, params=params, timeout_sec=8.0)
        except Exception as e:
            return {
                "found": False,
                "generic_name": clean_name,
                "source": "openFDA (US label)",
                "error": str(e),
                "disclaimer": OPENFDA_DISCLAIMER
            }
    except Exception as e:
        return {
            "found": False,
            "generic_name": clean_name,
            "source": "openFDA (US label)",
            "error": str(e),
            "disclaimer": OPENFDA_DISCLAIMER
        }

    results = data.get("results", [])
    if not results:
        return {
            "found": False,
            "generic_name": clean_name,
            "source": "openFDA (US label)",
            "disclaimer": OPENFDA_DISCLAIMER
        }

    item = results[0]

    def _extract_section(field_names):
        for f in field_names:
            val = item.get(f)
            if val and isinstance(val, list) and len(val) > 0:
                return " ".join(val).strip()
            elif isinstance(val, str) and val.strip():
                return val.strip()
        return "No specific section text documented in this label."

    return {
        "found": True,
        "generic_name": clean_name,
        "brand_names": item.get("openfda", {}).get("brand_name", []),
        "source": "openFDA (US label)",
        "licence": "U.S. Government Work (Public Domain / CC0)",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": OPENFDA_DISCLAIMER,
        "label_context": "US label, may differ for India",
        "sections": {
            "indications": _extract_section(["indications_and_usage", "purpose"]),
            "contraindications": _extract_section(["contraindications"]),
            "warnings": _extract_section(["warnings", "boxed_warning", "warnings_and_cautions"]),
            "adverse_reactions": _extract_section(["adverse_reactions"]),
            "drug_interactions": _extract_section(["drug_interactions"]),
            "pregnancy": _extract_section(["pregnancy", "pregnancy_or_breast_feeding"]),
            "pediatric_use": _extract_section(["pediatric_use"]),
            "geriatric_use": _extract_section(["geriatric_use"]),
        }
    }
