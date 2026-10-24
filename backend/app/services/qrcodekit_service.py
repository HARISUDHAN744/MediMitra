import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("medimitra.qrcodekit")

# Official QRCodeKIT Live API Key provided by user
QRCODEKIT_API_KEY = os.getenv("QRCODEKIT_API_KEY", "qrk_live_e4853810e419e552150039f266726fecc0d42642dc7cd7be")
QRCODEKIT_BASE_URL = "https://api.v2.qrcodekit.com/api"
DEFAULT_WEBSITE_TYPOLOGY = "/api/qr-typologies/f549a650-ae11-11ef-b2fb-16457c924e15"


def create_qrcodekit_qr(
    data: str,
    title: str = "MediMitra Emergency Health ID",
    description: Optional[str] = "Clinical Emergency Medical ID & Paramedic Record",
) -> Dict[str, Any]:
    """
    Creates a dynamic, cloud-tracked QR Code via QRCodeKIT API (api.v2.qrcodekit.com)
    using the live key: qrk_live_e4853810e419e552150039f266726fecc0d42642dc7cd7be.
    Returns high-res CDN vector SVG assetUrl and shortUrl.
    """
    api_key = QRCODEKIT_API_KEY.strip()

    # Determine input target for QRCodeKIT website typology
    target_url = data if data.startswith(("http://", "https://")) else f"https://medimitra.ai/emergency-card?data={urllib.parse.quote(data[:2000])}"

    payload = {
        "typology": DEFAULT_WEBSITE_TYPOLOGY,
        "input": {
            "url": target_url
        },
        "title": title[:100],
        "description": (description or "MediMitra AI Health Record")[:255]
    }

    req = urllib.request.Request(
        f"{QRCODEKIT_BASE_URL}/qrs",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "X-Api-Key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "MediMitra-Health/1.1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            asset_url = body.get("assetUrl")
            short_url = body.get("url")
            qr_uuid = body.get("uuid")

            logger.info(f"QRCodeKIT QR created successfully: uuid={qr_uuid}, assetUrl={asset_url}")

            return {
                "success": True,
                "provider": "QRCodeKIT",
                "apiKeyPrefix": f"{api_key[:12]}...{api_key[-6:]}",
                "uuid": qr_uuid,
                "assetUrl": asset_url,
                "shortUrl": short_url,
                "targetUrl": target_url,
                "title": title,
            }
    except Exception as exc:
        logger.warning(f"QRCodeKIT API call failed: {exc}. Using cloud QR fallback.")
        # Fallback to direct QR image URL
        fallback_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0284c7&margin=2&data={urllib.parse.quote(data[:1500])}"
        return {
            "success": False,
            "provider": "QRCodeKIT (Fallback)",
            "apiKeyPrefix": f"{api_key[:12]}...{api_key[-6:]}",
            "error": str(exc),
            "assetUrl": fallback_url,
            "shortUrl": target_url,
            "targetUrl": target_url,
            "title": title,
        }
