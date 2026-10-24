/**
 * MediMitra Laboratory Diagnostics API Service.
 * Interfaces with FastAPI /labs/* backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface InsightCard {
  test_key: string;
  name: string;
  panel: string;
  value: number;
  unit: string;
  range_used: string;
  range_source: string;
  status: 'Normal' | 'Low' | 'High' | 'Critical-Low' | 'Critical-High';
  severity_colour: string; // green, amber, rose, darkred
  severity_label: string;  // Normal, Low, High, Critical Low, Critical High
  is_critical: boolean;
  what_it_measures: string;
  high_low_meaning: string;
  non_medical_factors: string;
  questions_for_doctor: string[];
  lifestyle_info: string;
  is_converted: boolean;
  low_confidence: boolean;
  warning?: string | null;
  disclaimer: string;
}

export interface CrossMarkerPattern {
  rule_id: string;
  panel: string;
  title: string;
  description: string;
  trigger_values: Record<string, any>;
  guideline_source: string;
  recommendation: string;
}

export interface LabSummary {
  total_markers: number;
  normal_count: number;
  high_count: number;
  low_count: number;
  critical_count: number;
  top_discussion_items: string[];
  wellness_score?: number | null;
  wellness_formula?: string | null;
  critical_warning?: string | null;
}

export interface InsightsResponse {
  patient_id?: string | null;
  patient_name?: string | null;
  document_date?: string | null;
  summary: LabSummary;
  patterns_detected: CrossMarkerPattern[];
  insights: InsightCard[];
  panels: string[];
  medicines_from_prescription: string[];
  medical_disclaimer: string;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
  unit: string;
  report_id?: string | null;
  status?: string | null;
}

export interface ProjectedBand {
  projected_date: string;
  lower_bound: number;
  midpoint: number;
  upper_bound: number;
  uncertainty_margin: number;
}

export interface TrendResponse {
  test_key: string;
  test_name: string;
  unit: string;
  panel: string;
  data_points_count: number;
  data_points: HistoricalDataPoint[];
  status: 'sufficient_data' | 'insufficient_data';
  trend_label: 'Improving' | 'Stable' | 'Worsening' | 'Unclear' | 'Not Enough Data';
  reason: string;
  slope_per_month?: number | null;
  r_squared?: number | null;
  projected_range?: ProjectedBand | null;
  reference_low?: number | null;
  reference_high?: number | null;
  disclaimer: string;
}

export interface DemoPatient {
  id: string;
  name: string;
  age: number;
  sex: string;
  condition_note: string;
  reports_count: number;
  latest_report_date?: string | null;
}

/**
 * Fetch list of demo patients.
 */
export async function fetchDemoPatients(): Promise<DemoPatient[]> {
  const res = await fetch(`${API_BASE_URL}/labs/patients`);
  if (!res.ok) {
    throw new Error('Failed to fetch demo patients');
  }
  return res.json();
}

/**
 * Fetch insights and evaluated biomarkers for a patient report.
 */
export async function fetchLabInsights(
  patientId: string = 'P101',
  reportIndex?: number,
  reportDate?: string
): Promise<InsightsResponse> {
  const params = new URLSearchParams({ patient_id: patientId });
  if (reportIndex !== undefined) {
    params.append('report_index', reportIndex.toString());
  }
  if (reportDate) {
    params.append('report_date', reportDate);
  }

  const res = await fetch(`${API_BASE_URL}/labs/insights?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch lab insights: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch historical trend and regression forecast for a specific test.
 */
export async function fetchTestTrend(
  test: string,
  patientId: string = 'P101'
): Promise<TrendResponse> {
  const params = new URLSearchParams({
    test,
    patient_id: patientId,
  });

  const res = await fetch(`${API_BASE_URL}/labs/trends?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trend for ${test}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Download clinical PDF dossier for patient.
 */
export async function downloadLabReportPdf(
  patientId: string = 'P101',
  reportDate?: string,
  language: string = 'en'
): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/labs/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patient_id: patientId,
      report_date: reportDate,
      language,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate PDF report from server');
  }
  return res.blob();
}
