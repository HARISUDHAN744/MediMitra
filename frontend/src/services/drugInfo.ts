/**
 * openFDA Drug Label & Medication Safety Service
 * Uses the U.S. Food and Drug Administration (FDA) openFDA API:
 * https://open.fda.gov/apis/drug/label/
 */

export interface DrugInfoResult {
  brandName: string;
  genericName: string;
  purpose: string;
  warnings: string;
}

/**
 * Searches the openFDA Drug Label API for a medication by brand or generic name.
 * 
 * @param brandOrGenericName - The name of the medication (e.g. 'Metformin', 'Amoxicillin', 'Lipitor')
 * @returns Structured FDA drug label information including generic name, approved purpose, and safety warnings.
 */
export async function searchDrugInfo(brandOrGenericName: string): Promise<DrugInfoResult | null> {
  if (!brandOrGenericName || !brandOrGenericName.trim()) {
    return null;
  }

  // Clean drug name by stripping dosage details (e.g. '500mg', 'Tab', 'Cap') for higher match rate
  const cleaned = brandOrGenericName
    .replace(/^(Tab\.?|Cap\.?|Syp\.?|Inj\.?|Syrup|Tablet|Capsule)\s+/i, '')
    .replace(/\b\d+(\.\d+)?\s*(mg|g|ml|mcg|iu|%)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .trim();

  const queryTerm = cleaned || brandOrGenericName.trim();
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(queryTerm)}+openfda.generic_name:${encodeURIComponent(queryTerm)}&limit=1`;
  
  try {
    let response = await fetch(url);
    
    // Fallback if specific brand/generic field search returned 404
    if (!response.ok) {
      const fallbackUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(queryTerm)}&limit=1`;
      response = await fetch(fallbackUrl);
      if (!response.ok) return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const drug = data.results[0];
      return {
        brandName: drug.openfda?.brand_name?.[0] || "N/A",
        genericName: drug.openfda?.generic_name?.[0] || "N/A",
        purpose: drug.purpose?.[0] || drug.indications_and_usage?.[0] || "Information not specified",
        warnings: drug.warnings?.[0] || drug.boxed_warning?.[0] || drug.warnings_and_cautions?.[0] || "No specific warnings listed"
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching drug data from openFDA:", error);
    return null;
  }
}
