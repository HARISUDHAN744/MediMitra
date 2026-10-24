# MediMitra - AI-Powered Personal Health Copilot 🩺⚡

> **Altrix Labs Hackathon Challenge**  
> **Phase 1 Complete:** Multimodal Prescription & Lab Extraction + Deduplication Caching + 150+ Language Localization + NIH ICD-10 Search + Neon Cyber AI Aesthetic.

---

## 📌 Features

1. **Multimodal Clinical Extraction**:
   - Parses prescription slips or diagnostic lab reports (**JPG, PNG, WEBP, PDF**) using **Google Gemini Vision**.
   - Validates outputs strictly conforming to Pydantic JSON schemas.
   - Extracts: Patient, Doctor, Clinic, Date, Diagnoses, Medications (name, dosage, frequency, duration, instructions), Lab Tests (values, units, ranges, interpretations), and Confidence Scores.

2. **Universal 150+ Language Localization & Voice Audio Narrator**:
   - Built-in ISO 639-3 compliant language engine supporting **150+ global languages** and **all 22 official scheduled Indian languages & regional dialects** (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Sanskrit, Nepali, Konkani, Sindhi, Maithili, etc.).
   - Full RTL (Right-to-Left) writing system support (Arabic, Urdu, Persian, Hebrew, Sindhi, Pashto).
   - Real-time localized clinical translations for medication directions and safety instructions.
   - Integrated **Voice Audio Reader** (`🔊 Listen in [Language]`) using speech synthesis for patients with visual or literacy barriers.

3. **NIH Clinical Tables & ICD-10 Medical Code Lookup**:
   - Integrated with the **U.S. National Library of Medicine (NIH) Clinical Tables API**.
   - Dynamic search for standardized medical conditions and verified **ICD-10-CM codes**.
   - Instant one-click ICD-10 query badges on all extracted diagnoses.

4. **Deterministic SHA-256 Deduplication & SQLite Caching**:
   - Computes file hashes to eliminate redundant API latency and cost.
   - Duplicate uploads return cached clinical extractions in <15ms.

5. **Aesthetics & UI System**:
   - **Neon Cyber + AI + Medical + Psychological** theme.
   - Bioluminescent neon cyan (`#00F0FF`), cyberpunk emerald (`#00FF9D`), and psychological violet (`#8B5CF6`).
   - Glassmorphism HUD panels, telemetry badges, and micro-animations.

---

## 🚀 Quick Start (Single Command)

### 1. Install & Configure

```bash
# In the project root:
npm install
npm --prefix frontend install
pip install -r requirements.txt
huggingface-cli login          # accept the model's conditions once
```

Ensure `.env` in root contains your configuration:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
```

---

### 2. Run Backend & Frontend

You can launch both concurrently with a single command:
```bash
npm run dev
```

Or run the FastAPI server directly via `server:app`:
```bash
uvicorn server:app --port 8000
```

This starts:
- 🚀 **FastAPI Backend**: `http://localhost:8000` (Swagger docs at `/docs`)
- 🌐 **Vite Frontend**: `http://localhost:5173`

---

### 3. Voice Assistance Architecture & `speakText`

Universal client narration in Tamil (`ta`), Telugu (`te`), Hindi (`hi`), English (`en`), etc. powered by multi-engine voice APIs (AI4Bharat Indic-Parler-TTS, Google Speech API, and Gnani.ai):

```typescript
import { speakText } from './services/safeTranscribeAudio';

// Example: Speak Tamil medical summary and automatically update button UI state
const stopSpeech = speakText(summaryTextInTamil, "ta", voiceButton, (state) => {
  /* state: 'idle' | 'loading' | 'speaking' | 'error' */
  console.log('Voice assistant playback state:', state);
});
```

---

## 🧪 Testing

### Backend Test Suite
```bash
npm run test:backend
```

### Lab Diagnostics & Longitudinal Trend Tests (15 Tests)
```bash
pytest backend/tests/test_labs.py -v
```

### Medicine Knowledge Base & Substitutes Tests (15 Tests)
```bash
pytest backend/tests/test_medicines.py -v
```

### External API Provider Health & Telemetry Verification
```bash
python backend/scripts/check_providers.py
```

### Data Pipeline Quality Audit
```bash
python backend/data-pipeline/quality_report.py
```

---

## 💊 Medicine Knowledge Base, Generic Substitution & Safety Guide

The upgraded Medicine Knowledge Base module provides:
1. **Official Price & Ceiling Transparency**:
   - Integrates National Pharmaceutical Pricing Authority (NPPA) DPCO ceiling price gazette orders and National List of Essential Medicines (NLEM).
   - Every price shows statutory date (`as of <date>`) and source attribution.
   - Flags stale price records (>90 days) with an explicit notice to verify at the pharmacy counter.
   - Strictly removes misleading "Live" or "Verified" badges unless verified in real-time.
2. **PMBJP Jan Aushadhi Generic Substitution Engine**:
   - Matches identical formulations (exact same active ingredient(s), same strength, and same dosage form).
   - Calculates exact rupee (₹) and percentage (%) savings vs branded alternatives.
   - Displays the mandatory clinical notice: *"Same ingredient and strength. Ask your doctor or pharmacist before switching."*
3. **Prescription Safety & Multi-Drug Cross-Checker**:
   - **Drug Interactions**: Cross-checks multi-drug combinations against official openFDA label disclosures, quoting verbatim label text without editorializing.
   - **Duplicate Active Substance Detection**: Detects if patients are prescribed multiple brand names sharing the same therapeutic substance (e.g. Crocin + Calpol both containing Paracetamol), guarding against accidental toxicity.
   - **Zero Prescribing or Treatment Advice**: Strictly never outputs dosing instructions or treatment targets.
