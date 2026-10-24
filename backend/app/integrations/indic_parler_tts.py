"""
AI4Bharat Indic-Parler-TTS Integration Gateway.
State-of-the-art multilingual neural Text-to-Speech (TTS) for Indian languages:
Tamil (Jaya), Telugu (Lalitha), Hindi (Divya), Kannada (Anu), Malayalam (Anjali),
Bengali (Aditi), Gujarati (Neha), Marathi (Sunita), Punjabi (Divjot), Odia (Debjani),
Assamese (Amit), Sanskrit (Aryan), Nepali (Amrita), Bodo (Bikram), Dogri (Karan),
Manipuri (Laishram), Chhattisgarhi (Bhanu), English (Mary).
"""

import io
import os
import logging
from typing import Optional, Tuple, Dict, Any

logger = logging.getLogger(__name__)

# Recommended speaker voices from the AI4Bharat Indic-Parler-TTS model card
VOICES: Dict[str, str] = {
    "assamese": "Amit",
    "bengali": "Aditi",
    "bodo": "Bikram",
    "chhattisgarhi": "Bhanu",
    "dogri": "Karan",
    "english": "Mary",
    "gujarati": "Neha",
    "hindi": "Divya",
    "kannada": "Anu",
    "malayalam": "Anjali",
    "manipuri": "Laishram",
    "marathi": "Sunita",
    "nepali": "Amrita",
    "odia": "Debjani",
    "punjabi": "Divjot",
    "sanskrit": "Aryan",
    "tamil": "Jaya",
    "telugu": "Lalitha",
}

# ISO 639-1 / 639-3 to language name mapping
LANG_CODE_TO_NAME: Dict[str, str] = {
    "as": "assamese",
    "bn": "bengali",
    "brx": "bodo",
    "hne": "chhattisgarhi",
    "doi": "dogri",
    "en": "english",
    "gu": "gujarati",
    "hi": "hindi",
    "kn": "kannada",
    "ml": "malayalam",
    "mni": "manipuri",
    "mr": "marathi",
    "ne": "nepali",
    "or": "odia",
    "pa": "punjabi",
    "sa": "sanskrit",
    "ta": "tamil",
    "te": "telugu",
}

# Lazy-loaded model singletons
_model = None
_tok = None
_desc_tok = None
_device = None
_load_attempted = False


def is_indic_parler_installed() -> bool:
    """Checks if PyTorch, transformers, soundfile and parler_tts are available in current environment."""
    try:
        import torch
        import soundfile
        import transformers
        import parler_tts
        return True
    except ImportError:
        return False


def get_indic_parler_model():
    """Lazily loads the AI4Bharat Indic-Parler-TTS model and tokenizers."""
    global _model, _tok, _desc_tok, _device, _load_attempted

    if _model is not None:
        return _model, _tok, _desc_tok, _device

    if _load_attempted:
        return None, None, None, None

    _load_attempted = True

    try:
        import torch
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer

        _device = "cuda:0" if torch.cuda.is_available() else "cpu"
        logger.info("Initializing AI4Bharat Indic-Parler-TTS on device '%s'...", _device)

        model_name = "ai4bharat/indic-parler-tts"
        _model = ParlerTTSForConditionalGeneration.from_pretrained(model_name).to(_device)
        _tok = AutoTokenizer.from_pretrained(model_name)
        _desc_tok = AutoTokenizer.from_pretrained(_model.config.text_encoder._name_or_path)

        logger.info("AI4Bharat Indic-Parler-TTS model loaded successfully.")
        return _model, _tok, _desc_tok, _device

    except Exception as e:
        logger.warning("Could not initialize AI4Bharat Indic-Parler-TTS: %s", e)
        return None, None, None, None


def speak(text: str, language: str, out: str = "reply.wav") -> Optional[str]:
    """
    Synthesizes speech using AI4Bharat Indic-Parler-TTS and writes to output WAV file.
    Exact interface requested by user.
    """
    model, tok, desc_tok, device = get_indic_parler_model()
    if model is None:
        logger.warning("Indic-Parler-TTS model is not loaded. Cannot synthesize to file '%s'.", out)
        return None

    import soundfile as sf

    lang_key = language.lower().strip()
    # Resolve 2-letter ISO code if needed
    if lang_key in LANG_CODE_TO_NAME:
        lang_key = LANG_CODE_TO_NAME[lang_key]

    voice = VOICES.get(lang_key)
    who = f"{voice}'s voice" if voice else "A female speaker's voice"
    desc = f"{who} is clear and expressive, at a moderate pace, with very clear audio and a very close recording."

    d = desc_tok(desc, return_tensors="pt").to(device)
    p = tok(text, return_tensors="pt").to(device)

    audio = model.generate(
        input_ids=d.input_ids,
        attention_mask=d.attention_mask,
        prompt_input_ids=p.input_ids,
        prompt_attention_mask=p.attention_mask,
    )
    sf.write(out, audio.cpu().numpy().squeeze(), model.config.sampling_rate)
    return out


def synthesize_speech_indic_parler(
    text: str,
    language: str = "tamil"
) -> Tuple[Optional[bytes], str]:
    """
    Synthesizes speech using AI4Bharat Indic-Parler-TTS and returns (audio_bytes, "audio/wav").
    Returns (None, "") if dependencies are not loaded or synthesis fails.
    """
    model, tok, desc_tok, device = get_indic_parler_model()
    if model is None or not text:
        return None, ""

    try:
        import soundfile as sf
        import numpy as np

        lang_key = language.lower().strip().split("-")[0]
        if lang_key in LANG_CODE_TO_NAME:
            lang_key = LANG_CODE_TO_NAME[lang_key]

        voice = VOICES.get(lang_key)
        who = f"{voice}'s voice" if voice else "A female speaker's voice"
        desc = f"{who} is clear and expressive, at a moderate pace, with very clear audio and a very close recording."

        d = desc_tok(desc, return_tensors="pt").to(device)
        p = tok(text, return_tensors="pt").to(device)

        audio = model.generate(
            input_ids=d.input_ids,
            attention_mask=d.attention_mask,
            prompt_input_ids=p.input_ids,
            prompt_attention_mask=p.attention_mask,
        )

        audio_arr = audio.cpu().numpy().squeeze()
        buffer = io.BytesIO()
        sf.write(buffer, audio_arr, model.config.sampling_rate, format="WAV")
        buffer.seek(0)
        return buffer.read(), "audio/wav"

    except Exception as e:
        logger.warning("Indic-Parler-TTS synthesis failed: %s", e)
        return None, ""
