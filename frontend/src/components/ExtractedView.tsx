import React, { useState } from 'react';
import {
  FileText,
  User,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  Activity,
  AlertTriangle,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Loader2,
} from 'lucide-react';
import { UploadResponse } from '../types/medical';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ConditionSearchModal } from './ConditionSearchModal';
import { DrugInfoModal } from './DrugInfoModal';
import { PrescriptionAiAgent } from './PrescriptionAiAgent';
import {
  LanguageDetail,
  getUiTranslations,
  getLocalizedMedicationAdvice,
  speakMedicalText,
} from '../services/languageService';
import { playCloudTts, speakText } from '../services/safeTranscribeAudio';

interface ExtractedViewProps {
  result: UploadResponse;
  language: LanguageDetail;
}

export const ExtractedView: React.FC<ExtractedViewProps> = ({ result, language }) => {
  const [showJson, setShowJson] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [stopSpeechFn, setStopSpeechFn] = useState<(() => void) | null>(null);
  const voiceButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const { data, is_cached, is_fallback, fallback_reason, model_used, file_hash, filename } = result;
  const t = getUiTranslations(language.code);

  const handleOpenConditionLookup = (conditionName: string = '') => {
    setSelectedCondition(conditionName);
    setIsConditionModalOpen(true);
  };

  const handleOpenDrugInfo = (drugName: string) => {
    setSelectedDrug(drugName);
    setIsDrugModalOpen(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Localized clinical narrator builder supporting Indian & global languages
  const buildSpokenMedicalSummary = (doc: any, langCode: string): string => {
    const code = (langCode || 'en').toLowerCase().trim();
    const patient = doc.patient_name || '';

    if (code === 'ta') {
      let script = patient
        ? `நோயாளி ${patient} அவர்களின் மருத்துவ ஆவண விவரங்கள். `
        : 'மருத்துவ ஆவண விவரங்கள். ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `மருத்துவ கண்டறிதல்: ${doc.diagnoses.join(', ')}. `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, மருந்தளவு ${m.dosage}, ${m.frequency || ''}`)
          .join('. ');
        script += `பரிந்துரைக்கப்பட்ட மருந்துகள்: ${medList}. `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, அளவு ${t.value} ${t.unit || ''}, முடிவு ${t.interpretation || 'இயல்பானது'}`)
          .join('. ');
        script += `ஆய்வக சோதனை முடிவுகள்: ${testList}. `;
      }
      if (doc.notes) {
        script += `மருத்துவரின் குறிப்புகள்: ${doc.notes}. `;
      }
      return script;
    }

    if (code === 'hi') {
      let script = patient
        ? `मरीज ${patient} का मेडिकल दस्तावेज विवरण। `
        : 'मेडिकल दस्तावेज विवरण। ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `रोग निदान: ${doc.diagnoses.join(', ')}। `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, खुराक ${m.dosage}, ${m.frequency || ''}`)
          .join('। ');
        script += `दी गई दवाइयां: ${medList}। `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, मान ${t.value} ${t.unit || ''}, परिणाम ${t.interpretation || 'सामान्य'}`)
          .join('। ');
        script += `लैब टेस्ट परिणाम: ${testList}। `;
      }
      if (doc.notes) {
        script += `डॉक्टर के निर्देश: ${doc.notes}। `;
      }
      return script;
    }

    if (code === 'te') {
      let script = patient
        ? `రోగి ${patient} గారి వైద్య వివరాలు. `
        : 'వైద్య వివరాలు. ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `రోగ నిర్ధారణ: ${doc.diagnoses.join(', ')}. `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, మోతాదు ${m.dosage}, ${m.frequency || ''}`)
          .join('. ');
        script += `మందులు: ${medList}. `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, విలువ ${t.value} ${t.unit || ''}, ఫలితం ${t.interpretation || ''}`)
          .join('. ');
        script += `ల్యాబ్ పరీక్షలు: ${testList}. `;
      }
      if (doc.notes) {
        script += `వైద్యుల సూచనలు: ${doc.notes}. `;
      }
      return script;
    }

    if (code === 'kn') {
      let script = patient
        ? `ರೋಗಿ ${patient} ಅವರ ವೈದ್ಯಕೀಯ ವಿವರಗಳು. `
        : 'ವೈದ್ಯಕೀಯ ವಿವರಗಳು. ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `ರೋಗನಿರ್ಣಯ: ${doc.diagnoses.join(', ')}. `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, ಪ್ರಮಾಣ ${m.dosage}, ${m.frequency || ''}`)
          .join('. ');
        script += `ಔಷಧಿಗಳು: ${medList}. `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, ಮೌಲ್ಯ ${t.value} ${t.unit || ''}, ವಿವರಣೆ ${t.interpretation || ''}`)
          .join('. ');
        script += `ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆಗಳು: ${testList}. `;
      }
      if (doc.notes) {
        script += `ವೈದ್ಯರ ಸಲಹೆ: ${doc.notes}. `;
      }
      return script;
    }

    if (code === 'ml') {
      let script = patient
        ? `രോഗി ${patient} യുടെ മെഡിക്കൽ വിവരങ്ങൾ. `
        : 'മെഡിക്കൽ വിവരങ്ങൾ. ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `രോഗനിർണയം: ${doc.diagnoses.join(', ')}. `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, അളവ് ${m.dosage}, ${m.frequency || ''}`)
          .join('. ');
        script += `മരുന്നുകൾ: ${medList}. `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, മൂല്യം ${t.value} ${t.unit || ''}, ഫലം ${t.interpretation || ''}`)
          .join('. ');
        script += `ലാബ് പരിശോധനകൾ: ${testList}. `;
      }
      if (doc.notes) {
        script += `ഡോക്ടറുടെ നിർദ്ദേശം: ${doc.notes}. `;
      }
      return script;
    }

    if (code === 'bn') {
      let script = patient
        ? `রোগী ${patient}-এর মেডিকেল রেকর্ডের বিবরণ। `
        : 'মেডিকেল রেকর্ডের বিবরণ। ';
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        script += `রোগ নির্ণয়: ${doc.diagnoses.join(', ')}। `;
      }
      if (doc.medicines && doc.medicines.length > 0) {
        const medList = doc.medicines
          .map((m: any) => `${m.name}, মাত্রা ${m.dosage}, ${m.frequency || ''}`)
          .join('। ');
        script += `ওষুধ: ${medList}। `;
      }
      if (doc.tests && doc.tests.length > 0) {
        const testList = doc.tests
          .map((t: any) => `${t.name}, মান ${t.value} ${t.unit || ''}, ফলাফল ${t.interpretation || ''}`)
          .join('। ');
        script += `ল্যাব পরীক্ষা: ${testList}। `;
      }
      if (doc.notes) {
        script += `চিকিৎসকের মন্তব্য: ${doc.notes}। `;
      }
      return script;
    }

    // Default English / International
    let spokenScript = `Medical document extraction for patient ${patient || 'not specified'}. `;
    if (doc.diagnoses && doc.diagnoses.length > 0) {
      spokenScript += `Diagnoses: ${doc.diagnoses.join(', ')}. `;
    }
    if (doc.medicines && doc.medicines.length > 0) {
      spokenScript += `Prescribed medications: ${doc.medicines.map((m: any) => `${m.name}, dosage ${m.dosage}, ${m.frequency}`).join('. ')}. `;
    }
    if (doc.tests && doc.tests.length > 0) {
      spokenScript += `Lab tests: ${doc.tests.map((t: any) => `${t.name}, value ${t.value} ${t.unit || ''}, interpretation ${t.interpretation}`).join('. ')}. `;
    }
    if (doc.notes) {
      spokenScript += `Physician remarks: ${doc.notes}`;
    }
    return spokenScript;
  };

  // Voice Narrator in active language powered by speakText
  const handleToggleVoice = () => {
    if (isSpeaking || isAudioLoading) {
      if (stopSpeechFn) {
        stopSpeechFn();
        setStopSpeechFn(null);
      }
      setIsSpeaking(false);
      setIsAudioLoading(false);
      return;
    }

    // Build spoken script in patient's active native language (e.g. Tamil, Telugu, Hindi, English)
    const spokenScript = buildSpokenMedicalSummary(data, language.code);

    const stopFn = speakText(
      spokenScript,
      language.code,
      voiceButtonRef.current,
      (state) => {
        setIsAudioLoading(state === 'loading');
        setIsSpeaking(state === 'speaking');
        if (state === 'idle' || state === 'error') {
          setStopSpeechFn(null);
        }
      }
    );
    setStopSpeechFn(() => stopFn);
  };

  return (
    <div className="space-y-6 mt-8 animate-fadeIn" dir={language.direction}>
      {/* NIH Condition Lookup Modal */}
      <ConditionSearchModal
        isOpen={isConditionModalOpen}
        initialQuery={selectedCondition || ''}
        onClose={() => setIsConditionModalOpen(false)}
      />

      {/* openFDA Drug Info Modal */}
      {selectedDrug && (
        <DrugInfoModal
          isOpen={isDrugModalOpen}
          drugName={selectedDrug}
          onClose={() => setIsDrugModalOpen(false)}
        />
      )}

      {/* 1. Yellow Fallback Alert Banner (Required when fallback is used) */}
      {is_fallback && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <span>Demo fallback data - not extracted from your file</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-amber-400">
                Simulation Fallback
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {fallback_reason ||
                'The live Gemini API call could not be completed, so MediMitra automatically loaded verified sample fallback data from /samples for seamless demo execution.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Cache Notification Banner */}
      {is_cached && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Retrieved from local SQLite cache (Exact file hash matched)</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 font-semibold">
            SHA-256: {file_hash.substring(0, 12)}...
          </span>
        </div>
      )}

      {/* 3. Document Overview Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg capitalize tracking-wide font-mono">
                  {data.document_type.replace('_', ' ')}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono font-bold border border-sky-200">
                  {filename}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-500" />
                <span>AI Model:</span>
                <span className="font-mono text-sky-700 font-semibold">{model_used}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Voice Narrator Button */}
            <button
              ref={voiceButtonRef}
              type="button"
              onClick={handleToggleVoice}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isAudioLoading
                  ? 'bg-sky-600 text-white animate-pulse'
                  : 'bg-[#0284C7] hover:bg-[#0369A1] text-white hover:scale-105'
              }`}
            >
              {isAudioLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>
                {isAudioLoading
                  ? (language.code === 'ta' ? 'குரல் தயாராகிறது...' : (language.code === 'te' ? 'వాయిస్ సిద్ధమవుతోంది...' : 'Synthesizing voice...'))
                  : isSpeaking
                  ? t.stopAudioBtn
                  : `${t.listenAudioBtn} (${language.nativeName})`}
              </span>
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">
                Overall Confidence
              </span>
              <ConfidenceBadge score={data.confidence_scores?.overall || 0.95} size="md" />
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <User className="w-3.5 h-3.5 text-[#328CC1]" />
              <span className="font-medium">Patient Name</span>
            </div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {data.patient_name || 'Not detected'}
            </div>
            {data.confidence_scores?.patient_name && (
              <div className="mt-1.5">
                <ConfidenceBadge score={data.confidence_scores.patient_name} />
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-[#328CC1]" />
              <span className="font-medium">Doctor Name</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs truncate" title={data.doctor_name || ''}>
              {data.doctor_name || 'Not specified'}
            </div>
            {data.confidence_scores?.doctor_name && (
              <div className="mt-1.5">
                <ConfidenceBadge score={data.confidence_scores.doctor_name} />
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-medium">Hospital / Clinic</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs truncate" title={data.hospital_or_clinic || ''}>
              {data.hospital_or_clinic || 'Not specified'}
            </div>
            {data.confidence_scores?.hospital_or_clinic && (
              <div className="mt-1.5">
                <ConfidenceBadge score={data.confidence_scores.hospital_or_clinic} />
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#D9534F]" />
              <span className="font-medium">Document Date</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-xs">
              {data.document_date || 'Not specified'}
            </div>
            {data.confidence_scores?.document_date && (
              <div className="mt-1.5">
                <ConfidenceBadge score={data.confidence_scores.document_date} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3.5 AI Prescription Intelligence Agent & Copilot */}
      <PrescriptionAiAgent
        prescriptionData={data}
        language={language}
        filename={filename}
      />

      {/* 4. Diagnoses Section with NIH ICD-10 Integration */}
      {data.diagnoses && data.diagnoses.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 font-mono">
              <Activity className="w-5 h-5 text-[#328CC1]" />
              <span>{t.diagnosesHeading}</span>
            </h4>
            <button
              type="button"
              onClick={() => handleOpenConditionLookup('')}
              className="text-xs font-bold text-sky-700 hover:text-white hover:bg-sky-600 border border-sky-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>NIH ICD-10 Search</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {data.diagnoses.map((diag, i) => (
              <div
                key={i}
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs hover:border-[#328CC1] hover:bg-white transition-all shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#328CC1]" />
                <span className="font-semibold">{diag}</span>
                <button
                  type="button"
                  onClick={() => handleOpenConditionLookup(diag)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-600 hover:text-white font-bold transition-all ml-1 flex items-center gap-1"
                  title="Query verified ICD-10 code in NIH Clinical Database"
                >
                  <span>ICD-10</span>
                  <Search className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Prescribed Medications Section with openFDA & Localized Advice */}
      {data.medicines && data.medicines.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 font-mono">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>{t.medicationsHeading}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono border border-emerald-300 font-bold">
                {data.medicines.length}
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.medicines.map((med, idx) => {
              const localizedAdvice = getLocalizedMedicationAdvice(med.instructions || '', language.code);
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-50 border border-slate-200 hover:border-[#328CC1] p-4 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{med.name}</span>
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {med.dosage}
                          </span>
                        </h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenDrugInfo(med.name)}
                        className="text-[10px] font-semibold text-sky-700 hover:text-white hover:bg-sky-600 bg-sky-50 border border-sky-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <span>openFDA</span>
                        <Info className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[11px] uppercase font-semibold">{t.frequency}:</span>
                        <span className="font-bold text-slate-900">{med.frequency}</span>
                      </div>
                      {med.duration && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[11px] uppercase font-semibold">{t.duration}:</span>
                          <span className="font-mono text-[#D9534F] font-bold">{med.duration}</span>
                        </div>
                      )}
                    </div>

                    {med.instructions && (
                      <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          {t.instructions}:
                        </span>
                        <p className="text-slate-800 leading-relaxed">{med.instructions}</p>
                        {localizedAdvice && localizedAdvice !== med.instructions && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-sky-700 text-xs font-semibold">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="opacity-75">({language.nativeName}):</span>
                              {language.isBeta && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  AI translated (beta)
                                </span>
                              )}
                            </div>
                            <span className="text-slate-900 font-medium">{localizedAdvice}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Diagnostic Laboratory Biomarkers Section */}
      {data.tests && data.tests.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4 font-mono">
            <Activity className="w-5 h-5 text-sky-600" />
            <span>{t.labTestsHeading}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono border border-sky-200 font-bold">
              {data.tests.length}
            </span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Biomarker / Test</th>
                  <th className="py-3 px-4">Observed Value</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Reference Range</th>
                  <th className="py-3 px-4">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.tests.map((test, idx) => {
                  const isAbnormal =
                    test.interpretation?.toLowerCase() === 'high' ||
                    test.interpretation?.toLowerCase() === 'low';
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{test.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-800">{test.value}</td>
                      <td className="py-3 px-4 text-slate-600">{test.unit || '-'}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{test.reference_range || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                            isAbnormal
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {test.interpretation || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Physician Advice & Clinical Remarks */}
      {data.notes && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-2 font-mono">
            <Info className="w-5 h-5 text-[#328CC1]" />
            <span>{t.physicianNotesHeading}</span>
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {data.notes}
          </p>
        </div>
      )}

      {/* 8. Raw Validated JSON Inspector (Collapsible) */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#328CC1]" />
            <span>Structured Pydantic JSON Output (Raw Schema View)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500">JSON Schema v1</span>
            {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {showJson && (
          <div className="p-4 border-t border-slate-200 bg-slate-900 text-slate-100 relative">
            <button
              type="button"
              onClick={handleCopyJson}
              className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 shadow-md"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
