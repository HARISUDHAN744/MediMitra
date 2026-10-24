import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent
SAMPLES_DIR = ROOT_DIR / "samples"

# Load .env from root or backend directory
env_path = ROOT_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# App Configuration
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_API_KEY_2: str = os.getenv("GEMINI_API_KEY_2", "").strip()
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
GNANI_API_KEY: str = os.getenv("GNANI_API_KEY", "").strip()
GNANI_BASE_URL: str = os.getenv("GNANI_BASE_URL", "https://api.vachana.ai").rstrip("/")


def get_gemini_api_keys() -> list:
    """Returns all non-empty, unique, valid Gemini API keys for seamless rotation and quota redundancy."""
    keys = []
    # Primary key
    if GEMINI_API_KEY and "YOUR" not in GEMINI_API_KEY.upper() and "KEY" not in GEMINI_API_KEY.upper():
        keys.append(GEMINI_API_KEY)
    # Secondary key
    if GEMINI_API_KEY_2 and "YOUR" not in GEMINI_API_KEY_2.upper() and "KEY" not in GEMINI_API_KEY_2.upper() and GEMINI_API_KEY_2 not in keys:
        keys.append(GEMINI_API_KEY_2)
    # Comma-separated GEMINI_API_KEYS
    for k in os.getenv("GEMINI_API_KEYS", "").split(","):
        k = k.strip()
        if k and "YOUR" not in k.upper() and "KEY" not in k.upper() and k not in keys:
            keys.append(k)
    return keys

# Database configuration (SQLite for Phase 1)
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'medical_docs.db'}")

# External Medical & Geospatial Provider Endpoints
OPENFDA_BASE_URL: str = os.getenv("OPENFDA_BASE_URL", "https://api.fda.gov").rstrip("/")
OPENFDA_API_KEY: str = os.getenv("OPENFDA_API_KEY", "").strip()
RXNAV_BASE_URL: str = os.getenv("RXNAV_BASE_URL", "https://rxnav.nlm.nih.gov/REST").rstrip("/")
DAILYMED_BASE_URL: str = os.getenv("DAILYMED_BASE_URL", "https://dailymed.nlm.nih.gov/dailymed/services/v2").rstrip("/")
MEDLINEPLUS_BASE_URL: str = os.getenv("MEDLINEPLUS_BASE_URL", "https://connect.medlineplus.gov/service").rstrip("/")
PUBCHEM_BASE_URL: str = os.getenv("PUBCHEM_BASE_URL", "https://pubchem.ncbi.nlm.nih.gov/rest/pug").rstrip("/")
CHEMBL_BASE_URL: str = os.getenv("CHEMBL_BASE_URL", "https://www.ebi.ac.uk/chembl/api/data").rstrip("/")
OVERPASS_URL: str = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
NOMINATIM_URL: str = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org").rstrip("/")
OSRM_URL: str = os.getenv("OSRM_URL", "https://router.project-osrm.org").rstrip("/")
APP_CONTACT_EMAIL: str = os.getenv("APP_CONTACT_EMAIL", "medimitra.health@gmail.com").strip()

# Upload limits
MAX_FILE_SIZE_MB = 25
ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/mp4": ".m4a",
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
}
