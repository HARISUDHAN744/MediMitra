import os
import io
import json
import logging
import tempfile
import asyncio
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path

from app.config import GEMINI_API_KEY, GEMINI_MODEL, get_gemini_api_keys
from app.models.schemas import ExtractedMedicalDocument, MedicineItem, LabTestItem, ConfidenceScores

logger = logging.getLogger(__name__)

# Valid extensions allowed for OpenAI Whisper
ALLOWED_EXTENSIONS = {
    ".flac", ".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".ogg", ".wav", ".webm"
}
MAX_AUDIO_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_DURATION_SECONDS = 600  # 10 minutes

# Official OpenAI Whisper supported languages (ISO 639-1)
# Note: Whisper does NOT support all 22 Indian scheduled languages (e.g. Odia, Konkani, Maithili, Santali, etc. are not supported)
WHISPER_SUPPORTED_LANGUAGES = {
    "af", "am", "ar", "as", "az", "ba", "be", "bg", "bn", "bo", "br", "bs",
    "ca", "cs", "cy", "da", "de", "el", "en", "es", "et", "eu", "fa", "fi",
    "fo", "fr", "gl", "gu", "ha", "haw", "he", "hi", "hr", "ht", "hu", "hy",
    "id", "is", "it", "ja", "jw", "ka", "kk", "km", "kn", "ko", "la", "lb",
    "ln", "lo", "lt", "lv", "mg", "mi", "mk", "ml", "mn", "mr", "ms", "mt",
    "my", "ne", "nl", "nn", "no", "oc", "pa", "pl", "ps", "pt", "ro", "ru",
    "sa", "sd", "si", "sk", "sl", "sn", "so", "sq", "sr", "su", "sv", "sw",
    "ta", "te", "tg", "th", "tk", "tl", "tr", "tt", "uk", "ur", "uz", "vi",
    "yi", "yo", "zh"
}

ISO3_TO_ISO1 = {
    "ori": "or", "asm": "as", "san": "sa", "nep": "ne", "kas": "ks",
    "kok": "kok", "mai": "mai", "sat": "sat", "snd": "sd", "doi": "doi",
    "brx": "brx", "mni": "mni", "bho": "bho", "tam": "ta", "tel": "te",
    "kan": "kn", "mal": "ml", "hin": "hi", "ben": "bn", "mar": "mr",
    "guj": "gu", "pan": "pa", "urd": "ur", "eng": "en", "spa": "es", "fra": "fr"
}


def get_openai_api_key() -> str:
    """Reads OPENAI_API_KEY from environment (.env) only. Fails fast without logging keys."""
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key or "YOUR" in key.upper():
        raise ValueError("OPENAI_API_KEY is not configured in .env.")
    return key


