"""
Open Source Routing Machine (OSRM) Driving Distance & ETA Integration.
Computes real-world road network driving distance and transit duration,
with a robust mathematical Haversine straight-line distance fallback.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import OSRM_URL
from app.integrations.http_client import safe_request

OSRM_LICENCE = "Open Source Routing Machine / Project OSRM (BSD 2-Clause)"


def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0  # Earth mean radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def get_driving_route(lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, Any]:
    """
    Fetches real road driving distance and duration from OSRM.
    Falls back to straight-line Haversine estimate if network call fails.
    """
    url = f"{OSRM_URL}/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
    params = {"overview": "false", "steps": "false"}

    try:
        data = safe_request(provider="osrm", method="GET", url=url, params=params, timeout_sec=5.0)
        routes = data.get("routes", [])
        if routes:
            top_route = routes[0]
            distance_km = round(top_route.get("distance", 0.0) / 1000.0, 2)
            duration_min = round(top_route.get("duration", 0.0) / 60.0, 1)

            return {
                "distance_km": distance_km,
                "duration_minutes": duration_min,
                "distance_text": f"{distance_km} km",
                "eta_text": f"~{int(duration_min)} mins drive",
                "mode": "driving_network",
                "source": "Project OSRM Routing Engine",
                "licence": OSRM_LICENCE,
                "retrieved_at": datetime.now(timezone.utc).isoformat()
            }
    except Exception:
        pass

    # Mathematical Haversine Fallback
    h_dist = calculate_haversine_km(lat1, lon1, lat2, lon2)
    est_duration = round((h_dist / 35.0) * 60.0, 1)  # Assume average 35 km/h urban speed

    return {
        "distance_km": h_dist,
        "duration_minutes": est_duration,
        "distance_text": f"{h_dist} km",
        "eta_text": f"~{int(est_duration)} mins",
        "mode": "straight_line_fallback",
        "source": "Haversine Geodesic Math",
        "licence": "Public Domain",
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }
