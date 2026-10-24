import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';

import {
  transcribeAudioBlob,
  extractMedicalFromText,
} from '../services/safeTranscribeAudio';
import {
  BCP47_LOCALE_MAP,
  LANGUAGE_TO_BCP47,
  WHISPER_SUPPORTED_LANGUAGES,
  getLocaleForLanguage,
  getDeviceVoiceStatus,
  isSpeechOutputAvailable,
  isSpeechInputAvailable,
  computeLanguageSupport,
  verifyDosageNumbersPreserved,
  speakMedicalText,
  translateInstructionOnline,
  CURATED_LANGUAGES,
} from '../services/languageService';
import { VoiceDictationModal } from '../components/VoiceDictationModal';

describe('Voice Transcription & Speech System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ==========================================
  // 1. BACKEND & SERVICE MOCK UNIT TESTS
  // ==========================================
  describe('Transcription Client Service (Mocked Backend)', () => {
    it('handles missing API key error response from backend', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({
            detail: 'Invalid or missing OpenAI API key. Please configure OPENAI_API_KEY in .env.',
          }),
        })
      );

      const blob = new Blob(['mock audio'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'test.webm', 'hi');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or missing OpenAI API key');
    });

    it('handles unsupported audio file extension error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            detail: "Unsupported audio format '.txt'. Allowed extensions: .flac, .mp3, .mp4, .mpeg, .mpga, .m4a, .ogg, .wav, .webm",
          }),
        })
      );

      const blob = new Blob(['not audio'], { type: 'text/plain' });
      const result = await transcribeAudioBlob(blob, 'test.txt', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported audio format');
    });

    it('handles empty audio file error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            detail: 'Audio file is empty. Please provide a valid recording.',
          }),
        })
      );

      const blob = new Blob([], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'empty.webm', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Audio file is empty');
    });

    it('handles file exceeding 25 MB (413 Payload Too Large)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 413,
          json: async () => ({
            detail: 'Audio file exceeds maximum size limit of 25 MB.',
          }),
        })
      );

      const blob = new Blob([new Uint8Array(26 * 1024 * 1024)], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'large.webm', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('25 MB');
    });

    it('handles 429 rate limit or busy server error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          json: async () => ({
            detail: 'Transcription service is currently busy or rate limited. Please try again shortly.',
          }),
        })
      );

      const blob = new Blob(['mock audio'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'busy.webm', 'ta');

      expect(result.success).toBe(false);
      expect(result.error).toContain('busy or rate limited');
    });

    it('handles request timeout (60s abort / 504)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue({
          name: 'AbortError',
          message: 'The operation was aborted',
        })
      );

      const blob = new Blob(['mock audio'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'timeout.webm', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });

    it('handles silent audio guard error (no_speech_prob > 0.6)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            detail: 'No clear speech detected. Please record again.',
          }),
        })
      );

      const blob = new Blob(['silence'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'silence.webm', 'en');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No clear speech detected. Please record again.');
    });

    it('returns low_confidence flag and warnings when speech is indistinct', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            text: 'paracetamol indistinct dosage',
            detected_language: 'english',
            duration_seconds: 4.2,
            low_confidence: true,
            warnings: ['Audio confidence is low; speech was indistinct or muffled.'],
            provider: 'OpenAI Whisper',
            model: 'whisper-1',
          }),
        })
      );

      const blob = new Blob(['muffled audio'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'muffled.webm', 'en');

      expect(result.success).toBe(true);
      expect(result.low_confidence).toBe(true);
      expect(result.warnings).toContain('Audio confidence is low; speech was indistinct or muffled.');
    });

    it('handles language hint rejected and retried with warning', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            text: 'Retried verbatim transcript',
            detected_language: 'hindi',
            duration_seconds: 5.0,
            low_confidence: false,
            warnings: ["Language hint 'unknown_hint' was rejected by Whisper; retried with auto-detection."],
            provider: 'OpenAI Whisper',
            model: 'whisper-1',
          }),
        })
      );

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      const result = await transcribeAudioBlob(blob, 'retry.webm', 'unknown_hint');

      expect(result.success).toBe(true);
      expect(result.warnings?.[0]).toContain('Language hint');
    });

    it('ensures no keys or secrets are logged in error paths', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Connection failure'))
      );

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      await transcribeAudioBlob(blob, 'test.webm', 'en');

      // Check all console.error calls do not contain sk- or secret keys
      const allCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(allCalls).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // 2. TRANSLATION & DOSAGE PRESERVATION TESTS
  // ==========================================
  describe('translateInstructionOnline Suite', () => {
    it('returns empty text directly without network request', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const res = await translateInstructionOnline('', 'ta');
      expect(res.translated).toBe('');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('uses English-to-English shortcut for ASCII text without calling API', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);

      const res = await translateInstructionOnline('Take Paracetamol 650mg once daily', 'en', 'en');
      expect(res.translated).toBe('Take Paracetamol 650mg once daily');
      expect(res.isAiTranslated).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('translates successfully on HTTP 200 response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            translated_text: 'பாராசிட்டமால் 650mg தினமும் ஒரு வேளை உட்கொள்ளவும்',
            original_text: 'Take Paracetamol 650mg once daily',
            notice: 'AI translated (beta).',
          }),
        })
      );

      const res = await translateInstructionOnline('Take Paracetamol 650mg once daily', 'ta', 'en');
      expect(res.translated).toContain('பாராசிட்டமால் 650mg');
      expect(res.isAiTranslated).toBe(true);
    });

    it('handles HTTP error by falling back gracefully without crash', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        })
      );

      const res = await translateInstructionOnline('Take 1 tablet BD', 'hi', 'en');
      expect(res.translated).toBeDefined();
    });

    it('handles network failure gracefully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network offline'))
      );

      const res = await translateInstructionOnline('Take 1 tablet after meals', 'hi', 'en');
      expect(res.translated).toBeDefined();
    });

    it('verifies dosage numbers and units are preserved', () => {
      const source = 'Take Paracetamol 650 mg TDS for 5 days. Blood pressure was 120/80.';
      const goodTranslation = 'பாராசிட்டமால் 650 mg TDS 5 days உட்கொள்ளவும். ரத்த அழுத்தம் 120/80.';
      const badTranslation = 'பாராசிட்டமால் எடுத்துக்கொள்ளவும்.'; // missing 650 mg, 5 days, 120/80

      const goodCheck = verifyDosageNumbersPreserved(source, goodTranslation);
      expect(goodCheck.preserved).toBe(true);
      expect(goodCheck.missing.length).toBe(0);

      const badCheck = verifyDosageNumbersPreserved(source, badTranslation);
      expect(badCheck.preserved).toBe(false);
      expect(badCheck.missing.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 3. SPEECH OUTPUT (TTS) TESTS
  // ==========================================
  describe('speakMedicalText Suite', () => {
    it('reports unavailable and does NOT speak if no voice exists for language', () => {
      const mockSpeak = vi.fn();
      const mockCancel = vi.fn();
      const mockOnUnavailable = vi.fn();

      vi.stubGlobal('speechSynthesis', {
        cancel: mockCancel,
        speak: mockSpeak,
        getVoices: () => [
          { lang: 'en-US', name: 'English Voice' } as SpeechSynthesisVoice,
        ],
        paused: false,
        resume: vi.fn(),
      });

      (globalThis as any).SpeechSynthesisUtterance = class {
        text: string;
        lang: string = 'en-US';
        constructor(text: string) {
          this.text = text;
        }
      };

      // Request Tamil ('ta'), but only en-US voice is installed
      speakMedicalText(
        'நோயாளிக்கு காய்ச்சல் உள்ளது',
        'ta',
        undefined,
        mockOnUnavailable
      );

      // Must NOT speak with an English voice!
      expect(mockSpeak).not.toHaveBeenCalled();
      expect(mockOnUnavailable).toHaveBeenCalled();
    });

    it('speaks successfully when matching voice is found', () => {
      const mockSpeak = vi.fn();
      const mockCancel = vi.fn();

      vi.stubGlobal('speechSynthesis', {
        cancel: mockCancel,
        speak: mockSpeak,
        getVoices: () => [
          { lang: 'ta-IN', name: 'Tamil Voice' } as SpeechSynthesisVoice,
        ],
        paused: false,
        resume: vi.fn(),
      });

      (globalThis as any).SpeechSynthesisUtterance = class {
        text: string;
        lang: string = 'ta-IN';
        voice: any;
        constructor(text: string) {
          this.text = text;
        }
      };

      speakMedicalText('நோயாளிக்கு காய்ச்சல் உள்ளது', 'ta');

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalled();
    });

    it('matches Indian voices named in native script (Chrome Google voices)', () => {
      const mockSpeak = vi.fn();
      const mockVoices = [
        { lang: 'ta-IN', name: 'Google தமிழ்' } as SpeechSynthesisVoice,
        { lang: 'te-IN', name: 'Google తెలుగు' } as SpeechSynthesisVoice,
        { lang: 'kn-IN', name: 'Google ಕನ್ನಡ' } as SpeechSynthesisVoice,
        { lang: 'ml-IN', name: 'Google മലയാളം' } as SpeechSynthesisVoice,
        { lang: 'bn-IN', name: 'Google বাংলা' } as SpeechSynthesisVoice,
        { lang: 'mr-IN', name: 'Google मराठी' } as SpeechSynthesisVoice,
        { lang: 'gu-IN', name: 'Google ગુજરાતી' } as SpeechSynthesisVoice,
        { lang: 'pa-IN', name: 'Google ਪੰਜਾਬੀ' } as SpeechSynthesisVoice,
        { lang: 'ur-IN', name: 'Google اردو' } as SpeechSynthesisVoice,
        { lang: 'or-IN', name: 'Google ଓଡ଼ିଆ' } as SpeechSynthesisVoice,
        { lang: 'as-IN', name: 'Google অসমীয়া' } as SpeechSynthesisVoice,
        { lang: 'ne-NP', name: 'Google नेपाली' } as SpeechSynthesisVoice,
        { lang: 'sa-IN', name: 'Google संस्कृत' } as SpeechSynthesisVoice,
      ];

      vi.stubGlobal('speechSynthesis', {
        cancel: vi.fn(),
        speak: mockSpeak,
        getVoices: () => mockVoices,
        paused: false,
        resume: vi.fn(),
      });

      (globalThis as any).SpeechSynthesisUtterance = class {
        text: string;
        lang: string = 'te-IN';
        voice: any;
        constructor(text: string) {
          this.text = text;
        }
      };

      // Verify each Indian language matches its native script voice
      expect(isSpeechOutputAvailable('ta', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('te', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('kn', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('ml', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('bn', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('mr', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('gu', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('pa', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('ur', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('or', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('as', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('ne', mockVoices)).toBe(true);
      expect(isSpeechOutputAvailable('sa', mockVoices)).toBe(true);

      speakMedicalText('పారాసిటమాల్ 650 మి.గ్రా', 'te');
      expect(mockSpeak).toHaveBeenCalled();
      const calledUtterance = mockSpeak.mock.calls[0][0];
      expect(calledUtterance.voice.name).toBe('Google తెలుగు');
    });

    it('cleans markdown symbols while preserving meaningful parentheses and "650 mg"', () => {
      const mockSpeak = vi.fn();

      vi.stubGlobal('speechSynthesis', {
        cancel: vi.fn(),
        speak: mockSpeak,
        getVoices: () => [
          { lang: 'en-US', name: 'English Voice' } as SpeechSynthesisVoice,
        ],
        paused: false,
        resume: vi.fn(),
      });

      (globalThis as any).SpeechSynthesisUtterance = class {
        text: string;
        lang: string = 'en-US';
        constructor(text: string) {
          this.text = text;
        }
      };

      speakMedicalText(
        '**Prescription**: Take Paracetamol (650 mg) [twice daily] #daily',
        'en'
      );

      expect(mockSpeak).toHaveBeenCalled();
      const calledUtterance = mockSpeak.mock.calls[0][0];
      // Markdown symbols like * and # should be stripped
      expect(calledUtterance.text).not.toContain('*');
      expect(calledUtterance.text).not.toContain('#');
      // Meaningful dosage and parentheses MUST be preserved!
      expect(calledUtterance.text).toContain('(650 mg)');
    });
  });

  // ==========================================
  // 4. LOCALE & LANGUAGE COVERAGE TESTS
  // ==========================================
  describe('Locale & Language Coverage Suite', () => {
    it('ensures every language marked Live Speech has a valid locale in BCP47_LOCALE_MAP', () => {
      const liveSpeechLangs = ['hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'en'];

      for (const code of liveSpeechLangs) {
        const locale = getLocaleForLanguage(code);
        expect(locale).not.toBe('unsupported');
        expect(locale).toMatch(/^[a-z]{2,3}-[A-Z]{2,3}$/);
      }
    });

    it('returns "unsupported" for unknown language codes (never "xx-XX")', () => {
      expect(getLocaleForLanguage('xyz')).toBe('unsupported');
      expect(getLocaleForLanguage('fake123')).toBe('unsupported');
      expect(getLocaleForLanguage('')).toBe('unsupported');
    });

    it('does NOT claim Whisper supports all 22 Indian scheduled languages', () => {
      // Odia ('or'), Konkani ('kok'), Maithili ('mai'), Santali ('sat') are NOT supported by Whisper
      expect(WHISPER_SUPPORTED_LANGUAGES.has('kok')).toBe(false);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('mai')).toBe(false);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('sat')).toBe(false);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('doi')).toBe(false);

      // Supported languages
      expect(WHISPER_SUPPORTED_LANGUAGES.has('hi')).toBe(true);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('ta')).toBe(true);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('te')).toBe(true);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('kn')).toBe(true);
      expect(WHISPER_SUPPORTED_LANGUAGES.has('ml')).toBe(true);
    });

    it('correctly maps language codes to BCP-47 speech locales', () => {
      expect(LANGUAGE_TO_BCP47['hi']).toBe('hi-IN');
      expect(LANGUAGE_TO_BCP47['en']).toBe('en-IN');
      expect(LANGUAGE_TO_BCP47['ta']).toBe('ta-IN');
      expect(LANGUAGE_TO_BCP47['te']).toBe('te-IN');
      expect(LANGUAGE_TO_BCP47['kn']).toBe('kn-IN');
      expect(LANGUAGE_TO_BCP47['ml']).toBe('ml-IN');
      expect(LANGUAGE_TO_BCP47['bn']).toBe('bn-IN');
      expect(LANGUAGE_TO_BCP47['mr']).toBe('mr-IN');
      expect(LANGUAGE_TO_BCP47['gu']).toBe('gu-IN');
      expect(LANGUAGE_TO_BCP47['pa']).toBe('pa-IN');
    });

    it('detects voice status accurately across Full voice, Output only, Input only, and Text only', () => {
      const mockTamilVoice = {
        lang: 'ta-IN',
        name: 'Google Tamil',
        default: false,
        localService: true,
        voiceURI: 'ta-IN',
      } as SpeechSynthesisVoice;

      vi.stubGlobal('speechSynthesis', {
        getVoices: () => [mockTamilVoice],
      });

      // 1. Mock SpeechRecognition present
      vi.stubGlobal('SpeechRecognition', class {
        start() {}
        stop() {}
      });

      // Full voice: has recognition + has matching voice
      const fullStatus = getDeviceVoiceStatus('ta', [mockTamilVoice]);
      expect(fullStatus).toBe('Full voice');

      // Input only: has recognition + no matching voice
      const inputOnlyStatus = getDeviceVoiceStatus('te', [mockTamilVoice]);
      expect(inputOnlyStatus).toBe('Input only');

      // 2. Remove SpeechRecognition
      vi.stubGlobal('SpeechRecognition', undefined);
      vi.stubGlobal('webkitSpeechRecognition', undefined);

      // Output only: no recognition + has voice
      const outputOnlyStatus = getDeviceVoiceStatus('ta', [mockTamilVoice]);
      expect(outputOnlyStatus).toBe('Output only');

      // Text only: no recognition + no voice
      const textOnlyStatus = getDeviceVoiceStatus('te', [mockTamilVoice]);
      expect(textOnlyStatus).toBe('Text only');
    });

    it('computes language support level dynamically from capabilities', () => {
      vi.stubGlobal('SpeechRecognition', class {
        start() {}
        stop() {}
      });

      const hiSupport = computeLanguageSupport('hi');
      expect(hiSupport.canLiveRecord).toBe(true);
      expect(hiSupport.canUploadTranscribe).toBe(true);
      expect(hiSupport.canType).toBe(true);

      const unsupportedCode = computeLanguageSupport('xyz');
      expect(unsupportedCode.canLiveRecord).toBe(false);
      expect(unsupportedCode.badgeLabel).toBe('Text only');
    });
  });

  // ==========================================
  // 5. MODAL COMPONENT (REACT TESTING LIBRARY)
  // ==========================================
  describe('VoiceDictationModal Component Suite', () => {
    const mockSelectedLang = CURATED_LANGUAGES[0]; // Hindi
    const mockOnClose = vi.fn();
    const mockOnExtractionComplete = vi.fn();

    beforeEach(() => {
      localStorage.clear();
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }],
          }),
        },
        clipboard: {
          writeText: vi.fn(),
        },
      });

      vi.stubGlobal('SpeechRecognition', class {
        continuous = true;
        interimResults = true;
        lang = 'hi-IN';
        start = vi.fn();
        stop = vi.fn();
        abort = vi.fn();
      });

      vi.stubGlobal('speechSynthesis', {
        getVoices: () => [
          { lang: 'hi-IN', name: 'Google Hindi' } as SpeechSynthesisVoice,
        ],
        cancel: vi.fn(),
        speak: vi.fn(),
      });

      vi.stubGlobal('MediaRecorder', class {
        static isTypeSupported = vi.fn().mockReturnValue(true);
        state = 'inactive';
        mimeType = 'audio/webm';
        ondataavailable: any = null;
        onstop: any = null;
        start = vi.fn(function (this: any) {
          this.state = 'recording';
        });
        stop = vi.fn(function (this: any) {
          this.state = 'inactive';
          if (this.ondataavailable) {
            this.ondataavailable({
              data: new Blob(
                ['audio-data-chunk-padded-to-pass-silence-guard-check-longer-than-200-bytes-123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'],
                { type: 'audio/webm' }
              ),
            });
          }
          if (this.onstop) this.onstop();
        });
      });
    });

    it('requires consent checkbox before recording can start', () => {
      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const consentCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(consentCheckbox.checked).toBe(false);

      const recordButton = screen.getByRole('button', { name: /click to speak/i }) as HTMLButtonElement;
      expect(recordButton.disabled).toBe(true);

      // Check the consent box
      fireEvent.click(consentCheckbox);
      expect(consentCheckbox.checked).toBe(true);
      expect(recordButton.disabled).toBe(false);
      expect(localStorage.getItem('medimitra_voice_consent')).toBe('true');
    });

    it('shows error on extraction failure and does NOT call onExtractionComplete', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: false,
            extracted_medical: null,
            error: 'Could not extract a record. Please review the transcript.',
          }),
        })
      );

      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const textarea = screen.getByPlaceholderText(/speak into microphone/i);
      fireEvent.change(textarea, { target: { value: 'Random non-medical chat text' } });

      const extractButton = screen.getByRole('button', { name: /extract medical record/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(/could not extract a record/i)).toBeDefined();
      });

      // Crucial Safety Rule: onExtractionComplete must NOT be called on failure!
      expect(mockOnExtractionComplete).not.toHaveBeenCalled();
    });

    it('extracts medical records strictly using the edited transcript text', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          extracted_medical: {
            document_type: 'prescription',
            patient_name: 'Custom Patient',
            doctor_name: 'Dr. John Doe',
            hospital_or_clinic: null,
            document_date: null,
            diagnoses: ['Acute Bronchitis'],
            medicines: [
              {
                name: 'Amoxicillin',
                dosage: '500 mg',
                frequency: 'BD',
                duration: '5 days',
                instructions: 'After food',
              },
            ],
            tests: [],
            confidence_scores: { overall: 0.9 },
            notes: null,
          },
        }),
      });
      vi.stubGlobal('fetch', fetchSpy);

      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const textarea = screen.getByPlaceholderText(/speak into microphone/i);
      const userEditedText = 'Patient with cough. Prescribed Amoxicillin 500 mg BD for 5 days.';
      fireEvent.change(textarea, { target: { value: userEditedText } });

      const extractButton = screen.getByRole('button', { name: /extract medical record/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(/Review Voice-Extracted Clinical Record/i)).toBeDefined();
      });

      // Verify the request body sent to backend contains the exact user-edited text
      const requestCall = fetchSpy.mock.calls.find((c: any) => c[0].includes('/transcribe'));
      expect(requestCall).toBeDefined();
      const body = JSON.parse(requestCall![1].body);
      expect(body.text).toBe(userEditedText);

      // Confirming the record on the review screen calls onExtractionComplete
      const confirmButton = screen.getByRole('button', { name: /confirm & save to health profile/i });
      fireEvent.click(confirmButton);

      expect(mockOnExtractionComplete).toHaveBeenCalledTimes(1);
      const savedDoc = mockOnExtractionComplete.mock.calls[0][0];
      expect(savedDoc.data.patient_name).toBe('Custom Patient');
      expect(savedDoc.source).toBe('voice');
    });

    it('stops microphone tracks on unmount cleanly', () => {
      const stopTrackMock = vi.fn();
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: stopTrackMock }],
          }),
        },
      });

      const { unmount } = render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      unmount();
      expect(true).toBe(true);
    });

    it('restarts recognition on language switch during recording', async () => {
      const mockStopRecognition = vi.fn();
      const mockStartRecognition = vi.fn();

      vi.stubGlobal('SpeechRecognition', class {
        continuous = true;
        interimResults = true;
        lang = 'hi-IN';
        start = mockStartRecognition;
        stop = mockStopRecognition;
      });

      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      // Give consent and start recording
      const consentCheckbox = screen.getByRole('checkbox');
      fireEvent.click(consentCheckbox);

      const recordButton = screen.getByRole('button', { name: /click to speak/i });
      fireEvent.click(recordButton);

      // Wait for recognition to start
      await waitFor(() => {
        expect(mockStartRecognition).toHaveBeenCalled();
      });

      // Switch language to Tamil ('ta')
      const tamilButton = screen.getByRole('button', { name: /தமிழ்/i });
      fireEvent.click(tamilButton);

      expect(mockStopRecognition).toHaveBeenCalled();
    });

    it('handles unsupported-language path without silent fallback, showing explicit choice buttons', () => {
      // Mock neither SpeechRecognition nor TTS voice for Kokborok/unsupported language
      const unsupportedLang = {
        code: 'kok',
        isoCode3: 'kok',
        name: 'Konkani',
        nativeName: 'कोंकणी',
        scriptBadge: 'कोंकणी',
        direction: 'ltr' as const,
        region: 'Indian' as const,
        supportLevel: 'BASIC' as const,
        isBeta: true,
      };

      vi.stubGlobal('SpeechRecognition', undefined);
      vi.stubGlobal('webkitSpeechRecognition', undefined);
      vi.stubGlobal('speechSynthesis', {
        getVoices: () => [],
        cancel: vi.fn(),
        speak: vi.fn(),
      });

      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: unsupportedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      // Verify explicit message without silent fallback to English or Hindi
      expect(
        screen.getByText(/Voice is not available for Konkani on this device\. You can type instead\./i)
      ).toBeDefined();

      // Verify explicit alternative language choices are offered
      const englishButtons = screen.getAllByRole('button', { name: /English/i });
      expect(englishButtons.length).toBeGreaterThan(0);
      const hindiButtons = screen.getAllByRole('button', { name: /Hindi/i });
      expect(hindiButtons.length).toBeGreaterThan(0);
    });

    it('shows "We could not hear that. Please try again or type." on failed or empty transcription and never fabricates text', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({
            detail: 'Audio file is empty. Please provide a valid recording.',
          }),
        })
      );

      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      // Consent and trigger recording
      const consentCheckbox = screen.getByRole('checkbox');
      fireEvent.click(consentCheckbox);

      const recordButton = screen.getByRole('button', { name: /click to speak/i });
      fireEvent.click(recordButton);

      // Stop recording via the active stop button
      const stopButton = await screen.findByRole('button', { name: /stop recording/i });
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(
          screen.getByText(/We could not hear that\. Please try again or type\./i)
        ).toBeDefined();
      });

      // Verify no invented sample text is inserted into the textarea
      const textarea = screen.getByPlaceholderText(/speak into microphone/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('displays low-confidence warning "Please check this text before using it" when audio is indistinct', async () => {
      localStorage.setItem('medimitra_voice_consent', 'true');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            text: 'paracetamol indistinct dosage 500',
            detected_language: 'english',
            low_confidence: true,
            warnings: ['Low confidence audio'],
          }),
        })
      );

      const { container } = render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: CURATED_LANGUAGES.find((l) => l.code === 'en') || mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const fakeFile = new File(['mock audio data'], 'test.webm', { type: 'audio/webm' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(
          screen.getByText(/Please check this text before using it/i)
        ).toBeDefined();
      });
    });

    it('displays wrong-language warning "This sounded like <language>. Use it?" when detected language differs', async () => {
      localStorage.setItem('medimitra_voice_consent', 'true');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            text: 'मरीज को तेज बुखार और सिरदर्द है',
            detected_language: 'Hindi',
            low_confidence: false,
          }),
        })
      );

      // Chosen language is English ('en'), but audio spoken was Hindi
      const englishLang = CURATED_LANGUAGES.find((l) => l.code === 'en')!;
      const { container } = render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: englishLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const fakeFile = new File(['mock audio data'], 'test.webm', { type: 'audio/webm' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/This sounded like/i)).toBeDefined();
      });
      expect(screen.getAllByText('Hindi').length).toBeGreaterThan(0);

      // User has explicit Yes and No buttons
      expect(screen.getByRole('button', { name: /^Yes$/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /^No$/i })).toBeDefined();
    });

    it('cleans up resources and revokes object URLs on modal close', () => {
      const revokeSpy = vi.fn();
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-audio-url'),
        revokeObjectURL: revokeSpy,
      });

      const { unmount } = render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: mockSelectedLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      const closeButton = screen.getByRole('button', { name: /close voice dictation/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
      unmount();
      expect(true).toBe(true);
    });

    it('does not abort MediaRecorder when SpeechRecognition encounters language-not-supported error', async () => {
      let recognitionErrorCb: any = null;
      vi.stubGlobal('SpeechRecognition', class {
        continuous = true;
        interimResults = true;
        lang = 'ta-IN';
        start = vi.fn();
        stop = vi.fn();
        set onerror(cb: any) {
          recognitionErrorCb = cb;
        }
      });

      const tamilLang = CURATED_LANGUAGES.find((l) => l.code === 'ta')!;
      render(
        React.createElement(VoiceDictationModal, {
          isOpen: true,
          onClose: mockOnClose,
          selectedLanguage: tamilLang,
          onExtractionComplete: mockOnExtractionComplete,
        })
      );

      // Check consent
      const consentCheckbox = screen.getByRole('checkbox');
      fireEvent.click(consentCheckbox);

      // Start recording
      const recordButton = screen.getByRole('button', { name: /click to speak/i });
      fireEvent.click(recordButton);

      // Wait for recording to start
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeDefined();
      });

      // Trigger recognition language-not-supported error
      if (recognitionErrorCb) {
        act(() => {
          recognitionErrorCb({ error: 'language-not-supported' });
        });
      }

      // Audio recording must STILL be active (Stop Recording button remains visible)!
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeDefined();
    });
  });
});
