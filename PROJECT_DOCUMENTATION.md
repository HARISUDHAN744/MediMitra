# MediMitra - Complete Technical & Architectural Documentation

> **AI-Powered Personal Health Copilot & Clinical Intelligence Engine**  
> **PDF Documentation Generated**: [`MediMitra_Project_Architecture_Documentation.pdf`](./MediMitra_Project_Architecture_Documentation.pdf)

---

## 1. Executive Summary & Problem Solved
**MediMitra** is a patient-centric, clinical healthcare copilot designed to eliminate healthcare literacy barriers, prevent adverse drug reactions, and provide 24/7 multilingual medical guidance.

Patients often struggle to interpret handwritten prescriptions, decipher laboratory test biomarker values, or understand critical drug warnings—especially when communicating in their regional mother tongue. MediMitra bridges this gap by combining **Multimodal Vision LLMs**, **Speech Recognition (STT)**, **Native Indian Voice Synthesis (TTS)**, and **Standardized Medical Knowledge Bases (NIH ICD-10, openFDA)**.

---

## 2. Technology Stack Breakdown

### Frontend Tier
- **Framework**: React 19 + TypeScript 5
- **Build Tool & Bundler**: Vite 6 (Sub-second Hot Module Replacement, optimized tree-shaken chunks)
- **Styling**: Tailwind CSS 3.4 with custom medical theme tokens:
  - Deep Navy / Cyber Slate: `#0F172A`, `#0284C7`
  - Bioluminescent Neon Cyan: `#00F0FF`
  - Cyberpunk Emerald: `#00FF9D`
  - Psychological Violet: `#8B5CF6`
  - Emergency Alert Coral: `#D9534F`
- **Iconography**: Lucide React (90+ medical & interactive icons)
- **Unit Testing**: Vitest 5 + React Testing Library + JSDOM (**91 automated unit tests**)
- **Browser Web APIs**:
  - Web Speech API (`SpeechRecognition`) mapped to BCP-47 locales (`hi-IN`, `ta-IN`, `te-IN`, `en-US`)
  - MediaRecorder API for audio capture
  - Web Audio API / HTMLAudioElement for streaming playback
  - HTML5 Canvas for dynamic emergency QR code generation

### Backend Tier
- **Runtime & Web Framework**: Python 3.14 + FastAPI + Uvicorn (ASGI async event loop)
- **Validation**: Pydantic v2 schemas strictly typing clinical entities, confidence scores, and lab ranges
- **Database & Persistence**: SQLite 3 with SQLAlchemy ORM
- **Deduplication Engine**: Deterministic SHA-256 image/file content hashing (<15ms cache hit)
- **Testing Suite**: Pytest 9.1 + AnyIO + HTTPX TestClient (**30 lab/medicine tests + 8 end-to-end integration test suites**)
- **Process Orchestration**: Concurrently + Node.js port management scripts (`scripts/free-ports.js`)

---

## 3. Large Language Models (LLMs) & AI Cascade

