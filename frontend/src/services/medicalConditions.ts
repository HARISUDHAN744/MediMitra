/**
 * Medical Conditions & ICD-10 Code Lookup Service
 * Uses the National Library of Medicine (NIH) Clinical Tables API:
 * https://clinicaltables.nlm.nih.gov/apidoc/conditions/v3/doc.html
 */

export interface MedicalConditionResult {
  primaryName: string;
  icd10Codes: string;
}

/**
 * Searches the NIH Clinical Tables API for standardized medical conditions and ICD-10-CM codes.
 * 
 * @param searchTerm - The condition or symptom to search for (e.g., 'Hypertension', 'Diabetes', 'Bronchitis')
 * @returns An array of matching conditions with primary names and ICD-10 codes.
 */
export async function searchMedicalCondition(searchTerm: string): Promise<MedicalConditionResult[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const url = `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(
    searchTerm.trim()
  )}&df=primary_name,icd10cm_codes&maxList=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NIH API returned status: ${response.status}`);
    }

    const data = await response.json();

    // The NIH API returns an array: [totalCount, codeArray, extraDataHash, displayArray]
    const totalResults: number = data[0] || 0;
    const displayValues: [string, string][] = data[3] || []; // [[primary_name, icd10cm_codes], ...]

    console.log(`[NIH Medical DB] Found ${totalResults} results for '${searchTerm}'.`);

    // Format into clean, typed objects
    return displayValues.map(([primaryName, icd10Codes]) => ({
      primaryName: primaryName || '',
      icd10Codes: icd10Codes || 'N/A',
    }));
  } catch (error) {
    console.error('Error fetching medical conditions from NIH Clinical Tables:', error);
    return [];
  }
}
