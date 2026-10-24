import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  X,
  Droplets,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { LanguageDetail } from '../services/languageService';
import { speakText, VoicePlaybackState } from '../services/safeTranscribeAudio';
import { UploadResponse, MedicineItem } from '../types/medical';
import { NavSection } from './Sidebar';

export interface TopNotificationCenterProps {
  language: LanguageDetail;
  extractedResult: UploadResponse | null;
  onNavigate: (section: NavSection) => void;
  isExpandedExternal?: boolean;
  onToggleExpand?: () => void;
}

export interface ClinicalNotification {
  id: string;
  type: 'medication' | 'precaution' | 'hydration' | 'followup' | 'lab';
  title: string;
  detail: string;
  timeStr?: string;
  slot?: 'Morning' | 'Noon' | 'Evening' | 'Bedtime';
  medicineName?: string;
  dosage?: string;
  instructions?: string;
  isUrgent?: boolean;
  taken?: boolean;
  targetSection?: NavSection;
}

const STORAGE_KEY_TAKEN = 'medimitra_notifications_taken_ids';

export const TopNotificationCenter: React.FC<TopNotificationCenterProps> = ({
  language,
  extractedResult,
  onNavigate,
  isExpandedExternal,
  onToggleExpand,
}) => {
  const [takenIds, setTakenIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TAKEN);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>('idle');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stopVoiceRef = useRef<(() => void) | null>(null);

  const isExpanded = isExpandedExternal !== undefined ? isExpandedExternal : isExpandedInternal;
  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setIsExpandedInternal((prev) => !prev);
    }
  };

  // Translations
  const langCode = language.code.toLowerCase();
  const isTamil = langCode === 'ta' || langCode.startsWith('ta');
  const isHindi = langCode === 'hi' || langCode.startsWith('hi');
  const isTelugu = langCode === 'te' || langCode.startsWith('te');

  const t = useMemo(() => {
    if (isTamil) {
      return {
        bannerTag: 'முக்கிய அறிவிப்புகள் & மருந்து நினைவூட்டல்',
        takeTablet: 'மாத்திரை உட்கொள்ளவும்',
        takeNow: 'இப்போது எடுக்கவும்',
        markTaken: 'எடுத்துக்கொண்டேன்',
        takenSuccess: 'மருந்து உட்கொள்ளப்பட்டதாக பதிவு செய்யப்பட்டது!',
        listen: 'கேட்க',
        listening: 'பேசுகிறது...',
        allNotifications: 'அனைத்து அறிவிப்புகள்',
        medicationsDue: 'இன்று எடுக்க வேண்டிய மருந்துகள்',
        clinicalAlerts: 'மருத்துவ எச்சரிக்கைகள் & ஆலோசனைகள்',
        followUpLab: 'மருத்துவப் பரிசோதனை & சந்திப்பு',
        noAlerts: 'தற்போது புதிய அறிவிப்புகள் ஏதுமில்லை. அனைத்து மருந்துகளும் எடுக்கப்பட்டுவிட்டன!',
        viewSchedule: 'மருந்து அட்டவணையைத் திறக்க',
        openAiDoctor: 'AI வழிகாட்டியைத் திறக்க',
        snooze: '10 நிமிடம் கழித்து',
        urgent: 'முக்கியம்',
        close: 'மூடுக',
      };
    }
    if (isHindi) {
      return {
        bannerTag: 'महत्वपूर्ण अलर्ट व दवा रिमाइंडर',
        takeTablet: 'दवा का समय',
        takeNow: 'अभी लें',
        markTaken: 'दवा ली गई',
        takenSuccess: 'दवा का सेवन सफलतापूर्वक दर्ज किया गया!',
        listen: 'सुनें',
        listening: 'बोल रहा है...',
        allNotifications: 'सभी सूचनाएँ',
        medicationsDue: 'आज लेने वाली आवश्यक दवाइयाँ',
        clinicalAlerts: 'चिकित्सीय सावधानियाँ व निर्देश',
        followUpLab: 'फॉलो-अप व लैब जाँच अलर्ट',
        noAlerts: 'कोई नया अलर्ट नहीं है। सभी निर्धारित दवाएँ ली जा चुकी हैं!',
        viewSchedule: 'दवा समय-सारणी खोलें',
        openAiDoctor: 'AI डॉक्टर से पूछें',
        snooze: '10 मिनट बाद',
        urgent: 'जरूरी',
        close: 'बंद करें',
      };
    }
    if (isTelugu) {
      return {
        bannerTag: 'ముఖ్యమైన నోటిఫికేషన్లు & మందుల రిమైండర్',
        takeTablet: 'మాత్రలు వేసుకోండి',
        takeNow: 'ఇప్పుడే తీసుకోండి',
        markTaken: 'తీసుకున్నాను',
        takenSuccess: 'మందు తీసుకున్నట్లు నమోదు చేయబడింది!',
        listen: 'వినండి',
        listening: 'వినిపిస్తోంది...',
        allNotifications: 'అన్ని నోటిఫికేషన్లు',
        medicationsDue: 'ఈరోజు వేసుకోవాల్సిన మాత్రలు',
        clinicalAlerts: 'వైద్య జాగ్రత్తలు & సలహాలు',
        followUpLab: 'ఫాలో-అప్ & ల్యాబ్ టెస్ట్ అలర్ట్స్',
        noAlerts: 'కొత్త అలర్ట్‌లు లేవు. అన్ని మందులు వేసుకున్నారు!',
        viewSchedule: 'షెడ్యూల్ చూడండి',
        openAiDoctor: 'AI డాక్టర్‌ని అడగండి',
        snooze: '10 నిమిషాలు ఆపండి',
        urgent: 'ముఖ్యమైనది',
        close: 'మూసివేయి',
      };
    }
    return {
      bannerTag: 'Clinical Alerts & Medication Reminders',
      takeTablet: 'Take Your Tablet',
      takeNow: 'Take Now',
      markTaken: 'Mark as Taken',
      takenSuccess: 'Medication logged: marked as taken!',
      listen: 'Listen',
      listening: 'Speaking...',
      allNotifications: 'All Notifications',
      medicationsDue: 'Medications Due Today',
      clinicalAlerts: 'Clinical Precautions & Guidance',
      followUpLab: 'Follow-ups & Lab Alerts',
      noAlerts: 'All scheduled tablets and reminders are up to date!',
      viewSchedule: 'View Medication Schedule',
      openAiDoctor: 'Ask AI Copilot',
      snooze: 'Snooze 10m',
      urgent: 'Action Required',
      close: 'Close',
    };
  }, [isTamil, isHindi, isTelugu]);

  // Construct Notifications dynamically from extracted prescription + default schedule
  const allNotifications = useMemo<ClinicalNotification[]>(() => {
    const list: ClinicalNotification[] = [];

    // 1. If Prescription Uploaded, pull its extracted medicines first
    if (extractedResult?.data?.medicines && extractedResult.data.medicines.length > 0) {
      extractedResult.data.medicines.forEach((med: MedicineItem, idx: number) => {
        const id = `rx-med-${idx}-${med.name.replace(/\s+/g, '-').toLowerCase()}`;
        const slot: 'Morning' | 'Noon' | 'Evening' | 'Bedtime' =
          idx % 4 === 0 ? 'Morning' : idx % 4 === 1 ? 'Noon' : idx % 4 === 2 ? 'Evening' : 'Bedtime';
        const timeStr =
          slot === 'Morning' ? '08:30 AM' : slot === 'Noon' ? '01:30 PM' : slot === 'Evening' ? '08:00 PM' : '10:00 PM';

        list.push({
          id,
          type: 'medication',
          title: `${t.takeTablet}: ${med.name}`,
          detail: `${med.dosage || 'Prescribed dose'} • ${slot} (${timeStr}) • ${med.instructions || 'Take with water as directed'}`,
          timeStr,
          slot,
          medicineName: med.name,
          dosage: med.dosage || 'Standard dose',
          instructions: med.instructions || 'Take with water after meal',
          isUrgent: slot === 'Morning' || slot === 'Noon',
          targetSection: 'medication_schedule',
        });
      });
    }

    // 2. Default Routine Medication Schedule
    const routineTablets: ClinicalNotification[] = [
      {
        id: 'routine-panto',
        type: 'medication',
        title: `${t.takeTablet}: Pantoprazole (Pantocid 40mg)`,
        detail: isTamil
          ? 'காலை உணவு உண்பதற்கு 30 நிமிடங்களுக்கு முன் வெறும் வயிற்றில் வெதுவெதுப்பான நீரில் உட்கொள்ளவும்.'
          : isHindi
          ? 'सुबह नाश्ते से 30 मिनट पहले खाली पेट गुनगुने पानी के साथ लें।'
          : 'Take 30 mins before breakfast on empty stomach with warm water for acid reflux & gastric protection.',
        timeStr: '07:30 AM',
        slot: 'Morning',
        medicineName: 'Pantoprazole 40mg',
        dosage: '40 mg',
        instructions: 'Empty stomach with warm water',
        isUrgent: false,
        targetSection: 'medication_schedule',
      },
      {
        id: 'routine-metformin',
        type: 'medication',
        title: `${t.takeTablet}: Metformin Hydrochloride 500mg`,
        detail: isTamil
          ? 'ரத்த சர்க்கரை கட்டுப்பாட்டிற்கு: காலை உணவுடன் சேர்த்து எடுத்துக்கொள்ளவும்.'
          : isHindi
          ? 'रक्त शर्करा नियंत्रण: पेट की परेशानी से बचने के लिए नाश्ते के साथ लें।'
          : 'Blood sugar control: Take with breakfast to minimize gastrointestinal discomfort.',
        timeStr: '08:30 AM',
        slot: 'Morning',
        medicineName: 'Metformin 500mg',
        dosage: '500 mg',
        instructions: 'Take with breakfast',
        isUrgent: false,
        targetSection: 'medication_schedule',
      },
      {
        id: 'routine-ecosprin',
        type: 'medication',
        title: `${t.takeTablet}: Ecosprin (Aspirin 75mg)`,
        detail: isTamil
          ? 'இதயப் பாதுகாப்பு: மதிய உணவிற்குப் பிறகு உடனடியாக ஒரு முழு டம்ளர் தண்ணீருடன் எடுக்கவும்.'
          : isHindi
          ? 'हृदय सुरक्षा: दोपहर के भोजन के तुरंत बाद एक गिलास पानी के साथ लें।'
          : 'Cardiovascular protection: Take immediately after lunch with a full glass of water.',
        timeStr: '01:30 PM',
        slot: 'Noon',
        medicineName: 'Ecosprin 75mg',
        dosage: '75 mg',
        instructions: 'Immediately after lunch',
        isUrgent: true,
        targetSection: 'medication_schedule',
      },
      {
        id: 'routine-atorva',
        type: 'medication',
        title: `${t.takeTablet}: Atorvastatin (Atorva 10mg)`,
        detail: isTamil
          ? 'கொலஸ்ட்ரால் குறைப்பு: இரவு தூங்குவதற்கு முன் தண்ணீருடன் உட்கொள்ளவும்.'
          : isHindi
          ? 'कोलेस्ट्रॉल नियंत्रण: रात में सोने से पहले पानी के साथ लें।'
          : 'Lipid & cholesterol regulation: Take at bedtime before sleeping with water.',
        timeStr: '10:00 PM',
        slot: 'Bedtime',
        medicineName: 'Atorvastatin 10mg',
        dosage: '10 mg',
        instructions: 'Bedtime with water',
        isUrgent: false,
        targetSection: 'medication_schedule',
      },
    ];

    // Only add routine tablets if not already represented in prescription
    routineTablets.forEach((rt) => {
      if (!list.some((item) => item.medicineName?.toLowerCase().includes(rt.medicineName?.split(' ')[0].toLowerCase() || 'xyz'))) {
        list.push(rt);
      }
    });

    // 3. Clinical & Safety Precautions
    list.push({
      id: 'precaution-dairy',
      type: 'precaution',
      title: isTamil ? 'உணவு & மருந்து விதிமுறை' : isHindi ? 'भोजन व दवा संबंधी नियम' : 'Drug-Food Interaction Rule',
      detail: isTamil
        ? 'ஆன்டிபயாடிக் மருந்துகளை எடுக்கும்போது பால் அல்லது தயிர் உணவுகளை 2 மணி நேர இடைவெளியில் உட்கொள்ளவும்.'
        : isHindi
        ? 'एंटीबायोटिक या कैल्शियम दवाओं के साथ दूध/दही लेने में 2 घंटे का अंतर रखें।'
        : 'Avoid dairy products, calcium, or antacids within 2 hours of oral antibiotic intake.',
      targetSection: 'prescription_ai',
    });

    // 4. Hydration & Vitals Alert
    list.push({
      id: 'alert-hydration',
      type: 'hydration',
      title: isTamil ? 'போதுமான நீர்ச்சத்து' : isHindi ? 'हाइड्रेशन व जल सेवन' : 'Daily Hydration Target',
      detail: isTamil
        ? 'மருந்து உட்கிரகிப்பிற்கும் சிறுநீரக ஆரோக்கியத்திற்கும் தினமும் 2.5 லிட்டர் நீர் அருந்துங்கள்.'
        : isHindi
        ? 'दवाओं के बेहतर असर और गुर्दे के स्वास्थ्य के लिए दिन भर में 2.5 लीटर पानी पिएं।'
        : 'Drink at least 2.5 Liters of water daily to maintain renal clearance and drug efficacy.',
      targetSection: 'dashboard',
    });

    // 5. Follow-up or Lab Alert
    list.push({
      id: 'alert-followup',
      type: 'followup',
      title: isTamil ? 'மருத்துவ மறுபரிசீலனை நினைவூட்டல்' : isHindi ? 'चिकित्सक परामर्श फॉलो-अप' : 'Doctor Follow-Up Scheduled',
      detail: isTamil
        ? 'மருத்துவர் ஆலோசனை: 5 நாட்களுக்குப் பிறகு ரத்த அழுத்த பரிசோதனையுடன் மருத்துவரை சந்திக்கவும்.'
        : isHindi
        ? 'डॉक्टर समीक्षा: 5 दिनों के बाद ब्लड प्रेशर और शुगर रिपोर्ट के साथ परामर्श लें।'
        : 'Clinical review recommended in 5 days along with resting BP and fasting glucose check.',
      targetSection: 'lab_diagnostics',
    });

    return list;
  }, [extractedResult, t, isTamil, isHindi]);

  // Filter out dismissed or taken
  const activeNotifications = useMemo(() => {
    return allNotifications.filter((n) => !dismissedIds.includes(n.id) && !takenIds.includes(n.id));
  }, [allNotifications, dismissedIds, takenIds]);

  const activeMedications = useMemo(() => {
    return allNotifications.filter((n) => n.type === 'medication');
  }, [allNotifications]);

  // Keep index in range
  useEffect(() => {
    if (currentIndex >= activeNotifications.length) {
      setCurrentIndex(0);
    }
  }, [activeNotifications.length, currentIndex]);

  // Auto-cycle current banner notification every 8 seconds if not paused and not speaking
  useEffect(() => {
    if (isPaused || isExpanded || voiceState === 'speaking' || activeNotifications.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPaused, isExpanded, voiceState, activeNotifications.length]);

  const currentItem = activeNotifications[currentIndex] || activeNotifications[0] || null;

  // Actions
  const handleMarkTaken = (id: string, name?: string) => {
    const updated = [...takenIds, id];
    setTakenIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TAKEN, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
    }
    setVoiceState('idle');
    setCurrentlySpeakingId(null);

    setToastMessage(`${name || 'Tablet'} marked as taken!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
    if (currentlySpeakingId === id && stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
      setVoiceState('idle');
      setCurrentlySpeakingId(null);
    }
  };

  const handleSpeakItem = (item: ClinicalNotification) => {
    if (voiceState === 'speaking' && currentlySpeakingId === item.id) {
      if (stopVoiceRef.current) {
        stopVoiceRef.current();
        stopVoiceRef.current = null;
      }
      setVoiceState('idle');
      setCurrentlySpeakingId(null);
      return;
    }

    if (stopVoiceRef.current) {
      stopVoiceRef.current();
      stopVoiceRef.current = null;
    }

    const spokenText = `${item.title}. ${item.detail}.`;
    setCurrentlySpeakingId(item.id);

    const stopFn = speakText(spokenText, language.code, undefined, (newState) => {
      setVoiceState(newState);
      if (newState === 'idle' || newState === 'error') {
        setCurrentlySpeakingId(null);
        stopVoiceRef.current = null;
      }
    });

    stopVoiceRef.current = stopFn;
  };

  const handleNext = () => {
    if (activeNotifications.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
    }
  };

  const handlePrev = () => {
    if (activeNotifications.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeNotifications.length) % activeNotifications.length);
    }
  };

  const pendingCount = activeNotifications.length;

  return (
    <div
      className="w-full relative z-20 font-sans border-b border-sky-100/80 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Toast Notification for Mark as Taken */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Banner Ribbon */}
      <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Live Notification Tag + Alert Counter */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={toggleExpand}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            title="Toggle All Clinical Notifications"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Bell className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden sm:inline font-mono">{t.bannerTag}</span>
            <span className="bg-sky-600 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
              {pendingCount}
            </span>
          </button>

          {/* Carousel Arrows if > 1 items */}
          {activeNotifications.length > 1 && (
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 transition"
                title="Previous Alert"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium text-slate-500">
                {currentIndex + 1}/{activeNotifications.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 transition"
                title="Next Alert"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Current Alert Content (Single Ticker) */}
          {currentItem ? (
            <div className="flex items-center gap-2 text-xs text-slate-800 truncate">
              {currentItem.type === 'medication' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold shrink-0 text-[11px]">
                  <Pill className="w-3 h-3 text-amber-700 animate-pulse" />
                  {currentItem.slot || 'Dose Due'}
                </span>
              ) : currentItem.type === 'precaution' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold shrink-0 text-[11px]">
                  <ShieldAlert className="w-3 h-3 text-rose-700" />
                  {t.urgent}
                </span>
              ) : currentItem.type === 'hydration' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 font-bold shrink-0 text-[11px]">
                  <Droplets className="w-3 h-3 text-cyan-700" />
                  Hydration
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold shrink-0 text-[11px]">
                  <Calendar className="w-3 h-3 text-indigo-700" />
                  Follow-up
                </span>
              )}

              <span className="font-semibold text-slate-900 truncate">
                {currentItem.title}:
              </span>
              <span className="text-slate-600 hidden md:inline truncate">
                {currentItem.detail}
              </span>
            </div>
          ) : (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.noAlerts}
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {currentItem && currentItem.type === 'medication' && (
            <button
              type="button"
              onClick={() => handleMarkTaken(currentItem.id, currentItem.medicineName)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs hover:scale-102 cursor-pointer"
              title="Click to mark this tablet as taken"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t.markTaken}</span>
            </button>
          )}

          {currentItem && (
            <button
              type="button"
              onClick={() => handleSpeakItem(currentItem)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                currentlySpeakingId === currentItem.id && voiceState === 'speaking'
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Listen in chosen language"
            >
              {currentlySpeakingId === currentItem.id && voiceState === 'speaking' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px] font-bold">{t.listening}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                  <span className="hidden xl:inline text-[11px]">{t.listen}</span>
                </>
              )}
            </button>
          )}

          {/* Toggle Expand View All */}
          <button
            type="button"
            onClick={toggleExpand}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0369A1] border border-sky-200 text-xs font-semibold transition"
          >
            <span>{isExpanded ? t.close : `${t.allNotifications} (${pendingCount})`}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Notification Drawer */}
      {isExpanded && (
        <div className="border-t border-sky-100 bg-linear-to-b from-sky-50/50 via-white to-slate-50 p-4 sm:p-6 shadow-inner animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Header of Drawer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {t.bannerTag}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time clinical dosage schedule, interactions, and vital health reminders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('medication_schedule');
                    toggleExpand();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.viewSchedule}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('prescription_ai');
                    toggleExpand();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-[#0369A1] text-xs font-bold transition border border-sky-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.openAiDoctor}</span>
                </button>
              </div>
            </div>

            {/* Grid of Categorized Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Column 1: Tablets & Prescriptions to Take Today */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Pill className="w-4 h-4 text-amber-600" />
                      <h4>{t.medicationsDue}</h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {activeMedications.filter((m) => !takenIds.includes(m.id)).length} Due
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {activeMedications.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">No prescribed medications found.</p>
                    ) : (
                      activeMedications.map((item) => {
                        const isTaken = takenIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              isTaken
                                ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-75'
                                : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{item.medicineName}</span>
                                  {item.slot && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900 font-mono">
                                      {item.slot}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {item.detail}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSpeakItem(item)}
                                className="p-1 rounded text-slate-500 hover:text-sky-700 hover:bg-sky-50 shrink-0"
                                title="Listen to instructions"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-amber-200/50 flex items-center justify-between">
                              <span className="text-[11px] font-mono text-slate-500">
                                🕒 {item.timeStr || 'As directed'}
                              </span>
                              {isTaken ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleMarkTaken(item.id, item.medicineName)}
                                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                >
                                  {t.markTaken}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Clinical Alerts & Food Precautions */}
              <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <h4>{t.clinicalAlerts}</h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      Safety
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {allNotifications
                      .filter((n) => n.type === 'precaution' || n.type === 'hydration')
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {item.type === 'hydration' ? (
                                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                )}
                                <span>{item.title}</span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSpeakItem(item)}
                              className="p-1 rounded text-slate-500 hover:text-sky-700 hover:bg-sky-50 shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Follow-ups, Lab Tests & Emergency Sync */}
              <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <h4>{t.followUpLab}</h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Timeline
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {allNotifications
                      .filter((n) => n.type === 'followup' || n.type === 'lab')
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900">
                                {item.title}
                              </div>
                              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSpeakItem(item)}
                              className="p-1 rounded text-slate-500 hover:text-sky-700 hover:bg-sky-50 shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                onNavigate(item.targetSection || 'lab_diagnostics');
                                toggleExpand();
                              }}
                              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
                            >
                              Open Diagnostics <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Quick reset test buttons */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: All alert engines active</span>
                      {takenIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTakenIds([]);
                            localStorage.removeItem(STORAGE_KEY_TAKEN);
                          }}
                          className="text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Reset taken doses
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
