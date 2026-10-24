"""
Persistent Provider Response Cache in SQLite.
Supports configurable TTL per provider:
- drug labels: 30 days
- RxNorm: 30 days
- nearby places: 10 minutes
- geocoding: 7 days
"""

import hashlib
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from app.database import SessionLocal
from app.medicines.db_models import ProviderCacheRecord

logger = logging.getLogger("medimitra.integrations.cache")

# Default TTLs in seconds
DEFAULT_TTLS: Dict[str, int] = {
    "openfda": 30 * 86400,      # 30 days
    "rxnav": 30 * 86400,        # 30 days
    "dailymed": 30 * 86400,     # 30 days
    "medlineplus": 30 * 86400,  # 30 days
    "pubchem": 30 * 86400,      # 30 days
    "chembl": 30 * 86400,       # 30 days
    "overpass": 10 * 60,        # 10 minutes
    "nominatim": 7 * 86400,     # 7 days
    "osrm": 10 * 60,            # 10 minutes
    "gemini": 30 * 86400,       # 30 days
}


def make_request_hash(provider: str, endpoint: str, params: Optional[Dict[str, Any]] = None) -> str:
    """Generates deterministic SHA-256 hash for provider request."""
    serialized = f"{provider.lower()}:{endpoint}:{json.dumps(params or {}, sort_keys=True)}"
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def get_cached_response(provider: str, request_hash: str) -> Optional[Dict[str, Any]]:
    """Retrieves unexpired cached response if present."""
    db = SessionLocal()
    try:
        record = db.query(ProviderCacheRecord).filter(
            ProviderCacheRecord.provider == provider,
            ProviderCacheRecord.request_hash == request_hash
        ).first()

        if not record:
            return None

        # Check TTL
        now = datetime.now(timezone.utc)
        record_time = record.fetched_at
        if record_time.tzinfo is None:
            record_time = record_time.replace(tzinfo=timezone.utc)

        age_seconds = (now - record_time).total_seconds()
        if age_seconds > record.ttl_seconds:
            # Expired
            return None

        data = json.loads(record.response_json)
        data["_cached"] = True
        data["_cached_age_seconds"] = int(age_seconds)
        data["_fetched_at"] = record.fetched_at.isoformat()
        return data
    except Exception as e:
        logger.warning("Cache lookup error for %s (%s): %s", provider, request_hash[:10], e)
        return None
    finally:
        db.close()


def set_cached_response(
    provider: str,
    request_hash: str,
    response_data: Dict[str, Any],
    custom_ttl_seconds: Optional[int] = None
) -> None:
    """Stores response in SQLite persistent cache."""
    db = SessionLocal()
    try:
        ttl = custom_ttl_seconds or DEFAULT_TTLS.get(provider.lower(), 86400)
        clean_data = {k: v for k, v in response_data.items() if not k.startswith("_")}
        payload_str = json.dumps(clean_data)

        existing = db.query(ProviderCacheRecord).filter(
            ProviderCacheRecord.request_hash == request_hash
        ).first()

        if existing:
            existing.response_json = payload_str
            existing.fetched_at = datetime.utcnow()
            existing.ttl_seconds = ttl
        else:
            new_record = ProviderCacheRecord(
                provider=provider,
                request_hash=request_hash,
                response_json=payload_str,
                fetched_at=datetime.utcnow(),
                ttl_seconds=ttl
            )
            db.add(new_record)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning("Cache write error for %s: %s", provider, e)
    finally:
        db.close()
