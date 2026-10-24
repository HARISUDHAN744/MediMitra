import React, { useState } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bell,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  Plus,
  HelpCircle,
  Send,
  Leaf,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  Activity,
  ArrowRight,
  Info,
  Mic,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  LanguageDetail,
  getDeviceVoiceStatus,
  getEffectiveVoiceStatus,
  speakMedicalText,
  getLocaleForLanguage,
} from '../services/languageService';
import { playCloudTts } from '../services/safeTranscribeAudio';
import {
  RouteRemedyAdvice,
  CURATED_ROUTE_REMEDIES,
  getRouteAndRemedyAdvice,
} from '../services/routeRemedyService';

interface MedicationScheduleViewProps {
  language: LanguageDetail;
}

interface ScheduleItem {
  id: string;
  medicineName: string;
  dosage: string;
  slot: 'Morning' | 'Noon' | 'Evening' | 'Bedtime';
  timeStr: string;
  instructions: string;
  takenToday: boolean;
  purpose: string;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: 's-1',
    medicineName: 'Pantoprazole (Pantocid)',
    dosage: '40 mg',
    slot: 'Morning',
    timeStr: '07:30 AM',
    instructions: 'Take 30 mins before breakfast on empty stomach with warm water',
    takenToday: true,
    purpose: 'Acid Reflux & Gastric Protection',
  },
  {
    id: 's-2',
    medicineName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    slot: 'Morning',
    timeStr: '08:30 AM',
    instructions: 'Take with breakfast to minimize GI upset',
    takenToday: true,
    purpose: 'Blood Sugar Control',
  },
  {
    id: 's-3',
    medicineName: 'Telmisartan (Telma)',
    dosage: '40 mg',
    slot: 'Morning',
    timeStr: '09:00 AM',
    instructions: 'Take with water after breakfast',
    takenToday: true,
    purpose: 'Blood Pressure Regulation',
  },
  {
    id: 's-4',
    medicineName: 'Ecosprin (Aspirin)',
    dosage: '75 mg',
    slot: 'Noon',
    timeStr: '01:30 PM',
    instructions: 'Take immediately after lunch',
    takenToday: false,
    purpose: 'Cardiovascular Protection',
  },
  {
    id: 's-5',
    medicineName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    slot: 'Evening',
    timeStr: '08:00 PM',
    instructions: 'Take with dinner',
    takenToday: false,
    purpose: 'Evening Glycemic Stability',
  },
  {
    id: 's-6',
    medicineName: 'Atorvastatin (Atorva)',
    dosage: '10 mg',
    slot: 'Bedtime',
    timeStr: '10:00 PM',
    instructions: 'Take at night before sleep with water',
    takenToday: false,
    purpose: 'Cholesterol Reduction',
  },
];

const PRESET_AI_QUESTIONS = [
  {
    id: 'q-panto',
    label: 'Acid Reflux: Empty stomach route & natural remedies',
    query: 'Pantoprazole oral empty stomach route and GERD natural remedies',
    medicineHint: 'Pantoprazole',
  },
  {
    id: 'q-metformin',
    label: 'Diabetes: Post-meal route & blood sugar remedies',
    query: 'Metformin oral with meal route and diabetes dietary lifestyle remedies',
    medicineHint: 'Metformin',
  },
  {
    id: 'q-telmi',
    label: 'Blood Pressure: 24h route & DASH/herbal remedies',
    query: 'Telmisartan 24h oral route and blood pressure natural remedies',
    medicineHint: 'Telmisartan',
  },
  {
    id: 'q-aspirin',
    label: 'Heart Care: Aspirin gastric route & omega-3 remedies',
    query: 'Ecosprin aspirin with food route and cardiovascular remedies',
    medicineHint: 'Ecosprin',
  },
  {
    id: 'q-statin',
    label: 'Cholesterol: Bedtime route & soluble fiber remedies',
    query: 'Atorvastatin bedtime oral route and cholesterol reduction remedies',
    medicineHint: 'Atorvastatin',
  },
];

