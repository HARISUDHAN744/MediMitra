"""
OpenStreetMap Nominatim Geocoding Integration.
Complies with Nominatim Usage Policy:
- Custom descriptive User-Agent with contact email
- Strict rate limiting of max 1 request/second
- Local caching with 7-day TTL
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import NOMINATIM_URL, APP_CONTACT_EMAIL
from app.integrations.http_client import safe_request

NOMINATIM_LICENCE = "OpenStreetMap contributors (ODbL / Open Database License)"


def reverse_geocode(lat: float, lng: float) -> Dict[str, Any]:
    """
    Resolves GPS latitude/longitude coordinates into city, district, state and pincode.
    """
    url = f"{NOMINATIM_URL}/reverse"
    params = {
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
        "zoom": 14
    }
    headers = {
        "User-Agent": f"MediMitra-HealthHub/2.0 ({APP_CONTACT_EMAIL})"
    }

    try:
        data = safe_request(
            provider="nominatim",
            method="GET",
            url=url,
            params=params,
            headers=headers,
            timeout_sec=6.0,
            custom_ttl=7 * 86400  # 7 days
        )
        address = data.get("address", {})
        city = (
            address.get("city") or
            address.get("town") or
            address.get("municipality") or
            address.get("county") or
            address.get("state_district") or
            "Current Area"
        )
        state = address.get("state", "India")
        postcode = address.get("postcode", "")

        return {
            "found": True,
            "display_name": data.get("display_name"),
            "city": city,
            "state": state,
            "postcode": postcode,
            "source": "OpenStreetMap Nominatim",
            "licence": NOMINATIM_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "found": False,
            "lat": lat,
            "lng": lng,
            "city": "Current Location",
            "source": "OpenStreetMap Nominatim",
            "error": str(e),
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }


def search_place_coordinates(query: str) -> Dict[str, Any]:
    """
    Forward geocodes an Indian city, district or postal code into latitude and longitude.
    """
    url = f"{NOMINATIM_URL}/search"
    params = {
        "q": query.strip(),
        "format": "json",
        "limit": 1,
        "countrycodes": "in"
    }
    headers = {
        "User-Agent": f"MediMitra-HealthHub/2.0 ({APP_CONTACT_EMAIL})"
    }

    try:
        data = safe_request(
            provider="nominatim",
            method="GET",
            url=url,
            params=params,
            headers=headers,
            timeout_sec=6.0,
            custom_ttl=7 * 86400
        )
        if isinstance(data, list) and len(data) > 0:
            top = data[0]
            return {
                "found": True,
                "lat": float(top.get("lat", 0.0)),
                "lng": float(top.get("lon", 0.0)),
                "display_name": top.get("display_name"),
                "source": "OpenStreetMap Nominatim",
                "licence": NOMINATIM_LICENCE
            }
        return {"found": False, "query": query, "source": "OpenStreetMap Nominatim"}
    except Exception as e:
        return {"found": False, "query": query, "error": str(e), "source": "OpenStreetMap Nominatim"}
