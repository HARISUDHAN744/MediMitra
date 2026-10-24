# MediMitra Medicine Data Pipeline & Ingestion Architecture

This directory houses the offline/online ingestion and verification pipelines that maintain the **MediMitra Medicine Knowledge Base**.

## Safety and Compliance Principles
1. **No Scraping**: No commercial pharmacy websites are scraped. All data originates from public government gazettes, NPPA notifications, PMBJP Jan Aushadhi catalogs, and public scientific APIs (openFDA, RxNav, PubChem, ChEMBL).
2. **Attribution & Transparency**: Every price record specifies `price_as_of` and its source.
3. **No Unqualified Badges**: The terms "Live" and "Verified" are removed from estimates; only data verified in real-time or from an official government gazette is displayed with clear timestamps.
4. **No Dosing Instructions**: The pipelines do not generate or inject prescribing advice, dosages, or treatment targets.

## Available Pipeline Scripts
- `import_india_brands.py`: Ingests Indian brand-name formulations with validated active ingredient linkages, pack sizes, and MRPs.
- `import_jan_aushadhi.py`: Ingests PMBJP Jan Aushadhi generic product codes and government ceiling rates.
- `import_nppa.py`: Audits medicines against National Pharmaceutical Pricing Authority (NPPA) Drug Price Control Orders (DPCO).
- `fetch_openfda_labels.py`: Links official openFDA structured product labels (indications, warnings, drug interactions).
- `normalise_rxnorm.py`: Maps constituent active ingredients to RxNorm RxCUIs via the NLM RxNav API.
- `quality_report.py`: Runs automated database integrity assertions (checks for missing ingredients, negative prices, and stale dates).

## Running the Pipeline
```bash
python backend/data-pipeline/import_india_brands.py
python backend/data-pipeline/quality_report.py
```
