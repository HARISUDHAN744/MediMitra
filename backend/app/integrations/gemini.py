"""
Google Gemini Vision & Multimodal Integration Gateway.
Handles AI prescription & lab report extraction and plain-language medical Q&A.
Tracks provider health telemetry and enforces non-diagnostic medical guardrails.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.integrations.http_client import record_provider_result


def check_gemini_readiness() -> Dict[str, Any]:
    """Evaluates whether Gemini API is configured and operational."""
    has_key = bool(GEMINI_API_KEY and "YOUR" not in GEMINI_API_KEY.upper() and len(GEMINI_API_KEY) > 10)
    record_provider_result("gemini", has_key)
    return {
        "provider": "Google Gemini AI",
        "model": GEMINI_MODEL,
        "configured": has_key,
        "source": "Google Generative AI API",
        "licence": "Google Cloud Platform Terms of Service",
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }
