import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  MapPin,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Lock,
  Smartphone,
  Cpu,
  Zap,
  Activity,
  Award,
  Send,
  RotateCw,
  MessageSquare,
  AlertCircle,
  Mail,
  Search,
  ExternalLink,
  Info,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, DEFAULT_USER } from '../types/user';
import { LanguageDetail, CURATED_LANGUAGES, getUiTranslations } from '../services/languageService';
import {
  IsoCountry,
  ISO_COUNTRIES,
  getDefaultCountryFromLocale,
  getCountryHealthProfile,
  validatePhoneNumberForCountry,
  getSubdivisionsForCountry,
  getSubdivisionLabelForCountry,
} from '../services/countryService';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  activeLanguage: LanguageDetail;
  onLanguageChange: (lang: LanguageDetail) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  activeLanguage,
  onLanguageChange,
}) => {
  const t = getUiTranslations(activeLanguage.code);
  const [authStep, setAuthStep] = useState<'profile' | 'otp'>('profile');
  const [fullName, setFullName] = useState(DEFAULT_USER.name);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Patient');

  // 1. Full ISO 3166 Country Selection (Flag-free, native names, dial code)
  const [selectedCountry, setSelectedCountry] = useState<IsoCountry>(() => getDefaultCountryFromLocale());
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // 2. State / Provinces / Administrative Subdivisions based on selected country
  const availableSubdivisions = useMemo(() => {
    return getSubdivisionsForCountry(selectedCountry.code);
  }, [selectedCountry.code]);

  const subdivisionLabel = useMemo(() => {
    return getSubdivisionLabelForCountry(selectedCountry.code);
  }, [selectedCountry.code]);

  const [regionState, setRegionState] = useState(() => {
    const defaultCountry = getDefaultCountryFromLocale();
    const subs = getSubdivisionsForCountry(defaultCountry.code);
    return subs[0] || DEFAULT_USER.regionState;
  });

  // Automatically update subdivision state when user switches country
  useEffect(() => {
    const subs = getSubdivisionsForCountry(selectedCountry.code);
    if (!subs.includes(regionState)) {
      setRegionState(subs[0] || 'Capital Territory');
    }
  }, [selectedCountry.code]);

  // 3. Phone Number & libphonenumber-js Validation
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const phoneValidation = useMemo(() => {
    return validatePhoneNumberForCountry(phoneNumber, selectedCountry.code);
  }, [phoneNumber, selectedCountry.code]);

  // 4. Country Health Profile & Official Resources
  const countryProfile = useMemo(() => {
    return getCountryHealthProfile(selectedCountry.code);
  }, [selectedCountry.code]);

  // ABHA linking status for India
  const [abhaLinked, setAbhaLinked] = useState(true);
  const [abhaId, setAbhaId] = useState('91-4821-9920-1123');
  const [isLinkingAbha, setIsLinkingAbha] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['9', '8', '2', '1', '4', '0']);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);

  // Filtered countries for search modal
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.toLowerCase().trim();
    if (!q) return ISO_COUNTRIES;
    return ISO_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phoneCode.includes(q)
    );
  }, [countrySearchQuery]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (authStep === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);


  // Mock ABHA Link Action
  const handleLinkAbha = () => {
    setIsLinkingAbha(true);
    setTimeout(() => {
      setAbhaLinked(true);
      setAbhaId(`91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsLinkingAbha(false);
    }, 700);
  };

  // Dispatch SMS OTP
  const handleSendSmsOtp = async () => {
    if (!phoneValidation.isValid) {
      setErrorMessage(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }

    setIsSendingSms(true);
    setErrorMessage(null);

    const fullInternationalNumber = phoneValidation.formattedE164 || `${selectedCountry.phoneCode} ${phoneNumber}`;

    try {
      // NOTE: Strictly exclude religion/cultural preferences from API request bodies and logs
      const res = await fetch('http://localhost:8000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: fullInternationalNumber,
          name: fullName,
          country_code: selectedCountry.code,
        }),
      }).catch(() => null);

      let serverOtp = '982140';
      if (res && res.ok) {
        const data = await res.json();
        if (data.otp) serverOtp = data.otp;
      }

      setSmsSentNotice(`📲 SMS Gateway: Verification PIN ${serverOtp} dispatched to ${fullInternationalNumber}`);
      setOtpDigits(serverOtp.split(''));
      setCountdown(30);
      setCanResend(false);
      setAuthStep('otp');
    } catch {
      setSmsSentNotice(`📲 SMS Gateway: Verification PIN 982140 dispatched to ${fullInternationalNumber}`);
      setAuthStep('otp');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phoneValidation.isValid) {
      setErrorMessage(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }
    handleSendSmsOtp();
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      const pasted = val.replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const next = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          next[i] = pasted[i] || '';
        }
        setOtpDigits(next);
        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const next = [...otpDigits];
    next[index] = val.replace(/[^0-9]/g, '');
    setOtpDigits(next);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    const fullInternationalNumber = phoneValidation.formattedE164 || `${selectedCountry.phoneCode} ${phoneNumber}`;

    try {
      // NOTE: Strictly exclude religion from API request logs
      await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: fullInternationalNumber, otp: enteredCode }),
      }).catch(() => null);

      setTimeout(() => {
        const verifiedProfile: UserProfile = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          name: fullName.trim() || 'Gokul T',
          email: email.trim() || 'patient@medimitra.ai',
          phoneNumber: fullInternationalNumber,
          role,
          regionState,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          medicalId: `MM-${selectedCountry.iso3}-${regionState.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          isVerified: true,
          abhaLinked: selectedCountry.code === 'IN' ? abhaLinked : false,
          abhaId: selectedCountry.code === 'IN' && abhaLinked ? abhaId : undefined,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem('medimitra_user_profile', JSON.stringify(verifiedProfile));
        setIsVerifying(false);
        onLoginSuccess(verifiedProfile);
      }, 600);
    } catch {
      setIsVerifying(false);
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  const handleFastDemoLogin = () => {
    const profile = {
      ...DEFAULT_USER,
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      regionState,
    };
    localStorage.setItem('medimitra_user_profile', JSON.stringify(profile));
    onLoginSuccess(profile);
  };

  return (
    <div className="min-h-screen bg-white medical-bg flex flex-col justify-between text-slate-800 selection:bg-[#328CC1] selection:text-white relative overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1] z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-md">
            <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[#0369A1] text-lg tracking-wider font-mono">
                MediMitra<span className="text-[#0284C7]">.ai</span>
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#0284C7] border border-[#BAE6FD]">
                ISO 3166 Global Health
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">
              Universal Clinical Intelligence & Verified Country Health Directory
            </p>
          </div>
        </div>

        {/* Language Selection Ribbon & Demo Login */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#BAE6FD]">
            <Globe2 className="w-3.5 h-3.5 text-[#0284C7]" />
            <select
              value={activeLanguage.code}
              onChange={(e) => {
                const found = CURATED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              className="bg-transparent text-xs text-slate-800 focus:outline-hidden cursor-pointer font-medium max-w-[170px] truncate"
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
          </div>

          <button
            type="button"
            onClick={handleFastDemoLogin}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white transition-all shadow-xs hover:scale-105"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Demo Login</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0EA5E9]" />

          {authStep === 'profile' ? (
            <div className="space-y-6">
              {/* Heading */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-xs text-[#0369A1] font-mono font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Step 1 of 2: Clinician & Patient Country Profile</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-mono">
                  Welcome to MediMitra AI
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Access AI Prescription Vision, Biomarker Diagnostics, and official health resources for your country.
                </p>
              </div>

              {/* Onboarding Form */}
              <form onSubmit={handleProceedToOtp} className="space-y-4">
                {/* 1. Country Selection (Searchable ISO 3166 List with Native Names, Flag-free) */}
                <div className="space-y-1.5 relative" ref={countryDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Country (ISO 3166-1 Directory)</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">196 Sovereign Nations</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-left text-xs text-slate-900 flex items-center justify-between hover:border-[#0284C7] focus:outline-hidden"
                  >
                    <div>
                      <strong className="text-slate-900">{selectedCountry.name}</strong>{' '}
                      <span className="text-slate-500 font-sans">({selectedCountry.nativeName})</span>{' '}
                      <span className="text-[11px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded ml-1">
                        {selectedCountry.phoneCode}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs">Change ▾</span>
                  </button>

                  {/* Dropdown with Real-Time Search */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 p-2 max-h-72 overflow-hidden flex flex-col">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={countrySearchQuery}
                          onChange={(e) => setCountrySearchQuery(e.target.value)}
                          placeholder="Search 196 countries by name, native script, or dial code..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#0284C7]"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              const subs = getSubdivisionsForCountry(c.code);
                              setRegionState(subs[0] || 'Capital Territory');
                              setIsCountryDropdownOpen(false);
                              setCountrySearchQuery('');
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors ${
                              selectedCountry.code === c.code ? 'bg-[#E0F2FE] font-bold text-[#0369A1]' : 'text-slate-800'
                            }`}
                          >
                            <div>
                              <span>{c.name}</span>{' '}
                              <span className="text-slate-400 text-[11px]">({c.nativeName})</span>
                            </div>
                            <span className="font-mono text-xs font-semibold text-slate-500">{c.phoneCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Official Health Resources for Selected Country Panel */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                      <h4 className="text-xs font-bold font-mono text-slate-900">
                        Official Health Resources for {selectedCountry.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ISO: {selectedCountry.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Health Ministry */}
                    {countryProfile.healthMinistry && (
                      <a
                        href={countryProfile.healthMinistry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] flex items-center justify-between transition-all group"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{countryProfile.healthMinistry.name}</p>
                          <p className="text-[10px] text-slate-400">Verified: {countryProfile.healthMinistry.lastVerified}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7] shrink-0 ml-1" />
                      </a>
                    )}

                    {/* Drug Regulator */}
                    {countryProfile.drugRegulator && (
                      <a
                        href={countryProfile.drugRegulator.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] flex items-center justify-between transition-all group"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{countryProfile.drugRegulator.name}</p>
                          <p className="text-[10px] text-slate-400">Verified: {countryProfile.drugRegulator.lastVerified}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7] shrink-0 ml-1" />
                      </a>
                    )}

                    {/* Organ Donation Registry */}
                    {countryProfile.organDonationRegistry && (
                      <a
                        href={countryProfile.organDonationRegistry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] flex items-center justify-between transition-all group"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{countryProfile.organDonationRegistry.name}</p>
                          <p className="text-[10px] text-slate-400">Organ Registry</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7] shrink-0 ml-1" />
                      </a>
                    )}

                    {/* Emergency Ambulance */}
                    {countryProfile.emergency && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Emergency Dispatch</p>
                          <p className="text-[10px] text-slate-500">Ambulance: {countryProfile.emergency.ambulance || '112'}</p>
                        </div>
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  {/* Specific Rule: If Country = India, show ABDM Portal Link & Mock ABHA Link Flow */}
                  {selectedCountry.code === 'IN' && (
                    <div className="p-3 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                          <span className="text-xs font-bold text-[#0369A1]">Ayushman Bharat Digital Mission (ABDM)</span>
                        </div>
                        <a
                          href="https://abdm.gov.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                        >
                          <span>abdm.gov.in</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        ABDM provides your digital ABHA (Ayushman Bharat Health Account) to share medical prescriptions
                        and diagnostic reports securely with authorized doctors and hospitals across India.
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] font-mono text-[#0369A1]">
                          ABHA Status: <strong>{abhaLinked ? `Linked (${abhaId})` : 'Not Linked'}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleLinkAbha}
                          disabled={isLinkingAbha}
                          className="px-3 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold shadow-xs transition-all"
                        >
                          {isLinkingAbha ? 'Linking...' : abhaLinked ? 'Refresh ABHA Card' : 'Link ABHA ID'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fallback WHO Country Page for countries without dedicated digital-health profile */}
                  {selectedCountry.code !== 'IN' && countryProfile.fallbackWhoUrl && (
                    <div className="pt-1 text-right">
                      <a
                        href={countryProfile.fallbackWhoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#0284C7] hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        <span>WHO {selectedCountry.name} Health Monitor</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Full Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#328CC1]" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Gokul T"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#328CC1] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#328CC1]" />
                        <span>Email Address</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Optional
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com (optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#328CC1] transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number with libphonenumber-js Validation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#328CC1]" />
                      <span>Mobile Number (with {selectedCountry.phoneCode})</span>
                    </label>
                    {phoneValidation.isValid ? (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Valid {phoneValidation.formattedNational}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600">
                        {phoneValidation.error || 'Enter valid national digits'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:border-[#0284C7] bg-white">
                    <span className="px-3 py-2.5 bg-slate-100 text-slate-600 font-mono text-xs font-bold border-r border-slate-200">
                      {selectedCountry.phoneCode}
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      className="flex-1 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Healthcare Role</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Patient', 'Doctor', 'Healthcare Worker', 'Pharmacist'] as UserProfile['role'][]).map((r) => {
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isSelected
                              ? 'bg-[#0284C7] border-[#0284C7] text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-[#38BDF8]'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic State / Province / Territory based on selected country */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>{subdivisionLabel}</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedCountry.name} ({availableSubdivisions.length})
                    </span>
                  </div>

                  <select
                    value={regionState}
                    onChange={(e) => setRegionState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-[#0284C7] cursor-pointer shadow-xs"
                  >
                    {availableSubdivisions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Continue to SMS OTP */}
                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {isSendingSms ? (
                    <span className="flex items-center gap-2 font-mono">
                      <RotateCw className="w-4 h-4 animate-spin" /> Verifying {selectedCountry.name} Number...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send SMS Verification PIN ({selectedCountry.phoneCode})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Step 2: Verification Code (SMS OTP) */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-xs text-[#0369A1] font-mono font-bold mb-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Step 2 of 2: SMS OTP Verification</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-mono">
                  Enter 6-Digit SMS Verification PIN
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Passcode dispatched to <strong className="text-[#0284C7]">{phoneValidation.formattedE164 || `${selectedCountry.phoneCode} ${phoneNumber}`}</strong>.
                </p>
              </div>

              {smsSentNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{smsSentNotice}</span>
                </div>
              )}

              {/* 6-Digit Box Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 my-4">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-hidden shadow-xs transition-all"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2 font-mono">
                      <RotateCw className="w-4 h-4 animate-spin" /> Verifying Credentials...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Enter MediMitra Clinical Hub</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('profile')}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    ← Edit Profile or Country
                  </button>

                  <button
                    type="button"
                    disabled={!canResend || isSendingSms}
                    onClick={handleSendSmsOtp}
                    className={`font-semibold ${
                      canResend ? 'text-[#0284C7] hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Resend SMS PIN' : `Resend in ${countdown}s`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>
          MediMitra complies with ISO 3166 international standards, ABDM clinical interoperability, and end-to-end data minimization.
        </p>
      </footer>
    </div>
  );
};