4. **Official Medicine PDF Brief Export**:
   - Downloads a formatted ReportLab PDF brief featuring active ingredients, price per unit, generic alternatives, quoted label disclosures, and mandatory medical disclaimers.
5. **Unified External API Gateway (`backend/app/integrations/`)**:
   - Robust clients for **openFDA**, **NLM RxNav**, **DailyMed**, **MedlinePlus**, **PubChem**, **ChEMBL**, **OpenStreetMap Overpass**, **Nominatim** (with enforced 1 req/sec rate limit), and **OSRM** (with Haversine fallback).
   - Response caching with SQLite persistence, exponential backoff retries, and `/health/providers` telemetry monitor.
   - Documents all licenses and ethical non-scraping policies in `docs/DATA_SOURCES.md`.

---

## 🔬 Lab Diagnostics & Longitudinal Trend Engine

The upgraded Laboratory Diagnostics module provides:
1. **Reference Ranges & Normalisation**: Evaluates 18+ biomarkers across adult male, adult female, and pediatric age brackets using ICMR, ADA 2024, and WHO guidelines. Normalises synonyms and SI units (e.g. mmol/L ↔ mg/dL).
2. **Explainable Cross-Marker Patterns**: Auditable deterministic rule engine (documented in `docs/RULES.md`) detecting multi-marker patterns (e.g. `GLY-01` fasting & post-meal spike, `LIP-01` atherogenic dyslipidemia).
3. **Longitudinal Trend Prediction**: OLS linear regression across $\ge 3$ historical reports displaying uncertainty forecast cones with visible bounds (never discrete scalar predictions), labelled strictly as *"Trend estimate, not a diagnosis"*.
4. **Clinical Report PDF Builder**: Downloadable A4 PDF clinical dossier via ReportLab featuring patient summary, marker tables, doctor consultation questions, and privacy-preserving QR verification.
5. **Zero Forbidden Diagnostic Language**: Strictly adheres to medical non-diagnostic safety guidelines (no assertions of diabetes, no drug prescriptions, no treatment targets).


---

## 🎙️ Clinical Voice Assistant & Multilingual Speech System

The clinical voice module provides privacy-first, anti-hallucination medical speech-to-text dictation, live browser speech recognition, and clinical record extraction:

### 1. Unified Architecture & Data Flow
```text
[Mic / Audio File / Typed Notes] ──(Patient Consent Required)──► [VoiceDictationModal]
                                                                        │
                                   [safeTranscribeAudio.ts] (multipart POST + vocabulary)
                                                                        ▼
                                                         [FastAPI POST /transcribe]
                                                                        │
  ┌─────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────┐
  │ 1. Server guards: Patient consent check, format validation (.mp3, .wav, .webm, etc.), file size ≤ 25 MB, IP rate limit (30 req/min) │
  │ 2. Whisper API (verbose_json, temperature=0, language hint, medical vocabulary prompt)                                              │
  │ 3. Silence guard (no_speech_prob > 0.6), confidence flag (avg_logprob < -1.0), language mismatch detection                             │
  │ 4. Guaranteed audio file cleanup in `finally:` block (no uploaded audio persisted on disk)                                           │
  └─────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────┘
                                                                        ▼
                                                       [Editable Original Transcript Box]
                                            (Optional: Live Translation + Dosage Number Preservation Guard)
                                                                        ▼
                                                 [Clinical Record Extraction via Gemini Flash]
                                (Strict JSON extraction grounded ONLY in words present in the original transcript)
                                                                        ▼
                                                  [Interactive Clinical Review Screen]
                           (Review & edit patient name, doctor, diagnoses, medications with confidence indicators)
                                                                        ▼
                                          [User Confirms: Saved to Health Profile with source: 'voice']
```

### 2. Clinical Safety Guarantees
- **Zero Fabrication**: Client-side fallback dummy clinical records (e.g., `Z71.89`) are completely deleted. If extraction cannot find valid medical entities in the transcript, it displays `"Could not extract a record. Please review the transcript."` and never saves or fabricates phantom clinical data.
- **Original-Language Grounding**: Clinical extraction runs strictly on the original-language transcript currently in the text box (including user manual corrections), never on machine-translated text.
- **Dosage Number Preservation**: When translating transcripts or clinical instructions, the system cross-checks all numbers in the source text against the translated output. Any missing or altered dosage numbers trigger a warning badge.
- **Transparent Language Badges**: Displays dynamic capability badges (`Live speech (browser)`, `Upload transcription`, `Typing only`) computed from actual browser and Whisper support matrices. Never claims Whisper supports all 22 Indian languages; unsupported Indian languages accurately display "Typing only" with clear fallback guidance.
- **Safe Speech Output**: Medical text speech synthesis preserves clinical dosage parentheses (e.g., `(650 mg)`) while stripping raw markdown formatting. Never falls back to an accent/voice of the wrong language.

### 3. Environment Variables
In your root `.env` file:
```env
# Required for Audio Transcription
OPENAI_API_KEY=your_openai_api_key_here

# Required for Multimodal Vision & Anti-Hallucination Extraction
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 4. Running Voice Tests
```bash
# Run voice transcription test suite (28 comprehensive unit & component tests)
cd frontend
npx vitest run src/__tests__/voiceTranscription.test.ts

# Run all frontend tests (81 tests)
npx vitest run
```

---

### Production Build
```bash
npm run build
```
