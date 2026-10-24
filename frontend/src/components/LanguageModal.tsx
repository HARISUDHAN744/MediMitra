import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Globe2,
  Search,
  X,
  Check,
  Languages,
  Volume2,
  VolumeX,
  ShieldAlert,
} from 'lucide-react';
import {
  CURATED_LANGUAGES,
  LanguageDetail,
  ensureVoicesLoaded,
  hasVoiceForLanguage,
  speakMedicalText,
} from '../services/languageService';
import { playCloudTts } from '../services/safeTranscribeAudio';

// Native medical voice greetings for 1-click preview testing
const VOICE_PREVIEW_PHRASES: Record<string, string> = {
  hi: 'नमस्ते, मेडीमित्र स्वास्थ्य सहायक में आपका स्वागत है।',
  ta: 'வணக்கம், மெடிமித்ரா மருத்துவ உதவியாளருக்கு வரவேற்கிறோம்.',
  te: 'నమస్కారం, మెడిమిత్ర ఆరోగ్య సహాయకుడికి స్వాగతం.',
  kn: 'ನಮಸ್ಕಾರ, ಮೆಡಿಮಿತ್ರ ಆರೋಗ್ಯ ಸಹಾಯಕ್ಕೆ ಸ್ವಾಗತ.',
  ml: 'നമസ്കാരം, മെഡിമിത്ര ആരോഗ്യ സഹായിയിലേക്ക് സ്വാഗതം.',
  bn: 'নমস্কার, মেডিমিত্র স্বাস্থ্য সহকারীতে আপনাকে স্বাগতম।',
  mr: 'नमस्कार, मेडीमित्र आरोग्य सहाय्यकामध्ये आपले स्वागत आहे.',
  gu: 'નમસ્તે, મેડીમિત્ર આરોગ્ય સહાયકમાં આપનું સ્વાગત છે.',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਡੀਮਿੱਤਰ ਸਿਹਤ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।',
  or: 'ନମସ୍କାର, ମେଡିମିତ୍ର ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।',
  as: 'নমস্কাৰ, মেদিমিত্ৰ স্বাস্থ্য সহায়কত স্বাগতম।',
  ur: 'خوش آمدید، میڈی مترا ہیلتھ اسسٹنٹ میں آپ کا خیرمقدم ہے۔',
  sa: 'नमस्ते, मेडीमित्र स्वास्थ्य सहायके भवतां स्वागतम्।',
  ne: 'नमस्ते, मेडीमित्र स्वास्थ्य सहायकमा स्वागत छ।',
  kok: 'नमस्कार, मेडीमित्र भलायकी सहायकात तुमकां येवकार।',
  mai: 'प्रणाम, मेडीमित्र स्वास्थ्य सहायक मे अहाँक स्वागत अछि।',
  sat: 'ᱡᱚᱦᱟᱨ, ᱢᱮᱰᱤᱢᱤᱛᱨᱟ ᱦᱚᱲᱢᱚ ᱥᱟᱶᱟᱨ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾',
  ks: 'سلام، میڈی مترا صحت سہارَس منٛز خوش آمدید۔',
  sd: 'ڀلي ڪري آيا، ميڊي مترا هيلٿ اسسٽنٽ ۾ اوهان جو آڌرڀاءُ آهي.',
  doi: 'नमस्ते, मेडीमित्र सेहत सहायके च थुआढ़ा स्वागत ऐ।',
  brx: 'खुलुमबाय, मेदिमित्र साहाइयाव बरायबाय।',
  mni: 'ꯈꯨꯔꯨꯝꯖꯔꯤ, ꯃꯦꯗꯤꯃꯤꯇ꯭ꯔꯥ ꯍꯛꯁꯦꯜ ꯃꯇꯦꯡꯗ ꯇꯔꯥꯝꯅ ꯑꯣꯛꯆꯔꯤ।',
  bho: 'प्रणाम, मेडीमित्र स्वास्थ्य सहायक में राउर स्वागत बा।',
  raj: 'राम राम सा, मेडीमित्र स्वास्थ्य सहायक में आपरो स्वागत है।',
  mwr: 'राम राम सा, मेडीमित्र स्वास्थ्य सहायक में आपरो स्वागत है।',
  bgc: 'राम राम, मेडीमित्र स्वास्थ्य सहायक में थारा स्वागत सै।',
  hne: 'जय जोहार, मेडीमित्र स्वास्थ्य सहायक म आप मन के स्वागत हे।',
  tcy: 'ನಮಸ್ಕಾರ, ಮೆಡಿಮಿತ್ರ ಆರೋಗ್ಯ ಸಹಾಯೊಗು ಸ್ವಾಗತ.',
  en: 'Welcome to MediMitra Multilingual Health Assistant.',
  es: 'Bienvenido al asistente de salud MediMitra.',
  fr: 'Bienvenue sur l\'assistant de santé MediMitra.',
  ar: 'مرحباً بكم في مساعد ميدي مترا الصحي.',
};

