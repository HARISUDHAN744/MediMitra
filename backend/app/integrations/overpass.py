"""
OpenStreetMap Overpass API Integration.
Discovers nearby hospitals, clinics, primary health centers, pharmacies,
and Jan Aushadhi generic dispensaries using live geospatial OpenStreetMap topology.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import OVERPASS_URL
from app.integrations.http_client import safe_request

OVERPASS_LICENCE = "OpenStreetMap contributors (ODbL / Open Database License)"


def find_nearby_healthcare_facilities(
    lat: float,
    lng: float,
    radius_meters: int = 15000,
    facility_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes Overpass QL query around a coordinate bounding circle.
    Fetches hospitals, clinics, doctors, pharmacies, and Jan Aushadhi generic stores.
    """
    amenity_filter = '["amenity"~"hospital|clinic|pharmacy|doctors"]'
    if facility_type == "pharmacy":
        amenity_filter = '["amenity"="pharmacy"]'
    elif facility_type == "hospital":
        amenity_filter = '["amenity"="hospital"]'

    # Overpass QL query
    ql_query = f"""
    [out:json][timeout:15];
    (
      node{amenity_filter}(around:{radius_meters},{lat},{lng});
      way{amenity_filter}(around:{radius_meters},{lat},{lng});
    );
    out center 25;
    """

    params = {"data": ql_query.strip()}

    try:
        data = safe_request(provider="overpass", method="POST", url=OVERPASS_URL, params=params, timeout_sec=12.0)
        elements = data.get("elements", [])
        places = []

        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            item_lat = el.get("lat") or el.get("center", {}).get("lat")
            item_lng = el.get("lon") or el.get("center", {}).get("lon")

            is_jan_aushadhi = "jan aushadhi" in name.lower() or "pmbjp" in name.lower()

            places.append({
                "osm_id": el.get("id"),
                "name": name,
                "lat": item_lat,
                "lng": item_lng,
                "amenity": tags.get("amenity"),
                "healthcare": tags.get("healthcare"),
                "is_jan_aushadhi": is_jan_aushadhi,
                "phone": tags.get("phone") or tags.get("contact:phone"),
                "address": tags.get("addr:street") or tags.get("addr:city") or "Nearby"
            })

        return {
            "origin": {"lat": lat, "lng": lng},
            "radius_meters": radius_meters,
            "facilities_found": len(places),
            "places": places,
            "source": "OpenStreetMap Overpass API",
            "licence": OVERPASS_LICENCE,
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "origin": {"lat": lat, "lng": lng},
            "facilities_found": 0,
            "places": [],
            "source": "OpenStreetMap Overpass API",
            "error": str(e),
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