def validate_audio_file(filename: str, file_bytes: bytes) -> None:
    """
    Validates audio file format, size, and non-emptiness.
    Throws ValueError / ValueError with clear messages.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Audio file is empty. Please provide a valid recording.")

    if len(file_bytes) > MAX_AUDIO_BYTES:
        raise ValueError("Audio file exceeds maximum size limit of 25 MB.")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed_list = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ValueError(
            f"Unsupported audio format '{ext}'. Allowed extensions: {allowed_list}"
        )


def transcribe_audio_whisper(
    file_bytes: bytes,
    filename: str,
    language_hint: Optional[str] = None,
    vocabulary: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Transcribes audio using OpenAI Whisper API (`whisper-1`) with:
    - response_format='verbose_json'
    - temperature=0
    - language hint and medical vocabulary
    - automatic retry without language hint if rejected (HTTP 400)
    - silence guard (no_speech_prob > 0.6)
    - confidence evaluation (avg_logprob < -1.0)
    - language mismatch warning
    - client timeout 60s, max_retries=2
    """
    try:
        from openai import OpenAI, APIError, RateLimitError, AuthenticationError, BadRequestError, APITimeoutError
    except ImportError:
        raise RuntimeError("OpenAI package not installed. Run 'pip install openai'.")

    api_key = get_openai_api_key()
    client = OpenAI(api_key=api_key, timeout=60.0, max_retries=2)

    ext = Path(filename).suffix.lower() or ".mp3"
    mime_map = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".mp4": "audio/mp4",
        ".webm": "audio/webm",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".mpeg": "audio/mpeg",
        ".mpga": "audio/mpeg",
    }
    content_type = mime_map.get(ext, "audio/mpeg")

    # Clean ISO language hint
    clean_lang: Optional[str] = None
    if language_hint:
        raw = language_hint.strip().lower()
        clean_lang = ISO3_TO_ISO1.get(raw, raw)
        if clean_lang not in WHISPER_SUPPORTED_LANGUAGES:
            clean_lang = None  # Fallback to auto-detect if not in Whisper supported list

    # Combine medical drug vocabulary
    base_prompt = "Doctor consultation, medical symptoms, diagnoses, prescription medications, clinical dosages (e.g. 650 mg, 500 mg, TDS, BD), ICD-10 notes."
    if vocabulary and vocabulary.strip():
        base_prompt = f"{base_prompt} Vocabulary: {vocabulary.strip()}"

    warnings: List[str] = []
    response = None

    # Call Whisper API with retry without language hint on 400
    try:
        audio_tuple = (filename, io.BytesIO(file_bytes), content_type)
        kwargs: Dict[str, Any] = {
            "file": audio_tuple,
            "model": "whisper-1",
            "response_format": "verbose_json",
            "temperature": 0,
            "prompt": base_prompt,
        }
        if clean_lang:
            kwargs["language"] = clean_lang

        response = client.audio.transcriptions.create(**kwargs)
    except BadRequestError as bre:
        # If language hint was rejected (HTTP 400), retry once without language hint
        if clean_lang:
            logger.warning("Whisper rejected language hint '%s'. Retrying with auto-detect...", clean_lang)
            warnings.append(f"Language hint '{clean_lang}' was rejected by Whisper; retried with auto-detection.")
            audio_tuple = (filename, io.BytesIO(file_bytes), content_type)
            response = client.audio.transcriptions.create(
                file=audio_tuple,
                model="whisper-1",
                response_format="verbose_json",
                temperature=0,
                prompt=base_prompt,
            )
        else:
            raise bre

    # Inspect verbose_json response
    resp_dict = response.model_dump() if hasattr(response, "model_dump") else (
        response if isinstance(response, dict) else json.loads(response.model_dump_json())
    )

    text = resp_dict.get("text", "").strip()
    detected_language = resp_dict.get("language", clean_lang or "auto")
    duration = float(resp_dict.get("duration", 0.0))
    segments = resp_dict.get("segments", [])

    # Check duration guard (10 minutes)
    if duration > MAX_DURATION_SECONDS:
        raise ValueError(f"Audio duration ({duration:.1f}s) exceeds maximum allowed duration of 10 minutes.")

    # Silence Guard: average no_speech_prob > 0.6
    if segments:
        no_speech_probs = [seg.get("no_speech_prob", 0.0) for seg in segments if "no_speech_prob" in seg]
        if no_speech_probs:
            avg_no_speech = sum(no_speech_probs) / len(no_speech_probs)
            if avg_no_speech > 0.6:
                raise ValueError("No clear speech detected. Please record again.")

    # Confidence check: average avg_logprob < -1.0
    low_confidence = False
    if segments:
        logprobs = [seg.get("avg_logprob", 0.0) for seg in segments if "avg_logprob" in seg]
        if logprobs:
            avg_logprob = sum(logprobs) / len(logprobs)
            if avg_logprob < -1.0:
                low_confidence = True
                warnings.append("Audio confidence is low; speech was indistinct or muffled.")

    # Language mismatch check
    if clean_lang and detected_language:
        det_norm = detected_language.lower()
        hint_norm = clean_lang.lower()
        # Some whisper models return full English name ("hindi") while hint is "hi"
        lang_names = {"hi": "hindi", "ta": "tamil", "te": "telugu", "kn": "kannada", "ml": "malayalam", "en": "english"}
        expected_full = lang_names.get(hint_norm, hint_norm)
        if det_norm != hint_norm and det_norm != expected_full:
            warnings.append(
                f"Spoken language detected as '{detected_language}', which differs from selected '{clean_lang}'."
            )

    return {
        "success": True,
        "text": text,
        "detected_language": detected_language,
        "duration_seconds": duration,
        "low_confidence": low_confidence,
        "warnings": warnings,
        "provider": "OpenAI Whisper",
        "model": "whisper-1",
    }


