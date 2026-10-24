"""
High-Fidelity Offline Seed Dataset for MediMitra Medicine Knowledge Base.
Contains realistic Indian retail branded medicines, PMBJP Jan Aushadhi generic equivalents,
NPPA regulatory ceiling prices, and attributed openFDA clinical drug label disclosures.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List

SEED_DATA_SOURCES = [
    {
        "id": "NPPA_DPCO_2024",
        "name": "National Pharmaceutical Pricing Authority (NPPA) DPCO Ceilings",
        "url": "https://nppa.gov.in/ceiling-price-regulations",
        "licence": "Government of India Open Access Gazette",
        "retrieved_at": "2024-11-01T00:00:00"
    },
    {
        "id": "PMBJP_CATALOG_2024",
        "name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) Price List",
        "url": "https://janaushadhi.gov.in/product-list.aspx",
        "licence": "Government of India / BPPI Open Access",
        "retrieved_at": "2024-12-01T00:00:00"
    },
    {
        "id": "OPENFDA_LABEL_REGISTRY",
        "name": "openFDA Human Prescription Drug Label Registry",
        "url": "https://open.fda.gov/apis/drug/label/",
        "licence": "U.S. Government Work (Public Domain / CC0)",
        "retrieved_at": "2025-01-10T00:00:00"
    }
]

SEED_INGREDIENTS = [
    {"id": "paracetamol", "name": "Paracetamol", "rxnorm_id": "161", "atc_code": "N02BE01", "therapeutic_class": "Analgesic & Antipyretic"},
    {"id": "metformin", "name": "Metformin Hydrochloride", "rxnorm_id": "6809", "atc_code": "A10BA02", "therapeutic_class": "Biguanide Antidiabetic"},
    {"id": "amoxicillin", "name": "Amoxicillin", "rxnorm_id": "723", "atc_code": "J01CA04", "therapeutic_class": "Beta-Lactam Penicillin Antibiotic"},
    {"id": "clavulanic_acid", "name": "Clavulanic Acid", "rxnorm_id": "2582", "atc_code": "J01CR02", "therapeutic_class": "Beta-Lactamase Inhibitor"},
    {"id": "telmisartan", "name": "Telmisartan", "rxnorm_id": "83515", "atc_code": "C09CA07", "therapeutic_class": "Angiotensin II Receptor Blocker (ARB)"},
    {"id": "atorvastatin", "name": "Atorvastatin Calcium", "rxnorm_id": "83367", "atc_code": "C10AA05", "therapeutic_class": "HMG-CoA Reductase Inhibitor (Statin)"},
    {"id": "pantoprazole", "name": "Pantoprazole Sodium", "rxnorm_id": "40790", "atc_code": "A02BC02", "therapeutic_class": "Proton Pump Inhibitor (PPI)"},
    {"id": "levocetirizine", "name": "Levocetirizine Dihydrochloride", "rxnorm_id": "315481", "atc_code": "R06AE09", "therapeutic_class": "Antihistamine (Second Generation)"},
    {"id": "montelukast", "name": "Montelukast Sodium", "rxnorm_id": "83412", "atc_code": "R03DC03", "therapeutic_class": "Leukotriene Receptor Antagonist"},
    {"id": "amlodipine", "name": "Amlodipine Besylate", "rxnorm_id": "17767", "atc_code": "C08CA01", "therapeutic_class": "Dihydropyridine Calcium Channel Blocker"},
    {"id": "azithromycin", "name": "Azithromycin", "rxnorm_id": "18631", "atc_code": "J01FA10", "therapeutic_class": "Macrolide Antibiotic"},
    {"id": "rosuvastatin", "name": "Rosuvastatin Calcium", "rxnorm_id": "301542", "atc_code": "C10AA07", "therapeutic_class": "Lipid Lowering Statin"},
    {"id": "ciprofloxacin", "name": "Ciprofloxacin", "rxnorm_id": "2551", "atc_code": "J01MA02", "therapeutic_class": "Fluoroquinolone Antibacterial"},
    {"id": "ibuprofen", "name": "Ibuprofen", "rxnorm_id": "5640", "atc_code": "M01AE01", "therapeutic_class": "NSAID (Non-Steroidal Anti-Inflammatory)"},
    {"id": "aspirin", "name": "Aspirin", "rxnorm_id": "1191", "atc_code": "B01AC06", "therapeutic_class": "Platelet Aggregation Inhibitor"},
    {"id": "omeprazole", "name": "Omeprazole", "rxnorm_id": "7646", "atc_code": "A02BC01", "therapeutic_class": "Proton Pump Inhibitor (PPI)"},
]

SEED_GENERIC_PRODUCTS = [
    {
        "jan_aushadhi_code": "PMBJP0012",
        "name": "Paracetamol Tablets IP 650mg",
        "ingredient_id": "paracetamol",
        "dosage_form": "Tablet",
        "strength_text": "650 mg",
        "pack": "10 Tablets",
        "price": 9.50,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0045",
        "name": "Metformin Hydrochloride Prolonged-Release Tablets IP 500mg",
        "ingredient_id": "metformin",
        "dosage_form": "Tablet",
        "strength_text": "500 mg",
        "pack": "10 Tablets",
        "price": 7.20,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0182",
        "name": "Amoxicillin and Potassium Clavulanate Tablets IP 625mg",
        "ingredient_id": "amoxicillin",
        "dosage_form": "Tablet",
        "strength_text": "500mg + 125mg",
        "pack": "6 Tablets",
        "price": 38.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0210",
        "name": "Telmisartan Tablets IP 40mg",
        "ingredient_id": "telmisartan",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack": "10 Tablets",
        "price": 14.50,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0330",
        "name": "Atorvastatin Tablets IP 10mg",
        "ingredient_id": "atorvastatin",
        "dosage_form": "Tablet",
        "strength_text": "10 mg",
        "pack": "10 Tablets",
        "price": 12.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0112",
        "name": "Pantoprazole Gastro-Resistant Tablets IP 40mg",
        "ingredient_id": "pantoprazole",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack": "10 Tablets",
        "price": 15.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0420",
        "name": "Montelukast 10mg + Levocetirizine 5mg Tablets",
        "ingredient_id": "montelukast",
        "dosage_form": "Tablet",
        "strength_text": "5mg + 10mg",
        "pack": "10 Tablets",
        "price": 28.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0088",
        "name": "Amlodipine Tablets IP 5mg",
        "ingredient_id": "amlodipine",
        "dosage_form": "Tablet",
        "strength_text": "5 mg",
        "pack": "10 Tablets",
        "price": 5.50,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0198",
        "name": "Azithromycin Tablets IP 500mg",
        "ingredient_id": "azithromycin",
        "dosage_form": "Tablet",
        "strength_text": "500 mg",
        "pack": "3 Tablets",
        "price": 27.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    },
    {
        "jan_aushadhi_code": "PMBJP0021",
        "name": "Ibuprofen Tablets IP 400mg",
        "ingredient_id": "ibuprofen",
        "dosage_form": "Tablet",
        "strength_text": "400 mg",
        "pack": "10 Tablets",
        "price": 7.00,
        "as_of": "2024-12-01",
        "source": "PMBJP Official Catalog"
    }
]

SEED_MEDICINES = [
    # Paracetamol 650mg Brands
    {
        "id": "med_dolo_650",
        "brand_name": "Dolo 650",
        "manufacturer": "Micro Labs Ltd",
        "dosage_form": "Tablet",
        "strength_text": "650 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 33.60,
        "price_per_unit": 2.24,
        "rx_or_otc": "OTC",
        "schedule_h_flag": False,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.30,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-15",
        "ingredients": [{"ingredient_id": "paracetamol", "value": 650.0, "unit": "mg"}]
    },
    {
        "id": "med_calpol_650",
        "brand_name": "Calpol 650",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd",
        "dosage_form": "Tablet",
        "strength_text": "650 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 32.50,
        "price_per_unit": 2.17,
        "rx_or_otc": "OTC",
        "schedule_h_flag": False,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.30,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-15",
        "ingredients": [{"ingredient_id": "paracetamol", "value": 650.0, "unit": "mg"}]
    },
    {
        "id": "med_pacimol_650",
        "brand_name": "Pacimol 650",
        "manufacturer": "Ipca Laboratories Ltd",
        "dosage_form": "Tablet",
        "strength_text": "650 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 28.00,
        "price_per_unit": 1.87,
        "rx_or_otc": "OTC",
        "schedule_h_flag": False,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.30,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-15",
        "ingredients": [{"ingredient_id": "paracetamol", "value": 650.0, "unit": "mg"}]
    },
    {
        "id": "med_crocin_650",
        "brand_name": "Crocin 650",
        "manufacturer": "GlaxoSmithKline Consumer Healthcare",
        "dosage_form": "Tablet",
        "strength_text": "650 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 33.60,
        "price_per_unit": 2.24,
        "rx_or_otc": "OTC",
        "schedule_h_flag": False,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.30,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-15",
        "ingredients": [{"ingredient_id": "paracetamol", "value": 650.0, "unit": "mg"}]
    },
    {
        "id": "med_ecosprin_75",
        "brand_name": "Ecosprin 75",
        "manufacturer": "USV Pvt Ltd",
        "dosage_form": "Tablet",
        "strength_text": "75 mg",
        "pack_size": 14,
        "pack_unit": "Tablets",
        "mrp": 9.80,
        "price_per_unit": 0.70,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 0.85,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-15",
        "ingredients": [{"ingredient_id": "aspirin", "value": 75.0, "unit": "mg"}]
    },

    # Metformin 500mg Brands
    {
        "id": "med_glycomet_500",
        "brand_name": "Glycomet 500 SR",
        "manufacturer": "USV Pvt Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500 mg",
        "pack_size": 20,
        "pack_unit": "Tablets",
        "mrp": 48.50,
        "price_per_unit": 2.42,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-20",
        "ingredients": [{"ingredient_id": "metformin", "value": 500.0, "unit": "mg"}]
    },
    {
        "id": "med_riomet_500",
        "brand_name": "Riomet 500",
        "manufacturer": "Sun Pharmaceutical Industries Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 38.00,
        "price_per_unit": 2.53,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-20",
        "ingredients": [{"ingredient_id": "metformin", "value": 500.0, "unit": "mg"}]
    },
    {
        "id": "med_metfor_500",
        "brand_name": "Metfor 500",
        "manufacturer": "Cipla Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500 mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 18.00,
        "price_per_unit": 1.80,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 2.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-20",
        "ingredients": [{"ingredient_id": "metformin", "value": 500.0, "unit": "mg"}]
    },

    # Amoxicillin + Clavulanate (Augmentin & substitutes)
    {
        "id": "med_augmentin_625",
        "brand_name": "Augmentin 625 Duo",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500mg + 125mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 204.00,
        "price_per_unit": 20.40,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 20.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-12-05",
        "ingredients": [
            {"ingredient_id": "amoxicillin", "value": 500.0, "unit": "mg"},
            {"ingredient_id": "clavulanic_acid", "value": 125.0, "unit": "mg"}
        ]
    },
    {
        "id": "med_clavam_625",
        "brand_name": "Clavam 625",
        "manufacturer": "Alkem Laboratories Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500mg + 125mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 178.00,
        "price_per_unit": 17.80,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 20.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-12-05",
        "ingredients": [
            {"ingredient_id": "amoxicillin", "value": 500.0, "unit": "mg"},
            {"ingredient_id": "clavulanic_acid", "value": 125.0, "unit": "mg"}
        ]
    },
    {
        "id": "med_moxikind_cv_625",
        "brand_name": "Moxikind CV 625",
        "manufacturer": "Mankind Pharma Ltd",
        "dosage_form": "Tablet",
        "strength_text": "500mg + 125mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 145.00,
        "price_per_unit": 14.50,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 20.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-12-05",
        "ingredients": [
            {"ingredient_id": "amoxicillin", "value": 500.0, "unit": "mg"},
            {"ingredient_id": "clavulanic_acid", "value": 125.0, "unit": "mg"}
        ]
    },

    # Telmisartan 40mg
    {
        "id": "med_telma_40",
        "brand_name": "Telma 40",
        "manufacturer": "Glenmark Pharmaceuticals Ltd",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 142.00,
        "price_per_unit": 9.47,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 9.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-20",
        "ingredients": [{"ingredient_id": "telmisartan", "value": 40.0, "unit": "mg"}]
    },
    {
        "id": "med_telmikind_40",
        "brand_name": "Telmikind 40",
        "manufacturer": "Mankind Pharma Ltd",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 45.00,
        "price_per_unit": 4.50,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 9.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-20",
        "ingredients": [{"ingredient_id": "telmisartan", "value": 40.0, "unit": "mg"}]
    },
    {
        "id": "med_telsartan_40",
        "brand_name": "Telsartan 40",
        "manufacturer": "Dr Reddy's Laboratories Ltd",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 98.00,
        "price_per_unit": 6.53,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 9.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-20",
        "ingredients": [{"ingredient_id": "telmisartan", "value": 40.0, "unit": "mg"}]
    },

    # Atorvastatin 10mg
    {
        "id": "med_atorva_10",
        "brand_name": "Atorva 10",
        "manufacturer": "Zydus Lifesciences Ltd",
        "dosage_form": "Tablet",
        "strength_text": "10 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 118.00,
        "price_per_unit": 7.87,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 7.90,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-09-10",
        "ingredients": [{"ingredient_id": "atorvastatin", "value": 10.0, "unit": "mg"}]
    },
    {
        "id": "med_lipitor_10",
        "brand_name": "Lipitor 10",
        "manufacturer": "Pfizer Ltd",
        "dosage_form": "Tablet",
        "strength_text": "10 mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 140.00,
        "price_per_unit": 14.00,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": None,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-09-10",
        "ingredients": [{"ingredient_id": "atorvastatin", "value": 10.0, "unit": "mg"}]
    },
    {
        "id": "med_storvas_10",
        "brand_name": "Storvas 10",
        "manufacturer": "Sun Pharmaceutical Industries Ltd",
        "dosage_form": "Tablet",
        "strength_text": "10 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 85.00,
        "price_per_unit": 5.67,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 7.90,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-09-10",
        "ingredients": [{"ingredient_id": "atorvastatin", "value": 10.0, "unit": "mg"}]
    },

    # Pantoprazole 40mg
    {
        "id": "med_pantocid_40",
        "brand_name": "Pantocid 40",
        "manufacturer": "Sun Pharmaceutical Industries Ltd",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 155.00,
        "price_per_unit": 10.33,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 10.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-15",
        "ingredients": [{"ingredient_id": "pantoprazole", "value": 40.0, "unit": "mg"}]
    },
    {
        "id": "med_pan_40",
        "brand_name": "Pan 40",
        "manufacturer": "Alkem Laboratories Ltd",
        "dosage_form": "Tablet",
        "strength_text": "40 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 138.00,
        "price_per_unit": 9.20,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 10.50,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-15",
        "ingredients": [{"ingredient_id": "pantoprazole", "value": 40.0, "unit": "mg"}]
    },

    # Levocetirizine + Montelukast
    {
        "id": "med_montair_lc",
        "brand_name": "Montair LC",
        "manufacturer": "Cipla Ltd",
        "dosage_form": "Tablet",
        "strength_text": "5mg + 10mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 185.00,
        "price_per_unit": 18.50,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": False,
        "nppa_ceiling_price": None,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-01",
        "ingredients": [
            {"ingredient_id": "levocetirizine", "value": 5.0, "unit": "mg"},
            {"ingredient_id": "montelukast", "value": 10.0, "unit": "mg"}
        ]
    },
    {
        "id": "med_montek_lc",
        "brand_name": "Montek LC",
        "manufacturer": "Sun Pharmaceutical Industries Ltd",
        "dosage_form": "Tablet",
        "strength_text": "5mg + 10mg",
        "pack_size": 10,
        "pack_unit": "Tablets",
        "mrp": 160.00,
        "price_per_unit": 16.00,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": False,
        "nppa_ceiling_price": None,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-01",
        "ingredients": [
            {"ingredient_id": "levocetirizine", "value": 5.0, "unit": "mg"},
            {"ingredient_id": "montelukast", "value": 10.0, "unit": "mg"}
        ]
    },

    # Amlodipine 5mg
    {
        "id": "med_amlong_5",
        "brand_name": "Amlong 5",
        "manufacturer": "Micro Labs Ltd",
        "dosage_form": "Tablet",
        "strength_text": "5 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 46.50,
        "price_per_unit": 3.10,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 3.20,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-10",
        "ingredients": [{"ingredient_id": "amlodipine", "value": 5.0, "unit": "mg"}]
    },
    {
        "id": "med_stamlo_5",
        "brand_name": "Stamlo 5",
        "manufacturer": "Dr Reddy's Laboratories Ltd",
        "dosage_form": "Tablet",
        "strength_text": "5 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 42.00,
        "price_per_unit": 2.80,
        "rx_or_otc": "Rx",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 3.20,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-10-10",
        "ingredients": [{"ingredient_id": "amlodipine", "value": 5.0, "unit": "mg"}]
    },

    # Ibuprofen 400mg
    {
        "id": "med_brufen_400",
        "brand_name": "Brufen 400",
        "manufacturer": "Abbott India Ltd",
        "dosage_form": "Tablet",
        "strength_text": "400 mg",
        "pack_size": 15,
        "pack_unit": "Tablets",
        "mrp": 24.50,
        "price_per_unit": 1.63,
        "rx_or_otc": "Schedule H",
        "schedule_h_flag": True,
        "nlem_flag": True,
        "nppa_ceiling_price": 1.70,
        "source_id": "NPPA_DPCO_2024",
        "price_as_of": "2024-11-25",
        "ingredients": [{"ingredient_id": "ibuprofen", "value": 400.0, "unit": "mg"}]
    }
]

SEED_LABEL_INFOS = [
    {
        "ingredient_id": "paracetamol",
        "source": "openFDA (US label)",
        "section": "indications",
        "text": "Temporarily relieves minor aches and pains due to headache, muscular aches, backache, arthritis, the common cold, toothache, and reduces fever."
    },
    {
        "ingredient_id": "paracetamol",
        "source": "openFDA (US label)",
        "section": "warnings",
        "text": "Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg of acetaminophen in 24 hours, take with other drugs containing acetaminophen, or have 3 or more alcoholic drinks every day while using this product."
    },
    {
        "ingredient_id": "paracetamol",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Concomitant use with other acetaminophen-containing products should be avoided. Chronic alcohol ingestion increases the risk of liver toxicity. Anticoagulant effect of warfarin may be enhanced with prolonged daily use."
    },
    {
        "ingredient_id": "metformin",
        "source": "openFDA (US label)",
        "section": "indications",
        "text": "Adjunct to diet and exercise to improve glycemic control in adults and pediatric patients 10 years of age and older with type 2 diabetes mellitus."
    },
    {
        "ingredient_id": "metformin",
        "source": "openFDA (US label)",
        "section": "warnings",
        "text": "Postmarketing cases of metformin-associated lactic acidosis have resulted in death, hypothermia, hypotension, and resistant bradyarrhythmias. Withhold metformin in the presence of conditions that predispose to hypoxemia or acute renal failure."
    },
    {
        "ingredient_id": "metformin",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Carbonic anhydrase inhibitors may increase the risk of lactic acidosis. Concomitant administration of drugs that interfere with common renal tubular transport systems may increase systemic exposure to metformin. Alcohol potentiates the effect of metformin on lactate metabolism."
    },
    {
        "ingredient_id": "telmisartan",
        "source": "openFDA (US label)",
        "section": "warnings",
        "text": "When pregnancy is detected, discontinue telmisartan as soon as possible. Drugs that act directly on the renin-angiotensin system can cause injury and death to the developing fetus."
    },
    {
        "ingredient_id": "telmisartan",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Dual blockade of the RAS with angiotensin receptor blockers, ACE inhibitors, or aliskiren is associated with increased risks of hypotension, hyperkalemia, and changes in renal function. Co-administration of telmisartan did not result in a clinically significant interaction with digoxin or warfarin."
    },
    {
        "ingredient_id": "atorvastatin",
        "source": "openFDA (US label)",
        "section": "warnings",
        "text": "Cases of myopathy and rhabdomyolysis with acute renal failure secondary to myoglobinuria have been reported with HMG-CoA reductase inhibitors, including atorvastatin."
    },
    {
        "ingredient_id": "atorvastatin",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Strong inhibitors of CYP3A4 (e.g., cyclosporine, clarithromycin, itraconazole) increase plasma concentrations of atorvastatin and increase the risk of myopathy. Avoid grapefruit juice in large quantities (greater than 1.2 liters daily)."
    },
    {
        "ingredient_id": "ibuprofen",
        "source": "openFDA (US label)",
        "section": "warnings",
        "text": "Nonsteroidal anti-inflammatory drugs (NSAIDs) cause an increased risk of serious cardiovascular thrombotic events, including myocardial infarction and stroke, which can be fatal."
    },
    {
        "ingredient_id": "ibuprofen",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Concomitant use of ibuprofen and aspirin increases the risk of gastrointestinal adverse events. Co-administration with ACE inhibitors, ARBs, or beta-blockers may diminish the antihypertensive effect of these agents."
    },
    {
        "ingredient_id": "aspirin",
        "source": "openFDA (US label)",
        "section": "interactions",
        "text": "Concomitant administration of aspirin and other NSAIDs such as ibuprofen increases the risk of gastrointestinal ulceration and bleeding."
    }
]


def populate_seed_data(db_session):
    """Inserts initial seed catalog into SQLite database if empty."""
    from app.medicines.db_models import (
        DataSourceRecord, IngredientRecord, MedicineRecord,
        MedicineIngredientRecord, GenericProductRecord, LabelInfoRecord
    )

    counts = {
        "medicines": db_session.query(MedicineRecord).count(),
        "ingredients": db_session.query(IngredientRecord).count(),
        "labels": db_session.query(LabelInfoRecord).count(),
    }
    if counts["medicines"] > 0:
        return counts

    # 1. Sources
    for s in SEED_DATA_SOURCES:
        rec = DataSourceRecord(
            id=s["id"],
            name=s["name"],
            url=s["url"],
            licence=s["licence"],
            retrieved_at=datetime.fromisoformat(s["retrieved_at"])
        )
        db_session.add(rec)
    db_session.commit()

    # 2. Ingredients
    for ing in SEED_INGREDIENTS:
        rec = IngredientRecord(
            id=ing["id"],
            name=ing["name"],
            rxnorm_id=ing.get("rxnorm_id"),
            atc_code=ing.get("atc_code"),
            therapeutic_class=ing.get("therapeutic_class")
        )
        db_session.add(rec)
    db_session.commit()

    # 3. Jan Aushadhi
    for gen in SEED_GENERIC_PRODUCTS:
        rec = GenericProductRecord(
            jan_aushadhi_code=gen["jan_aushadhi_code"],
            name=gen["name"],
            ingredient_id=gen["ingredient_id"],
            dosage_form=gen["dosage_form"],
            strength_text=gen["strength_text"],
            pack=gen["pack"],
            price=gen["price"],
            as_of=gen["as_of"],
            source=gen["source"]
        )
        db_session.add(rec)
    db_session.commit()

    # 4. Medicines & Junction
    for med in SEED_MEDICINES:
        m_rec = MedicineRecord(
            id=med["id"],
            brand_name=med["brand_name"],
            manufacturer=med["manufacturer"],
            dosage_form=med["dosage_form"],
            strength_text=med["strength_text"],
            pack_size=med["pack_size"],
            pack_unit=med["pack_unit"],
            mrp=med["mrp"],
            price_per_unit=med["price_per_unit"],
            rx_or_otc=med["rx_or_otc"],
            schedule_h_flag=med["schedule_h_flag"],
            nlem_flag=med["nlem_flag"],
            nppa_ceiling_price=med["nppa_ceiling_price"],
            source_id=med["source_id"],
            price_as_of=med["price_as_of"]
        )
        db_session.add(m_rec)
        db_session.commit()

        for j_ing in med["ingredients"]:
            j_rec = MedicineIngredientRecord(
                medicine_id=med["id"],
                ingredient_id=j_ing["ingredient_id"],
                strength_value=j_ing["value"],
                strength_unit=j_ing["unit"]
            )
            db_session.add(j_rec)
    db_session.commit()

    # 5. Label info
    for lbl in SEED_LABEL_INFOS:
        l_rec = LabelInfoRecord(
            ingredient_id=lbl["ingredient_id"],
            source=lbl["source"],
            section=lbl["section"],
            text=lbl["text"]
        )
        db_session.add(l_rec)
    db_session.commit()

    return {
        "medicines": db_session.query(MedicineRecord).count(),
        "ingredients": db_session.query(IngredientRecord).count(),
        "labels": db_session.query(LabelInfoRecord).count(),
    }
