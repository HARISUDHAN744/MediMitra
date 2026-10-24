import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Database,
  ArrowUpRight,
  Globe2,
  Search,
  Zap,
  Activity,
  Mic,
  Menu,
  Pill,
  Dna,
  TrendingUp,
  MapPin,
  FolderArchive,
  QrCode,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  X,
} from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { Sidebar, NavSection } from './components/Sidebar';
import { TopNotificationCenter } from './components/TopNotificationCenter';
import { FileUpload } from './components/FileUpload';
import { SamplePicker } from './components/SamplePicker';
import { ExtractedView } from './components/ExtractedView';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { LanguageModal } from './components/LanguageModal';
import { ConditionSearchModal } from './components/ConditionSearchModal';
import { VoiceDictationModal } from './components/VoiceDictationModal';
import { LabDiagnosticsView } from './components/LabDiagnosticsView';
import { LiveRatesView } from './components/LiveRatesView';
import { HealthCentersMapView } from './components/HealthCentersMapView';
import { DonationHubView } from './components/DonationHubView';
import { MedicationScheduleView } from './components/MedicationScheduleView';
import { PatientVaultView } from './components/PatientVaultView';
import { QrMedicalIdView } from './components/QrMedicalIdView';
import { MedicalAiChatView } from './components/MedicalAiChatView';
import { FloatingAiChatbot } from './components/FloatingAiChatbot';
import { UserProfile, DEFAULT_USER } from './types/user';
import { autoSaveDocumentToVault } from './services/vaultService';
import {
  uploadMedicalDocument,
  fetchAvailableSamples,
  checkBackendHealth,
} from './services/api';
import {
  CURATED_LANGUAGES,
  LanguageDetail,
  getUiTranslations,
  getGlobalLanguageDetails,
} from './services/languageService';
import { UploadResponse, SampleDoc } from './types/medical';

