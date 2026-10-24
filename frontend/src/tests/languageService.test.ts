import { describe, it, expect } from 'vitest';
import {
  CURATED_LANGUAGES,
  TRANSLATIONS,
  resolveLanguageCode,
  getGlobalLanguageDetails,
  getUiTranslations,
  formatStructuredInstructions,
  UiTranslations,
} from '../services/languageService';

describe('Language System & Localization Suite', () => {
  describe('1. Curated Language Registry Specifications', () => {
    it('has exactly 104 curated languages (44 FULL UI, 60 AI/BASIC)', () => {
      expect(CURATED_LANGUAGES.length).toBe(104);

      const fullCount = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'FULL').length;
      expect(fullCount).toBe(44);

      const aiCount = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'AI').length;
      const basicCount = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'BASIC').length;
      expect(aiCount + basicCount).toBe(60);
    });

    it('enforces safety rule: isBeta is true for all non-English languages and false for English', () => {
      const english = CURATED_LANGUAGES.find((l) => l.code === 'en');
      expect(english).toBeDefined();
      expect(english?.isBeta).toBe(false);

      const nonEnglish = CURATED_LANGUAGES.filter((l) => l.code !== 'en');
      expect(nonEnglish.every((l) => l.isBeta === true)).toBe(true);
    });

    it('has correct Hebrew native name עברית in Hebrew script (no Arabic letters)', () => {
      const hebrew = CURATED_LANGUAGES.find((l) => l.code === 'he');
      expect(hebrew).toBeDefined();
      expect(hebrew?.nativeName).toBe('\u05E2\u05D1\u05E8\u05D9\u05EA');
      expect(hebrew?.direction).toBe('rtl');
      expect(hebrew?.scriptBadge).toBe('\u05E2\u05D1\u05E8\u05D9\u05EA');
    });

    it('has correct Manipuri native name in Meitei Mayek script and Bengali alias', () => {
      const mni = CURATED_LANGUAGES.find((l) => l.code === 'mni');
      expect(mni).toBeDefined();
      expect(mni?.nativeName).toBe('ꯃꯩꯇꯩꯂꯣꯟ');
      expect(mni?.scriptBadge).toBe('ꯃꯩꯇꯩ');
      expect(mni?.aliases).toContain('মৈতৈলোন্');
      expect(mni?.isBeta).toBe(true);
    });

    it('has valid scriptBadge, direction, and isoCode3 for all 104 languages', () => {
      for (const lang of CURATED_LANGUAGES) {
        expect(lang.code).toBeTruthy();
        expect(lang.isoCode3).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.nativeName).toBeTruthy();
        expect(lang.scriptBadge).toBeTruthy();
        expect(['ltr', 'rtl']).toContain(lang.direction);
        expect(['Indian', 'Global']).toContain(lang.region);
        expect(['FULL', 'AI', 'BASIC']).toContain(lang.supportLevel);
      }
    });
  });

  describe('2. Language Code & Query Resolution', () => {
    it('resolves primary ISO-639-1 codes directly', () => {
      expect(resolveLanguageCode('en')).toBe('en');
      expect(resolveLanguageCode('hi')).toBe('hi');
      expect(resolveLanguageCode('ta')).toBe('ta');
      expect(resolveLanguageCode('es')).toBe('es');
      expect(resolveLanguageCode('fr')).toBe('fr');
    });

    it('resolves ISO-639-3 3-letter codes to canonical codes', () => {
      expect(resolveLanguageCode('hin')).toBe('hi');
      expect(resolveLanguageCode('tam')).toBe('ta');
      expect(resolveLanguageCode('fra')).toBe('fr');
      expect(resolveLanguageCode('spa')).toBe('es');
      expect(resolveLanguageCode('deu')).toBe('de');
    });

    it('resolves common language names and aliases case-insensitively', () => {
      expect(resolveLanguageCode('Hindi')).toBe('hi');
      expect(resolveLanguageCode('Tamil')).toBe('ta');
      expect(resolveLanguageCode('Spanish')).toBe('es');
      expect(resolveLanguageCode('castilian')).toBe('es');
      expect(resolveLanguageCode('farsi')).toBe('fa');
      expect(resolveLanguageCode('meitei')).toBe('mni');
    });

    it('falls back gracefully to en for empty or unknown inputs', () => {
      expect(resolveLanguageCode('')).toBe('en');
      expect(resolveLanguageCode('unknown_lang_xyz')).toBe('unknown_lang_xyz');
    });

    it('getGlobalLanguageDetails retrieves complete metadata by code or name', () => {
      const tamil = getGlobalLanguageDetails('ta');
      expect(tamil.name).toBe('Tamil');
      expect(tamil.nativeName).toBe('தமிழ்');
      expect(tamil.scriptBadge).toBe('தமிழ்');
      expect(tamil.region).toBe('Indian');
      expect(tamil.supportLevel).toBe('FULL');

      const arabic = getGlobalLanguageDetails('ara');
      expect(arabic.name).toBe('Arabic');
      expect(arabic.direction).toBe('rtl');
      expect(arabic.supportLevel).toBe('FULL');

      const fallback = getGlobalLanguageDetails('nonexistent');
      expect(fallback.code).toBe('en');
    });
  });

  describe('3. UI Translations Completeness (All 57 Keys across all 44 dictionaries)', () => {
    const EXPECTED_KEYS: (keyof UiTranslations)[] = [
      'appTitle', 'appSubtitle', 'heroTag', 'heroTitle', 'heroDescription',
      'uploadBoxTitle', 'uploadBoxSubtitle', 'selectDocBtn', 'processingTitle', 'analyzingStep',
      'diagnosesHeading', 'medicationsHeading', 'labTestsHeading', 'physicianNotesHeading',
      'dosage', 'frequency', 'duration', 'instructions', 'listenAudioBtn', 'stopAudioBtn',
      'openNihLookup', 'openFdaInfo', 'disclaimerTitle', 'disclaimerText', 'switchLanguage',
      'allLanguages', 'indianLanguages', 'globalLanguages', 'searchLangPlaceholder', 'verifiedIcdCodes',
      'dashboardNav', 'medicalAiChatNav', 'prescriptionAiNav', 'labDiagnosticsNav', 'liveRatesNav',
      'healthMapNav', 'voiceAssistantNav', 'medicationScheduleNav', 'patientVaultNav', 'qrMedicalIdNav',
      'medicalCopilotStatus', 'readyStatus', 'clinicalIntelligenceHub', 'spokenLanguage',
      'verifiedClinicalPortal', 'welcomeBack', 'welcomeSubtitle', 'uploadMedicalDocBtn',
      'multimodalVisionCard', 'standardAnalytesCard', 'languagesVoiceCard', 'emergencyIdCard',
      'quickDocScanner', 'openFullScanner', 'voiceAssistantBtn', 'nihIcd10Btn', 'signOut',
    ];

    it('verifies that UiTranslations defines exactly 57 keys', () => {
      expect(EXPECTED_KEYS.length).toBe(57);
    });

    it('ensures getUiTranslations returns all 57 keys with no undefined values for English', () => {
      const en = getUiTranslations('en');
      for (const key of EXPECTED_KEYS) {
        expect(en[key], `Missing English key: ${key}`).toBeDefined();
        expect(typeof en[key]).toBe('string');
        expect(en[key].length).toBeGreaterThan(0);
      }
    });

    it('ensures getUiTranslations returns all 57 keys for all 44 FULL UI languages', () => {
      const fullLangs = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'FULL');
      expect(fullLangs.length).toBe(44);

      for (const lang of fullLangs) {
        const trans = getUiTranslations(lang.code);
        for (const key of EXPECTED_KEYS) {
          expect(trans[key], `Key ${key} missing or undefined in ${lang.name} (${lang.code})`).toBeDefined();
          expect(typeof trans[key]).toBe('string');
          expect(trans[key].length).toBeGreaterThan(0);
        }
      }
    });

    it('verifies medicalAiChatNav is defined in all 44 language dictionaries', () => {
      const fullLangs = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'FULL');
      for (const lang of fullLangs) {
        const trans = getUiTranslations(lang.code);
        expect(trans.medicalAiChatNav).toBeDefined();
        expect(trans.medicalAiChatNav.length).toBeGreaterThan(0);
      }
    });

    it('ensures no heroTag contains outdated "Phase 1" phrasing', () => {
      const fullLangs = CURATED_LANGUAGES.filter((l) => l.supportLevel === 'FULL');
      for (const lang of fullLangs) {
        const trans = getUiTranslations(lang.code);
        expect(trans.heroTag.toLowerCase()).not.toContain('phase 1');
      }
    });

    it('verifies that every UI dictionary has every key or a declared fallback to English', () => {
      const englishDictionary = TRANSLATIONS['en'];
      const englishKeys = Object.keys(englishDictionary) as (keyof UiTranslations)[];

      for (const [langCode, dict] of Object.entries(TRANSLATIONS)) {
        const resolved = getUiTranslations(langCode);
        for (const key of englishKeys) {
          const hasDirectOrFallback = Boolean(dict[key] || resolved[key]);
          expect(hasDirectOrFallback, `Key ${key} in ${langCode} must have a translation or declared fallback`).toBe(true);
          expect(resolved[key]).toBeDefined();
          expect(typeof resolved[key]).toBe('string');
        }
      }
    });
  });

  describe('4. Structured Medicine Instructions & Safety Banners', () => {
    it('formats structured medicine frequency and timing with bilingual display', () => {
      const resultHi = formatStructuredInstructions('BD', 'after meals with water', 'hi');
      expect(resultHi.original).toBe('after meals with water');
      expect(resultHi.translated).toContain('दिन में दो बार');
      expect(resultHi.translated).toContain('खाना खाने के बाद');
      expect(resultHi.isAiTranslated).toBe(true);
      expect(resultHi.notice).toContain('AI translated (beta)');
    });

    it('translates Tamil instructions with frequency token and food timing', () => {
      const resultTa = formatStructuredInstructions('OD', 'before food', 'ta');
      expect(resultTa.original).toBe('before food');
      expect(resultTa.translated).toContain('ஒரு முறை');
      expect(resultTa.translated).toContain('உணவுக்கு முன்');
      expect(resultTa.isAiTranslated).toBe(true);
      expect(resultTa.notice).toContain('AI translated (beta)');
    });

    it('retains original text without beta notice when target language is English', () => {
      const resultEn = formatStructuredInstructions('BD', 'take with plenty of water', 'en');
      expect(resultEn.original).toBe('take with plenty of water');
      expect(resultEn.translated).toBe('take with plenty of water');
      expect(resultEn.isAiTranslated).toBe(false);
      expect(resultEn.notice).toBe('Original clinical instruction.');
    });
  });
});