interface LanguageModalProps {
  isOpen: boolean;
  activeLanguage: LanguageDetail;
  onSelectLanguage: (lang: LanguageDetail) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  activeLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'indian' | 'global'>('indian');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [previewSpeakingCode, setPreviewSpeakingCode] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const stopPreviewRef = useRef<(() => void) | null>(null);

  const stopPreview = useCallback(() => {
    if (stopPreviewRef.current) {
      stopPreviewRef.current();
      stopPreviewRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPreviewSpeakingCode(null);
  }, []);

  const handlePlayVoicePreview = (e: React.MouseEvent, lang: LanguageDetail) => {
    e.stopPropagation();
    if (previewSpeakingCode === lang.code) {
      stopPreview();
      return;
    }

    stopPreview();
    setPreviewSpeakingCode(lang.code);
    const phrase = VOICE_PREVIEW_PHRASES[lang.code] || `Hello, MediMitra Health Copilot in ${lang.name}.`;
    const stopFn = speakMedicalText(
      phrase,
      lang.code,
      () => {
        setPreviewSpeakingCode(null);
        stopPreviewRef.current = null;
      },
      () => {
        const cloudStop = playCloudTts(
          phrase,
          lang.code,
          () => {
            setPreviewSpeakingCode(null);
            stopPreviewRef.current = null;
          },
          () => {
            setPreviewSpeakingCode(null);
            stopPreviewRef.current = null;
          }
        );
        stopPreviewRef.current = cloudStop;
      }
    );
    stopPreviewRef.current = stopFn;
  };

  // Load browser voices on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      ensureVoicesLoaded().then((v) => setVoices(v));
      // Focus search input after modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      stopPreview();
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    }
  }, [isOpen, stopPreview]);

  // Debounce search input by 150ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset keyboard focus index on search or tab change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [debouncedSearch, selectedTab]);

  // Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter languages with normalized, prefix-first ranking
  const filteredLanguages = useMemo(() => {
    let list = CURATED_LANGUAGES;

    if (selectedTab === 'indian') {
      list = list.filter((l) => l.region === 'Indian');
    } else if (selectedTab === 'global') {
      list = list.filter((l) => l.region === 'Global');
    }

    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return list;

    // Categorized scoring for prefix-first relevance
    const rank1Exact: LanguageDetail[] = [];
    const rank2PrefixName: LanguageDetail[] = [];
    const rank3PrefixNative: LanguageDetail[] = [];
    const rank4Alias: LanguageDetail[] = [];
    const rank5Substring: LanguageDetail[] = [];

    for (const lang of list) {
      const code = lang.code.toLowerCase();
      const iso = lang.isoCode3.toLowerCase();
      const name = lang.name.toLowerCase();
      const native = lang.nativeName.toLowerCase();
      const aliases = (lang.aliases || []).map((a) => a.toLowerCase());

      // Rank 1: Exact code or name match
      if (code === q || iso === q || name === q || native === q) {
        rank1Exact.push(lang);
        continue;
      }

      // Rank 2: English name starts with query
      if (name.startsWith(q)) {
        rank2PrefixName.push(lang);
        continue;
      }

      // Rank 3: Native name starts with or code starts with query
      if (native.startsWith(q) || code.startsWith(q) || iso.startsWith(q)) {
        rank3PrefixNative.push(lang);
        continue;
      }

      // Rank 4: Alias matches query
      if (aliases.some((a) => a.startsWith(q) || a === q)) {
        rank4Alias.push(lang);
        continue;
      }

      // Rank 5: Contains anywhere
      if (name.includes(q) || native.includes(q) || aliases.some((a) => a.includes(q))) {
        rank5Substring.push(lang);
      }
    }

    return [...rank1Exact, ...rank2PrefixName, ...rank3PrefixNative, ...rank4Alias, ...rank5Substring];
  }, [debouncedSearch, selectedTab]);

  // Handle arrow key navigation within the list
  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredLanguages.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredLanguages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredLanguages.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredLanguages.length) {
        e.preventDefault();
        onSelectLanguage(filteredLanguages[focusedIndex]);
        onClose();
      }
    },
    [filteredLanguages, focusedIndex, onSelectLanguage, onClose]
  );

  if (!isOpen) return null;

  const indianCount = CURATED_LANGUAGES.filter((l) => l.region === 'Indian').length;
  const globalCount = CURATED_LANGUAGES.filter((l) => l.region === 'Global').length;
  const fullUiCount = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'FULL').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onKeyDown={handleListKeyDown}
      >
        {/* Header */}
        <div className="p-5 border-b border-sky-200 flex items-center justify-between bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner flex-shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="language-modal-title"
                  className="font-bold text-white text-base tracking-tight flex items-center gap-2"
                >
                  <span>Universal Clinical Localization</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {fullUiCount} Interface • {CURATED_LANGUAGES.length} AI Languages
                  </span>
                </h3>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Choose your language. Summaries and explanations adapt to it. Always confirm medical instructions with your doctor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close language selector modal"
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#328CC1]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by language, script, or code (e.g. Hindi, தமிழ், Telugu, Español, עברית, Arabic)..."
              aria-label="Search languages"
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#328CC1] focus:ring-1 focus:ring-[#328CC1] shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 pt-1" role="tablist" aria-label="Language categories">
            <button
              type="button"
              role="tab"
              aria-selected={selectedTab === 'indian'}
              onClick={() => setSelectedTab('indian')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTab === 'indian'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>Indian Languages ({indianCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedTab === 'global'}
              onClick={() => setSelectedTab('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTab === 'global'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>Global Languages ({globalCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedTab === 'all'}
              onClick={() => setSelectedTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedTab === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>All ({CURATED_LANGUAGES.length})</span>
            </button>
          </div>
        </div>

        {/* Language Grid */}
        <div
          ref={listContainerRef}
          className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50"
        >
          {filteredLanguages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Languages className="w-8 h-8 mx-auto mb-2 opacity-50 text-sky-500" />
              <p className="text-xs">No matching language found for "{searchTerm}"</p>
            </div>
          ) : (
            filteredLanguages.map((lang, index) => {
              const isSelected = activeLanguage.code.toLowerCase() === lang.code.toLowerCase();
              const hasVoice = hasVoiceForLanguage(lang.code, voices);
              const isKeyboardFocused = focusedIndex === index;

              return (
                <button
                  key={`${lang.code}-${lang.isoCode3}-${lang.name}`}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  className={`p-3 rounded-xl text-left flex items-center justify-between border transition-all duration-150 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm font-semibold'
                      : isKeyboardFocused
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400 text-slate-900'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Script Badge (replacing country flags) */}
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200 min-w-[42px] text-center flex-shrink-0">
                      {lang.scriptBadge}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900">{lang.name}</span>

                        {/* Support Level Badge */}
                        {lang.supportLevel === 'FULL' && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200"
                            title="Full UI translated, voice and AI explanations"
                          >
                            UI + AI
                          </span>
                        )}
                        {lang.supportLevel === 'AI' && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200"
                            title="AI explanations & voice synthesis"
                          >
                            AI Voice
                          </span>
                        )}
                        {lang.supportLevel === 'BASIC' && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                            title="AI text explanations"
                          >
                            AI Text
                          </span>
                        )}

                        {/* AI Translated Beta Badge */}
                        {lang.isBeta && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200"
                            title="Machine translated (beta), pending native clinical review"
                          >
                            Beta
                          </span>
                        )}

                        {/* RTL Badge */}
                        {lang.direction === 'rtl' && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                            RTL
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-sky-700 font-medium mt-0.5">
                        {lang.nativeName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Voice indicator with interactive audio preview */}
                    <button
                      type="button"
                      onClick={(e) => handlePlayVoicePreview(e, lang)}
                      title={
                        previewSpeakingCode === lang.code
                          ? 'Click to stop voice playback'
                          : `Click to test voice pronunciation in ${lang.nativeName}`
                      }
                      className={`p-1 rounded-md transition-all ${
                        previewSpeakingCode === lang.code
                          ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-110'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 text-emerald-600 ${
                          previewSpeakingCode === lang.code ? 'animate-pulse' : ''
                        }`}
                      />
                    </button>

                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {lang.code}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Active: <strong className="text-sky-700">{activeLanguage.name} ({activeLanguage.nativeName})</strong>
            </span>
            {activeLanguage.isBeta && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                AI translated (beta)
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Direction: {activeLanguage.direction.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
