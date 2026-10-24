"""
Gnani.ai Vachana Voice & Speech Integration Gateway.
Provides ASR (Speech-to-Text) and TTS (Text-to-Speech) for Indic and global languages.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
import logging
import httpx

from app.config import GNANI_API_KEY, GNANI_BASE_URL
from app.integrations.http_client import record_provider_result

logger = logging.getLogger(__name__)

# Map common ISO 639-1 language codes to Gnani Vachana regional codes
GNANI_LANG_MAP = {
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "pa": "pa-IN",
    "or": "or-IN",
    "as": "as-IN",
    "ur": "ur-IN",
    "en": "en-IN",
}


def check_gnani_readiness() -> Dict[str, Any]:
    """Evaluates whether Gnani.ai API is configured and operational."""
    has_key = bool(GNANI_API_KEY and "YOUR" not in GNANI_API_KEY.upper() and len(GNANI_API_KEY) > 10)
    record_provider_result("gnani", has_key)
    return {
        "provider": "Gnani.ai Vachana Speech",
        "configured": has_key,
        "base_url": GNANI_BASE_URL,
        "source": "Gnani.ai Speech Platform",
        "retrieved_at": datetime.now(timezone.utc).isoformat()
    }


def transcribe_audio_gnani(
    file_bytes: bytes,
    filename: str,
    language_hint: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Transcribes audio using Gnani.ai Vachana STT API (v3).
    Supports Indian languages (Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, etc.).
    """
    if not GNANI_API_KEY or "YOUR" in GNANI_API_KEY.upper() or len(GNANI_API_KEY) < 10:
        return None

    iso_code = (language_hint or "hi").lower().split("-")[0]
    lang_code = GNANI_LANG_MAP.get(iso_code, f"{iso_code}-IN" if len(iso_code) == 2 else "hi-IN")

    ext = Path(filename).suffix.lower() or ".wav"
    mime_type = "audio/wav" if ext == ".wav" else ("audio/mpeg" if ext == ".mp3" else "audio/webm")

    url = f"{GNANI_BASE_URL}/stt/v3"
    headers = {
        "X-API-Key-ID": GNANI_API_KEY,
    }
    data = {
        "language_code": lang_code,
        "preferred_language": lang_code,
        "format": "transcribe",
        "itn_native_numerals": "true",
    }
    files = {
        "audio_file": (filename, file_bytes, mime_type)
    }

    try:
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(url, headers=headers, data=data, files=files)
            if resp.status_code == 200:
                result = resp.json()
                text = (
                    result.get("transcript")
                    or result.get("text")
                    or result.get("data", {}).get("transcript")
                    or result.get("data", {}).get("text")
                    or ""
                ).strip()
                if text:
                    logger.info("Gnani ASR transcription succeeded for '%s' in %s", filename, lang_code)
                    return {
                        "text": text,
                        "detected_language": iso_code,
                        "provider": "Gnani.ai Vachana ASR",
                        "model": "vachana-stt-v3",
                        "confidence": float(result.get("confidence", 0.95)),
                        "duration_seconds": float(result.get("duration", 0.0)),
                        "warnings": []
                    }
            else:
                logger.warning("Gnani STT returned HTTP %d: %s", resp.status_code, resp.text[:120])
    except Exception as e:
        logger.warning("Gnani STT request failed: %s", e)

    return None


def synthesize_speech_gnani(
    text: str,
    language_code: str = "hi",
    voice: Optional[str] = None
) -> Optional[bytes]:
    """
    Synthesizes speech using Gnani.ai Vachana TTS API.
    Returns audio bytes (WAV/MP3).
    """
    if not GNANI_API_KEY or "YOUR" in GNANI_API_KEY.upper() or len(GNANI_API_KEY) < 10 or not text:
        return None

    iso_code = (language_code or "hi").lower().split("-")[0]
    lang_code = GNANI_LANG_MAP.get(iso_code, f"{iso_code}-IN")

    url = f"{GNANI_BASE_URL}/api/v1/tts/inference"
    headers = {
        "X-API-Key-ID": GNANI_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "language": lang_code,
        "model": "timbre-v2.5",
        "speed": 1.0,
        "audio_config": {
            "sample_rate": 24000,
            "container": "wav",
            "encoding": "linear_pcm"
        }
    }
    payload["voice"] = voice or "Nalini"

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                content_type = resp.headers.get("content-type", "")
                if "audio" in content_type or "octet-stream" in content_type:
                    return resp.content
                res_json = resp.json()
                if "audio" in res_json:
                    import base64
                    return base64.b64decode(res_json["audio"])
            else:
                logger.warning("Gnani TTS returned HTTP %d: %s", resp.status_code, resp.text[:120])
    except Exception as e:
        logger.warning("Gnani TTS request failed: %s", e)

    return None
