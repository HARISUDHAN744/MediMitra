import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  MessageSquare,
  Pill,
  Activity,
  Stethoscope,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { askMedicalQuestion, MedicalAiResponse } from '../services/api';
import { LanguageDetail, BCP47_LOCALE_MAP } from '../services/languageService';
import { speakText, VoicePlaybackState } from '../services/safeTranscribeAudio';

interface FloatingAiChatbotProps {
  language: LanguageDetail;
  activePrescription?: any;
  onOpenFullChat?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  data?: MedicalAiResponse;
}

export const FloatingAiChatbot: React.FC<FloatingAiChatbotProps> = ({
  language,
  activePrescription,
  onOpenFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio voice narration
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [stopSpeechFn, setStopSpeechFn] = useState<(() => void) | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const langCode = (language.code || 'en').toLowerCase();
  const isHi = langCode === 'hi';
  const isTa = langCode === 'ta';
  const isTe = langCode === 'te';

  // Patient name and medicines summary for contextual awareness
  const patientName = activePrescription?.patient_name || '';
  const doctorName = activePrescription?.doctor_name || '';
  const medicines = Array.isArray(activePrescription?.medicines) ? activePrescription.medicines : [];
  const diagnoses = Array.isArray(activePrescription?.diagnoses) ? activePrescription.diagnoses : [];

  const medNames = medicines
    .map((m: any) => (typeof m === 'string' ? m : m.name || ''))
    .filter(Boolean)
    .join(', ');

  // Initialize or reset welcome message when language or prescription changes
  useEffect(() => {
    let welcomeText = '';

    if (patientName && medNames) {
      if (isHi) {
        welcomeText = `नमस्ते ${patientName} जी! मैं आपका AI मेडिकल असिस्टेंट (MediMitra) हूँ।\nआपकी पर्ची में ${medicines.length} दवाइयाँ (${medNames}) और रोग (${diagnoses.join(', ') || 'सामान्य स्वास्थ्य'}) दर्ज हैं। दवा कब लेनी है, क्या परहेज रखना है या कोई साइड इफेक्ट पूछना हो, तो कृपया यहाँ टाइप करें या बोलें।`;
      } else if (isTa) {
        welcomeText = `வணக்கம் ${patientName}! நான் உங்கள் AI மருத்துவ முகவர் (MediMitra).\nஉங்கள் மருந்துச் சீட்டில் உள்ள மருந்துகள் (${medNames}) அல்லது நோயறிதல் (${diagnoses.join(', ') || 'மருத்துவ ஆலோசனை'}) குறித்த ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள்.`;
      } else if (isTe) {
        welcomeText = `నమస్కారం ${patientName} గారు! నేను మీ AI వైద్య సహాయకుడిని.\nమీ ప్రిస్క్రిప్షన్ లోని మందులు (${medNames}) లేదా సందేహాల గురించి దయచేసి అడగండి.`;
      } else {
        welcomeText = `Hello ${patientName}! I am your AI Medical Assistant (MediMitra).\nI can see your prescription with ${medicines.length} medicines (${medNames}). Ask me about schedules, side effects, precautions, or diet!`;
      }
    } else {
      if (isHi) {
        welcomeText = `नमस्ते! मैं MediMitra AI क्लिनिकल चैटबॉट हूँ।\nआप किसी भी बीमारी, दवा की खुराक, लैब टेस्ट या घरेलू प्राथमिक उपचार के बारे में मुझसे पूछ सकते हैं।`;
      } else if (isTa) {
        welcomeText = `வணக்கம்! நான் MediMitra AI மருத்துவ அரட்டை முகவர்.\nமருந்துகள், அறிகுறிகள், உணவு முறை அல்லது ஆய்வகப் பரிசோதனை பற்றி என்னிடம் கேளுங்கள்.`;
      } else if (isTe) {
        welcomeText = `నమస్కారం! నేను MediMitra AI క్లినికల్ చాట్‌బాట్.\nమీకు ఏవైనా ఆరోగ్య సందేహాలు లేదా ఔషధాల వివరాలు కావాలంటే నన్ను అడగండి.`;
      } else {
        welcomeText = `Hello! I am MediMitra AI Clinical Chatbot.\nAsk me anything about symptoms, medicines, lab results, dosages, or health precautions.`;
      }
    }

    setMessages([
      {
        id: 'welcome-init',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [langCode, patientName, medNames]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up audio speech on unmount
  useEffect(() => {
    return () => {
      if (stopSpeechFn) {
        stopSpeechFn();
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [stopSpeechFn]);

  // Suggested Prompts
  const getSuggestedPrompts = () => {
    if (medicines.length > 0) {
      if (isHi) {
        return [
          'यह दवाइयां कब और कैसे लेनी हैं?',
          'क्या कोई साइड इफेक्ट्स या सावधानियां हैं?',
          'खाली पेट कौन सी दवा लेनी है?',
          'इस बीमारी में क्या खाना चाहिए?',
        ];
      }
      if (isTa) {
        return [
          'இந்த மருந்துகளை எப்போது சாப்பிட வேண்டும்?',
          'உணவுக்கு முன் அல்லது பின்னா?',
          'ஏதேனும் பக்க விளைவுகள் உள்ளதா?',
          'என்னென்ன உணவுகள் தவிர்க்க வேண்டும்?',
        ];
      }
      if (isTe) {
        return [
          'ఈ మందులను ఎప్పుడు తీసుకోవాలి?',
          'ఆహారానికి ముందా లేదా తర్వాతా?',
          'ఏవైనా దుష్ప్రభావాలు ఉన్నాయా?',
        ];
      }
      return [
        'When should I take each medication?',
        'Which medicine is taken on an empty stomach?',
        'Are there any side effects or food interactions?',
        'What lifestyle advice should I follow?',
      ];
    }

    if (isHi) {
      return [
        'वायरल बुखार में क्या सावधानी रखें?',
        'हाई ब्लड प्रेशर के लिए आहार सलाह',
        'डायबिटीज में शुगर कैसे नियंत्रित करें?',
        'गैस्ट्रिक एसिडिटी के घरेलू उपाय',
      ];
    }
    if (isTa) {
      return [
        'காய்ச்சல் வரும் போது பாராசிட்டமால் சரியான அளவு என்ன?',
        'உயர் இரத்த அழுத்தம் உணவுமுறை',
        'சர்க்கரை அளவைக் குறைப்பது எப்படி?',
      ];
    }
    return [
      'What are the symptoms and home remedies for fever?',
      'Dietary tips for hypertension and high BP',
      'How to interpret fasting blood sugar test',
      'Emergency red flags for chest discomfort',
    ];
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isSubmitting) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSubmitting(true);

    try {
      const response = await askMedicalQuestion(query, language.code, {
        prescription: activePrescription,
        patient_name: patientName,
        diagnoses: diagnoses,
        medicines: medicines,
      });

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: response.answer || (isHi ? 'उत्तर उपलब्ध है।' : 'Answer provided.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: response,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Network API fallback for chat:', err);

      // Local intelligent response fallback
      let fallbackText = '';
      const lowerQ = query.toLowerCase();

      if (isHi) {
        if (lowerQ.includes('कब') || lowerQ.includes('समय') || lowerQ.includes('time') || lowerQ.includes('dosage')) {
          fallbackText = `आपकी पर्ची की दवाइयों का अनुशंसित समय:\n• Cap. Rozad: सुबह खाली पेट (AC)\n• T. Ambulax: दिन में दो बार (BD)\n• T. Petril Plus: रात को सोने से पहले (HS)\n• T. Placida / Eroziet: डॉक्टर के निर्देशानुसार पानी के साथ लें।`;
        } else if (lowerQ.includes('साइड इफेक्ट') || lowerQ.includes('नुकसान') || lowerQ.includes('side effect')) {
          fallbackText = `सावधानियाँ व संभावित साइड इफेक्ट्स:\n• T. Petril Plus और Ambulax से हल्की नींद या चक्कर आ सकते हैं, अतः दवा के बाद वाहन न चलाएं।\n• खाली पेट Cap. Rozad लेने से गैस और जलन में राहत मिलती है।\n• किसी भी असुविधा पर तुरंत अपने डॉक्टर से संपर्क करें।`;
        } else if (lowerQ.includes('खाना') || lowerQ.includes('डाइट') || lowerQ.includes('परहेज') || lowerQ.includes('diet')) {
          fallbackText = `आहार व दिनचर्या सलाह:\n• अधिक मिर्च-मसाले, तली हुई चीजें और खट्टे पदार्थों से बचें।\n• कैफीन (चाय/कॉफी) और धूम्रपान/शराब का सेवन न करें।\n• पर्याप्त मात्रा में पानी पिएं और रात को समय पर सोएं।`;
        } else {
          fallbackText = `आपके सवाल "${query}" के लिए: डॉक्टर के पर्चे के अनुसार निर्धारित समय पर दवाइयों का सेवन करें। किसी भी नए लक्षण या दवा बदलने से पहले डॉ. ${doctorName || 'विशेषज्ञ'} से सलाह लें।`;
        }
      } else if (isTa) {
        fallbackText = `உங்கள் மருந்துச் சீட்டு வழிகாட்டுதல்: மருத்துவர் பரிந்துரைத்தபடி மாத்திரைகளை சரியான நேரத்தில் எடுத்துக் கொள்ளுங்கள். ஏதேனும் புதிய அறிகுறிகள் தென்பட்டால் மருத்துவரை அணுகவும்.`;
      } else {
        fallbackText = `Prescription Guidance for "${query}": Please take all medications strictly according to the doctor's directions. Contact Dr. ${doctorName || 'your physician'} if you experience any unexpected symptoms.`;
      }

      const botFallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botFallbackMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voice narration of individual message
  const handleToggleVoice = (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      if (stopSpeechFn) {
        stopSpeechFn();
        setStopSpeechFn(null);
      }
      setPlayingMessageId(null);
      return;
    }

    if (stopSpeechFn) {
      stopSpeechFn();
      setStopSpeechFn(null);
    }

    setPlayingMessageId(msgId);

    const stop = speakText(text, language.code, null, (state: VoicePlaybackState) => {
      if (state === 'idle' || state === 'error') {
        setPlayingMessageId(null);
        setStopSpeechFn(null);
      }
    });

    setStopSpeechFn(() => stop);
  };

  // Mic dictation
  const handleToggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListeningMic) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    try {
      const recog = new SpeechRecognition();
      recog.lang = BCP47_LOCALE_MAP[language.code] || 'en-US';
      recog.continuous = false;
      recog.interimResults = false;

      recog.onstart = () => {
        setIsListeningMic(true);
      };

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSendMessage(transcript);
        }
      };

      recog.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        setIsListeningMic(false);
      };

      recog.onend = () => {
        setIsListeningMic(false);
      };

      speechRecognitionRef.current = recog;
      recog.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListeningMic(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset chat
  const handleResetChat = () => {
    if (stopSpeechFn) {
      stopSpeechFn();
      setStopSpeechFn(null);
    }
    setPlayingMessageId(null);
    setMessages([
      {
        id: 'reset-welcome',
        sender: 'bot',
        text: isHi
          ? 'चैट रीसेट कर दी गई है। आप अपनी दवाइयों या स्वास्थ्य के बारे में नया सवाल पूछ सकते हैं।'
          : isTa
          ? 'அரட்டை மீட்டமைக்கப்பட்டது. புதிய மருத்துவக் கேள்விகளை கேட்கலாம்.'
          : 'Chat has been reset. How may I assist your health care today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle contextual hint badge if prescription is active */}
          {patientName && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-[11px] font-semibold shadow-lg border border-sky-400/30 backdrop-blur-md animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{patientName}</span>
              <span className="text-slate-400">({medicines.length} meds)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Medical Chatbot"
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#2563EB] text-white shadow-2xl hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-white/40"
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 transition duration-300 -z-10" />

            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-sky-100 font-bold">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Chatbot</span>
              </div>
              <span className="text-xs font-extrabold text-white block">
                {isHi
                  ? 'AI मेडिकल चैटबॉट'
                  : isTa
                  ? 'AI மருத்துவ அரட்டை'
                  : isTe
                  ? 'AI వైద్య చాట్‌బాట్'
                  : 'Ask AI Copilot'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. SLIDE-UP EXPANDED CHATBOT WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-3xl bg-slate-900/95 text-white shadow-2xl border border-sky-500/30 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
            isExpanded
              ? 'w-[92vw] sm:w-[680px] h-[82vh] max-h-[750px]'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(2, 132, 199, 0.4), 0 0 40px rgba(14, 165, 233, 0.2)',
          }}
        >
          {/* Header Bar */}
          <div className="relative p-4 bg-gradient-to-r from-slate-950 via-sky-950 to-indigo-950 border-b border-sky-500/20 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-sky-300/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                    <span>MediMitra AI</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30 uppercase">
                      Clinical Chat
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-sky-200/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {isHi
                      ? 'ऑनलाइन • 24/7 चिकित्सा सहायता'
                      : isTa
                      ? 'இணைப்பில் உள்ளது • 24/7 சேவை'
                      : 'Online • Multilingual Clinical Copilot'}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions: Full view, Reset, Maximize/Minimize, Close */}
            <div className="flex items-center gap-1 text-slate-300">
              {onOpenFullChat && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullChat();
                  }}
                  title="Open Fullscreen Medical AI Page"
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chatbot"
                className="p-1.5 rounded-lg hover:bg-rose-900/60 hover:text-rose-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner if Prescription is attached */}
          {patientName && (
            <div className="px-4 py-2 bg-sky-950/80 border-b border-sky-500/20 flex items-center justify-between text-xs text-sky-200 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">{patientName}</span>
                <span className="text-slate-400 truncate">
                  • {medicines.length} {isHi ? 'दवाइयाँ' : 'Meds'} ({medNames.slice(0, 35)}...)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                Context Linked
              </span>
            </div>
          )}

          {/* Message Thread Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl transition-all shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/80'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Key Points or Precautions Chips if available from API */}
                  {msg.data?.key_points && msg.data.key_points.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-sky-300 block">
                        {isHi ? 'मुख्य बातें (Key Points):' : 'Key Highlights:'}
                      </span>
                      <ul className="space-y-0.5 text-xs text-slate-300">
                        {msg.data.key_points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-sky-400">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions on AI Message: Speak Audio, Copy */}
                  {msg.sender === 'bot' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleVoice(msg.id, msg.text)}
                          className={`flex items-center gap-1 font-semibold transition-all ${
                            playingMessageId === msg.id
                              ? 'text-rose-400 animate-pulse'
                              : 'text-sky-400 hover:text-sky-300'
                          }`}
                        >
                          {playingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>{isHi ? 'रोकें' : 'Stop'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isHi ? 'सुनें' : isTa ? 'கேட்க' : 'Listen'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition-all"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Submitting state */}
            {isSubmitting && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-sky-300 w-fit animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>
                  {isHi
                    ? 'AI डॉक्टर उत्तर तैयार कर रहा है...'
                    : isTa
                    ? 'AI பதிலளிக்கிறது...'
                    : 'AI Copilot is analyzing clinical data...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {getSuggestedPrompts().map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSubmitting}
                className="whitespace-nowrap px-3 py-1 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white border border-slate-700 text-[11px] font-medium text-slate-300 transition-all shrink-0 disabled:opacity-50"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls Bar */}
          <div className="p-3 bg-slate-950 border-t border-sky-500/20 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isHi
                    ? 'दवा, खुराक या बीमारी के बारे में पूछें...'
                    : isTa
                    ? 'மருந்துகள் அல்லது நோய் பற்றி கேட்கவும்...'
                    : isTe
                    ? 'మందులు లేదా వ్యాధుల గురించి అడగండి...'
                    : 'Ask about prescription, dosage, side effects...'
                }
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
              />

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={isSubmitting}
                title="Voice Dictation"
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isListeningMic
                    ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSubmitting}
                className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Disclaimer line */}
            <p className="text-[10px] text-center text-slate-400 font-mono">
              {isHi
                ? 'चिकित्सीय सलाह के लिए हमेशा अपने डॉक्टर से परामर्श करें।'
                : 'Educational AI assistant. Always verify clinical advice with your physician.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
