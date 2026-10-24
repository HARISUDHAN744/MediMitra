/**
 * MediMitra Universal Audio & Speech-to-Text Transcription Service
 * Browser-compatible client invoking the backend POST /transcribe endpoint.
 */

import { speakMedicalText } from './languageService';

export interface TranscriptionOptions {
  language?: string; // ISO 639-1 code hint (e.g. 'hi', 'ta', 'te', 'en', 'es')
  vocabulary?: string; // Drug names and clinical terms
  consent?: boolean; // Patient consent flag (required true)
  extractMedical?: boolean; // Whether to run grounded clinical extraction
  text?: string; // For text-only extraction
}

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  detected_language?: string;
  duration_seconds?: number;
  low_confidence?: boolean;
  warnings?: string[];
  provider?: string;
  model?: string;
  extracted_medical?: any;
  error?: string;
}

/**
 * Universal Safe Audio Transcriber
 * Communicates with the FastAPI /transcribe endpoint with full consent, validation, and timeout handling.
 */
export async function transcribeAudioBlob(
  audioBlob?: Blob | null,
  filename: string = 'recording.webm',
  languageCode?: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
  const consent = options.consent !== undefined ? options.consent : true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    let response: Response;

    if (audioBlob) {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      formData.append('consent', consent ? 'true' : 'false');

      if (languageCode || options.language) {
        formData.append('language', languageCode || options.language || '');
      }
      if (options.vocabulary) {
        formData.append('vocabulary', options.vocabulary);
      }
      if (options.extractMedical) {
        formData.append('extract_medical', 'true');
      }

      response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } else if (options.text) {
      response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          language: languageCode || options.language,
          consent: consent,
          extract_medical: !!options.extractMedical,
        }),
        signal: controller.signal,
      });
    } else {
      throw new Error('No audio recording or transcript text provided.');
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errText = 'Audio transcription failed';
      try {
        const json = await response.json();
        errText = json.detail || errText;
      } catch {
        if (response.status === 413) errText = 'Audio file exceeds maximum size limit of 25 MB.';
        else if (response.status === 429) errText = 'Transcription service is currently busy. Please try again.';
        else if (response.status === 504) errText = 'Transcription request timed out.';
      }
      throw new Error(errText);
    }

    const data: TranscriptionResult = await response.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    const message = isAbort
      ? 'Transcription request timed out (60s limit).'
      : err.message || 'Failed to connect to transcription service.';

    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Text-only clinical extraction using original transcript text
 */
export async function extractMedicalFromText(
  text: string,
  languageCode?: string
): Promise<TranscriptionResult> {
  return transcribeAudioBlob(null, 'voice_transcript.txt', languageCode, {
    text,
    extractMedical: true,
    consent: true,
  });
}

/**
 * Synthesizes and plays clinical voice audio using Gnani.ai / backend TTS endpoint.
 * This guarantees high-quality Indic voice playback (Tamil, Telugu, Kannada, Malayalam,
 * Bengali, Marathi, Gujarati, Punjabi, Hindi, etc.) even when the client OS lacks local voices.
 */
