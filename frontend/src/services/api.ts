import { UploadResponse, SampleDoc } from '../types/medical';

// Auto-detect base URL (defaults to direct port 8000 or relative proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function uploadMedicalDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = 'Upload failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errorDetail;
      } catch {
        errorDetail = `Server responded with status ${response.status}`;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Cannot connect to MediMitra backend server at http://localhost:8000. Please ensure the backend is running (`npm run backend:dev` or `npm run dev`).'
      );
    }
    throw err;
  }
}

export async function fetchAvailableSamples(): Promise<SampleDoc[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/samples`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.samples || [];
  } catch (err) {
    console.warn('Could not fetch remote samples list, using bundled synthetic fallbacks:', err);
    return [];
  }
}

export async function checkBackendHealth(): Promise<{ status: string; has_api_key: boolean; model_configured: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Backend health check returned non-200');
    }
    return response.json();
  } catch (err: any) {
    throw new Error('Backend offline');
  }
}

export interface MedicalAiResponse {
  success: boolean;
  query: string;
  language: string;
  answer: string;
  key_points?: string[];
  precautions?: string[];
  when_to_see_doctor?: string[];
  lifestyle_diet?: string[];
  related_drugs?: string[];
  icd_10_codes?: string[];
  model_used?: string;
  disclaimer?: string;
}

export async function askMedicalQuestion(
  query: string,
  languageCode: string = 'en',
  contextData?: any
): Promise<MedicalAiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/ask-medical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        query,
        language: languageCode,
        context: contextData,
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = 'Failed to get medical response';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errorDetail;
      } catch {
        errorDetail = `Server responded with status ${response.status}`;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Medical AI Question API error:', err);
    throw err;
  }
}

export interface MedicineDetailed {
  name: string;
  molecule?: string;
  why_prescribed: string;
  how_it_works: string;
  how_to_take: string;
  food_diet_rules?: string;
  side_effects?: string;
}

export interface LabTestExplained {
  name: string;
  value: string;
  reference_range?: string;
  clinical_meaning: string;
  status?: string;
  recommendation?: string;
}

export interface ConditionInsight {
  name: string;
  explanation: string;
  severity?: string;
}

export interface PrescriptionIntelligenceResponse {
  success: boolean;
  language?: string;
  overall_summary: string;
  condition_insights?: ConditionInsight[];
  medicines_detailed?: MedicineDetailed[];
  lab_tests_explained?: LabTestExplained[];
  safety_and_interactions?: {
    status: string;
    summary: string;
    alerts?: string[];
  };
  lifestyle_and_diet_plan?: {
    diet_advice?: string[];
    hydration_and_exercise?: string[];
    daily_routine?: string[];
  };
  red_flags?: string[];
  doctor_questions?: string[];
  speech_summary?: string;
  model_used?: string;
  disclaimer?: string;
}

export async function getPrescriptionIntelligence(
  docData: any,
  languageCode: string = 'en'
): Promise<PrescriptionIntelligenceResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/prescription-intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        document: docData,
        language: languageCode,
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = 'Failed to get prescription intelligence';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errorDetail;
      } catch {
        errorDetail = `Server responded with status ${response.status}`;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Prescription Intelligence API error:', err);
    throw err;
  }
}