def transcribe_audio_gemini(
    file_bytes: bytes,
    filename: str = "audio.wav",
    language_hint: Optional[str] = None
) -> Optional[str]:
    """
    Transcribes audio using Google Gemini Multimodal Audio (gemini-3.8-flash).
    Provides native transcription for all Indian languages (Tamil, Hindi, Telugu, Kannada,
    Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, etc.).
    """
    from google import genai
    from google.genai import types

    keys = get_gemini_api_keys()
    if not keys:
        return None

    ext = Path(filename).suffix.lower()
    mime_map = {
        ".wav": "audio/wav",
        ".mp3": "audio/mp3",
        ".webm": "audio/webm",
        ".mp4": "audio/mp4",
        ".m4a": "audio/m4a",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
    }
    mime_type = mime_map.get(ext, "audio/wav")

    target_lang = language_hint or "the native spoken language"
    prompt_text = (
        f"You are a clinical speech-to-text transcriber for healthcare consultations. "
        f"Listen to the attached audio recording and transcribe every spoken word accurately in {target_lang}. "
        f"Rules:\n"
        f"1. Transcribe strictly in the standard native script of {target_lang} (e.g. தமிழ் for Tamil, हिन्दी for Hindi, etc.).\n"
        f"2. Keep medical dosages, medicine names, and numerical values clinically exact.\n"
        f"3. Return ONLY the verbatim transcribed text without conversational intro, markdown, quotes, or timestamps."
    )

    models_to_try = [
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest"
    ]

    for current_key in keys:
        try:
            client = genai.Client(api_key=current_key)
            part_file = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            part_prompt = types.Part.from_text(text=prompt_text)

            for model_name in models_to_try:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=[part_prompt, part_file]
                    )
                    if resp.text and resp.text.strip():
                        return resp.text.strip().strip('"').strip("'")
                except Exception as ex:
                    logger.warning("Gemini audio transcription model %s failed: %s", model_name, ex)
                    continue
        except Exception as key_ex:
            logger.warning("Gemini client initialization failed: %s", key_ex)
            continue

    return None


