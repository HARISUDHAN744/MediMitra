# RULES FOR THE AGENT
- Read this whole file first, every time.
- Build ONE phase at a time. Stop after each phase, tell me how to run and test it, and list known gaps. Never start the next phase on your own.
- Use fake/synthetic data only. Never hardcode API keys; read GEMINI_API_KEY from .env.
- Every AI output shows a medical disclaimer. No diagnosis, no dosage advice.
- Keep code typed, commented and beginner-readable. I am a 2nd-year student, explain simply.
- Prefer the simplest working solution. Ask before any change that expands scope.

# PROJECT: MediMitra - AI-Powered Personal Health Copilot
National hackathon prototype (Altrix Labs challenge). Goal: a working, demo-ready app.
Judging: AI Utilization 35% (extraction accuracy, plain-language summaries),
Technical Architecture 25% (clean pipeline, structured model, ABDM-ready schema),
User Experience 20%, Healthcare Safety 10%, Demo 10%.
Bonus: regional-language support and ABDM/ABHA readiness.

## 1. Product
Turn scattered records (prescriptions, lab reports, discharge summaries, diagnostic
reports) into one understandable health profile and timeline for three user groups:
- Patient/family: upload, understand, track, reminders.
- Doctor: consent-based access, AI pre-visit brief, notes.
- Government/public-health analyst: anonymized district-level trends only
  (suppress groups smaller than 10).

## 2. Tech stack (start simple)
- Backend: Python 3.11, FastAPI, Pydantic, SQLAlchemy, PostgreSQL (SQLite allowed
  for early phases), JWT + role-based access (patient, doctor, govt), audit log.
- Frontend: React + Vite + TypeScript + Tailwind + Recharts + i18next, mobile-first, PWA.
- AI: Google Gemini API for OCR/vision extraction (printed + handwritten, English,
  Tamil, Hindi) and plain-language summaries. Force JSON output validated by Pydantic.
  Cache results so the same document is never sent twice. Add a retry and a
  fallback to saved sample results if the API fails (for demo safety).
- Standards: FHIR R4 resources (Patient, Observation, MedicationRequest, Condition,
  DiagnosticReport, DocumentReference), ABDM-style consent, mock ABHA link.
- DevOps: Docker Compose, .env.example, seed data, pytest.
- Optional later (only if core works): Redis/Celery, MinIO, MongoDB, Node layer.

## 3. AI components
1. Extraction: image -> Gemini -> JSON (medicines, dosage, frequency, duration,
   tests, values, units, reference ranges, diagnoses, doctor, hospital, dates)
   with a confidence per field.
2. Anti-hallucination: every extracted value must be present in the document text;
   low-confidence fields are highlighted for user review.
3. Summary: Class-8 reading level, English + Tamil (then Hindi/Telugu), with
   High/Low/Critical badges, what abnormal values mean, questions to ask the doctor,
   general lifestyle cautions. Never diagnose, never prescribe, never change doses.
4. Risk signals: simple rule-based trend flags (e.g., rising HbA1c, repeated low Hb)
   phrased as "discuss with your doctor". Optional: XGBoost model in /ml later.
5. "Ask my records" chat: answers only from the user's documents, with citations.
6. Evaluation script: 30 synthetic labelled documents, reports precision/recall per
   field. Show results in the app.

## 4. Core features
1. Upload (drag-drop/camera, multi-file, image quality check).
2. Review screen with per-field confidence; corrections are saved.
3. Plain-language summary with abnormal-value explanations.
4. Unified timeline, trend charts, medicine list (current/past), allergies.
5. Medicine safety: duplicate-drug detection and basic interaction warnings (informational).
6. Multi-language UI + summaries + read-aloud (English, Tamil, Hindi, Telugu);
   adding a language needs only a translation file.
7. ABDM readiness: FHIR export/import, mock ABHA link, consent manager
   (grant/revoke access with expiry).
8. Doctor portal: request access -> patient approves -> timeline + AI brief + notes.
9. Government dashboard: anonymized district heat map and trends.
10. Reminders (mock push/SMS) and emergency QR card.

## 5. Safety and privacy
Disclaimer on every AI output; emergency-symptom detection -> advise calling 112 or
a doctor; encryption, consent before any sharing, audit trail, delete-my-data,
DPDP Act 2023 aligned wording; prompt-injection guard on uploaded documents;
synthetic data only.

## 6. ROADMAP (build strictly in this order)
Phase 1: Setup + upload -> Gemini extraction -> JSON saved in DB -> simple table UI.
Phase 2: Review/correct screen with confidence highlights.
Phase 3: Plain-language summary (English + Tamil) with High/Low/Critical badges.
Phase 4: Login and roles, unified timeline, trend charts, medicine list.
Phase 5: FHIR export/import, mock ABHA link, consent manager.
Phase 6: Doctor portal and government dashboard.
Phase 7: Medicine safety, reminders, emergency QR, "Ask my records" chat.
Phase 8: Evaluation dashboard, safety polish, accessibility, more languages.
Phase 9: Architecture diagram (Mermaid), ER + FHIR mapping, README, 8-slide outline,
         3-minute demo script.
If time runs short, Phases 1-4 must be fully polished before anything else.

## 7. Deliverables
Monorepo (/backend /frontend /ml /infra /docs /samples), README (setup in 5 minutes),
OpenAPI docs, demo users (patient, doctor, govt), sample documents, architecture diagram.