/**
 * MediMitra Safe Server-Side Whisper Transcription Module (ESM)
 * OpenAI Whisper API (whisper-1) with strict privacy, silence guards,
 * medical vocabulary prompt, retry on 400 without hint, and temp file cleanup.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export const ALLOWED_EXTENSIONS = new Set([
  '.flac', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.ogg', '.wav', '.webm'
]);

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB limit
export const MAX_DURATION_SECONDS = 600; // 10 minutes

export const BASE_MEDICAL_PROMPT = 
  'Doctor consultation, medical symptoms, diagnoses, prescription medications, clinical dosages (e.g. 650 mg, 500 mg, TDS, BD), ICD-10 notes.';

export function getOpenAIApiKey() {
  const key = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
  if (!key || key.toUpperCase().includes('YOUR') || key.toUpperCase().includes('KEY')) {
    throw new Error('Invalid or missing OpenAI API key. Please configure OPENAI_API_KEY in .env.');
  }
  return key;
}

export function getGnaniApiKey() {
  const key = process.env.GNANI_API_KEY ? process.env.GNANI_API_KEY.trim() : '';
  return key;
}

export function validateAudioFile(filePath, fileBytes) {
  if (!fileBytes || fileBytes.length === 0) {
    throw new Error('Audio file is empty. Please provide a valid recording.');
  }

  if (fileBytes.length > MAX_AUDIO_BYTES) {
    throw new Error('Audio file exceeds maximum size limit of 25 MB.');
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const allowed = Array.from(ALLOWED_EXTENSIONS).sort().join(', ');
    throw new Error(`Unsupported audio format '${ext}'. Allowed extensions: ${allowed}`);
  }
}

/**
 * Transcribes audio file safely with Whisper
 * Deletes temp file in a finally block, enforces silence guard and confidence checks.
 */
export async function safeTranscribeAudioFile(filePath, options = {}) {
  const {
    languageHint = null,
    vocabulary = '',
    consent = true,
    deleteAfter = false, // Clean up input temp file if flagged
  } = options;

  if (!consent) {
    throw new Error('Patient consent is required before processing audio on server.');
  }

  let fileStream = null;

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file does not exist at path: ${filePath}`);
    }

    const fileStats = fs.statSync(filePath);
    if (fileStats.size === 0) {
      throw new Error('Audio file is empty. Please provide a valid recording.');
    }

    if (fileStats.size > MAX_AUDIO_BYTES) {
      throw new Error('Audio file exceeds maximum size limit of 25 MB.');
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      const allowed = Array.from(ALLOWED_EXTENSIONS).sort().join(', ');
      throw new Error(`Unsupported audio format '${ext}'. Allowed extensions: ${allowed}`);
    }

    const apiKey = getOpenAIApiKey();
    const openai = new OpenAI({ apiKey, timeout: 60000, maxRetries: 2 });

    const prompt = vocabulary && vocabulary.trim()
      ? `${BASE_MEDICAL_PROMPT} Vocabulary: ${vocabulary.trim()}`
      : BASE_MEDICAL_PROMPT;

    const warnings = [];
    let response = null;

    // First attempt with language hint if provided
    fileStream = fs.createReadStream(filePath);

    try {
      const params = {
        file: fileStream,
        model: 'whisper-1',
        response_format: 'verbose_json',
        temperature: 0,
        prompt: prompt,
      };

      if (languageHint && typeof languageHint === 'string' && languageHint.trim()) {
        params.language = languageHint.trim().toLowerCase();
      }

      response = await openai.audio.transcriptions.create(params);
    } catch (apiErr) {
      // If language hint was rejected with a 400 error, retry once without language hint
      if (languageHint && (apiErr.status === 400 || apiErr.code === 'invalid_language' || apiErr.message?.includes('language'))) {
        warnings.push(`Language hint '${languageHint}' was rejected by Whisper; retried with auto-detection.`);
        fileStream = fs.createReadStream(filePath);
        response = await openai.audio.transcriptions.create({
          file: fileStream,
          model: 'whisper-1',
          response_format: 'verbose_json',
          temperature: 0,
          prompt: prompt,
        });
      } else {
        // Map friendly error
        if (apiErr.status === 401) {
          throw new Error('Invalid or missing OpenAI API key. Please configure OPENAI_API_KEY in .env.');
        } else if (apiErr.status === 413) {
          throw new Error('Audio file exceeds maximum size limit of 25 MB.');
        } else if (apiErr.status === 429) {
          throw new Error('Transcription service is currently busy or rate limited. Please try again shortly.');
        } else if (apiErr.status === 504 || apiErr.name === 'AbortError') {
          throw new Error('Transcription request timed out.');
        }
        throw apiErr;
      }
    }

    const text = (response.text || '').trim();
    const detectedLanguage = response.language || languageHint || 'auto';
    const duration = parseFloat(response.duration || 0);
    const segments = response.segments || [];

    // Silence Guard: check no_speech_prob
    if (segments.length > 0) {
      const probs = segments
        .map((s) => s.no_speech_prob)
        .filter((p) => typeof p === 'number');
      if (probs.length > 0) {
        const avgNoSpeech = probs.reduce((a, b) => a + b, 0) / probs.length;
        if (avgNoSpeech > 0.6) {
          throw new Error('No clear speech detected. Please record again.');
        }
      }
    }

    // Flag low confidence when avg_logprob < -1.0
    let lowConfidence = false;
    if (segments.length > 0) {
      const logprobs = segments
        .map((s) => s.avg_logprob)
        .filter((lp) => typeof lp === 'number');
      if (logprobs.length > 0) {
        const avgLogprob = logprobs.reduce((a, b) => a + b, 0) / logprobs.length;
        if (avgLogprob < -1.0) {
          lowConfidence = true;
          warnings.push('Audio confidence is low; speech was indistinct or muffled.');
        }
      }
    }

    // Mismatch warning if detected differs from chosen
    if (languageHint && detectedLanguage) {
      const normDet = detectedLanguage.toLowerCase();
      const normHint = languageHint.toLowerCase();
      if (normDet !== normHint && !normDet.startsWith(normHint)) {
        warnings.push(`Spoken language detected as '${detectedLanguage}', which differs from selected '${languageHint}'.`);
      }
    }

    return {
      success: true,
      text,
      detected_language: detectedLanguage,
      duration_seconds: duration,
      low_confidence: lowConfidence,
      warnings,
      provider: 'OpenAI Whisper',
      model: 'whisper-1',
    };
  } finally {
    // Delete temp file in finally block to ensure zero retention
    if (deleteAfter && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`Could not delete temp audio file ${filePath}:`, err);
      }
    }
  }
}