export const App: React.FC = () => {
  // Page 1 vs Page 2 State: Check localStorage for logged-in user profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('medimitra_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Navigation
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Document Upload & Extraction State
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<UploadResponse | null>(null);
  const [samples, setSamples] = useState<SampleDoc[]>([]);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [vaultNotice, setVaultNotice] = useState<{ title: string; message: string; isNewFolder: boolean } | null>(null);

  // Language Detail
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageDetail>(CURATED_LANGUAGES[0]); // Hindi / English / Tamil

  // Backend Health State
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    has_api_key: boolean;
    model_configured: string;
  } | null>(null);

  const t = getUiTranslations(selectedLanguage.code);

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const health = await checkBackendHealth();
      setBackendHealth(health);
    } catch {
      setBackendHealth(null);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await checkHealth();
      try {
        const sampleList = await fetchAvailableSamples();
        setSamples(sampleList);
      } catch (err) {
        console.warn('Could not load samples list:', err);
      }
    };

    initApp();
    const interval = setInterval(checkHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle Login & Logout
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveSection('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('medimitra_user_profile');
    setCurrentUser(null);
  };

  // Auto-Save report into Vault and Auto-Create folder for the user
  const handleSaveReportToVault = (result: UploadResponse) => {
    try {
      const sync = autoSaveDocumentToVault(result, currentUser);
      if (sync.isNewFolder) {
        setVaultNotice({
          title: '📁 New User Folder Created in Vault',
          message: `Created new folder "${sync.folder.name}" for ${sync.folder.patientName} & stored document safely in Vault!`,
          isNewFolder: true,
        });
      } else {
        setVaultNotice({
          title: '📁 Medical Document Stored in Vault',
          message: `Organized and stored report into "${sync.folder.name}".`,
          isNewFolder: false,
        });
      }
      setTimeout(() => setVaultNotice(null), 5000);
    } catch (err) {
      console.warn('Auto-save to vault error:', err);
    }
  };

  // Upload Handlers
  const handleFileSelect = async (file: File) => {
    setActiveFile(file);
    setError(null);
    setIsLoading(true);
    setLoadingStep('1. Computing SHA-256 hash & checking SQLite database cache...');

    try {
      setTimeout(() => {
        setLoadingStep('2. Analyzing document with Gemini AI Multimodal Vision...');
      }, 500);

      const result = await uploadMedicalDocument(file);
      setExtractedResult(result);
      handleSaveReportToVault(result);
      if (activeSection !== 'prescription_ai') {
        setActiveSection('prescription_ai');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'An error occurred during medical extraction.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectSample = async (sample: SampleDoc) => {
    setError(null);
    setIsLoading(true);
    setLoadingStep(`Loading sample: ${sample.title}...`);

    try {
      if (sample.image_file) {
        try {
          const imgResp = await fetch(`/samples-files/${sample.image_file}`);
          if (imgResp.ok) {
            const blob = await imgResp.blob();
            const sampleFile = new File([blob], sample.image_file, { type: 'image/png' });
            setActiveFile(sampleFile);
            setLoadingStep('Running AI Multimodal Vision extraction pipeline...');
            const result = await uploadMedicalDocument(sampleFile);
            setExtractedResult(result);
            handleSaveReportToVault(result);
            setActiveSection('prescription_ai');
            return;
          }
        } catch {
          // fallback
        }
      }

      const simulatedResponse: UploadResponse = {
        success: true,
        message: 'Loaded sample document preview.',
        file_hash: 'sample-simulated-hash-12345',
        filename: sample.json_file,
        file_size_bytes: 1024,
        mime_type: 'application/json',
        is_cached: false,
        is_fallback: false,
        model_used: backendHealth?.model_configured || 'gemini-3.5-flash',
        data: sample.preview,
        created_at: new Date().toISOString(),
      };
      setExtractedResult(simulatedResponse);
      handleSaveReportToVault(simulatedResponse);
      setActiveSection('prescription_ai');
    } catch (err: any) {
      console.error('Error loading sample:', err);
      setError(err.message || 'Could not load sample.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleClear = () => {
    setActiveFile(null);
    setExtractedResult(null);
    setError(null);
  };


  // PAGE 1: Authentication Portal if not logged in
  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        activeLanguage={selectedLanguage}
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
      />
    );
  }

  // PAGE 2: Main Application Dashboard with Left Sidebar
  return (
    <div className="min-h-screen bg-white medical-bg flex text-slate-800 selection:bg-[#328CC1] selection:text-white">
      {/* 150+ Language Selector Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        activeLanguage={selectedLanguage}
        onSelectLanguage={(lang) => setSelectedLanguage(lang)}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* NIH Condition & ICD-10 Search Modal */}
      <ConditionSearchModal
        isOpen={isConditionModalOpen}
        initialQuery=""
        onClose={() => setIsConditionModalOpen(false)}
      />

      {/* Universal Voice Dictation & Audio Consultation Modal */}
      <VoiceDictationModal
        isOpen={isVoiceModalOpen}
        selectedLanguage={selectedLanguage}
        onClose={() => setIsVoiceModalOpen(false)}
        onExtractionComplete={(res) => {
          setExtractedResult(res);
          handleSaveReportToVault(res);
          setActiveFile(null);
          setError(null);
          setActiveSection('prescription_ai');
        }}
      />

      {/* Left Sidebar Layout */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        user={currentUser}
        onLogout={handleLogout}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 bg-slate-50/50">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 border-b border-[#BAE6FD] shadow-xs">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Mobile Menu Toggle + Current Section Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 rounded-xl bg-[#E0F2FE] text-[#0369A1] hover:text-[#0284C7] border border-[#BAE6FD] lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[#0369A1] text-base sm:text-lg tracking-wider font-mono">
                  {activeSection === 'dashboard'
                    ? (t.dashboardNav || 'Dashboard')
                    : activeSection === 'ai_chat'
                    ? (selectedLanguage.code === 'ta' ? 'மருத்துவ AI வழிகாட்டி' : 'Medical AI Agent')
                    : activeSection === 'prescription_ai'
                    ? (t.prescriptionAiNav || 'Prescription AI')
                    : activeSection === 'lab_diagnostics'
                    ? (t.labDiagnosticsNav || 'Lab Diagnostics')
                    : activeSection === 'live_rates'
                    ? (t.liveRatesNav || 'Live Rates & Safety')
                    : activeSection === 'health_map'
                    ? (t.healthMapNav || 'Health Centers Map')
                    : activeSection === 'voice_assistant'
                    ? (t.voiceAssistantNav || 'Voice AI Assistant')
                    : activeSection === 'medication_schedule'
                    ? (t.medicationScheduleNav || 'Medication Schedule')
                    : activeSection === 'patient_vault'
                    ? (t.patientVaultNav || 'Patient Vault')
                    : activeSection === 'qr_medical_id'
                    ? (t.qrMedicalIdNav || 'Emergency QR ID Model')
                    : (activeSection as string).replace('_', ' ')}
                </h1>
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] font-semibold">
                  {t.medicalCopilotStatus || 'Clinical AI Copilot'}
                </span>
              </div>
            </div>

            {/* Right Controls: Ask AI + Voice Assistant + ICD-10 + Language + Backend Indicator */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ask Medical AI Q&A Button */}
              <button
                type="button"
                onClick={() => setActiveSection('ai_chat')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  activeSection === 'ai_chat'
                    ? 'bg-[#0284C7] text-white ring-2 ring-[#BAE6FD]'
                    : 'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] border border-[#BAE6FD]'
                }`}
                title="Ask Any Medical Question to AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {selectedLanguage.code === 'ta' ? 'மருத்துவ AI' : 'Ask AI Agent'}
                </span>
              </button>

              {/* Voice Dictation Button (CTA Accent Coral) */}
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white transition-all shadow-xs hover:scale-105"
                title="Voice Doctor Consultation & Dictation"
              >
                <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="hidden md:inline">{t.voiceAssistantBtn || 'Voice'}</span>
              </button>

              {/* NIH ICD-10 Lookup Button */}
              <button
                type="button"
                onClick={() => setIsConditionModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#E0F2FE] border border-[#BAE6FD] text-xs text-[#0369A1] font-semibold transition-all shadow-xs"
              >
                <Database className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{t.nihIcd10Btn || 'NIH ICD-10'}</span>
              </button>

              {/* Clinical Notifications & Tablet Reminders Bell */}
              <button
                type="button"
                onClick={() => setIsNotificationDrawerOpen((prev) => !prev)}
                className={`relative p-2 rounded-xl transition-all shadow-xs border flex items-center justify-center cursor-pointer ${
                  isNotificationDrawerOpen
                    ? 'bg-[#0284C7] text-white border-[#0284C7]'
                    : 'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] border-[#BAE6FD]'
                }`}
                title="Clinical Alerts & Tablet Reminders"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  !
                </span>
              </button>

              {/* 150+ Language Switcher */}
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#BAE6FD] text-xs font-bold text-[#0369A1] transition-all shadow-xs"
              >
                <Globe2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{selectedLanguage.flagEmoji} {selectedLanguage.nativeName}</span>
              </button>

              {/* Backend Indicator */}
              {backendHealth ? (
                <div
                  className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-xs text-emerald-800"
                  title="FastAPI Backend Online"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-mono font-bold hidden sm:inline">
                    Online
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs text-amber-800"
                  title="Backend Connecting..."
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="text-[11px] font-mono hidden sm:inline">Syncing...</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Top Clinical & Medication Notification Center (Tablets to take, schedule, precautions, follow-ups) */}
        <TopNotificationCenter
          language={selectedLanguage}
          extractedResult={extractedResult}
          onNavigate={(sec) => setActiveSection(sec)}
          isExpandedExternal={isNotificationDrawerOpen}
          onToggleExpand={() => setIsNotificationDrawerOpen((prev) => !prev)}
        />

        {/* Dynamic Body Content according to active sidebar section */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Banner (Clean light blue clinical gradient) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD] border border-[#BAE6FD] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#0369A1] border border-[#BAE6FD] text-xs font-mono font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>{t.verifiedClinicalPortal || 'Verified Clinical Portal'} • {currentUser.role}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0369A1] font-mono tracking-wide">
                    {t.welcomeBack || 'Welcome back'}, {currentUser.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-sans max-w-xl leading-relaxed font-medium">
                    {t.welcomeSubtitle || 'Your Multilingual Health Copilot is ready. Upload medical prescriptions, lab reports, or dictate voice notes in'}{' '}
                    <strong className="text-[#0369A1] bg-white px-2 py-0.5 rounded font-bold border border-[#BAE6FD]">
                      {selectedLanguage.nativeName} ({selectedLanguage.name})
                    </strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection('prescription_ai')}
                    className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t.uploadMedicalDocBtn || 'Upload Medical Doc'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Metric Cards (Clean White with Light Blue #0284C7 & Sky Accents) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveSection('ai_chat')}
                  className="p-5 rounded-2xl bg-white border border-[#BAE6FD] hover:border-[#0284C7] shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2.5 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#0284C7] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    AI AGENT
                  </div>
                  <div className="p-3 rounded-xl bg-[#E0F2FE] text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all w-fit shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#0284C7] group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#0284C7] font-bold uppercase font-mono">
                      {selectedLanguage.code === 'ta' ? 'மருத்துவ AI' : 'Medical AI Agent'}
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedLanguage.code === 'ta' ? 'எதையும் கேளுங்கள்' : 'Ask Any Question'}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('prescription_ai')}
                  className="p-5 rounded-2xl bg-white border border-[#BAE6FD] hover:border-[#0284C7] shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="p-3 rounded-xl bg-[#E0F2FE] text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all w-fit shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#0284C7] font-bold uppercase font-mono">{t.prescriptionAiNav || 'Prescription AI'}</p>
                    <p className="text-sm font-bold text-slate-800">{t.multimodalVisionCard || 'Multimodal Vision'}</p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('lab_diagnostics')}
                  className="p-5 rounded-2xl bg-white border border-[#BAE6FD] hover:border-[#0284C7] shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="p-3 rounded-xl bg-[#E0F2FE] text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all w-fit shadow-xs">
                    <Dna className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#0284C7] font-bold uppercase font-mono">{t.labDiagnosticsNav || 'Biomarker Lab'}</p>
                    <p className="text-sm font-bold text-slate-800">{t.standardAnalytesCard || '15 Standard Analytes'}</p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveSection('qr_medical_id')}
                  className="p-5 rounded-2xl bg-white border border-[#BAE6FD] hover:border-[#0284C7] shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="p-3 rounded-xl bg-[#E0F2FE] text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-all w-fit shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#0284C7] font-bold uppercase font-mono">{t.qrMedicalIdNav || 'Emergency ID'}</p>
                    <p className="text-sm font-bold text-slate-800">{t.emergencyIdCard || 'Live QR Model'}</p>
                  </div>
                </div>
              </div>

              {/* Fast File Upload Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284C7]" />
                    <span>{t.quickDocScanner || 'Quick Medical Document Scanner'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSection('prescription_ai')}
                    className="text-xs text-[#0284C7] hover:text-[#0369A1] font-bold hover:underline font-mono"
                  >
                    {t.openFullScanner || 'Open Full Scanner →'}
                  </button>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  isLoading={isLoading}
                  activeFile={activeFile}
                  onClear={handleClear}
                  language={selectedLanguage}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                />
              </div>

              {/* Synthetic Sample Pickers */}
              <SamplePicker
                samples={samples}
                onSelectSample={handleSelectSample}
                isLoading={isLoading}
                language={selectedLanguage}
              />
            </div>
          )}

          {/* 1.5 MEDICAL AI CHAT & KNOWLEDGE COPILOT */}
          {activeSection === 'ai_chat' && (
            <MedicalAiChatView language={selectedLanguage} />
          )}

          {/* 2. PRESCRIPTION AI VISION EXTRACTION */}
          {activeSection === 'prescription_ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-mono">
                    Prescription AI & Multimodal Vision Engine
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload handwritten or digital doctor prescriptions, pathology reports, and radiology scans.
                  </p>
                </div>

                {extractedResult && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-[#328CC1] shadow-sm transition-all"
                  >
                    Scan New Document
                  </button>
                )}
              </div>

              {!extractedResult && (
                <>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isLoading={isLoading}
                    activeFile={activeFile}
                    onClear={handleClear}
                    language={selectedLanguage}
                    onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  />

                  <SamplePicker
                    samples={samples}
                    onSelectSample={handleSelectSample}
                    isLoading={isLoading}
                    language={selectedLanguage}
                  />
                </>
              )}

              {/* Extraction Progress Indicator */}
              {isLoading && (
                <div className="p-8 rounded-2xl bg-white border border-sky-300 text-center space-y-3 shadow-md">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-600" />
                  <p className="text-base font-mono font-bold text-slate-900">{loadingStep}</p>
                  <p className="text-xs text-slate-500">
                    Verifying deduplication hash, parsing clinical entities, and mapping ICD-10 diagnostics...
                  </p>
                </div>
              )}

              {/* Extracted Clinical View */}
              {extractedResult && (
                <ExtractedView result={extractedResult} language={selectedLanguage} />
              )}
            </div>
          )}

          {/* 3. LAB DIAGNOSTICS & BIOMARKER ANALYZER */}
          {activeSection === 'lab_diagnostics' && (
            <LabDiagnosticsView language={selectedLanguage} />
          )}

          {/* 4. MEDICINE KNOWLEDGE BASE, RATES & DRUG SAFETY */}
          {activeSection === 'live_rates' && (
            <LiveRatesView
              language={selectedLanguage}
              onNavigateToMap={() => setActiveSection('health_map')}
            />
          )}

          {/* 5. HEALTH CENTERS & CLINICS MAP */}
          {activeSection === 'health_map' && (
            <HealthCentersMapView language={selectedLanguage} userRegion={currentUser.regionState} currentUser={currentUser} />
          )}

          {/* 5.5 DONATION HUB & EMERGENCY SERVICES (PHASE 14A) */}
          {activeSection === 'donation_hub' && (
            <DonationHubView
              language={selectedLanguage}
              userCountry="IN"
              onNavigateToSection={(s) => setActiveSection(s as NavSection)}
            />
          )}

          {/* 6. VOICE AI ASSISTANT */}
          {activeSection === 'voice_assistant' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white border border-sky-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-white shadow-sm">
                    <Mic className="w-8 h-8 animate-pulse text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-wide">
                        Multilingual Voice AI Doctor Assistant
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                        Whisper-1 + Gemini
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-sky-100 mt-1">
                      Real-time audio transcription and speech synthesis in {selectedLanguage.nativeName} ({selectedLanguage.name}).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#D9534F] hover:bg-[#C9302C] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0"
                >
                  <Mic className="w-4 h-4" />
                  <span>Launch Voice Dictation Studio</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-sky-800 font-mono">99+ Spoken Languages</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Supports all 22 official Indian scheduled languages (Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, etc.) with native dialects.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-sky-800 font-mono">🔊 Native Text-to-Speech</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Audio voice playback reads medication prescriptions and clinical remarks out loud in the patient's native mother tongue.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-sky-800 font-mono">Clinical Entity Extraction</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Converts spoken verbal doctor-patient consultations directly into structured JSON medical records with ICD-10 codes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. MEDICATION SCHEDULE & DOSAGE GUIDE */}
          {activeSection === 'medication_schedule' && (
            <MedicationScheduleView language={selectedLanguage} />
          )}

          {/* 8. PATIENT MEDICAL VAULT */}
          {activeSection === 'patient_vault' && (
            <PatientVaultView
              language={selectedLanguage}
              onSelectSavedDocument={(res) => {
                setExtractedResult(res);
                setActiveSection('prescription_ai');
              }}
            />
          )}

          {/* 9. AI + QR MEDICAL ID CARD */}
          {activeSection === 'qr_medical_id' && (
            <QrMedicalIdView user={currentUser} language={selectedLanguage} />
          )}

          {/* Medical Disclaimer */}
          <MedicalDisclaimer language={selectedLanguage} />
        </main>
      </div>

      {/* Auto-Vault Notification Toast */}
      {vaultNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-sky-400/40 flex items-start gap-3.5 max-w-md animate-in fade-in slide-in-from-top-4">
          <div className={`p-2.5 rounded-xl ${vaultNotice.isNewFolder ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'} shrink-0`}>
            <FolderArchive className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{vaultNotice.title}</span>
              {vaultNotice.isNewFolder && (
                <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                  AUTO-CREATED FOLDER
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {vaultNotice.message}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('patient_vault');
                  setVaultNotice(null);
                }}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Open in Patient Vault <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVaultNotice(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Floating 24/7 AI Medical Chatbot */}
      <FloatingAiChatbot
        language={selectedLanguage}
        activePrescription={extractedResult?.data}
        onOpenFullChat={() => setActiveSection('ai_chat')}
      />
    </div>
  );
};

export default App;
