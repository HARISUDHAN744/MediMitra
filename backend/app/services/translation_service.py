import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.db_models import TranslationCacheRecord
from app.config import GEMINI_API_KEY, get_gemini_api_keys
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Prioritize highly available, fast models (gemini-3.5-flash-lite & gemini-2.5-flash) to avoid 503 spikes
CANDIDATE_TRANSLATE_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash",
]

# Comprehensive Indian and global language canonical mapping with native scripts
LANGUAGE_CODE_MAP = {
    "ta": ("ta", "Tamil (தமிழ்)"),
    "tam": ("ta", "Tamil (தமிழ்)"),
    "tamil": ("ta", "Tamil (தமிழ்)"),
    "te": ("te", "Telugu (తెలుగు)"),
    "tel": ("te", "Telugu (తెలుగు)"),
    "telugu": ("te", "Telugu (తెలుగు)"),
    "hi": ("hi", "Hindi (हिन्दी)"),
    "hin": ("hi", "Hindi (हिन्दी)"),
    "hindi": ("hi", "Hindi (हिन्दी)"),
    "kn": ("kn", "Kannada (ಕನ್ನಡ)"),
    "kan": ("kn", "Kannada (ಕನ್ನಡ)"),
    "kannada": ("kn", "Kannada (ಕನ್ನಡ)"),
    "kannadam": ("kn", "Kannada (ಕನ್ನಡ)"),
    "ml": ("ml", "Malayalam (മലയാളം)"),
    "mal": ("ml", "Malayalam (മലയാളം)"),
    "malayalam": ("ml", "Malayalam (മലയാളം)"),
    "malayalamam": ("ml", "Malayalam (മലയാളം)"),
    "bn": ("bn", "Bengali (বাংলা)"),
    "ben": ("bn", "Bengali (বাংলা)"),
    "bengali": ("bn", "Bengali (বাংলা)"),
    "mr": ("mr", "Marathi (मराठी)"),
    "mar": ("mr", "Marathi (मराठी)"),
    "marathi": ("mr", "Marathi (मराठी)"),
    "gu": ("gu", "Gujarati (ગુજરાતી)"),
    "guj": ("gu", "Gujarati (ગુજરાતી)"),
    "gujarati": ("gu", "Gujarati (ગુજરાતી)"),
    "pa": ("pa", "Punjabi (ਪੰਜਾਬੀ)"),
    "pan": ("pa", "Punjabi (ਪੰਜਾਬੀ)"),
    "punjabi": ("pa", "Punjabi (ਪੰਜਾਬੀ)"),
    "or": ("or", "Odia (ଓଡ଼ିଆ)"),
    "ori": ("or", "Odia (ଓଡ଼ିଆ)"),
    "ory": ("or", "Odia (ଓଡ଼ିଆ)"),
    "odia": ("or", "Odia (ଓଡ଼ିଆ)"),
    "oriya": ("or", "Odia (ଓଡ଼ିଆ)"),
    "ur": ("ur", "Urdu (اردو)"),
    "urd": ("ur", "Urdu (اردو)"),
    "urdu": ("ur", "Urdu (اردو)"),
    "as": ("as", "Assamese (অসমীয়া)"),
    "asm": ("as", "Assamese (অসমীয়া)"),
    "assamese": ("as", "Assamese (অসমীয়া)"),
    "sa": ("sa", "Sanskrit (संस्कृतम्)"),
    "san": ("sa", "Sanskrit (संस्कृतम्)"),
    "sanskrit": ("sa", "Sanskrit (संस्कृतम्)"),
    "ne": ("ne", "Nepali (नेपाली)"),
    "nep": ("ne", "Nepali (नेपाली)"),
    "nepali": ("ne", "Nepali (नेपाली)"),
    "kok": ("kok", "Konkani (कोंकणी)"),
    "konkani": ("kok", "Konkani (कोंकणी)"),
    "mai": ("mai", "Maithili (मैथिली)"),
    "maithili": ("mai", "Maithili (मैथिली)"),
    "sat": ("sat", "Santali (ᱥᱟᱱᱛᱟᱲᱤ)"),
    "santali": ("sat", "Santali (ᱥᱟᱱᱛᱟᱲᱤ)"),
    "ks": ("ks", "Kashmiri (کٲشُر)"),
    "kas": ("ks", "Kashmiri (کٲشُر)"),
    "kashmiri": ("ks", "Kashmiri (کٲشُر)"),
    "sd": ("sd", "Sindhi (سنڌي)"),
    "snd": ("sd", "Sindhi (سنڌي)"),
    "sindhi": ("sd", "Sindhi (سنڌي)"),
    "doi": ("doi", "Dogri (डोगरी)"),
    "dogri": ("doi", "Dogri (डोगरी)"),
    "brx": ("brx", "Bodo (बड़ो)"),
    "bodo": ("brx", "Bodo (बड़ो)"),
    "mni": ("mni", "Manipuri (মৈতৈলোন্)"),
    "manipuri": ("mni", "Manipuri (মৈতৈলোন্)"),
    "bho": ("bho", "Bhojpuri (भोजपुरी)"),
    "bhojpuri": ("bho", "Bhojpuri (भोजपुरी)"),
    "en": ("en", "English"),
    "eng": ("en", "English"),
    "english": ("en", "English"),
    "es": ("es", "Spanish (Español)"),
    "fr": ("fr", "French (Français)"),
    "ar": ("ar", "Arabic (العربية)"),
}


