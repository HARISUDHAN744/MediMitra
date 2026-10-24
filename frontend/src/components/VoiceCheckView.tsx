import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  Square,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  Globe2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  CURATED_LANGUAGES,
  LanguageDetail,
  LANGUAGE_TO_BCP47,
  getDeviceVoiceStatus,
  hasVoiceOutputSupport,
  DeviceVoiceStatus,
  speakMedicalText,
  ensureVoicesLoaded,
} from '../services/languageService';
import { transcribeAudioBlob, playCloudTts } from '../services/safeTranscribeAudio';

interface VoiceCheckViewProps {
  onBackToApp?: () => void;
}

// Sample test sentences for speech output verification
const SAMPLE_TEST_SENTENCES: Record<string, string> = {
  en: 'This is a MediMitra voice test sentence. Please take Paracetamol 650 mg after food.',
  hi: 'यह मेदीमित्र वॉइस टेस्ट वाक्य है। कृपया भोजन के बाद पैरासिटामोल 650 मिलीग्राम लें।',
  ta: 'இது மெடிமித்ரா குரல் சோதனை வாக்கியம். உணவுக்குப் பிறகு பாராசிட்டமால் 650 மி.கி உட்கொள்ளவும்.',
  te: 'ఇది మెడిమిత్ర వాయిస్ పరీక్ష వాక్యం. భోజనం తర్వాత పారాసిటమాల్ 650 మి.గ్రా తీసుకోండి.',
  kn: 'ಇದು ಮೆಡಿಮಿತ್ರ ಧ್ವನಿ ಪರೀಕ್ಷಾ ವಾಕ್ಯ. ಊಟದ ನಂತರ ಪ್ಯಾರಸಿಟಮಾಲ್ 650 ಮಿ.ಗ್ರಾಂ ಸೇವಿಸಿ.',
  ml: 'ഇത് മെഡിമിത്ര വോയ്‌സ് ടെസ്റ്റ് വാക്യമാണ്. ഭക്ഷണത്തിന് ശേഷം പാരസെറ്റമോൾ 650 മില്ലിഗ്രാം കഴിക്കുക.',
  bn: 'এটি মেডিমিথ্রা ভয়েস টেস্ট বাক্য। খাবারের পর প্যারাসিটামল ৬৫০ মিলিগ্রাম গ্রহণ করুন।',
  mr: 'हे मेदीमित्र व्हॉईस टेस्ट वाक्य आहे. कृपया जेवणानंतर पॅरासिटामॉल 650 मिग्रॅ घ्यावे.',
  gu: 'આ મેદિમિત્ર વૉઇસ ટેસ્ટ વાક્ય છે. જમ્યા પછી પેરાસિટામોલ 650 મિલીગ્રામ લો.',
  pa: 'ਇਹ ਮੇਦੀਮਿਤਰਾ ਵੌਇਸ ਟੈਸਟ ਵਾਕ ਹੈ। ਖਾਣ ਤੋਂ ਬਾਅਦ ਪੈਰਾਸੀਟਾਮੋਲ 650 ਮਿਲੀਗ੍ਰਾਮ ਲਓ।',
  ur: 'یہ میڈی مترا وائس ٹیسٹ جملہ ہے۔ کھانے کے بعد پیراسیٹامول 650 ملی گرام لیں۔',
  or: 'ଏହା ମେଡିମିତ୍ର ଭଏସ୍ ଟେଷ୍ଟ ବାକ୍ୟ | ଖାଇବା ପରେ ପାରାସିଟାମଲ ୬୫୦ ମିଲିଗ୍ରାମ ନିଅନ୍ତୁ |',
  as: 'এইটো মেডিমিত্ৰা কণ্ঠ পৰীক্ষা বাক্য। খোৱাৰ পিছত পেৰাচিটামল ৬৫০ মিলিগ্ৰাম লওক।',
  sa: 'इदं मेदिमित्र स्वरपरीक्षार्थं वाक्यम्। भोजनस्य अनन्तरं प्यारासिटामॉल ६५० मिग्रा स्वीकुर्वन्तु।',
  ne: 'यो मेदिमित्र आवाज परीक्षण वाक्य हो। खाना पछि प्यारासिटामोल ६५० मिलिग्राम लिनुहोस्।',
  kok: 'हें मेदिमित्र आवाज तपासणी वाक्य आसा. जेवण जातकच पॅरासिटामॉल 650 मिग्रॅ घेयात.',
  mai: 'ई मेदिमित्र आवाज परीक्षण वाक्य अछि। भोजनक बाद पैरासिटामोल ६५० मिलीग्राम लिअ।',
  sd: 'هي ميڊي مترا آواز جو ٽيسٽ جملو آهي. ماني کائڻ کانپوءِ پيراسيٽامول 650 ملي گرام وٺو.',
  es: 'Esta es una frase de prueba de voz de MediMitra. Tome Paracetamol 650 mg después de las comidas.',
  fr: 'Ceci est une phrase de test vocal MediMitra. Prenez du Paracétamol 650 mg après le repas.',
  de: 'Dies ist ein MediMitra-Sprachtestsatz. Nehmen Sie nach dem Essen Paracetamol 650 mg ein.',
  ar: 'هذه جملة اختبار صوتي لـ MediMitra. يرجى تناول الباراسيتامول 650 ملغ بعد الطعام.',
  zh: '这是 MediMitra 语音测试句子。饭后请服用对乙酰氨基酚 650 毫克。',
  ja: 'これは MediMitra の音声テスト文章です。食後にパラセタモール 650 mg を服用してください。',
  ru: 'Это тестовое предложение голосового помощника MediMitra. Принимайте парацетамол 650 мг после еды.',
};

