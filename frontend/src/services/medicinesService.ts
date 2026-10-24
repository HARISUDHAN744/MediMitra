/**
 * Medicine Knowledge Base, Jan Aushadhi Substitutes,
 * Drug Interaction & Duplicate Active Ingredient API Client.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface IngredientItem {
  id: string;
  name: string;
  strength_value: number;
  strength_unit: string;
  rxnorm_id?: string;
  therapeutic_class?: string;
}

export interface MedicineSummary {
  id: string;
  brand_name: string;
  manufacturer?: string;
  dosage_form: string;
  strength_text: string;
  pack_size: number;
  pack_unit: string;
  mrp: number;
  price_per_unit: number;
  rx_or_otc: string;
  schedule_h_flag: boolean;
  nlem_flag: boolean;
  nppa_ceiling_price?: number;
  price_as_of: string;
  source_name: string;
  is_stale_price: boolean;
  jan_aushadhi_code?: string;
  jan_aushadhi_price?: number;
  ingredients: IngredientItem[];
}

export interface MedicineDetail extends MedicineSummary {
  plain_language_info: string;
  substitutes_count: number;
  max_savings_percentage?: number;
  label_sections: Record<string, string>;
  label_source: string;
  label_context: string;
  data_source_url?: string;
  licence: string;
}

export interface SubstituteItem {
  id: string;
  brand_name: string;
  manufacturer?: string;
  dosage_form: string;
  strength_text: string;
  pack_size: number;
  pack_unit: string;
  mrp: number;
  price_per_unit: number;
  is_jan_aushadhi: boolean;
  savings_rupees: number;
  savings_percentage: number;
  price_as_of: string;
  source: string;
}

export interface SubstituteResponse {
  reference_medicine_id: string;
  reference_brand_name: string;
  reference_mrp: number;
  reference_dosage_form: string;
  reference_strength: string;
  substitutes_found: number;
  jan_aushadhi_option?: SubstituteItem;
  substitutes: SubstituteItem[];
  substitution_notice: string;
}

export interface InteractionFinding {
  drug_a: string;
  drug_b: string;
  quoted_sentence: string;
  source: string;
  severity_note: string;
}

export interface InteractionCheckResponse {
  medicines_checked: string[];
  interactions_count: number;
  interactions: InteractionFinding[];
  general_notice: string;
  disclaimer: string;
}

export interface DuplicateFinding {
  ingredient_name: string;
  matched_medicines: string[];
  warning: string;
}

export interface DuplicateCheckResponse {
  duplicates_detected: boolean;
  duplicate_count: number;
  findings: DuplicateFinding[];
  notice: string;
}

export interface ProviderHealthResponse {
  status: string;
  timestamp: string;
  providers: Record<string, any>;
}

export async function searchMedicines(
  query?: string,
  rxFilter?: string,
  nlemOnly: boolean = false,
  janAushadhiOnly: boolean = false,
  limit: number = 50
): Promise<MedicineSummary[]> {
  const params = new URLSearchParams();
  if (query && query.trim()) params.append('q', query.trim());
  if (rxFilter) params.append('rx_filter', rxFilter);
  if (nlemOnly) params.append('nlem_only', 'true');
  if (janAushadhiOnly) params.append('jan_aushadhi_only', 'true');
  params.append('limit', limit.toString());

  const res = await fetch(`${API_BASE_URL}/medicines/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to search medicines: ${res.statusText}`);
  }
  return res.json();
}

export async function getMedicineDetail(medicineId: string): Promise<MedicineDetail> {
  const res = await fetch(`${API_BASE_URL}/medicines/${encodeURIComponent(medicineId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch medicine detail: ${res.statusText}`);
  }
  return res.json();
}

export async function getMedicineSubstitutes(medicineId: string): Promise<SubstituteResponse> {
  const res = await fetch(`${API_BASE_URL}/medicines/${encodeURIComponent(medicineId)}/substitutes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch substitutes: ${res.statusText}`);
  }
  return res.json();
}

export async function checkInteractions(
  medicineIds?: string[],
  medicineNames?: string[]
): Promise<InteractionCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/medicines/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicine_ids: medicineIds, medicine_names: medicineNames }),
  });
  if (!res.ok) {
    throw new Error(`Failed to check drug interactions: ${res.statusText}`);
  }
  return res.json();
}

export async function checkDuplicateIngredients(
  medicineNames: string[]
): Promise<DuplicateCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/medicines/duplicates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicine_names: medicineNames }),
  });
  if (!res.ok) {
    throw new Error(`Failed to check duplicate active ingredients: ${res.statusText}`);
  }
  return res.json();
}

export function getMedicineReportPdfUrl(medicineId: string): string {
  return `${API_BASE_URL}/medicines/${encodeURIComponent(medicineId)}/report`;
}

export async function getProviderHealth(): Promise<ProviderHealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health/providers`);
  if (!res.ok) {
    throw new Error(`Failed to fetch provider health: ${res.statusText}`);
  }
  return res.json();
}
