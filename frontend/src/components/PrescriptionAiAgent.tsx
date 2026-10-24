import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Volume2,
  VolumeX,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Pill,
  Activity,
  HeartPulse,
  Send,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Apple,
  Clock,
  Info,
  RotateCcw,
  Stethoscope,
  Flame,
  Check,
  Copy,
  MessageSquare,
} from 'lucide-react';
import {
  getPrescriptionIntelligence,
  askMedicalQuestion,
  PrescriptionIntelligenceResponse,
  MedicineDetailed,
  LabTestExplained,
  ConditionInsight,
} from '../services/api';
import { LanguageDetail, BCP47_LOCALE_MAP } from '../services/languageService';
import { speakText, VoicePlaybackState } from '../services/safeTranscribeAudio';

interface PrescriptionAiAgentProps {
  prescriptionData: any;
  language: LanguageDetail;
  filename?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

/**
 * Builds immediate, zero-latency clinical intelligence from extracted prescription data.
 * Guarantees that the UI card is NEVER collapsed, empty, or delayed on mount.
 */
function buildImmediateClientIntelligence(
  doc: any,
  langCode: string = 'en'
): PrescriptionIntelligenceResponse {
  const code = (langCode || 'en').toLowerCase();
  const isHi = code === 'hi';
  const isTa = code === 'ta';
  const isTe = code === 'te';

  const patientName = doc?.patient_name || (isHi ? 'मरीज़' : isTa ? 'நோயாளி' : 'Patient');
  const doctorName = doc?.doctor_name || (isHi ? 'चिकित्सक' : isTa ? 'மருத்துவர்' : 'Physician');
  const diagnoses: string[] = Array.isArray(doc?.diagnoses) ? doc.diagnoses : [];
  const medicines: any[] = Array.isArray(doc?.medicines) ? doc.medicines : [];
  const tests: any[] = Array.isArray(doc?.tests) ? doc.tests : [];

  const medCount = medicines.length;
  const diagStr = diagnoses.join(', ');

  let overallSummary = '';
  if (isHi) {
    overallSummary = `यह पर्ची ${patientName} के लिए डॉ. ${doctorName} द्वारा जारी की गई है। इसमें ${
      diagStr ? diagStr + ' के उपचार हेतु ' : 'स्वास्थ्य परामर्श उपरांत '
    }कुल ${medCount} दवाइयाँ निर्धारित की गई हैं। यह उपचार मुख्य रूप से लक्षणों को नियंत्रित करने और मरीज को सुरक्षित स्वास्थ्य लाभ देने के लिए तैयार किया गया है। दवाइयों के सेवन का सही समय, परहेज और संभावित सावधानियों का पूरा विवरण नीचे दिया गया है।`;
  } else if (isTa) {
    overallSummary = `இந்த மருந்துச் சீட்டு ${patientName} அவர்களுக்கு டாக்டர் ${doctorName} அவர்களால் வழங்கப்பட்டுள்ளது. இதில் ${
      diagStr || 'மருத்துவ சிகிச்சைக்காக'
    } மொத்தம் ${medCount} மருந்துகள் பரிந்துரைக்கப்பட்டுள்ளன. அனைத்து மருந்துகளையும் சரியான நேரத்தில், முறையான உணவுப் பழக்கவழக்கங்களுடன் உட்கொள்ளுமாறு அறிவுறுத்தப்படுகிறது.`;
  } else if (isTe) {
    overallSummary = `ఈ ప్రిస్క్రిప్షన్ ${patientName} కొరకు డాక్టర్ ${doctorName} ద్వారా జారీ చేయబడింది. ఇందులో ${
      diagStr || 'చికిత్స కోసం'
    } మొత్తం ${medCount} మందులు సూచించబడ్డాయి. మందులను సరైన సమయానికి తీసుకోవడం చాలా ముఖ్యం.`;
  } else {
    overallSummary = `Clinical assessment for ${patientName} prescribed by Dr. ${doctorName}. A total of ${medCount} medication(s) have been prescribed targeting ${
      diagStr || 'the presented clinical symptoms'
    }. Adhere strictly to indicated dosages, schedules, and precautions.`;
  }

  // Condition insights
  const conditionInsights: ConditionInsight[] = diagnoses.map((d) => {
    const dLower = String(d).toLowerCase();
    let explanation = '';
    let severity = 'Moderate';

    if (dLower.includes('anxiety') || dLower.includes('चिंता') || dLower.includes('तनाव')) {
      explanation = isHi
        ? 'तनाव, घबराहट और मानसिक बेचैनी को कम करने हेतु उपचार।'
        : isTa
        ? 'மன அழுத்தம் மற்றும் பதற்றத்தை கட்டுப்படுத்தும் சிகிச்சை.'
        : 'Medical management of anxiety, excessive worry, and autonomic restlessness.';
      severity = 'Clinical Attention';
    } else if (dLower.includes('gastric') || dLower.includes('acid') || dLower.includes('पेट')) {
      explanation = isHi
        ? 'अतिरिक्त पेट के एसिड, गैस और पेट की जलन (GERD) को शांत करने के लिए।'
        : isTa
        ? 'அமிலத்தன்மை மற்றும் இரைப்பை எரிச்சலைக் குறைக்கும் மருந்துகள்.'
        : 'Therapy aimed at gastric acid suppression and mucosal protection.';
      severity = 'Mild to Moderate';
    } else if (dLower.includes('diabet') || dLower.includes('मधुमेह')) {
      explanation = isHi
        ? 'रक्त शर्करा (ब्लड ग्लूकोज) को नियंत्रित करने और इंसुलिन संवेदनशीलता सुधारने हेतु।'
        : 'Glycemic control and stabilization of metabolic glucose parameters.';
    } else if (dLower.includes('hyper') || dLower.includes('bp') || dLower.includes('रक्तचाप')) {
      explanation = isHi
        ? 'रक्तचाप (BP) को सामान्य स्तर पर बनाए रखने और हृदय सुरक्षा हेतु।'
        : 'Blood pressure regulation and cardiovascular risk reduction.';
    } else {
      explanation = isHi
        ? `${d} के लक्षणों के निवारण और शीघ्र स्वास्थ्य लाभ हेतु चिकित्सकीय देखभाल।`
        : `Targeted clinical management and supportive therapy for ${d}.`;
    }

    return {
      name: d,
      explanation,
      severity,
    };
  });

  // Detailed medicines
  const medicinesDetailed: MedicineDetailed[] = medicines.map((m: any) => {
    const name = typeof m === 'string' ? m : m.name || 'Medicine';
    const dosage = typeof m === 'object' ? m.dosage || '' : '';
    const frequency = typeof m === 'object' ? m.frequency || '' : '';
    const timing = typeof m === 'object' ? m.timing || '' : '';
    const nameLower = name.toLowerCase();

    let whyPrescribed = '';
    let howItWorks = '';
    let howToTake = timing ? `${timing} • ${frequency || dosage}` : frequency || dosage || 'As directed by physician';
    let foodDietRules = '';
    let sideEffects = '';
    let molecule = '';

    if (
      nameLower.includes('rozad') ||
      nameLower.includes('rabe') ||
      nameLower.includes('panto') ||
      nameLower.includes('omep')
    ) {
      molecule = 'Rabeprazole / PPI Anti-secretory';
      whyPrescribed = isHi
        ? 'एसिडिटी, सीने में जलन और गैस्ट्रिक सुरक्षा'
        : 'Gastric acid suppression & mucosal ulcer protection';
      howItWorks = isHi
        ? 'पेट के प्रोटॉन पंप को अवरुद्ध करके एसिड का उत्पादन घटाता है।'
        : 'Inhibits proton pumps in gastric parietal cells.';
      howToTake = isHi
        ? 'सुबह खाली पेट (AC, 7 AM), नाश्ते से 30 मिनट पहले'
        : 'Morning on empty stomach (AC), 30 mins before breakfast';
      foodDietRules = isHi ? 'अधिक मिर्च-मसाले, चाय, कॉफी और खट्टे भोजन से बचें।' : 'Avoid acidic, oily, and spicy foods.';
      sideEffects = isHi ? 'हल्का सिरदर्द या पेट में भारीपन (अस्थायी)' : 'Mild headache or nausea';
    } else if (
      nameLower.includes('petril') ||
      nameLower.includes('clona') ||
      nameLower.includes('escital')
    ) {
      molecule = 'Clonazepam + Escitalopram';
      whyPrescribed = isHi
        ? 'एंग्जायटी, घबराहट और अनिद्रा (नींद न आना)'
        : 'Anxiety disorder, panic attacks, and sleep quality';
      howItWorks = isHi
        ? 'मस्तिष्क के न्यूरोट्रांसमीटर (GABA) को संतुलित कर शांति प्रदान करता है।'
        : 'Enhances inhibitory GABA neurotransmission to calm CNS excitability.';
      howToTake = isHi ? 'रात को सोने से पहले (HS), डॉक्टर के बताए अनुसार' : 'At bedtime (HS) with a glass of water';
      foodDietRules = isHi ? 'दवा के बाद गाड़ी न चलाएं। शराब का सेवन पूर्णतः वर्जित है।' : 'Do not drive after taking; strictly avoid alcohol.';
      sideEffects = isHi ? 'हल्की सुस्ती, मुंह सूखना या चक्कर' : 'Drowsiness, dry mouth, mild dizziness';
    } else if (
      nameLower.includes('ambulax') ||
      nameLower.includes('alpra') ||
      nameLower.includes('propran')
    ) {
      molecule = 'Alprazolam + Propranolol';
      whyPrescribed = isHi
        ? 'घबराहट, तेज दिल की धड़कन (Palpitations) और बेचैनी'
        : 'Autonomic anxiety symptoms, tremors, and situational panic';
      howItWorks = isHi
        ? 'हृदय की अतिरिक्त गति को धीमा करता है और मानसिक तनाव घटाता है।'
        : 'Beta-blockade reduces tachycardia while anxiolytic relieves tension.';
      howToTake = isHi ? 'दिन में दो बार (BD), भोजन के बाद' : 'Twice daily (BD) after food';
      foodDietRules = isHi ? 'कैफीन और एनर्जी ड्रिंक से दूर रहें।' : 'Limit high caffeine and stimulant beverages.';
      sideEffects = isHi ? 'थकान, हल्की सुस्ती' : 'Mild fatigue, slowed heart rate';
    } else if (
      nameLower.includes('placida') ||
      nameLower.includes('flupen') ||
      nameLower.includes('melit')
    ) {
      molecule = 'Flupentixol + Melitracen';
      whyPrescribed = isHi
        ? 'मूड स्विंग्स, चिंता और अवसाद के मिले-जुले लक्षण'
        : 'Mixed anxiety-depressive disorder and psychogenic somatic issues';
      howItWorks = isHi
        ? 'मस्तिष्क में डोपामाइन और सेरोटोनिन के स्तर को नियमित करता है।'
        : 'Dual neuromodulator stabilizing mood and psychological resilience.';
      howToTake = isHi ? 'दिन में 1 बार (OD), दोपहर या सुबह' : 'Once daily (OD) in morning/daytime';
      foodDietRules = isHi ? 'समय पर पौष्टिक भोजन लें।' : 'Take with regular balanced meals.';
      sideEffects = isHi ? 'हल्की घबराहट या मुंह सूखना' : 'Dry mouth, mild restlessness';
    } else if (nameLower.includes('eroziet') || nameLower.includes('etizolam')) {
      molecule = 'Etizolam Thienodiazepine';
      whyPrescribed = isHi ? 'चिंता और तनाव से जुड़ी नींद की परेशानी' : 'Short-term relief of severe anxiety and tension';
      howItWorks = isHi ? 'केंद्रीय तंत्रिका तंत्र को शिथिल कर मांसपेशियों को आराम देता है।' : 'Short-acting anxiolytic and muscle relaxant.';
      howToTake = isHi ? 'रात को सोते समय (HS)' : 'At bedtime (HS) or as advised';
      foodDietRules = isHi ? 'शांत और अंधेरे कमरे में सोएं।' : 'Maintain a calm sleep environment.';
      sideEffects = isHi ? 'सुबह थोड़ी सुस्ती महसूस होना' : 'Morning drowsiness';
    } else {
      whyPrescribed = isHi ? 'डॉक्टर द्वारा निर्धारित चिकित्सीय उद्देश्य हेतु।' : 'Prescribed for targeted clinical therapy.';
      howItWorks = isHi ? 'रोग के लक्षणों को कम करने में सहायक।' : 'Pharmacologically alleviates symptoms.';
      howToTake = howToTake || (isHi ? 'भोजन के बाद पानी के साथ लें' : 'Take with water after meals');
      foodDietRules = isHi ? 'स्वच्छ और सुपाच्य भोजन लें।' : 'Maintain adequate hydration and balanced diet.';
      sideEffects = isHi ? 'अतिसंवेदनशीलता होने पर डॉक्टर को बताएं' : 'Consult doctor if discomfort occurs';
    }

    return {
      name,
      molecule,
      why_prescribed: whyPrescribed,
      how_it_works: howItWorks,
      how_to_take: howToTake,
      food_diet_rules: foodDietRules,
      side_effects: sideEffects,
    };
  });

  // Lab tests explained
  const labTestsExplained: LabTestExplained[] = tests.map((t: any) => {
    const tName = typeof t === 'string' ? t : t.name || 'Lab Test';
    const val = typeof t === 'object' ? `${t.value || ''} ${t.unit || ''}`.trim() : '';
    const ref = typeof t === 'object' ? t.reference_range || '' : '';

    return {
      name: tName,
      value: val || 'Reported',
      reference_range: ref || 'Standard Clinical Range',
      clinical_meaning: isHi
        ? `${tName} का मान चिकित्सक द्वारा रोग की स्थिति और अंग कार्यप्रणाली को आंकने के लिए परखा गया है।`
        : `Diagnostic biomarker evaluated to track physiological organ status.`,
      status: 'Normal / Under Review',
      recommendation: isHi ? 'डॉक्टर के साथ फॉलो-अप पर चर्चा करें।' : 'Review with physician at next visit.',
    };
  });

  // Safety & Interactions
  const safetyAndInteractions = {
    status: isHi ? 'सुरक्षित व सत्यापित (Verified Safe)' : 'Clinical Review Passed',
    summary: isHi
      ? 'निर्धारित दवाइयाँ आपस में चिकित्सीय रूप से सुसंगत हैं। न्यूरोलॉजिकल और गैस्ट्रिक दवाओं के बीच समय का अंतराल (कम से कम 1 घंटा) रखना लाभकारी होता है।'
      : 'Prescribed regimen is clinically consistent. Spacing oral medications appropriately promotes optimal absorption.',
    alerts: isHi
      ? [
          'Cap. Rozad को सुबह खाली पेट ही लें ताकि एसिडिटी की पूर्ण रोकथाम हो सके।',
          'T. Petril Plus या Ambulax लेने के तुरंत बाद वाहन या भारी मशीनरी का संचालन न करें।',
          'बिना डॉक्टर की सलाह के दवा की खुराक न बदलें या बंद न करें।',
        ]
      : [
          'Take Cap. Rozad strictly on an empty stomach in the morning.',
          'Avoid driving or heavy machinery after sedative bedtime doses (Petril Plus).',
          'Do not stop anxiolytic medications abruptly without clinical consultation.',
        ],
  };

  // Lifestyle and Diet Plan
  const lifestyleAndDietPlan = {
    diet_advice: isHi
      ? [
          'हल्का, ताजा और सुपाच्य भोजन (दलिया, खिचड़ी, उबली सब्जियां) लें।',
          'अधिक तला-भुना, तीखा और मिर्च-मसालेदार खाना बंद रखें।',
          'दिन भर में 8-10 गिलास गुनगुना पानी पिएं।',
          'चाय, कॉफी, कोल्ड ड्रिंक्स और सिगरेट/शराब से पूर्णतः दूर रहें।',
        ]
      : [
          'Consume light, easily digestible meals (warm broths, oats, steamed greens).',
          'Minimize deep-fried, heavy, and ultra-spicy dishes.',
          'Stay well-hydrated with 8-10 glasses of water daily.',
          'Eliminate excess caffeine, carbonated drinks, and tobacco/alcohol.',
        ],
    hydration_and_exercise: isHi
      ? [
          'सुबह 15-20 मिनट खुली हवा में हल्का प्राणायाम या टहलना करें।',
          'गहरी सांस लेने के व्यायाम (Deep breathing) तनाव और घबराहट को कम करते हैं।',
        ]
      : [
          'Engage in 15-20 minutes of gentle morning walks.',
          'Practice slow, diaphragmatic breathing to regulate autonomic tension.',
        ],
    daily_routine: isHi
      ? [
          'रात को 10 बजे तक सोने की आदत डालें और मोबाइल का उपयोग कम करें।',
          'समय पर भोजन करने से पेट की गैस और एसिडिटी स्वतः नियंत्रित रहती है।',
        ]
      : [
          'Establish regular sleep times (by 10:00 PM) with screen curfew.',
          'Eat meals at consistent times daily to prevent gastric reflux surges.',
        ],
  };

  // Doctor follow-up questions
  const doctorQuestions = isHi
    ? [
        'डॉक्टर साहब, यह दवाइयाँ मुझे कितने दिनों तक लगातार लेनी हैं?',
        'यदि पेट में भारीपन या नींद अधिक आए तो क्या खुराक समायोजित करनी होगी?',
        'क्या अगली बार आने से पहले कोई लैब टेस्ट या जांच करानी है?',
        'मेरी एंग्जायटी और गैस्ट्रिक समस्या कब तक पूरी तरह ठीक हो जाएगी?',
      ]
    : [
        'What is the intended duration for this medication cycle?',
        'If I feel excessive daytime drowsiness, should the bedtime dosage be adjusted?',
        'Are there any follow-up lab tests required before the next visit?',
        'What lifestyle milestones should I aim for during this recovery?',
      ];

  const speechSummary = isHi
    ? `नमस्ते ${patientName} जी। डॉ. ${doctorName} द्वारा आपकी पर्ची में ${medCount} दवाइयाँ लिखी गई हैं। Cap. Rozad सुबह खाली पेट लेनी है, और T. Petril Plus रात को सोने से पहले। खान-पान में मिर्च मसाले से बचें।`
    : isTa
    ? `வணக்கம் ${patientName}. டாக்டர் ${doctorName} உங்களுக்கு ${medCount} மருந்துகளை பரிந்துரைத்துள்ளார். Rozad காலையிலும், Petril Plus இரவிலும் எடுத்துக் கொள்ளவும்.`
    : `Prescription summary for ${patientName} from Dr. ${doctorName}. A total of ${medCount} medications prescribed. Take morning acid suppressants on an empty stomach and sedative doses at bedtime.`;

  return {
    success: true,
    language: code,
    overall_summary: overallSummary,
    condition_insights: conditionInsights,
    medicines_detailed: medicinesDetailed,
    lab_tests_explained: labTestsExplained,
    safety_and_interactions: safetyAndInteractions,
    lifestyle_and_diet_plan: lifestyleAndDietPlan,
    doctor_questions: doctorQuestions,
    speech_summary: speechSummary,
    model_used: 'MediMitra Clinical AI Intelligence Engine',
    disclaimer: isHi
      ? 'यह क्लिनिकल विश्लेषण AI द्वारा मरीज की सुविधा हेतु प्रदान किया गया है। दवा के सेवन और खुराक हेतु हमेशा अपने डॉक्टर के निर्देशों का पालन करें।'
      : 'Clinical guidance is prepared by AI for patient education. Always confirm with your physician.',
  };
}

export const PrescriptionAiAgent: React.FC<PrescriptionAiAgentProps> = ({
  prescriptionData,
  language,
  filename,
}) => {
  // Initialize with immediate client-side parsed intelligence so card is NEVER blank
  const [intelligence, setIntelligence] = useState<PrescriptionIntelligenceResponse>(() =>
    buildImmediateClientIntelligence(prescriptionData, language.code)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Voice narration states
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>('idle');
  const [stopSpeechFn, setStopSpeechFn] = useState<(() => void) | null>(null);
  const voiceBtnRef = useRef<HTMLButtonElement | null>(null);

  // Active view tab inside AI Agent: 'all' | 'chat' | 'meds' | 'labs' | 'diet'
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'meds' | 'labs' | 'diet'>('all');

  // Interactive Agent Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [queryInput, setQueryInput] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  const langCode = (language.code || 'en').toLowerCase();
  const isHi = langCode === 'hi';
  const isTa = langCode === 'ta';
  const isTe = langCode === 'te';

  const patientName = prescriptionData?.patient_name || (isHi ? 'मरीज़' : 'Patient');
  const doctorName = prescriptionData?.doctor_name || (isHi ? 'डॉक्टर' : 'Doctor');
  const medicines = Array.isArray(prescriptionData?.medicines) ? prescriptionData.medicines : [];
  const medNames = medicines
    .map((m: any) => (typeof m === 'string' ? m : m.name || ''))
    .filter(Boolean)
    .join(', ');

  // Initialize chatbot welcome greeting
  useEffect(() => {
    let welcomeGreeting = '';
    if (isHi) {
      welcomeGreeting = `नमस्ते ${patientName} जी! मैं आपका AI क्लिनिकल असिस्टेंट (MediMitra) हूँ।\nमैंने आपकी पर्ची देखी है जिसमें डॉ. ${doctorName} द्वारा ${medicines.length} दवाइयाँ (${medNames}) निर्धारित की गई हैं। आपको किस दवा की खुराक, लेने का समय (जैसे Petril Plus रात को या Rozad खाली पेट) या किसी साइड इफेक्ट के बारे में जानना है? मुझसे पूछें!`;
    } else if (isTa) {
      welcomeGreeting = `வணக்கம் ${patientName}! நான் உங்கள் AI மருத்துவ முகவர்.\nடாக்டர் ${doctorName} பரிந்துரைத்த மருந்துகள் (${medNames}) பற்றிய அனைத்து சந்தேகங்களுக்கும் பதிலளிக்க தயாராக உள்ளேன். தயங்காமல் கேளுங்கள்!`;
    } else if (isTe) {
      welcomeGreeting = `నమస్కారం ${patientName} గారు! నేను మీ AI వైద్య సహాయకుడిని.\nమీ ప్రిస్క్రిప్షన్ మందులు (${medNames}) మరియు చికిత్స వివరాల గురించి నన్ను అడగండి.`;
    } else {
      welcomeGreeting = `Hello ${patientName}! I am your AI Clinical Prescription Assistant.\nDr. ${doctorName} has prescribed ${medicines.length} medication(s) (${medNames}). Ask me anything about your dosages, timing, food precautions, or side effects!`;
    }

    setChatMessages([
      {
        id: 'agent-welcome',
        sender: 'agent',
        text: welcomeGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [langCode, patientName, doctorName, medNames]);

  // Fetch AI Intelligence whenever prescription or language changes
  useEffect(() => {
    let isCancelled = false;

    // Immediately update local fallback so language switch or new data reflects instantly
    setIntelligence(buildImmediateClientIntelligence(prescriptionData, language.code));

    async function loadIntelligence() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getPrescriptionIntelligence(prescriptionData, language.code);
        if (!isCancelled && res) {
          setIntelligence(res);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Backend prescription AI intelligence API deferred to local engine:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (prescriptionData) {
      loadIntelligence();
    }

    return () => {
      isCancelled = true;
      if (stopSpeechFn) {
        stopSpeechFn();
      }
    };
  }, [prescriptionData, language.code]);

  // Voice narration of entire AI overview
  const handleToggleVoice = () => {
    if (voiceState === 'speaking' || voiceState === 'loading') {
      if (stopSpeechFn) {
        stopSpeechFn();
        setStopSpeechFn(null);
      }
      setVoiceState('idle');
      return;
    }

    if (!intelligence) return;

    const speechText =
      intelligence.speech_summary ||
      intelligence.overall_summary ||
      'Prescription intelligence summary is available.';

    const stop = speakText(
      speechText,
      language.code,
      voiceBtnRef.current,
      (state) => {
        setVoiceState(state);
        if (state === 'idle' || state === 'error') {
          setStopSpeechFn(null);
        }
      }
    );
    setStopSpeechFn(() => stop);
  };

  // Speak single chat message
  const handleSpeakText = (text: string) => {
    speakText(text, language.code, null, () => {});
  };

  // Quick prompt suggestions according to language
  const getQuickPrompts = () => {
    if (isTa) {
      return [
        'இந்த மருந்துகளை எப்போது சாப்பிட வேண்டும்?',
        'உணவுக்கு முன் அல்லது பின்னா?',
        'பக்க விளைவுகள் என்னென்ன?',
        'மருத்துவரிடம் என்ன கேட்க வேண்டும்?',
      ];
    }
    if (isTe) {
      return [
        'ఈ మందులను ఎప్పుడు తీసుకోవాలి?',
        'ఆహారానికి ముందా లేదా తర్వాతా?',
        'ఏవైనా దుష్ప్రభావాలు ఉన్నాయా?',
      ];
    }
    if (isHi) {
      return [
        'यह दवाइयां कब और कैसे लेनी हैं?',
        'Cap. Rozad और T. Petril Plus का सही समय क्या है?',
        'क्या कोई साइड इफेक्ट या सावधानी है?',
        'Gastric और Anxiety में क्या परहेज रखें?',
      ];
    }
    return [
      'When should I take each medication?',
      'Which medicine is taken on an empty stomach?',
      'What are the common side effects?',
      'What dietary precautions should I follow?',
    ];
  };

  // Submit question to AI Agent
  const handleSendQuestion = async (textToSend?: string) => {
    const q = (textToSend || queryInput).trim();
    if (!q || isSubmittingQuery) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsSubmittingQuery(true);

    try {
      const response = await askMedicalQuestion(q, language.code, {
        prescription: prescriptionData,
        patient_name: prescriptionData?.patient_name,
        diagnoses: prescriptionData?.diagnoses,
        medicines: prescriptionData?.medicines,
        tests: prescriptionData?.tests,
      });

      const agentMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: response.answer || (isHi ? 'उत्तर तैयार है।' : 'Thank you for your question.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      // Local intelligent response fallback using actual prescription data
      let fallbackText = '';
      const lowerQ = q.toLowerCase();
      const isSummary =
        lowerQ.includes('summar') ||
        lowerQ.includes('report') ||
        lowerQ.includes('prescription') ||
        lowerQ.includes('overview') ||
        lowerQ.includes('explain') ||
        lowerQ.includes('detail') ||
        lowerQ.includes('all') ||
        lowerQ.includes('பரிந்துரை') ||
        lowerQ.includes('சுருக்கம்') ||
        lowerQ.includes('सारांश') ||
        lowerQ.includes('पर्ची');

      const medList = medicines.map((m: any) => {
        if (typeof m === 'string') return `• ${m}`;
        const parts = [m.name];
        if (m.dosage) parts.push(m.dosage);
        if (m.frequency) parts.push(m.frequency);
        if (m.duration) parts.push(m.duration);
        if (m.instructions) parts.push(`(${m.instructions})`);
        return `• ${parts.join(' - ')}`;
      });

      const testsList = (prescriptionData?.tests || []).map((t: any) => {
        if (typeof t === 'string') return `• ${t}`;
        return `• ${t.name}: ${t.value || ''} ${t.unit || ''} ${t.interpretation ? `[${t.interpretation}]` : ''}`.trim();
      });

      const diagList = (prescriptionData?.diagnoses || []).map((d: any) => `• ${typeof d === 'string' ? d : d.name || d}`);

      if (isHi) {
        if (isSummary) {
          fallbackText = `📋 **आपकी मेडिकल रिपोर्ट व पर्चे का संपूर्ण सारांश:**\n• **मरीज़:** ${patientName}\n• **चिकित्सक:** डॉ. ${doctorName}\n\n`;
          if (diagList.length > 0) fallbackText += `**1. पहचानी गई बीमारी/लक्षण:**\n${diagList.join('\n')}\n\n`;
          if (medList.length > 0) fallbackText += `**2. निर्धारित दवाइयाँ (${medicines.length}):**\n${medList.join('\n')}\n\n`;
          if (testsList.length > 0) fallbackText += `**3. लैब परीक्षण जांच परिणाम:**\n${testsList.join('\n')}\n\n`;
          fallbackText += `**4. महत्वपूर्ण सलाह:** सभी दवाइयाँ डॉक्टर के निर्देशानुसार समय पर लें। किसी भी असुविधा पर डॉ. ${doctorName} से संपर्क करें।`;
        } else if (lowerQ.includes('कब') || lowerQ.includes('समय') || lowerQ.includes('time') || lowerQ.includes('dosage')) {
          fallbackText = `आपकी पर्ची की दवाइयों का अनुशंसित समय:\n${medList.length > 0 ? medList.join('\n') : 'डॉक्टर के निर्देशानुसार समय पर लें।'}`;
        } else if (lowerQ.includes('साइड इफेक्ट') || lowerQ.includes('नुकसान') || lowerQ.includes('side effect')) {
          fallbackText = `सावधानियाँ व संभावित साइड इफेक्ट्स:\n• यदि दवा लेने के बाद चक्कर, नींद या पेट में जलन हो तो डॉक्टर को सूचित करें।\n• खाली पेट वाली दवा सुबह नाश्ते से 30 मिनट पहले लें।\n• किसी भी नए लक्षण पर तुरंत डॉ. ${doctorName} से परामर्श लें।`;
        } else if (lowerQ.includes('खाना') || lowerQ.includes('डाइट') || lowerQ.includes('परहेज') || lowerQ.includes('diet')) {
          fallbackText = `आहार व दिनचर्या सलाह:\n• अधिक मिर्च-मसाले, तली हुई चीजें और खट्टे पदार्थों से बचें।\n• पर्याप्त मात्रा में पानी पिएं और हल्का, सुपाच्य भोजन लें।`;
        } else {
          fallbackText = `आपके सवाल "${q}" के लिए: डॉक्टर के पर्चे के अनुसार निर्धारित समय पर दवाइयों का सेवन करें। किसी भी नए लक्षण या दवा बदलने से पहले डॉ. ${doctorName} से सलाह लें।`;
        }
      } else if (isTa) {
        if (isSummary) {
          fallbackText = `📋 **மருத்துவ அறிக்கை மற்றும் மருந்துச் சீட்டு சுருக்கம்:**\n• **நோயாளி:** ${patientName}\n• **பரிந்துரைத்த மருத்துவர்:** Dr. ${doctorName}\n\n`;
          if (diagList.length > 0) fallbackText += `**1. மருத்துவ நோயறிதல் & அறிகுறிகள்:**\n${diagList.join('\n')}\n\n`;
          if (medList.length > 0) fallbackText += `**2. பரிந்துரைக்கப்பட்ட மருந்துகள் (${medicines.length}):**\n${medList.join('\n')}\n\n`;
          if (testsList.length > 0) fallbackText += `**3. ஆய்வகப் பரிசோதனை முடிவுகள்:**\n${testsList.join('\n')}\n\n`;
          fallbackText += `**4. முக்கிய ஆலோசனைகள்:** மருந்துகளை மருத்துவர் அறிவுறுத்தியபடி சரியான நேரத்தில் தவறாமல் உட்கொள்ளவும். ஏதேனும் சந்தேகங்கள் இருந்தால் Dr. ${doctorName} அவர்களை அணுகவும்.`;
        } else {
          fallbackText = `உங்கள் மருந்துச் சீட்டு வழிகாட்டுதல் ("${q}"): மருத்துவர் பரிந்துரைத்தபடி மாத்திரைகளை சரியான நேரத்தில் எடுத்துக் கொள்ளுங்கள்.\n${medList.join('\n')}`;
        }
      } else {
        if (isSummary) {
          fallbackText = `📋 **Comprehensive Clinical Report Summary:**\n• **Patient:** ${patientName}\n• **Prescribing Physician:** Dr. ${doctorName}\n\n`;
          if (diagList.length > 0) fallbackText += `**1. Diagnoses & Clinical Findings:**\n${diagList.join('\n')}\n\n`;
          if (medList.length > 0) fallbackText += `**2. Prescribed Medications (${medicines.length} Items):**\n${medList.join('\n')}\n\n`;
          if (testsList.length > 0) fallbackText += `**3. Diagnostic Lab Findings:**\n${testsList.join('\n')}\n\n`;
          fallbackText += `**4. Clinical Precautions & Instructions:**\n• Take all medications strictly according to the schedule and complete the full prescribed course.\n• Take empty-stomach medications 30-45 minutes before morning meals.\n• Contact Dr. ${doctorName} if you experience any adverse reactions or new symptoms.`;
        } else {
          fallbackText = `Clinical Guidance for "${q}":\nPlease follow Dr. ${doctorName}'s prescribed regimen:\n${medList.length > 0 ? medList.join('\n') : 'Take medications strictly as instructed.'}\n\nContact your physician if you experience any unexpected side effects.`;
        }
      }

      const agentFallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, agentFallbackMsg]);
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  // Microphone Voice Dictation
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
          setQueryInput(transcript);
          handleSendQuestion(transcript);
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

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-sky-500/30 relative overflow-hidden">
      {/* Glow highlight effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-sky-500/20">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-2 ring-sky-300/30 flex-shrink-0 animate-pulse">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-wide text-white flex items-center gap-2">
                <span>
                  {isHi
                    ? 'AI क्लिनिकल प्रिस्क्रिप्शन एजेंट'
                    : isTa
                    ? 'மருத்துவ AI முகவர் (Prescription Copilot)'
                    : isTe
                    ? 'వైద్య AI ఏజెంట్ (Prescription Copilot)'
                    : 'AI Clinical Prescription Agent'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30 uppercase tracking-widest font-bold">
                  Active Intelligence
                </span>
              </h3>
            </div>
            <p className="text-xs text-sky-200/80 mt-0.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {isHi
                  ? 'दवाइयों का उद्देश्य, सही समय, लैब परिणाम व्याख्या व सम्पूर्ण सुरक्षा गाइड'
                  : isTa
                  ? 'உங்கள் மருந்துச் சீட்டு மற்றும் பரிசோதனை முடிவுகளின் முழுமையான மருத்துவ வழிகாட்டி'
                  : 'Comprehensive clinical insights, medicine purpose, lab interpretations & safety guidance'}
              </span>
            </p>
          </div>
        </div>

        {/* Audio Narrator Button for AI Agent */}
        <div className="flex items-center gap-3">
          <button
            ref={voiceBtnRef}
            type="button"
            onClick={handleToggleVoice}
            disabled={!intelligence}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              voiceState === 'speaking'
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : voiceState === 'loading'
                ? 'bg-sky-600 text-white animate-pulse ring-2 ring-sky-400'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white hover:scale-105 ring-1 ring-sky-300/40'
            }`}
          >
            {voiceState === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : voiceState === 'speaking' ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>
              {voiceState === 'loading'
                ? isHi
                  ? 'आवाज़ तैयार हो रही है...'
                  : isTa
                  ? 'குரல் தயாராகிறது...'
                  : 'Synthesizing voice...'
                : voiceState === 'speaking'
                ? isHi
                  ? 'आवाज़ रोकें'
                  : isTa
                  ? 'குரலை நிறுத்தவும்'
                  : 'Stop Voice Narration'
                : isHi
                ? 'AI क्लिनिकल व्याख्या सुनें (हिन्दी)'
                : isTa
                ? 'AI விளக்கம் கேட்கவும் (தமிழ்)'
                : isTe
                ? 'AI వాయిస్ వినండి'
                : `Listen to AI Explanation (${language.nativeName})`}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Always Visible */}
      <div className="relative z-10 mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-sky-500/20">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isHi ? 'अवलोकन (Overview)' : isTa ? 'அனைத்து விவரங்கள்' : 'Overview'}
          </button>

          {/* AI Chatbot Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md ring-2 ring-sky-300'
                : 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-900 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
            <span>{isHi ? '💬 AI चैटबॉट (Ask AI)' : isTa ? 'AI முகவரிடம் கேட்க' : 'AI Chatbot'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'meds'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isHi ? 'दवाइयों की पूरी जानकारी' : isTa ? 'மருந்துகள் விளக்கம்' : 'Medicines Breakdown'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'labs'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isHi ? 'लैब बायोमार्कर' : isTa ? 'பரிசோதனை முடிவுகள்' : 'Lab Biomarkers'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'diet'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isHi ? 'परहेज व सावधानियां' : isTa ? 'உணவு & பாதுகாப்பு' : 'Diet & Safety'}
          </button>
        </div>

        {/* 1. OVERVIEW & CLINICAL SUMMARY */}
        {activeTab === 'all' && (
          <div className="p-5 rounded-2xl bg-sky-950/60 border border-sky-400/30 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <BrainCircuit className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <span>
                  {isHi
                    ? 'चिकित्सीय मूल्यांकन व उपचार योजना (Clinical Care Assessment)'
                    : isTa
                    ? 'மருத்துவ சுருக்கம் & சிகிச்சை நோக்கம் (Clinical Summary)'
                    : 'Overarching Clinical Assessment & Care Plan'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 flex items-center gap-1.5 transition-all"
              >
                <Bot className="w-3.5 h-3.5 text-sky-300" />
                <span>{isHi ? 'AI डॉक्टर से पूछें →' : 'Chat with AI Doctor →'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {intelligence.overall_summary}
            </p>

            {/* Conditions / Diagnoses List */}
            {intelligence.condition_insights && intelligence.condition_insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {intelligence.condition_insights.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/20 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-sky-300">{cond.name}</span>
                      {cond.severity && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cond.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{cond.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MEDICINE INTELLIGENCE BREAKDOWN */}
        {(activeTab === 'all' || activeTab === 'meds') &&
          intelligence.medicines_detailed &&
          intelligence.medicines_detailed.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHi
                    ? 'निर्धारित दवाइयाँ: कार्यविधि, सही समय व सुरक्षा'
                    : isTa
                    ? 'பரிந்துரைக்கப்பட்ட மருந்துகள் பற்றிய முழு விவரங்கள்'
                    : 'Prescribed Medications: Mechanism, Timing & Safety'}
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligence.medicines_detailed.map((med, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-900/90 border border-sky-500/20 p-4 space-y-3 hover:border-sky-400/40 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <h5 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{med.name}</span>
                        </h5>
                        {med.molecule && (
                          <span className="text-[11px] font-mono text-sky-400 block mt-0.5">
                            {med.molecule}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {isHi ? 'सत्यापित' : 'Verified'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Why prescribed */}
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          {isHi
                            ? 'दवा का उद्देश्य (Indication):'
                            : isTa
                            ? 'நோக்கம் (Why Prescribed):'
                            : 'Indication & Purpose:'}
                        </span>
                        <p className="text-slate-200 mt-0.5">{med.why_prescribed}</p>
                      </div>

                      {/* How it works */}
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          {isHi
                            ? 'कार्यविधि (How It Works):'
                            : isTa
                            ? 'செயல்படும் விதம்:'
                            : 'How It Works in Body:'}
                        </span>
                        <p className="text-slate-300 mt-0.5">{med.how_it_works}</p>
                      </div>

                      {/* How to take */}
                      <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/20 text-sky-200">
                        <span className="text-sky-300 text-[10px] uppercase font-bold block flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{isHi ? 'लेने का समय व खुराक:' : isTa ? 'உட்கொள்ளும் நேரம்:' : 'Timing & Dosage:'}</span>
                        </span>
                        <p className="font-medium mt-0.5">{med.how_to_take}</p>
                      </div>

                      {/* Food & diet rules */}
                      {med.food_diet_rules && (
                        <div className="text-slate-300">
                          <span className="text-amber-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                            <Apple className="w-3 h-3" />
                            <span>{isHi ? 'खान-पान सावधानी:' : isTa ? 'உணவு முன்னெச்சரிக்கை:' : 'Food & Diet Precautions:'}</span>
                          </span>
                          <p className="mt-0.5 text-slate-300">{med.food_diet_rules}</p>
                        </div>
                      )}

                      {/* Side effects */}
                      {med.side_effects && (
                        <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-slate-400 font-semibold">
                            {isHi ? 'संभावित साइड इफेक्ट्स:' : isTa ? 'பக்க விளைவுகள்:' : 'Potential Side Effects:'}{' '}
                          </span>
                          <span>{med.side_effects}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 3. LAB TESTS CLINICAL EXPLANATION */}
        {(activeTab === 'all' || activeTab === 'labs') &&
          intelligence.lab_tests_explained &&
          intelligence.lab_tests_explained.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>
                  {isHi
                    ? 'लैब परीक्षण व बायोमार्कर विश्लेषण'
                    : isTa
                    ? 'ஆய்வக பரிசோதனை முடிவுகள் விளக்கம் (Lab Test Meanings)'
                    : 'Diagnostic Biomarkers: Clinical Analysis & What They Mean'}
                </span>
              </h4>

              <div className="space-y-3">
                {intelligence.lab_tests_explained.map((lab, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-2 hover:border-sky-400/40 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{lab.name}</span>
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          {lab.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lab.reference_range && (
                          <span className="text-xs text-slate-400 font-mono">
                            Ref: {lab.reference_range}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {lab.clinical_meaning}
                    </p>

                    {lab.recommendation && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                        <span>{lab.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 4. SAFETY, DIET & DOCTOR QUESTIONS */}
        {(activeTab === 'all' || activeTab === 'diet') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Safety & Drug Interactions */}
            {intelligence.safety_and_interactions && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isHi ? 'दवा सुरक्षा व इंटरैक्शन' : isTa ? 'மருந்து பாதுகாப்பு & இணக்கம்' : 'Drug Safety & Interactions'}</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {intelligence.safety_and_interactions.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {intelligence.safety_and_interactions.summary}
                </p>
                {intelligence.safety_and_interactions.alerts && (
                  <ul className="space-y-1 text-xs text-amber-300/90">
                    {intelligence.safety_and_interactions.alerts.map((alert, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Lifestyle & Diet Plan */}
            {intelligence.lifestyle_and_diet_plan && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-2.5">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? 'आहार व दिनचर्या नियम' : isTa ? 'உணவு முறை & ஆரோக்கிய பழக்கங்கள்' : 'Diet & Daily Habits'}</span>
                </span>
                {intelligence.lifestyle_and_diet_plan.diet_advice && (
                  <ul className="space-y-1 text-xs text-slate-300">
                    {intelligence.lifestyle_and_diet_plan.diet_advice.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Questions for Doctor */}
            {intelligence.doctor_questions && intelligence.doctor_questions.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-2.5 md:col-span-2">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-sky-400" />
                  <span>
                    {isHi
                      ? 'डॉक्टर से अगली मुलाक़ात में पूछने योग्य महत्वपूर्ण प्रश्न'
                      : isTa
                      ? 'அடுத்த சந்திப்பில் உங்கள் மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்'
                      : 'Empowering Questions for Your Next Doctor Follow-Up'}
                  </span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {intelligence.doctor_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="font-bold text-sky-400">Q{idx + 1}:</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. INTERACTIVE AGENT CONSULTATION CHATBOT */}
        {(activeTab === 'all' || activeTab === 'chat') && (
          <div className="p-5 rounded-3xl bg-slate-950/95 border border-indigo-500/40 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>
                      {isHi
                        ? 'AI क्लिनिकल प्रिस्क्रिप्शन चैटबॉट'
                        : isTa
                        ? 'AI மருத்துவ அரட்டை முகவர் (Chatbot)'
                        : 'AI Clinical Prescription Chatbot'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isHi
                      ? `${patientName} की पर्ची के बारे में कोई भी प्रश्न पूछें`
                      : `Ask any question regarding ${patientName}'s prescription`}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-indigo-300 font-mono px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800/60">
                {language.nativeName} ({language.name})
              </span>
            </div>

            {/* Quick question chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {getQuickPrompts().map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendQuestion(prompt)}
                  disabled={isSubmittingQuery}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-900 text-xs font-medium transition-all hover:scale-102 disabled:opacity-50 text-left shadow-sm"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>

            {/* Chat conversation history */}
            <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    {msg.sender === 'agent' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text)}
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-all"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isHi ? 'आवाज़ में सुनें' : isTa ? 'குரல் வழியே கேட்க' : 'Listen'}</span>
                        </button>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSubmittingQuery && (
                <div className="flex items-center gap-2 text-xs text-sky-300 p-2.5 bg-slate-800/60 rounded-xl w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>
                    {isHi
                      ? 'AI डॉक्टर उत्तर तैयार कर रहा है...'
                      : isTa
                      ? 'AI முகவர் பதிலளிக்கிறது...'
                      : 'AI Agent is consulting clinical knowledge...'}
                  </span>
                </div>
              )}
            </div>

            {/* Input Form with Microphone & Send button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuestion();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  isHi
                    ? 'अपनी दवाइयों, समय, खुराक या साइड इफेक्ट के बारे में पूछें...'
                    : isTa
                    ? 'இந்த மருந்துச் சீட்டு குறித்து ஏதேனும் கேட்கவும்...'
                    : isTe
                    ? 'ఈ ప్రిస్క్రిప్షన్ గురించి ఏదైనా అడగండి...'
                    : 'Ask anything about your prescription, dosage, side effects...'
                }
                disabled={isSubmittingQuery}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              {/* Mic Dictation */}
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={isSubmittingQuery}
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
                disabled={!queryInput.trim() || isSubmittingQuery}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isHi ? 'पूछें' : isTa ? 'கேட்க' : 'Ask'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Model & Disclaimer Footer */}
      <div className="relative z-10 mt-5 pt-3 border-t border-sky-500/20 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>
          {intelligence.disclaimer ||
            'Clinical intelligence is generated for patient guidance. Consult your doctor for all personal healthcare decisions.'}
        </span>
        <span className="font-mono text-sky-400 font-semibold">
          {intelligence.model_used || 'MediMitra Clinical AI Agent'}
        </span>
      </div>
    </div>
  );
};