export const VoiceCheckView: React.FC<VoiceCheckViewProps> = ({ onBackToApp }) => {
  const [voiceMap, setVoiceMap] = useState<Record<string, DeviceVoiceStatus>>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<'All' | 'Indian' | 'Global'>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [speakingCode, setSpeakingCode] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  // Quick Mic Recording Tester State
  const [testRecordingLang, setTestRecordingLang] = useState<LanguageDetail | null>(null);
  const [isTestRecording, setIsTestRecording] = useState(false);
  const [testTranscript, setTestTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  // Load and refresh voices
  const refreshVoices = () => {
    ensureVoicesLoaded().then((loaded) => {
      setVoices(loaded);
      const newMap: Record<string, DeviceVoiceStatus> = {};
      for (const lang of CURATED_LANGUAGES) {
        const rawStatus = getDeviceVoiceStatus(lang.code, loaded);
        const hasOut = hasVoiceOutputSupport(lang.code, loaded);
        if (hasOut && rawStatus === 'Input only') {
          newMap[lang.code] = 'Full voice';
        } else if (hasOut && rawStatus === 'Text only') {
          newMap[lang.code] = 'Output only';
        } else {
          newMap[lang.code] = rawStatus;
        }
      }
      setVoiceMap(newMap);
    });
  };

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }, []);

  // Filtered languages
  const filteredLangs = CURATED_LANGUAGES.filter((lang) => {
    const status = voiceMap[lang.code] || 'Text only';
    const matchesSearch =
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion =
      filterRegion === 'All' ? true : lang.region === filterRegion;

    const matchesStatus =
      filterStatus === 'All' ? true : status === filterStatus;

    return matchesSearch && matchesRegion && matchesStatus;
  });

  // Calculate stats
  const totalCount = CURATED_LANGUAGES.length;
  const fullVoiceCount = Object.values(voiceMap).filter((s) => s === 'Full voice').length;
  const outputOnlyCount = Object.values(voiceMap).filter((s) => s === 'Output only').length;
  const inputOnlyCount = Object.values(voiceMap).filter((s) => s === 'Input only').length;
  const textOnlyCount = Object.values(voiceMap).filter((s) => s === 'Text only').length;

  // Tested languages that pass on this laptop (e.g. English, Hindi, Tamil)
  const candidateTested = CURATED_LANGUAGES.filter((l) => {
    const st = voiceMap[l.code];
    return ['en', 'hi', 'ta', 'te'].includes(l.code) && (st === 'Full voice' || st === 'Output only');
  });

  // Speak test sentence
  const handleSpeakTest = (lang: LanguageDetail) => {
    if (speakingCode === lang.code) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingCode(null);
      return;
    }

    setTestNotice(null);
    setSpeakingCode(lang.code);

    const sentence =
      SAMPLE_TEST_SENTENCES[lang.code] ||
      `This is a voice test for ${lang.name}. Please take your prescribed medicine after food.`;

    speakMedicalText(
      sentence,
      lang.code,
      () => {
        setSpeakingCode(null);
      },
      () => {
        playCloudTts(
          sentence,
          lang.code,
          () => setSpeakingCode(null),
          () => {
            setSpeakingCode(null);
            setTestNotice(`Voice not available for ${lang.name} on this device.`);
          }
        );
      }
    );
  };

  // Start quick recording test
  const startTestRecord = async (lang: LanguageDetail) => {
    setTestRecordingLang(lang);
    setTestTranscript('');
    setTestNotice(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);

        try {
          const res = await transcribeAudioBlob(blob, 'test_mic.webm', lang.code, {
            consent: true,
            extractMedical: false,
          });

          if (res.success && res.text) {
            setTestTranscript(res.text);
          } else {
            setTestTranscript('We could not hear that. Please try again or type.');
          }
        } catch (err: any) {
          setTestTranscript(err.message || 'We could not hear that. Please try again or type.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setIsTestRecording(true);
    } catch (err: any) {
      setTestNotice(`Microphone error: ${err.message || 'Permission denied'}`);
      setTestRecordingLang(null);
    }
  };

  const stopTestRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsTestRecording(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-sky-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Globe2 className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Device Voice Capability Verification (/voice-check)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            Real-time hardware & browser speech inspection. Tests SpeechSynthesis (Text-to-Speech) and SpeechRecognition (Dictation) across all languages on this laptop.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={refreshVoices}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm border border-white/30 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rescan Device Voices</span>
          </button>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0369A1] font-bold text-xs shadow-md hover:bg-slate-100 transition-all"
            >
              Back to Main App
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Languages</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Curated Global & Indian</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-center">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Full Voice</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{fullVoiceCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Input & Output Ready</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm text-center">
          <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Output Only</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{outputOnlyCount}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">TTS Voice Installed</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 shadow-sm text-center">
          <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Input Only</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{inputOnlyCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">Speech Dictation Only</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm text-center">
          <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Text Only</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{textOnlyCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">No OS Voice Installed</p>
        </div>
      </div>

      {/* Demo Recommendation Banner (Section E Acceptance) */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-sky-950">
              Demo Readiness Recommendation (Verified on this device):
            </h4>
            <p className="text-xs text-sky-800 mt-0.5">
              Claim as "tested" in the demo only languages with verified installed voices on this laptop:
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {['en', 'hi', 'ta', 'te'].map((code) => {
                const lang = CURATED_LANGUAGES.find((l) => l.code === code);
                const st = voiceMap[code] || 'Text only';
                const isPassed = st === 'Full voice' || st === 'Output only';
                return (
                  <span
                    key={code}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{lang?.name} ({lang?.nativeName}): {st}</span>
                    {isPassed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {testNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{testNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search language, code or native script (e.g. Hindi, Tamil, Telugu, en, es)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0284C7] bg-white text-slate-900 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Region Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {(['All', 'Indian', 'Global'] as const).map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setFilterRegion(reg)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterRegion === reg
                    ? 'bg-white text-[#0284C7] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:border-[#0284C7]"
          >
            <option value="All">All Voice Statuses</option>
            <option value="Full voice">Full voice</option>
            <option value="Output only">Output only</option>
            <option value="Input only">Input only</option>
            <option value="Text only">Text only</option>
          </select>
        </div>
      </div>

      {/* Language Verification Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Code / Locale</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Detected Device Status</th>
                <th className="py-3.5 px-4 text-center">Speech Output Test</th>
                <th className="py-3.5 px-4 text-center">Speech Input Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLangs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No languages match the current search filter.
                  </td>
                </tr>
              ) : (
                filteredLangs.map((lang) => {
                  const status = voiceMap[lang.code] || 'Text only';
                  const locale = LANGUAGE_TO_BCP47[lang.code] || 'unsupported';
                  const isSpeakingThis = speakingCode === lang.code;

                  return (
                    <tr key={lang.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{lang.nativeName}</span>
                          <span className="text-slate-500 font-normal">({lang.name})</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold">
                          {lang.code}
                        </span>
                        <span className="ml-2 text-slate-500">→ {locale}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lang.region === 'Indian'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}>
                          {lang.region}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          status === 'Full voice'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : status === 'Output only'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : status === 'Input only'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Full voice'
                              ? 'bg-emerald-600'
                              : status === 'Output only'
                              ? 'bg-blue-600'
                              : status === 'Input only'
                              ? 'bg-purple-600'
                              : 'bg-slate-400'
                          }`} />
                          <span>{status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleSpeakTest(lang)}
                          disabled={status === 'Text only' || status === 'Input only'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isSpeakingThis
                              ? 'bg-[#0284C7] text-white animate-pulse'
                              : status === 'Full voice' || status === 'Output only'
                              ? 'bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                          title={
                            status === 'Text only' || status === 'Input only'
                              ? 'No TTS voice installed for this language'
                              : 'Click to speak test sentence'
                          }
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isSpeakingThis ? 'Speaking...' : 'Speak Sentence'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => startTestRecord(lang)}
                          disabled={status === 'Text only' || status === 'Output only'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            status === 'Full voice' || status === 'Input only'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                          title={
                            status === 'Text only' || status === 'Output only'
                              ? 'Speech input not available'
                              : 'Test recording & transcription'
                          }
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Test Mic</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Interactive Recording Test Modal */}
      {testRecordingLang && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#0284C7]" />
                <span>Test Recording: {testRecordingLang.nativeName} ({testRecordingLang.name})</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  stopTestRecord();
                  setTestRecordingLang(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              {isTestRecording ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>🔴 Recording active... Speak now</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={stopTestRecord}
                      className="px-6 py-2.5 rounded-full bg-[#D9534F] text-white font-bold text-xs shadow-md hover:bg-[#C9302C]"
                    >
                      <Square className="w-4 h-4 inline-block mr-1 fill-white" />
                      Stop & Transcribe
                    </button>
                  </div>
                </div>
              ) : isTranscribing ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-700 py-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0284C7]" />
                  <span>Transcribing audio via Whisper...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => startTestRecord(testRecordingLang)}
                    className="px-6 py-2.5 rounded-full bg-[#0284C7] text-white font-bold text-xs shadow-md hover:bg-[#0369A1]"
                  >
                    Start Test Recording
                  </button>
                </div>
              )}

              {testTranscript && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                  <span className="font-bold text-slate-800">Transcript Result:</span>
                  <p className="text-slate-700 font-sans italic">{testTranscript}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  stopTestRecord();
                  setTestRecordingLang(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