def normalize_language_code(code_or_name: str) -> tuple[str, str]:
    """Returns (canonical_2_letter_code, full_display_name_with_script)."""
    if not code_or_name:
        return ("en", "English")
    cleaned = code_or_name.strip().lower()
    # Strip country suffix like -in, -np, -pk, -us
    base = cleaned.split("-")[0].strip()
    if cleaned in LANGUAGE_CODE_MAP:
        return LANGUAGE_CODE_MAP[cleaned]
    if base in LANGUAGE_CODE_MAP:
        return LANGUAGE_CODE_MAP[base]
    return (base, code_or_name)


def translate_medical_text(
    text: str,
    target_language: str,
    source_language: Optional[str] = None,
    db: Optional[Session] = None
) -> dict:
    """
    Translates medical instruction, consultation notes, or label text into target_language using Gemini with SQLite caching.
    Ensures safety disclaimer: AI translated (beta) and preserves clinical accuracy.
    First-class support for Indian languages (Tamil, Telugu, Hindi, Malayalam, Kannada, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, etc.)
    translating to English or between regional Indic languages accurately.
    """
    cleaned_text = (text or "").strip()
    canon_target_code, target_display_name = normalize_language_code(target_language or "en")
    canon_source_code, source_display_name = normalize_language_code(source_language) if source_language else ("", "")

    if not cleaned_text:
        return {
            "original_text": "",
            "translated_text": "",
            "target_language": canon_target_code,
            "notice": "AI translated (beta). Always confirm medical instructions with your doctor.",
            "is_cached": False,
        }

    # Detect if text contains non-ASCII characters (e.g. Indian scripts: Devanagari, Tamil, Telugu, Malayalam, Kannada, Bengali, etc.)
    has_non_ascii = any(ord(c) > 127 for c in cleaned_text)

    # Only treat as already English if target is English AND text contains no non-ASCII characters AND source isn't explicitly foreign
    if canon_target_code == "en" and not has_non_ascii and (not canon_source_code or canon_source_code == "en"):
        return {
            "original_text": cleaned_text,
            "translated_text": cleaned_text,
            "target_language": "en",
            "notice": "Original text.",
            "is_cached": True,
        }

    # If source and target are identical and non-empty
    if canon_source_code and canon_source_code == canon_target_code:
        return {
            "original_text": cleaned_text,
            "translated_text": cleaned_text,
            "target_language": canon_target_code,
            "notice": "Original text.",
            "is_cached": True,
        }

    # Check database cache if DB session is available
    if db:
        try:
            cached = db.query(TranslationCacheRecord).filter(
                TranslationCacheRecord.source_text == cleaned_text,
                TranslationCacheRecord.target_language == canon_target_code
            ).first()
            if cached and cached.translated_text:
                return {
                    "original_text": cleaned_text,
                    "translated_text": cached.translated_text,
                    "target_language": canon_target_code,
                    "notice": "AI translated (beta). Always confirm medical instructions with your doctor.",
                    "is_cached": True,
                }
        except Exception as e:
            logger.warning("Error checking translation cache: %s", e)

    # High-accuracy Gemini translation with Indic script instruction
    translated_result = ""
    model_used = "fallback"

    for key_idx, current_key in enumerate(get_gemini_api_keys(), start=1):
        try:
            client = genai.Client(api_key=current_key)
            src_hint = f" from {source_display_name}" if source_display_name else ""
            prompt = (
                f"You are an expert clinical medical translator specializing in Indian and global healthcare.\n"
                f"Translate the following medical consultation notes/prescription instructions{src_hint} accurately into the language '{target_display_name}'.\n"
                f"Rules:\n"
                f"1. Use authentic, grammatically correct {target_display_name} in its standard native script.\n"
                f"2. Keep medical dosages, active medicine names, and clinical units (e.g. mg, ml, TDS, BD, OD, BP, mmHg) clear and clinically intact.\n"
                f"3. Return ONLY the plain translated text in {target_display_name} without conversational commentary, markdown bolding (**), or quotes.\n\n"
                f"Text to translate:\n\"{cleaned_text}\""
            )
            for model_name in CANDIDATE_TRANSLATE_MODELS:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    if resp.text:
                        raw_trans = resp.text.strip().strip('"').strip("'")
                        # Clean markdown asterisks if Gemini adds **
                        if raw_trans.startswith("**") and raw_trans.endswith("**"):
                            raw_trans = raw_trans[2:-2].strip()
                        translated_result = raw_trans
                        model_used = model_name
                        break
                except Exception as ex:
                    logger.warning("Translation with %s (key #%d) failed: %s", model_name, key_idx, ex)
                    continue
            if translated_result:
                break
        except Exception as e:
            logger.warning("Gemini translation service exception (key #%d): %s", key_idx, e)

    if not translated_result:
        translated_result = cleaned_text  # Fallback to original text if offline or unavailable

    # Store into DB cache
    if db and translated_result and translated_result != cleaned_text:
        try:
            record = TranslationCacheRecord(
                source_text=cleaned_text,
                target_language=canon_target_code,
                translated_text=translated_result,
                model_used=model_used
            )
            db.add(record)
            db.commit()
        except Exception as e:
            logger.warning("Failed to save translation cache: %s", e)
            db.rollback()

    return {
        "original_text": cleaned_text,
        "translated_text": translated_result,
        "target_language": canon_target_code,
        "notice": "AI translated (beta). Always confirm medical instructions with your doctor.",
        "is_cached": False,
    }
