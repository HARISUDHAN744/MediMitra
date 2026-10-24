import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Dna,
  TrendingUp,
  MapPin,
  Mic,
  Pill,
  FolderArchive,
  QrCode,
  LogOut,
  X,
  HeartPulse,
  ChevronDown,
  Activity,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { UserProfile } from '../types/user';
import { LanguageDetail, CURATED_LANGUAGES, getUiTranslations } from '../services/languageService';

export type NavSection =
  | 'dashboard'
  | 'ai_chat'
  | 'prescription_ai'
  | 'lab_diagnostics'
  | 'live_rates'
  | 'health_map'
  | 'donation_hub'
  | 'voice_assistant'
  | 'medication_schedule'
  | 'patient_vault'
  | 'qr_medical_id';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  user: UserProfile;
  onLogout: () => void;
  selectedLanguage: LanguageDetail;
  onLanguageChange: (lang: LanguageDetail) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  user,
  onLogout,
  selectedLanguage,
  onLanguageChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = getUiTranslations(selectedLanguage.code);

  const navItems = [
    {
      id: 'dashboard' as NavSection,
      label: t.dashboardNav || 'Dashboard',
      icon: LayoutDashboard,
      subtitle: 'Clinical Overview',
    },
    {
      id: 'ai_chat' as NavSection,
      label: selectedLanguage.code === 'ta' ? 'மருத்துவ AI வழிகாட்டி' : (t.medicalAiChatNav || 'Medical AI Q&A'),
      icon: Sparkles,
      badge: 'Ask AI',
      subtitle: 'Ask Any Medical Question',
    },
    {
      id: 'prescription_ai' as NavSection,
      label: t.prescriptionAiNav || 'Prescription AI',
      icon: ShieldCheck,
      subtitle: 'Vision & PDF Scanner',
    },
    {
      id: 'lab_diagnostics' as NavSection,
      label: t.labDiagnosticsNav || 'Lab Diagnostics',
      icon: Dna,
      subtitle: 'Biomarkers & Analytes',
    },
    {
      id: 'live_rates' as NavSection,
      label: t.liveRatesNav || 'Medicine Rates & Safety',
      icon: Pill,
      subtitle: 'Jan Aushadhi & openFDA',
    },
    {
      id: 'health_map' as NavSection,
      label: t.healthMapNav || 'Health Centers Map',
      icon: MapPin,
      subtitle: 'Nearby 24/7 Clinics',
    },
    {
      id: 'donation_hub' as NavSection,
      label: t.donationNav || 'Donation Hub',
      icon: HeartHandshake,
      badge: 'Hub',
      subtitle: 'Blood, Organs & Ambulance',
    },
    {
      id: 'voice_assistant' as NavSection,
      label: t.voiceAssistantNav || 'Voice AI Assistant',
      icon: Mic,
      badge: '150+ ISO',
      subtitle: 'Speech & Native TTS',
    },
    {
      id: 'medication_schedule' as NavSection,
      label: t.medicationScheduleNav || 'Medication Schedule',
      icon: Pill,
      subtitle: 'Smart Dosage Regimen',
    },
    {
      id: 'patient_vault' as NavSection,
      label: t.patientVaultNav || 'Patient Vault',
      icon: FolderArchive,
      subtitle: 'SQLite Medical History',
    },
    {
      id: 'qr_medical_id' as NavSection,
      label: t.qrMedicalIdNav || 'AI + QR System',
      icon: QrCode,
      subtitle: 'Emergency ABDM ID',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#F0F9FF] border-r border-[#BAE6FD] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="p-4 border-b border-[#BAE6FD] flex items-center justify-between bg-[#E0F2FE]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold shadow-md">
                <HeartPulse className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#0369A1] text-base tracking-wider font-mono flex items-center gap-1">
                  <span>MEDIMITRA</span>
                  <span className="text-[#0284C7]">.ai</span>
                </h2>
                <span className="text-[10px] font-mono text-[#0284C7] block -mt-0.5 font-semibold">
                  {t.clinicalIntelligenceHub || 'Clinical Intelligence Hub'}
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#BAE6FD] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clinical Status Pill */}
          <div className="px-3.5 pt-3 pb-1">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#E0F2FE] border border-[#7DD3FC] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#0369A1] font-mono text-[11px] font-bold">
                  {t.medicalCopilotStatus || 'Medical Copilot'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase bg-white px-2 py-0.5 rounded shadow-xs">
                {t.readyStatus || 'Ready'}
              </span>
            </div>
          </div>

          {/* Navigation Topics List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#0284C7] text-white shadow-md font-bold'
                      : 'text-slate-700 hover:text-[#0284C7] hover:bg-[#E0F2FE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-[#0284C7] group-hover:text-[#0369A1]'
                      }`}
                    />
                    <div className="text-left">
                      <span className="block leading-tight">{item.label}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EF4444] text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Language & User Profile */}
        <div className="p-3 border-t border-[#BAE6FD] bg-[#E0F2FE] space-y-3">
          {/* Language Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#0369A1] block px-1 font-bold">
              {t.spokenLanguage || 'Spoken Language'}
            </label>
            <div className="relative">
              <select
                value={selectedLanguage.code}
                onChange={(e) => {
                  const found = CURATED_LANGUAGES.find((l) => l.code === e.target.value);
                  if (found) onLanguageChange(found);
                }}
                className="w-full bg-white text-slate-800 border border-[#BAE6FD] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0284C7] cursor-pointer appearance-none shadow-xs"
              >
                <optgroup label="🇮🇳 Indian Languages (22 Official + Regional)">
                  {CURATED_LANGUAGES.filter((l) => l.region === 'Indian').map((l) => (
                    <option key={l.code} value={l.code} className="bg-white text-slate-800">
                      {l.flagEmoji} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌐 Global Languages">
                  {CURATED_LANGUAGES.filter((l) => l.region === 'Global').map((l) => (
                    <option key={l.code} value={l.code} className="bg-white text-slate-800">
                      {l.flagEmoji} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#BAE6FD] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate font-mono">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user.role} – {user.regionState}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title={t.signOut || 'Sign Out & Return to Login'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