export function playCloudTts(
  text: string,
  langCode: string,
  onEnd?: () => void,
  onError?: (err: any) => void,
  onStart?: () => void
): () => void {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return () => {};
  }

  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return () => {};
  }

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
  const controller = new AbortController();
  let audio: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;
  let isCancelled = false;

  const cleanup = () => {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      audio = null;
    }
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {}
      audioUrl = null;
    }
  };

  const isoCode = (langCode || 'en').toLowerCase().split('-')[0].trim();
  const providerPref = (isoCode === 'ta' || isoCode === 'te') ? 'google' : undefined;

  fetch(`${API_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: cleanText,
      language: langCode,
      voice: 'Nalini',
      provider: providerPref,
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (isCancelled) return;
      if (!response.ok) {
        throw new Error(`TTS failed with status ${response.status}`);
      }
      const blob = await response.blob();
      if (isCancelled) return;
      audioUrl = URL.createObjectURL(blob);
      audio = new Audio(audioUrl);
      audio.onended = () => {
        cleanup();
        if (onEnd) onEnd();
      };
      audio.onerror = (e) => {
        cleanup();
        console.warn('Audio playback error:', e);
        if (onError) onError(e);
        else if (onEnd) onEnd();
      };
      if (onStart) onStart();
      await audio.play();
    })
    .catch((err) => {
      if (isCancelled) return;

      // Direct fallback to Google Speech API for Tamil ('ta'), Telugu ('te'), etc. if backend is unreachable
      if (['ta', 'te', 'hi', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'ur', 'en'].includes(isoCode)) {
        try {
          const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.substring(0, 160))}&tl=${isoCode}&client=tw-ob`;
          audio = new Audio(directUrl);
          audio.onended = () => {
            cleanup();
            if (onEnd) onEnd();
          };
          audio.onerror = (e) => {
            cleanup();
            if (onError) onError(e);
            else if (onEnd) onEnd();
          };
          if (onStart) onStart();
          audio.play().catch((playErr) => {
            cleanup();
            if (onError) onError(playErr);
            else if (onEnd) onEnd();
          });
          return;
        } catch {}
      }

      cleanup();
      console.warn('Cloud TTS synthesis error:', err);
      if (onError) onError(err);
      else if (onEnd) onEnd();
    });

  return () => {
    isCancelled = true;
    try {
      controller.abort();
    } catch {}
    cleanup();
  };
}

export type VoicePlaybackState = 'idle' | 'loading' | 'speaking' | 'error';

/**
 * Universal voice narration function:
 * speakText(summaryTextInTamil, "ta", voiceButton, (state) => { ... });
 * 
 * Supports Tamil, Telugu, Hindi, Kannada, Malayalam, Bengali, Marathi, English, and all Indic/global languages.
 * Orchestrates:
 * 1. State updates: 'loading' -> 'speaking' -> 'idle' (or 'error')
 * 2. Button element attributes and styling reflection (data-voice-state, aria-busy)
 * 3. Browser SpeechSynthesis + Cloud Multi-Engine Fallback (Indic-Parler-TTS, Google Speech API, Gnani)
 * 4. Returns an active cancel/stop callback.
 */
export function speakText(
  text: string,
  language: string = 'ta',
  voiceButton?: HTMLElement | null,
  onStateChange?: (state: VoicePlaybackState) => void
): () => void {
  let isCancelled = false;
  let activeStopFn: (() => void) | null = null;

  const updateState = (state: VoicePlaybackState) => {
    if (voiceButton) {
      voiceButton.dataset.voiceState = state;
      if (state === 'loading') {
        voiceButton.setAttribute('aria-busy', 'true');
      } else {
        voiceButton.removeAttribute('aria-busy');
      }
    }
    if (onStateChange) {
      onStateChange(state);
    }
  };

  const cleanText = (text || '')
    .replace(/[*_#`~]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    updateState('idle');
    return () => {};
  }

  updateState('loading');

  // Try local browser speech synthesis first via speakMedicalText
  activeStopFn = speakMedicalText(
    cleanText,
    language,
    () => {
      if (!isCancelled) {
        updateState('idle');
      }
    },
    () => {
      // Local voice unavailable on this OS -> delegate to Cloud Speech Synthesis (Indic-Parler-TTS / Google / Gnani)
      if (isCancelled) return;
      const cloudStop = playCloudTts(
        cleanText,
        language,
        () => {
          if (!isCancelled) updateState('idle');
        },
        (err) => {
          if (!isCancelled) {
            console.warn('speakText cloud voice playback error:', err);
            updateState('error');
            setTimeout(() => {
              if (!isCancelled) updateState('idle');
            }, 2500);
          }
        },
        () => {
          if (!isCancelled) updateState('speaking');
        }
      );
      activeStopFn = cloudStop;
    }
  );

  // If browser synthesis started speaking immediately
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
    updateState('speaking');
  }

  return () => {
    isCancelled = true;
    if (activeStopFn) {
      try {
        activeStopFn();
      } catch {}
      activeStopFn = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    updateState('idle');
  };
}

