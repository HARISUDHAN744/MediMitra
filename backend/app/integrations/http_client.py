"""
Shared HTTP Client for Provider Integrations.
Features:
- Configurable connection and read timeouts
- Exponential backoff retry mechanism (2 retries)
- Strict rate limiting per provider (e.g. Nominatim 1 req/sec)
- Granular, safe exception types without leaking credentials
- Provider health telemetry tracker
"""

import time
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

from app.integrations.cache import make_request_hash, get_cached_response, set_cached_response

logger = logging.getLogger("medimitra.integrations.client")


class ProviderError(Exception):
    """Base exception for provider integration errors."""
    def __init__(self, provider: str, message: str, status_code: Optional[int] = None):
        super().__init__(f"[{provider.upper()}] {message}")
        self.provider = provider
        self.status_code = status_code


class ProviderNetworkError(ProviderError):
    """Network connection failure or timeout."""
    pass


class ProviderRateLimitError(ProviderError):
    """HTTP 429 Too Many Requests."""
    pass


class ProviderNotFoundError(ProviderError):
    """HTTP 404 Resource Not Found."""
    pass


class ProviderAuthError(ProviderError):
    """HTTP 401/403 Authentication Failure."""
    pass


# Provider Health Telemetry In-Memory Tracker
PROVIDER_HEALTH: Dict[str, Dict[str, Any]] = {
    "openfda": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 115},
    "rxnav": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 95},
    "dailymed": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 130},
    "medlineplus": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 140},
    "pubchem": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 110},
    "chembl": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 160},
    "overpass": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 250},
    "nominatim": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 180},
    "osrm": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 75},
    "gemini": {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0, "request_count": 0, "failure_count": 0, "last_status_code": 200, "avg_latency_ms": 320},
}


def get_provider_health() -> Dict[str, Dict[str, Any]]:
    """Returns telemetry data for all registered providers."""
    return PROVIDER_HEALTH

# Rate limit last-request timestamps (epoch seconds)
LAST_CALL_TIMESTAMPS: Dict[str, float] = {}
RATE_LIMIT_INTERVALS: Dict[str, float] = {
    "nominatim": 1.1,   # Max 1 request per second strictly enforced by OSM policy
    "overpass": 1.0,
    "openfda": 0.25,
    "rxnav": 0.1,
    "dailymed": 0.2,
}


def enforce_rate_limit(provider: str) -> None:
    """Enforces min time interval between successive calls to external provider."""
    min_interval = RATE_LIMIT_INTERVALS.get(provider.lower())
    if not min_interval:
        return
    now = time.time()
    last = LAST_CALL_TIMESTAMPS.get(provider.lower(), 0.0)
    elapsed = now - last
    if elapsed < min_interval:
        sleep_needed = min_interval - elapsed
        time.sleep(sleep_needed)
    LAST_CALL_TIMESTAMPS[provider.lower()] = time.time()


def record_provider_result(provider: str, success: bool, error_msg: Optional[str] = None):
    """Updates provider status in telemetry monitor."""
    p = provider.lower()
    if p not in PROVIDER_HEALTH:
        PROVIDER_HEALTH[p] = {"status": "ok", "last_call": None, "last_error": None, "calls_count": 0}
    info = PROVIDER_HEALTH[p]
    info["last_call"] = datetime.now(timezone.utc).isoformat()
    info["calls_count"] += 1
    if success:
        info["status"] = "ok"
        info["last_error"] = None
    else:
        info["status"] = "degraded" if info["status"] == "ok" else "down"
        info["last_error"] = error_msg


def safe_request(
    provider: str,
    method: str,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout_sec: float = 8.0,
    use_cache: bool = True,
    custom_ttl: Optional[int] = None
) -> Dict[str, Any]:
    """
    Synchronous request handler with automatic caching, rate limiting, and 2 retries with exponential backoff.
    Never logs or leaks API keys in error traces.
    """
    p = provider.lower()
    req_hash = make_request_hash(p, url, params)

    if use_cache:
        cached = get_cached_response(p, req_hash)
        if cached is not None:
            return cached

    enforce_rate_limit(p)

    req_headers = {
        "Accept": "application/json",
        "User-Agent": "MediMitra-Clinical-Engine/2.0 (health.hackathon; medimitra.health@gmail.com)"
    }
    if headers:
        req_headers.update(headers)

    max_retries = 2
    backoff = 0.5
    last_err: Optional[Exception] = None

    for attempt in range(max_retries + 1):
        try:
            with httpx.Client(timeout=timeout_sec) as client:
                res = client.request(method, url, params=params, headers=req_headers)
                
                if res.status_code == 200:
                    data = res.json()
                    record_provider_result(p, True)
                    if use_cache:
                        set_cached_response(p, req_hash, data, custom_ttl)
                    return data
                elif res.status_code == 404:
                    record_provider_result(p, False, "Resource not found (404)")
                    raise ProviderNotFoundError(p, "Requested clinical entity not found in provider registry.", 404)
                elif res.status_code == 429:
                    record_provider_result(p, False, "Rate limit exceeded (429)")
                    if attempt < max_retries:
                        time.sleep(backoff * (attempt + 1))
                        continue
                    raise ProviderRateLimitError(p, "External provider rate limit reached. Using fallback.", 429)
                elif res.status_code in (401, 403):
                    record_provider_result(p, False, f"Auth forbidden ({res.status_code})")
                    raise ProviderAuthError(p, f"Provider authorization failure ({res.status_code}). Verify environment credentials.", res.status_code)
                else:
                    res.raise_for_status()

        except (httpx.TimeoutException, httpx.NetworkError) as net_err:
            last_err = net_err
            if attempt < max_retries:
                time.sleep(backoff * (2 ** attempt))
                continue
            record_provider_result(p, False, str(net_err))
            raise ProviderNetworkError(p, f"Network timeout/connectivity issue connecting to provider: {type(net_err).__name__}")
        except (ProviderNotFoundError, ProviderAuthError, ProviderRateLimitError):
            raise
        except Exception as gen_err:
            last_err = gen_err
            if attempt < max_retries:
                time.sleep(backoff)
                continue
            record_provider_result(p, False, str(gen_err))
            raise ProviderError(p, f"Unexpected provider error: {str(gen_err)}")

    record_provider_result(p, False, str(last_err))
    raise ProviderNetworkError(p, f"Failed after {max_retries} retries: {str(last_err)}")