def extract_medical_with_anti_hallucination(
    transcript_text: str,
    filename: str = "voice_note.webm"
) -> Optional[ExtractedMedicalDocument]:
    """
    Extracts structured medical document from transcript using Gemini with strict schema,
    and enforces token-level anti-hallucination validation against the original transcript text.
    If no valid entities are found in the transcript text, returns None.
    """
    if not transcript_text or len(transcript_text.strip()) < 5:
        return None

    from google import genai
    from google.genai import types

    keys_to_try = get_gemini_api_keys()
    if not keys_to_try:
        logger.warning("No valid Gemini API key configured for medical entity extraction.")
        return None

    extraction_prompt = (
        "You are an expert clinical scribe. Analyze the following patient consultation transcript "
        "and extract clinical entities into strict JSON.\n"
        "STRICT SAFETY RULES:\n"
        "1. Extract ONLY information explicitly stated in the transcript. Do NOT invent, assume, or fabricate any medicine, dose, or condition.\n"
        "2. If an entity is not explicitly mentioned, omit it or set it to null.\n"
        "3. Provide realistic confidence scores (0.0 to 1.0).\n\n"
        f"Transcript:\n\"\"\"{transcript_text}\"\"\"\n\n"
        "JSON Schema:\n"
        "{\n"
        '  "document_type": "prescription",\n'
        '  "patient_name": "string or null",\n'
        '  "doctor_name": "string or null",\n'
        '  "hospital_or_clinic": "string or null",\n'
        '  "document_date": "YYYY-MM-DD or null",\n'
        '  "diagnoses": ["string"],\n'
        '  "medicines": [{"name": "string", "dosage": "string", "frequency": "string", "duration": "string", "instructions": "string"}],\n'
        '  "tests": [{"name": "string", "value": "string", "unit": "string", "reference_range": "string", "interpretation": "string"}],\n'
        '  "confidence_scores": {"overall": float, "patient_name": float, "doctor_name": float, "hospital_or_clinic": float, "document_date": float, "medicines": float, "tests": float, "diagnoses": float},\n'
        '  "notes": "string or null"\n'
        "}"
    )

    models_to_try = [
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-2.5-flash"
    ]

    extracted_dict = None
    for key_idx, current_key in enumerate(keys_to_try, start=1):
        try:
            client = genai.Client(api_key=current_key)
            for model_name in models_to_try:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=extraction_prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.0
                        )
                    )
                    if resp.text:
                        cleaned = resp.text.strip()
                        if cleaned.startswith("```json"):
                            cleaned = cleaned[7:]
                        if cleaned.startswith("```"):
                            cleaned = cleaned[3:]
                        if cleaned.endswith("```"):
                            cleaned = cleaned[:-3]
                        extracted_dict = json.loads(cleaned.strip())
                        break
                except Exception as e:
                    logger.warning("Gemini extraction model %s (key #%d) failed: %s", model_name, key_idx, e)
                    continue
            if extracted_dict:
                break
        except Exception as key_err:
            logger.warning("Gemini client initialization failed for key #%d: %s", key_idx, key_err)

    if not extracted_dict:
        return None

    # Anti-Hallucination Grounding Check:
    # Every extracted medicine, diagnosis, and test must have supporting words in the transcript.
    raw_lower = transcript_text.lower()

    grounded_medicines: List[MedicineItem] = []
    for med in extracted_dict.get("medicines", []):
        med_name = med.get("name", "").strip()
        if not med_name:
            continue
        # Check if the name or significant tokens appear in transcript
        tokens = [t.lower() for t in med_name.split() if len(t) > 2]
        is_grounded = any(t in raw_lower for t in tokens) or med_name.lower() in raw_lower
        if is_grounded:
            grounded_medicines.append(MedicineItem(
                name=med_name,
                dosage=med.get("dosage", ""),
                frequency=med.get("frequency", ""),
                duration=med.get("duration", ""),
                instructions=med.get("instructions", "")
            ))
        else:
            logger.info("Anti-hallucination dropped ungrounded medication: %s", med_name)

    grounded_diagnoses: List[str] = []
    for d in extracted_dict.get("diagnoses", []):
        d_str = str(d).strip()
        if not d_str:
            continue
        tokens = [t.lower() for t in d_str.split() if len(t) > 2]
        if any(t in raw_lower for t in tokens) or d_str.lower() in raw_lower:
            grounded_diagnoses.append(d_str)

    grounded_tests: List[LabTestItem] = []
    for t in extracted_dict.get("tests", []):
        t_name = t.get("name", "").strip()
        if not t_name:
            continue
        tokens = [w.lower() for w in t_name.split() if len(w) > 2]
        if any(w in raw_lower for w in tokens) or t_name.lower() in raw_lower:
            grounded_tests.append(LabTestItem(
                name=t_name,
                value=t.get("value", ""),
                unit=t.get("unit", ""),
                reference_range=t.get("reference_range", ""),
                interpretation=t.get("interpretation", "Normal")
            ))

    # If nothing valid was extracted or grounded in the transcript, do not create a fake document!
    if not grounded_medicines and not grounded_diagnoses and not grounded_tests:
        return None

    patient_name = extracted_dict.get("patient_name")
    if patient_name and not any(p.lower() in raw_lower for p in patient_name.split() if len(p) > 2):
        patient_name = None

    doctor_name = extracted_dict.get("doctor_name")
    if doctor_name and not any(d.lower() in raw_lower for d in doctor_name.split() if len(d) > 2):
        doctor_name = None

    return ExtractedMedicalDocument(
        document_type=extracted_dict.get("document_type", "prescription"),
        patient_name=patient_name or "Voice Patient",
        doctor_name=doctor_name,
        hospital_or_clinic=extracted_dict.get("hospital_or_clinic"),
        document_date=extracted_dict.get("document_date"),
        diagnoses=grounded_diagnoses,
        medicines=grounded_medicines,
        tests=grounded_tests,
        confidence_scores=ConfidenceScores(
            overall=0.88 if grounded_medicines else 0.75,
            patient_name=0.85 if patient_name else 0.5,
            doctor_name=0.85 if doctor_name else 0.5,
            hospital_or_clinic=0.8 if extracted_dict.get("hospital_or_clinic") else 0.5,
            document_date=0.9 if extracted_dict.get("document_date") else 0.5,
            medicines=0.9 if grounded_medicines else 0.0,
            tests=0.9 if grounded_tests else 0.0,
            diagnoses=0.88 if grounded_diagnoses else 0.0
        ),
        notes=extracted_dict.get("notes") or "Extracted from verified patient speech transcript."
    )