| Model / AI Engine | Provider | Architectural Role in MediMitra |
| :--- | :--- | :--- |
| **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) | Google DeepMind / GenAI SDK | **Primary Multimodal Vision Engine**: OCR of handwritten doctor prescriptions, pathology reports, and radiology scans. Extracts patient, doctor, clinic, date, diagnoses, medications, and lab tests. |
| **Google Gemini 3.5 Flash** (`gemini-3.5-flash`) | Google GenAI API | **High-Throughput Clinical Intelligence Fallback**: Compiles comprehensive care plans, drug-drug interaction alerts, and patient lifestyle recommendations in 150+ languages. |
| **Google Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`) | Google GenAI API | **Ultra-Low Latency Conversational LLM**: Powers sub-second responses in the interactive prescription chatbot and global floating assistant. |
| **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) | Google GenAI API | **Resilience Failover**: Multimodal audio streams and complex PDF extraction fallback. |
| **OpenAI Whisper-1** (`whisper-1`) | OpenAI Audio API | **Medical Speech-to-Text Transcription**: Converts audio consultations into structured transcripts. |
| **OpenAI GPT-4o / GPT-4o-mini** | OpenAI API | **Secondary LLM Fallback**: Automatic backup if Google Gemini endpoints hit regional rate limits. |
| **Deterministic Clinical Rules Engine** | MediMitra In-Memory Engine | **Zero-Latency Client Intelligence**: Generates immediate clinical guidance on frame 0 so the UI never renders blank or collapsed. |

---

## 4. Voice AI & Neural Speech Synthesis

MediMitra provides bidirectional voice interaction:
1. **AI4Bharat Indic-Parler-TTS** (`ai4bharat/indic-parler-tts`):
   - Transformer-based neural voice generation for **18 Indian languages** with dedicated native speakers:
     - Hindi: *Divya*
     - Tamil: *Jaya*
     - Telugu: *Lalitha*
     - Bengali: *Aditi*
     - Kannada: *Anu*
     - Malayalam: *Anjali*
     - Marathi: *Sunita*
     - Gujarati: *Neha*
     - Punjabi: *Divjot*
     - Odia, Assamese, Bodo, Dogri, Sanskrit, Nepali, etc.
2. **Gnani.ai Speech Suite** (`vachana.ai`):
   - Tailored for Indian vernacular accents, code-mixed Hinglish/Tanglish, and noisy outpatient audio.
3. **Google Cloud TTS Engine**:
   - Universal high-fidelity cloud text-to-speech fallback supporting 104+ global ISO languages.
4. **Universal `speakText()` Frontend Service**:
   - Reactive audio playback controller with real-time state management (`idle`, `loading`, `speaking`, `error`) and instant cancel capability.

---

## 5. External Medical APIs & Knowledge Bases

1. **U.S. National Library of Medicine (NIH) Clinical Tables API**:
   - Real-time condition lookup providing standardized **ICD-10-CM codes**, billable classifications, and clinical hierarchy.
2. **openFDA Drug Database**:
   - Live drug monographs, approved indications, contraindications, adverse drug event alerts, and black-box safety warnings.
3. **Overpass & OpenStreetMap API**:
   - Geospatial locator for nearby hospitals, clinics, diagnostic labs, pharmacies, and emergency 108/112 ambulance services.
4. **National Blood & Organ Donation Directories**:
   - Emergency donor matching index for critical blood groups (A-, B-, O-, AB-) and organ procurement centers.

---

## 6. Key Application Modules

1. **Multimodal Prescription & Lab Scanner**: Ingests JPG, PNG, WEBP, or PDF files with deduplication caching.
2. **AI Clinical Prescription Agent**: Zero-latency clinical assessment, drug mechanism breakdown, lab interpretations, and diet advice.
3. **Global Floating 24/7 AI Chatbot**: Always available at the bottom right across all views with full mic voice input and audio voice playback.
4. **Medical AI Q&A Copilot View**: Multi-agent consultation center with 4 specialized modes:
   - *General Clinical Copilot*
   - *Pharmacology & Drug Safety*
   - *Lab Biomarker Diagnostics*
   - *Emergency Triage 24/7*
5. **Lab Diagnostics & Biomarker Analyzer**: Normalizes blood panels, HbA1c, lipids, renal panels with interactive biological reference ranges.
6. **Universal 150+ Language Engine**: 150+ languages with full RTL support (Arabic/Urdu) and complete localization for all 22 official Indian scheduled languages.
7. **Emergency QR Medical ID Card**: Generates a secure, printable/scannable QR health card with blood group, emergency contacts, allergy alerts, and active medications.
8. **Medication Schedule & Calendar**: Visual dosage timeline (Morning AC, Afternoon, Night HS) with adherence tracking.
9. **Patient Health Vault**: Stores past prescriptions with SHA-256 deduplication and one-click re-analysis.
10. **Blood & Organ Donation Hub**: Emergency escalation module connecting patients with nearby blood banks and emergency services.

---

## 7. Security, Privacy & Safety Compliance

- **Mandatory Patient Consent**: `/transcribe` strictly enforces `consent=true` before processing patient audio.
- **SHA-256 De-Identification**: Unique image hashes prevent storing redundant PII.
- **Clinical Safety Disclaimers**: All AI outputs explicitly advise confirming prescription changes with a licensed physician.
- **Failover High Availability**: Automated multi-tiered LLM fallback prevents service disruptions.
