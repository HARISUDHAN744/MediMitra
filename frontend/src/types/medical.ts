export interface MedicineItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface LabTestItem {
  name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  interpretation?: string;
}

export interface ConfidenceScores {
  document_type: number;
  patient_name: number;
  doctor_name: number;
  hospital_or_clinic: number;
  document_date: number;
  diagnoses: number;
  medicines: number;
  tests: number;
  overall: number;
}

export interface ExtractedMedicalDocument {
  document_type: string;
  patient_name?: string | null;
  doctor_name?: string | null;
  hospital_or_clinic?: string | null;
  document_date?: string | null;
  diagnoses: string[];
  medicines: MedicineItem[];
  tests: LabTestItem[];
  confidence_scores?: ConfidenceScores;
  notes?: string | null;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file_hash: string;
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  is_cached: boolean;
  is_fallback: boolean;
  fallback_reason?: string | null;
  model_used: string;
  data: ExtractedMedicalDocument;
  created_at: string;
}

export interface SampleDoc {
  id: string;
  title: string;
  json_file: string;
  image_file?: string | null;
  image_url?: string | null;
  document_type: string;
  patient_name: string;
  doctor_or_lab?: string | null;
  preview: ExtractedMedicalDocument;
}