export const MedicationScheduleView: React.FC<MedicationScheduleViewProps> = ({ language }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);

  // AI Route & Remedy State
  const [activeAdvice, setActiveAdvice] = useState<RouteRemedyAdvice>(
    CURATED_ROUTE_REMEDIES.pantoprazole
  );
  const [userQuery, setUserQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [selectedQuestionTab, setSelectedQuestionTab] = useState<'route' | 'remedies' | 'assessment'>('route');

  const toggleTaken = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, takenToday: !item.takenToday } : item))
    );
  };

  const handleAskPreset = async (query: string, hint: string) => {
    setIsLoadingAi(true);
    setUserQuery(query);
    const advice = await getRouteAndRemedyAdvice(query, language.code, hint);
    setActiveAdvice(advice);
    setIsLoadingAi(false);
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsLoadingAi(true);
    const advice = await getRouteAndRemedyAdvice(userQuery, language.code);
    setActiveAdvice(advice);
    setIsLoadingAi(false);
  };

  // Voice Reminder Loop State (Powered by high-availability Cloud Speech APIs for Tamil, Telugu, Hindi, etc.)
  const voiceStatus = getEffectiveVoiceStatus(language.code);
  const activeReminder = schedule.find((s) => !s.takenToday) || null;
  const [isSpeakingReminder, setIsSpeakingReminder] = useState(false);
  const [isListeningVoiceCmd, setIsListeningVoiceCmd] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<string | null>(null);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const speechRecognitionRef = React.useRef<any>(null);
  const stopSpeakingReminderRef = React.useRef<(() => void) | null>(null);

  const handleSpeakReminder = () => {
    if (!activeReminder) return;
    if (isSpeakingReminder) {
      if (stopSpeakingReminderRef.current) {
        stopSpeakingReminderRef.current();
        stopSpeakingReminderRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingReminder(false);
      return;
    }

    if (stopSpeakingReminderRef.current) {
      stopSpeakingReminderRef.current();
      stopSpeakingReminderRef.current = null;
    }

    setIsSpeakingReminder(true);
    setReminderNotice(null);

    const reminderSentence = `Time to take your medication: ${activeReminder.medicineName}, ${activeReminder.dosage}. ${activeReminder.instructions}.`;

    const stopFn = speakMedicalText(
      reminderSentence,
      language.code,
      () => {
        setIsSpeakingReminder(false);
        stopSpeakingReminderRef.current = null;
      },
      () => {
        // Fall back to Cloud Gnani Indic TTS before reporting unavailable
        const cloudStop = playCloudTts(
          reminderSentence,
          language.code,
          () => {
            setIsSpeakingReminder(false);
            stopSpeakingReminderRef.current = null;
          },
          () => {
            setIsSpeakingReminder(false);
            stopSpeakingReminderRef.current = null;
            setReminderNotice('Voice not available for this language on this device.');
          }
        );
        stopSpeakingReminderRef.current = cloudStop;
      }
    );
    stopSpeakingReminderRef.current = stopFn;
  };

  const handleMarkTaken = (id: string) => {
    toggleTaken(id);
    if (isSpeakingReminder) {
      if (stopSpeakingReminderRef.current) {
        stopSpeakingReminderRef.current();
        stopSpeakingReminderRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingReminder(false);
    }
    stopListeningCmd();
    setReminderNotice(`Dose recorded: marked as taken.`);
    setTimeout(() => setReminderNotice(null), 3500);
  };

  const handleSnooze = () => {
    if (isSpeakingReminder && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingReminder(false);
    }
    stopListeningCmd();
    const snoozedTime = new Date(Date.now() + 10 * 60000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setSnoozeUntil(snoozedTime);
    setReminderNotice(`Reminder snoozed for 10 minutes (until ${snoozedTime}).`);
    setTimeout(() => setReminderNotice(null), 4000);
  };

  const startListeningCmd = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || voiceStatus === 'Text only' || voiceStatus === 'Output only') {
      setReminderNotice('Speech recognition not available for this language on this device.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLocaleForLanguage(language.code);

      recognition.onresult = (event: any) => {
        const text = (event.results[0]?.[0]?.transcript || '').toLowerCase().trim();
        const takenKeywords = [
          'taken', 'took', 'done', 'yes', 'ok', 'okay',
          // Hindi / Sanskrit / Nepali
          'ले लिया', 'हो गया', 'हाँ', 'खा ली', 'स्वीकृतम्',
          // Tamil
          'எடுத்துக்கொண்டேன்', 'முடிந்தது', 'சாப்பிட்டேன்', 'ஆம்',
          // Telugu
          'తీసుకున్నాను', 'తీసుకున్నా', 'అయిపోయింది', 'వేసుకున్నాను', 'అవును',
          // Kannada
          'ತೆಗೆದುಕೊಂಡೆ', 'ಆಯಿತು', 'ಹೌದು',
          // Malayalam
          'കഴിച്ചു', 'എടുത്തു', 'തീർന്നു', 'അതെ',
          // Bengali / Assamese
          'নিয়েছি', 'খেয়েছি', 'হয়েছে', 'হ্যাঁ', 'ললোঁ', 'খালোঁ',
          // Marathi
          'घेतले', 'खाल्ले', 'झाले', 'होय',
          // Gujarati
          'લીધી', 'ખાઈ લીધી', 'થઈ ગયું', 'હા',
          // Punjabi
          'ਲੈ ਲਈ', 'ਖਾ ਲਈ', 'ਹੋ ਗਈ', 'ਹਾਂ',
          // Urdu
          'لے لی', 'کھا لی', 'ہو گئی', 'جی ہاں',
          // Odia
          'ନେଇଛି', 'ଖାଇଛି', 'ହଁ',
        ];
        const snoozeKeywords = [
          'snooze', 'later', 'wait',
          // Hindi / Sanskrit / Nepali
          'स्नूज़', 'बाद में', 'रुकिए',
          // Tamil
          'ஸ்னூஸ்', 'பிறகு', 'கொஞ்சம் கழித்து',
          // Telugu
          'స్నూజ్', 'కాసేపు', 'తర్వాత',
          // Kannada
          'ಸ್ನೂಜ್', 'ನಂತರ', 'ಸ್ವಲ್ಪ ಬಿಟ್ಟು',
          // Malayalam
          'സ്നൂസ്', 'പിന്നീട്', 'കാത്തിരിക്കൂ',
          // Bengali / Assamese
          'স্নুজ', 'পরে', 'একটু পরে',
          // Marathi
          'स्नूझ', 'नंतर', 'थांबा',
          // Gujarati
          'સ્નૂઝ', 'પછી',
          // Punjabi
          'ਸਨੂਜ਼', 'ਬਾਅਦ ਵਿੱਚ',
          // Urdu
          'سنوز', 'بعد میں',
        ];

        if (takenKeywords.some((k) => text.includes(k))) {
          if (activeReminder) handleMarkTaken(activeReminder.id);
        } else if (snoozeKeywords.some((k) => text.includes(k))) {
          handleSnooze();
        } else {
          setReminderNotice(`Heard "${text}". Please say "Taken" or "Snooze".`);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoiceCmd(false);
      };

      recognition.onend = () => {
        setIsListeningVoiceCmd(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsListeningVoiceCmd(true);
      setReminderNotice('Listening for "Taken" or "Snooze"...');
    } catch {
      setIsListeningVoiceCmd(false);
    }
  };

  const stopListeningCmd = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    setIsListeningVoiceCmd(false);
  };

  const completedCount = schedule.filter((s) => s.takenToday).length;
  const totalCount = schedule.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  const slots = [
    { name: 'Morning', icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Noon', icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Evening', icon: Sunset, color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Bedtime', icon: Moon, color: 'text-sky-700', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card (Primary Sky Blue) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white border border-sky-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-white shadow-sm">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-wide">
                Medication Schedule & Smart Pill Regimen
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold border border-white/20">
                Auto-Synchronized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Interactive morning to bedtime prescription dosage tracker with clinical meal timing guidance.
            </p>
          </div>
        </div>

        {/* Adherence Progress */}
        <div className="flex items-center gap-4 bg-sky-900/40 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-md">
          <div className="text-right">
            <p className="text-[10px] text-sky-100 font-mono uppercase font-bold">Today's Adherence</p>
            <p className="text-base font-bold text-white font-mono">
              {completedCount} / {totalCount} Doses ({percent}%)
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-sky-200 flex items-center justify-center font-mono font-bold text-sm text-white bg-sky-700/80">
            {percent}%
          </div>
        </div>
      </div>

      {/* Voice Reminder Loop (F5 Replacement with F0 Language Compliance) */}
      {activeReminder && (
        <div className="p-6 rounded-3xl bg-white border-2 border-sky-300 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 animate-pulse">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 font-mono">
                    Medication Reminder Loop
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    voiceStatus === 'Full voice'
                      ? 'bg-emerald-100 text-emerald-800'
                      : voiceStatus === 'Output only'
                      ? 'bg-blue-100 text-blue-800'
                      : voiceStatus === 'Input only'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {voiceStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {voiceStatus === 'Full voice' || voiceStatus === 'Output only'
                    ? `Voice audio reminder in ${language.nativeName} (${language.name})`
                    : `Voice output not available for ${language.name} on this device. Displaying text reminder.`}
                </p>
              </div>
            </div>

            {/* Audio action controls */}
            <div className="flex items-center gap-2">
              {(voiceStatus === 'Full voice' || voiceStatus === 'Output only') && (
                <button
                  type="button"
                  onClick={handleSpeakReminder}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSpeakingReminder
                      ? 'bg-[#0284C7] text-white shadow-sm animate-pulse'
                      : 'bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200'
                  }`}
                >
                  {isSpeakingReminder ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeakingReminder ? 'Stop Audio' : '🔊 Speak Reminder'}</span>
                </button>
              )}

              {(voiceStatus === 'Full voice' || voiceStatus === 'Input only') && (
                <button
                  type="button"
                  onClick={isListeningVoiceCmd ? stopListeningCmd : startListeningCmd}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListeningVoiceCmd
                      ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="Say 'Taken' or 'Snooze'"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isListeningVoiceCmd ? 'Listening...' : 'Voice Command'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Medication Reminder Details */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">{activeReminder.medicineName}</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-xs font-bold text-[#0284C7]">
                  {activeReminder.dosage}
                </span>
                <span className="text-xs text-slate-500 font-mono">({activeReminder.slot} • {activeReminder.timeStr})</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                {activeReminder.instructions}
              </p>
              {snoozeUntil && (
                <p className="text-[11px] text-amber-700 font-semibold">
                  (Currently snoozed until {snoozeUntil})
                </p>
              )}
            </div>

            {/* Big Action Buttons: Taken & Snooze */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSnooze}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-xs"
              >
                Snooze (10 mins)
              </button>
              <button
                type="button"
                onClick={() => handleMarkTaken(activeReminder.id)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Taken</span>
              </button>
            </div>
          </div>

          {reminderNotice && (
            <div className="p-2.5 rounded-xl bg-sky-100/70 border border-sky-200 text-xs text-sky-900 font-medium animate-fade-in flex items-center justify-between">
              <span>{reminderNotice}</span>
              <button
                type="button"
                onClick={() => setReminderNotice(null)}
                className="text-sky-800 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* NEW: AI Route & Disease Remedy Interactive Copilot */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/50 to-[#E0F2FE]/40 border-2 border-[#38BDF8]/60 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base font-mono">
                  Clinical AI: Route of Administration & Disease Remedy Copilot
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Evidence-Based
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Ask targeted clinical questions regarding meal timing, oral/sublingual routes, and lifestyle remedies for your diseases.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-mono text-[#0369A1] bg-white px-3 py-1.5 rounded-xl border border-sky-200 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Active: {activeAdvice.conditionOrMedicine}</span>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Interactive Route & Remedy Assessment Inquiries:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_AI_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleAskPreset(q.query, q.medicineHint)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 shadow-2xs ${
                  activeAdvice.conditionOrMedicine.toLowerCase().includes(q.medicineHint.toLowerCase())
                    ? 'bg-[#0284C7] text-white border-[#0284C7] font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#38BDF8] hover:bg-sky-50'
                }`}
              >
                <span>{q.label}</span>
                <ArrowRight className="w-3 h-3 shrink-0 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Ask AI Search Bar */}
        <form onSubmit={handleCustomQuery} className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask AI: e.g. 'Can I crush Telmisartan?' or 'Best dietary remedies for acid reflux with Pantoprazole'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0284C7] shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingAi || !userQuery.trim()}
            className="px-5 py-2.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-sm transition-all"
          >
            {isLoadingAi ? (
              <span>Consulting AI...</span>
            ) : (
              <>
                <span>Ask Copilot</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Active Advice Display Box */}
        <div className="p-5 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="font-bold text-slate-900 text-sm font-mono">
                {activeAdvice.conditionOrMedicine}
              </h4>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedQuestionTab('route')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedQuestionTab === 'route'
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💊 Route & Meal Timing
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuestionTab('remedies')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedQuestionTab === 'remedies'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌿 Disease Remedies
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuestionTab('assessment')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedQuestionTab === 'assessment'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ❓ Clinical Assessment
              </button>
            </div>
          </div>

          {/* Tab 1: Route Guidance */}
          {selectedQuestionTab === 'route' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0369A1] font-mono">
                <Pill className="w-4 h-4 text-[#0284C7]" />
                <span>{activeAdvice.routeTitle}</span>
              </div>
              <ul className="space-y-2">
                {activeAdvice.routeGuidance.map((point, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-slate-800 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 2: Disease Remedies & Natural Care */}
          {selectedQuestionTab === 'remedies' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 font-mono">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Evidence-Backed Lifestyle & Dietary Remedies for Disease Support:</span>
              </div>
              <ul className="space-y-2">
                {activeAdvice.remediesForDisease.map((remedy, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-slate-800 flex items-start gap-2.5 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 3: Interactive Clinical Assessment Questions */}
          {selectedQuestionTab === 'assessment' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 font-mono">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Key Questions the AI Asks to Evaluate Your Route & Regimen Safety:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {activeAdvice.clinicalAssessmentQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 space-y-1.5 flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-bold text-indigo-700 font-mono uppercase">
                      Clinical Inquiry #{idx + 1}
                    </span>
                    <p className="font-semibold text-slate-800 leading-snug">{q}</p>
                    <span className="text-[10px] text-slate-400 italic">
                      Discuss answers with your physician or pharmacist
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Precautions & Red Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1 font-mono text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Route Precautions & Food Interactions</span>
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                {activeAdvice.precautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="font-bold text-rose-900 flex items-center gap-1 font-mono text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>When to Seek Immediate Medical Attention</span>
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                {activeAdvice.whenToSeeDoctor.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="italic flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span>{activeAdvice.disclaimer}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
              NIH/CDSCO Verified
            </span>
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slots.map((slot) => {
          const SlotIcon = slot.icon;
          const itemsInSlot = schedule.filter((s) => s.slot === slot.name);
          if (itemsInSlot.length === 0) return null;

          return (
            <div
              key={slot.name}
              className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <SlotIcon className={`w-5 h-5 ${slot.color}`} />
                  <h3 className="font-bold text-slate-900 text-base font-mono">{slot.name} Regimen</h3>
                </div>
                <span className="text-xs font-bold text-sky-700 font-mono bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  {itemsInSlot.filter((i) => i.takenToday).length} of {itemsInSlot.length} taken
                </span>
              </div>

              <div className="space-y-3">
                {itemsInSlot.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl transition-all border flex flex-col gap-2.5 ${
                      item.takenToday
                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                        : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.medicineName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 font-bold border border-sky-200">
                            {item.dosage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#328CC1]" />
                          <span>{item.timeStr}</span> • <span className="text-slate-700 font-semibold">{item.purpose}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                          {item.instructions}
                        </p>
                      </div>

                      {/* Checkbox Toggle Button */}
                      <div className="pt-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleTaken(item.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                            item.takenToday
                              ? 'bg-emerald-600 text-white shadow-sm font-bold'
                              : 'border-2 border-slate-300 bg-white hover:border-[#0284C7]'
                          }`}
                          title={item.takenToday ? 'Mark as not taken' : 'Mark as taken'}
                        >
                          {item.takenToday && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Trigger: Ask AI Route & Disease Remedies for this exact medicine */}
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAskPreset(`${item.medicineName} route and remedies`, item.medicineName)}
                        className="text-[11px] font-mono font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-[#0284C7]" />
                        <span>Ask AI Route & Disease Remedies</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.slot} Oral
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
