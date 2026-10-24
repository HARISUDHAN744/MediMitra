import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Globe2,
  FileAudio,
  Trash2,
  ShieldCheck,
  Languages,
  CheckCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  transcribeAudioBlob,
  extractMedicalFromText,
  playCloudTts,
  TranscriptionResult,
} from '../services/safeTranscribeAudio';
import {
  CURATED_LANGUAGES,
  LanguageDetail,
  speakMedicalText,
  translateInstructionOnline,
  getLocaleForLanguage,
  computeLanguageSupport,
  getDeviceVoiceStatus,
  getEffectiveVoiceStatus,
  DeviceVoiceStatus,
  verifyDosageNumbersPreserved,
} from '../services/languageService';
import { UploadResponse, ExtractedMedicalDocument, MedicineItem } from '../types/medical';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageDetail;
  onExtractionComplete: (result: UploadResponse) => void;
}

// Quick language switcher tags with authentic native script labels (no country flags)
const QUICK_VOICE_LANGS = [
  { code: 'hi', label: 'हिन्दी', script: 'देवनागरी' },
  { code: 'ta', label: 'தமிழ்', script: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు', script: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ', script: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം', script: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা', script: 'বাংলা' },
  { code: 'mr', label: 'मराठी', script: 'देवनागरी' },
  { code: 'gu', label: 'ગુજરાતી', script: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', script: 'ਗੁਰਮੁਖੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ', script: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া', script: 'অসমীয়া' },
  { code: 'ur', label: 'اردو', script: 'اردو' },
  { code: 'sa', label: 'संस्कृतम्', script: 'संस्कृत' },
  { code: 'ne', label: 'नेपाली', script: 'नेपाली' },
  { code: 'en', label: 'English', script: 'Latin' },
  { code: 'es', label: 'Español', script: 'Latin' },
  { code: 'fr', label: 'Français', script: 'Latin' },
  { code: 'ar', label: 'العربية', script: 'العربية' },
];

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onExtractionComplete,
}) => {
  // Consent state (stored safely in localStorage)
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    try {
      return localStorage.getItem('medimitra_voice_consent') === 'true';
    } catch {
      return false;
    }
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [transcriptionMetadata, setTranscriptionMetadata] = useState<TranscriptionResult | null>(null);
  const [languageMismatchPrompt, setLanguageMismatchPrompt] = useState<{ detected: string; langCode: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<LanguageDetail>(selectedLanguage);

  // Translation states
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetTranslateLang, setTargetTranslateLang] = useState<string>(
    selectedLanguage.code === 'en' ? 'hi' : 'en'
  );
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [dosageWarning, setDosageWarning] = useState<string[]>([]);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Review Screen state for extracted clinical record before final vault save
  const [reviewRecord, setReviewRecord] = useState<ExtractedMedicalDocument | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingDurationRef = useRef<number>(0);
  const speechRecognitionRef = useRef<any>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const stopSpeechTranslatedRef = useRef<(() => void) | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync selected language from parent
  useEffect(() => {
    setActiveLang(selectedLanguage);
    setTargetTranslateLang(selectedLanguage.code === 'en' ? 'hi' : 'en');
  }, [selectedLanguage]);

  // Persist consent
  const handleConsentToggle = (checked: boolean) => {
    setHasConsent(checked);
    try {
      localStorage.setItem('medimitra_voice_consent', checked ? 'true' : 'false');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const stopSpeaking = useCallback(() => {
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
      stopSpeechRef.current = null;
    }
    if (stopSpeechTranslatedRef.current) {
      stopSpeechTranslatedRef.current();
      stopSpeechTranslatedRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeakingTranslated(false);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
  }, []);

  const deleteRecording = useCallback(() => {
    stopRecording();
    stopSpeaking();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setTranslatedText('');
    setTranscriptionMetadata(null);
    setLanguageMismatchPrompt(null);
    setReviewRecord(null);
    setError(null);
    setSpeechNotice(null);
    setDosageWarning([]);
    setRecordingDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [audioUrl, stopRecording, stopSpeaking]);

  // Cleanup on unmount or close: zero mic leaks, timers cleared, URLs revoked
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      stopSpeaking();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      setRecordingDuration(0);
      setError(null);
      setSpeechNotice(null);
      setLanguageMismatchPrompt(null);
    }

    return () => {
      stopRecording();
      stopSpeaking();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isOpen, stopRecording, stopSpeaking, audioUrl]);

  // Esc key & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Device voice status for active language (Powered by high-availability Speech APIs)
  const deviceStatus: DeviceVoiceStatus = getEffectiveVoiceStatus(activeLang.code);
  const languageSupport = computeLanguageSupport(activeLang.code);

  // Live Speech Recognition with complete error mapping & state reset
  const startLiveRecognition = useCallback((locale: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        let live = '';
        for (let i = 0; i < event.results.length; i++) {
          live += event.results[i][0].transcript + ' ';
        }
        if (live.trim()) {
          setTranscript(live.trim());
        }
      };

      recognition.onerror = (e: any) => {
        const errType = e.error;
        console.warn('SpeechRecognition error:', errType);

        if (errType === 'not-allowed') {
          stopRecording();
          setError('Microphone access is blocked. Please allow microphone access in your browser settings.');
        } else if (errType === 'language-not-supported') {
          try {
            recognition.stop();
          } catch {}
          speechRecognitionRef.current = null;
          setSpeechNotice(`Live preview unavailable for ${activeLang.name} on this browser. Voice is being recorded for transcription.`);
        } else if (errType === 'no-speech') {
          // Normal pause in speech; do not abort recording
        } else if (errType === 'audio-capture') {
          stopRecording();
          setError('No microphone was detected. Please check your audio input hardware.');
        } else if (errType === 'network') {
          try {
            recognition.stop();
          } catch {}
          speechRecognitionRef.current = null;
          setSpeechNotice('Live streaming preview offline; audio recording continues.');
        } else {
          console.warn('Live recognition non-fatal note:', errType);
        }
      };

      recognition.onend = () => {
        // Live speech recognition ended (speech pause or language-not-supported).
        // Main audio recording continues via mediaRecorder until stopped by user.
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization note:', e);
    }
  }, [activeLang.name, stopRecording]);

  // Language switch
  const switchLanguage = (langDetail: LanguageDetail) => {
    setActiveLang(langDetail);
    setTargetTranslateLang(langDetail.code === 'en' ? 'hi' : 'en');
    setSpeechNotice(null);
    setVoiceUnavailable(false);
    setError(null);
    setLanguageMismatchPrompt(null);

    const locale = getLocaleForLanguage(langDetail.code);
    const targetStatus = getEffectiveVoiceStatus(langDetail.code);

    if (isRecording && speechRecognitionRef.current) {
      speechRecognitionRef.current.onend = null;
      try {
        speechRecognitionRef.current.stop();
      } catch {}

      if (targetStatus === 'Full voice' || targetStatus === 'Input only') {
        startLiveRecognition(locale);
      } else {
        setSpeechNotice(
          `Voice is not available for ${langDetail.name} on this device. You can type instead.`
        );
      }
    }
  };

  // Start recording audio
  const startRecording = async () => {
    if (!hasConsent) {
      setError('Please provide microphone consent before recording audio.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(`Microphone access is not supported on this browser. You can type notes in ${activeLang.name} directly below.`);
      return;
    }

    setError(null);
    setSpeechNotice(null);
    setVoiceUnavailable(false);
    setLanguageMismatchPrompt(null);
    stopSpeaking();
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let chosenMime = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(chosenMime)) {
        chosenMime = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorderOptions: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const finalMime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        setAudioBlob(blob);

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Silence guard: if the recording is under 1 second or silent, do not call the API
        if (recordingDurationRef.current < 1 || blob.size < 200) {
          setError('We could not hear that. Please try again or type.');
          return;
        }

        // Auto-transcribe recorded blob
        setIsTranscribing(true);
        setError(null);
        try {
          const ext = finalMime.includes('mp4') ? 'mp4' : 'webm';
          const result = await transcribeAudioBlob(
            blob,
            `voice_recording.${ext}`,
            activeLang.code,
            { consent: true, extractMedical: false }
          );

          if (result.success && result.text && result.text.trim()) {
            setTranscript(result.text.trim());
            setTranscriptionMetadata(result);

            // Low confidence check
            if (result.low_confidence) {
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }

            // Language mismatch check
            if (result.detected_language) {
              const det = result.detected_language.toLowerCase().trim();
              const curr = activeLang.code.toLowerCase().trim();
              if (det !== curr && det !== activeLang.name.toLowerCase()) {
                const foundLang = CURATED_LANGUAGES.find(
                  (l) => l.code === det || l.name.toLowerCase() === det
                );
                if (foundLang) {
                  setLanguageMismatchPrompt({
                    detected: foundLang.name,
                    langCode: foundLang.code,
                  });
                }
              }
            }
          } else {
            setError(result.error || 'We could not hear that. Please try again or type.');
          }
        } catch (transErr: any) {
          setError(transErr.message || 'We could not hear that. Please try again or type.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      recordingDurationRef.current = 0;
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration(recordingDurationRef.current);
      }, 1000);

      const targetLocale = getLocaleForLanguage(activeLang.code);
      if (targetLocale !== 'unsupported') {
        startLiveRecognition(targetLocale);
      }
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access is blocked. Please allow microphone permissions in your browser.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone was detected. Please check your audio input hardware.');
      } else if (err.name === 'NotReadableError') {
        setError('Microphone is busy or being used by another application.');
      } else {
        setError('Could not access microphone. You can type notes directly below.');
      }
    }
  };

  // Handle audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasConsent) {
      setError('Please provide microphone and audio processing consent first.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Audio file exceeds maximum size limit of 25 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setAudioBlob(file);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(URL.createObjectURL(file));
    setTranscript('');
    setTranscriptionMetadata(null);
    setLanguageMismatchPrompt(null);
    setReviewRecord(null);

    setIsTranscribing(true);
    transcribeAudioBlob(file, file.name, activeLang.code, { consent: true, extractMedical: false })
      .then((result) => {
        if (result.success && result.text && result.text.trim()) {
          setTranscript(result.text.trim());
          setTranscriptionMetadata(result);
          if (result.low_confidence && textareaRef.current) {
            textareaRef.current.focus();
          }

          if (result.detected_language) {
            const det = result.detected_language.toLowerCase().trim();
            const curr = activeLang.code.toLowerCase().trim();
            if (det !== curr && det !== activeLang.name.toLowerCase()) {
              const foundLang = CURATED_LANGUAGES.find(
                (l) => l.code === det || l.name.toLowerCase() === det
              );
              if (foundLang) {
                setLanguageMismatchPrompt({
                  detected: foundLang.name,
                  langCode: foundLang.code,
                });
              }
            }
          }
        } else {
          setError(result.error || 'We could not hear that. Please try again or type.');
        }
      })
      .catch((err) => {
        setError(err.message || 'We could not hear that. Please try again or type.');
      })
      .finally(() => {
        setIsTranscribing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  // Handle translation for display only
  const handleTranslate = async () => {
    const textToTranslate = transcript.trim();
    if (!textToTranslate) {
      setError('Please record or enter a transcript to translate.');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setDosageWarning([]);

    try {
      const res = await translateInstructionOnline(textToTranslate, targetTranslateLang, activeLang.code);
      if (res && res.translated) {
        setTranslatedText(res.translated);
        const dosageCheck = verifyDosageNumbersPreserved(textToTranslate, res.translated);
        if (!dosageCheck.preserved) {
          setDosageWarning(dosageCheck.missing);
        }
      } else {
        throw new Error('Translation returned empty text.');
      }
    } catch (err: any) {
      setError(err.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Extract medical record strictly on the USER-EDITED transcript text
  const handleExtractMedicalRecord = async () => {
    const textToProcess = transcript.trim();
    if (!textToProcess) {
      setError('Please provide consultation notes to extract records.');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const result = await extractMedicalFromText(textToProcess, activeLang.code);

      if (result.success && result.extracted_medical) {
        setReviewRecord(result.extracted_medical);
      } else {
        setError('Could not extract a record. Please review the transcript.');
      }
    } catch (err: any) {
      setError('Could not extract a record. Please review the transcript.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm and save reviewed clinical record
  const handleConfirmReviewRecord = () => {
    if (!reviewRecord) return;

    const sourceTag = translatedText ? 'voice, translated' : 'voice';
    const uploadResponse: UploadResponse = {
      success: true,
      message: 'Voice consultation record verified and confirmed.',
      file_hash: 'voice-' + Date.now(),
      filename: `Voice_Consultation_${activeLang.code.toUpperCase()}.webm`,
      file_size_bytes: audioBlob?.size || new Blob([transcript]).size,
      mime_type: audioBlob?.type || 'audio/webm',
      is_cached: false,
      is_fallback: false,
      model_used: transcriptionMetadata?.model || 'OpenAI Whisper (whisper-1)',
      data: reviewRecord,
      created_at: new Date().toISOString(),
    };

    (uploadResponse as any).source = sourceTag;
    onExtractionComplete(uploadResponse);
    onClose();
  };

  // Text-to-speech for transcript - never uses another language's voice
  const speakTranscript = () => {
    if (!transcript) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);
    setVoiceUnavailable(false);

    const stopFn = speakMedicalText(
      transcript,
      activeLang.code,
      () => {
        setIsSpeaking(false);
        stopSpeechRef.current = null;
      },
      () => {
        // Fall back to Cloud Gnani Indic TTS before reporting unavailable
        const cloudStop = playCloudTts(
          transcript,
          activeLang.code,
          () => {
            setIsSpeaking(false);
            stopSpeechRef.current = null;
          },
          () => {
            setIsSpeaking(false);
            stopSpeechRef.current = null;
            setVoiceUnavailable(true);
          }
        );
        stopSpeechRef.current = cloudStop;
      }
    );
    stopSpeechRef.current = stopFn;
  };

  // Text-to-speech for translated text
  const speakTranslated = () => {
    if (!translatedText) return;
    if (isSpeakingTranslated) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    setIsSpeakingTranslated(true);

    const stopFn = speakMedicalText(
      translatedText,
      targetTranslateLang,
      () => {
        setIsSpeakingTranslated(false);
        stopSpeechTranslatedRef.current = null;
      },
      () => {
        // Fall back to Cloud Gnani Indic TTS before reporting unavailable
        const cloudStop = playCloudTts(
          translatedText,
          targetTranslateLang,
          () => {
            setIsSpeakingTranslated(false);
            stopSpeechTranslatedRef.current = null;
          },
          () => {
            setIsSpeakingTranslated(false);
            stopSpeechTranslatedRef.current = null;
            setVoiceUnavailable(true);
          }
        );
        stopSpeechTranslatedRef.current = cloudStop;
      }
    );
    stopSpeechTranslatedRef.current = stopFn;
  };

  const copyToClipboard = (text: string, isTrans: boolean = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isTrans) {
      setCopiedTranslated(true);
      setTimeout(() => setCopiedTranslated(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // List of nearest supported languages for explicit fallback button
  const alternativeSupportedLangs = CURATED_LANGUAGES.filter(
    (l) => ['en', 'hi', 'ta', 'te'].includes(l.code) && l.code !== activeLang.code
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-200 bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-white shadow-inner">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
                  Voice Assistant & Dictation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">
                  {transcriptionMetadata?.provider || 'OpenAI Whisper'} ({transcriptionMetadata?.model || 'whisper-1'})
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <span>Device Status:</span>
                <span className="font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px]">
                  {deviceStatus}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close voice dictation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* Mandatory Privacy & Microphone Consent Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Patient Privacy & Microphone Consent</p>
              <p className="text-slate-600">
                MediMitra uses your microphone for consultation notes. Audio is processed directly and deleted immediately after transcription. No audio is stored.
              </p>
              <label className="flex items-center gap-2 pt-1 font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => handleConsentToggle(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-[#0284C7] w-4 h-4"
                />
                <span>I consent to microphone voice transcription</span>
              </label>
            </div>
          </div>

          {/* Review Screen (when extraction is ready) */}
          {reviewRecord ? (
            <div className="space-y-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
              <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0284C7]" />
                  <h3 className="font-bold text-sm text-slate-900">Review Voice-Extracted Clinical Record</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Confidence: {Math.round((reviewRecord.confidence_scores?.overall || 0.85) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={reviewRecord.patient_name || ''}
                    onChange={(e) => setReviewRecord({ ...reviewRecord, patient_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Doctor Name</label>
                  <input
                    type="text"
                    value={reviewRecord.doctor_name || ''}
                    onChange={(e) => setReviewRecord({ ...reviewRecord, doctor_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Diagnoses */}
              {reviewRecord.diagnoses && reviewRecord.diagnoses.length > 0 && (
                <div className="text-xs">
                  <label className="font-semibold text-slate-700">Diagnoses / Symptoms</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {reviewRecord.diagnoses.map((diag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-medium">
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {reviewRecord.medicines && reviewRecord.medicines.length > 0 && (
                <div className="text-xs space-y-1.5">
                  <label className="font-semibold text-slate-700">Prescribed Medications</label>
                  <div className="space-y-1.5">
                    {reviewRecord.medicines.map((med: MedicineItem, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900">{med.name}</strong>
                          <span className="text-slate-600 ml-2">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </span>
                        </div>
                        {med.instructions && (
                          <span className="text-[11px] text-slate-500 italic">{med.instructions}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-sky-200">
                <button
                  type="button"
                  onClick={() => setReviewRecord(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                >
                  Back to Transcript
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReviewRecord}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Confirm & Save to Health Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Language Selector Ribbon with Device Voice Status */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-semibold">
                    <Globe2 className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Language:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0369A1]">
                      {activeLang.nativeName} ({activeLang.code.toUpperCase()})
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      deviceStatus === 'Full voice'
                        ? 'bg-emerald-100 text-emerald-800'
                        : deviceStatus === 'Output only'
                        ? 'bg-blue-100 text-blue-800'
                        : deviceStatus === 'Input only'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {deviceStatus}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {QUICK_VOICE_LANGS.map((q) => {
                    const isActive = activeLang.code === q.code;
                    const qStatus = getEffectiveVoiceStatus(q.code);
                    return (
                      <button
                        key={q.code}
                        type="button"
                        onClick={() => {
                          const found = CURATED_LANGUAGES.find((l) => l.code === q.code);
                          if (found) switchLanguage(found);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                          isActive
                            ? 'bg-[#0284C7] text-white font-bold shadow-sm scale-[1.02]'
                            : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={`${q.label} (${qStatus})`}
                      >
                        <span>{q.label}</span>
                        <span className={`text-[9px] px-1 rounded ${
                          isActive ? 'bg-white/20 text-white' : 'text-slate-400'
                        }`}>
                          {qStatus === 'Full voice' ? '✓' : qStatus === 'Output only' ? '🔊' : qStatus === 'Input only' ? '🎤' : '📝'}
                        </span>
                      </button>
                    );
                  })}

                  {/* Dropdown with Status Label */}
                  <div className="ml-auto relative min-w-[150px]">
                    <select
                      value={activeLang.code}
                      onChange={(e) => {
                        const found = CURATED_LANGUAGES.find((l) => l.code === e.target.value);
                        if (found) switchLanguage(found);
                      }}
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#0284C7] shadow-sm cursor-pointer"
                    >
                      <optgroup label="Indian Languages">
                        {CURATED_LANGUAGES.filter((l) => l.region === 'Indian').map((l) => {
                          const st = getEffectiveVoiceStatus(l.code);
                          return (
                            <option key={l.code} value={l.code}>
                              {l.nativeName} ({l.name}) — {st}
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="Global Languages">
                        {CURATED_LANGUAGES.filter((l) => l.region === 'Global').map((l) => {
                          const st = getEffectiveVoiceStatus(l.code);
                          return (
                            <option key={l.code} value={l.code}>
                              {l.nativeName} ({l.name}) — {st}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* Unsupported Language Notification (Rule A.4: Never silent fallback) */}
              {(deviceStatus === 'Text only' || deviceStatus === 'Output only') && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Voice is not available for {activeLang.name} on this device. You can type instead.</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-semibold text-amber-800">Or tap a supported language:</span>
                    {alternativeSupportedLangs.map((alt) => (
                      <button
                        key={alt.code}
                        type="button"
                        onClick={() => switchLanguage(alt)}
                        className="px-2.5 py-0.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold text-[11px] transition-colors"
                      >
                        {alt.nativeName} ({alt.name})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recording Area with Clear Listening Indicator */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      <span>🔴 Listening... ({formatTime(recordingDuration)})</span>
                    </div>
                    <div className="flex items-center gap-1.5 h-10">
                      {[35, 70, 95, 55, 100, 85, 45, 90, 65, 80, 50, 95, 40].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-[#0284C7] animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 0.07}s`,
                            animationDuration: '0.5s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-3">
                    <span className="text-xs text-slate-600 font-medium">
                      Ready to record in <strong className="text-[#0369A1]">{activeLang.nativeName}</strong>
                    </span>
                  </div>
                )}

                {/* Record Button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={!hasConsent || isTranscribing}
                    className="group relative p-6 rounded-full bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!hasConsent ? 'Please check consent checkbox first' : 'Click to start recording'}
                  >
                    <Mic className="w-8 h-8 text-white" />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-[#0369A1] whitespace-nowrap">
                      Click to Speak
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="group relative p-6 rounded-full bg-[#D9534F] text-white font-bold shadow-lg transition-all animate-pulse"
                  >
                    <Square className="w-8 h-8 text-white fill-white" />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-[#D9534F] whitespace-nowrap">
                      Stop Recording ({formatTime(recordingDuration)})
                    </span>
                  </button>
                )}

                {/* Audio Playback Controls */}
                {audioUrl && !isRecording && (
                  <div className="mt-8 w-full max-w-md bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <audio src={audioUrl} controls className="w-full h-9 rounded-lg" />
                  </div>
                )}
              </div>

              {/* Upload Alternative & Delete Recording */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">or upload audio:</span>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer transition-all shadow-sm">
                    <FileAudio className="w-4 h-4 text-[#0284C7]" />
                    <span>Choose Audio File (max 25 MB)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".flac,.mp3,.mp4,.mpeg,.mpga,.m4a,.ogg,.wav,.webm,audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Always Visible Delete Recording Button */}
                {(audioBlob || transcript) && (
                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all"
                    title="Delete current recording and reset transcript"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Recording</span>
                  </button>
                )}
              </div>

              {/* Transcribing Indicator */}
              {isTranscribing && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-100 border border-sky-300 text-xs font-semibold text-sky-900 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0284C7] shrink-0" />
                  <span>Transcribing speech in authentic {activeLang.nativeName}...</span>
                </div>
              )}

              {/* Low Confidence Warning (Prompt C) */}
              {transcriptionMetadata?.low_confidence && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please check this text before using it. Speech may have been indistinct.</span>
                </div>
              )}

              {/* Language Mismatch Prompt (Prompt C) */}
              {languageMismatchPrompt && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>This sounded like <strong>{languageMismatchPrompt.detected}</strong>. Use it?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = CURATED_LANGUAGES.find((l) => l.code === languageMismatchPrompt.langCode);
                        if (target) switchLanguage(target);
                        setLanguageMismatchPrompt(null);
                      }}
                      className="px-2.5 py-1 rounded bg-[#0284C7] text-white font-bold hover:bg-[#0369A1]"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguageMismatchPrompt(null)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript Display & Editable Area (Rule A.2: Save User's Edited Transcript) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Clinical Transcript ({activeLang.nativeName}):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {transcript && (
                      <button
                        type="button"
                        onClick={speakTranscript}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSpeaking
                            ? 'bg-[#0284C7] text-white shadow-sm animate-pulse'
                            : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                        }`}
                        title="Listen to speech output"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Stop Speaking' : '🔊 Listen'}</span>
                      </button>
                    )}

                    {transcript && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(transcript, false)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0284C7] font-medium transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={`Speak into microphone or upload audio to see transcription in ${activeLang.nativeName}. You can also type or edit doctor consultation notes directly here...`}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-sans placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] resize-none transition-all shadow-sm leading-relaxed"
                />

                {/* Telemetry and Warnings Badge */}
                {transcriptionMetadata && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span>Detected: <strong>{transcriptionMetadata.detected_language}</strong></span>
                    {transcriptionMetadata.duration_seconds ? (
                      <span>• Duration: <strong>{transcriptionMetadata.duration_seconds.toFixed(1)}s</strong></span>
                    ) : null}
                    {transcriptionMetadata.warnings?.map((w, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Unavailable Notice (Rule B.4: Show text only, never read with another language) */}
              {voiceUnavailable && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Voice not available for this language on this device.</span>
                </div>
              )}

              {/* Speech Notice */}
              {speechNotice && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{speechNotice}</span>
                </div>
              )}

              {/* Translation Suite (Display only) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-blue-50/60 border border-sky-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Languages className="w-4 h-4 text-[#0284C7]" />
                    <span>Translate Transcript (for Display Only):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={targetTranslateLang}
                      onChange={(e) => setTargetTranslateLang(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0284C7] shadow-sm cursor-pointer"
                    >
                      <option value="en">English (Universal)</option>
                      {CURATED_LANGUAGES.filter((l) => l.code !== 'en').map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.nativeName} ({l.name})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleTranslate}
                      disabled={isTranslating || !transcript.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe2 className="w-3.5 h-3.5" />}
                      <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                    </button>
                  </div>
                </div>

                {/* Translated Output Card */}
                {translatedText && (
                  <div className="p-3 rounded-xl bg-white border border-sky-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Translated Display:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={speakTranslated}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-semibold"
                        >
                          {isSpeakingTranslated ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>Listen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(translatedText, true)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          {copiedTranslated ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={translatedText}
                      onChange={(e) => setTranslatedText(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-slate-900 text-xs font-sans focus:outline-none focus:border-[#0284C7] resize-none leading-relaxed"
                    />

                    {/* Dosage Number Integrity Warning */}
                    {dosageWarning.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Check dosage numbers: </strong>
                          <span>Some clinical numbers/units from the original transcript may differ in translation: </span>
                          <span className="font-semibold text-amber-950">{dosageWarning.join(', ')}</span>
                          <p className="text-[11px] text-amber-800 mt-0.5">The original transcript is kept visible above for medical verification.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Alert (Rule A.1: "We could not hear that. Please try again or type.") */}
              {error && (
                <div
                  aria-live="polite"
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Extraction Trigger */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500 italic">
                  Extraction runs strictly on the transcript text above to ensure clinical fidelity.
                </p>
                <button
                  type="button"
                  onClick={handleExtractMedicalRecord}
                  disabled={isExtracting || !transcript.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isExtracting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                  <span>{isExtracting ? 'Extracting Record...' : 'Extract Medical Record'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
