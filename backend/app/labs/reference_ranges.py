"""
Reference Ranges and Thresholds for Laboratory Biomarkers.
Sources: ICMR Guidelines (2023), ADA Standards of Care (2024), ACC/AHA (2019), WHO.
Provides demographic variations (Adult Male, Adult Female, Child) and critical thresholds.
"""

from typing import Dict, Any, Optional, Tuple

REFERENCE_TABLE: Dict[str, Dict[str, Any]] = {
    "FBS": {
        "canonical_name": "Fasting Blood Sugar (FBS)",
        "unit": "mg/dL",
        "panel": "Glycaemic Profile",
        "demographics": {
            "adult_male":   {"low": 70.0, "high": 99.0, "crit_low": 40.0, "crit_high": 500.0, "range_str": "70 - 99 mg/dL", "source": "ICMR / ADA 2024"},
            "adult_female": {"low": 70.0, "high": 99.0, "crit_low": 40.0, "crit_high": 500.0, "range_str": "70 - 99 mg/dL", "source": "ICMR / ADA 2024"},
            "child":        {"low": 70.0, "high": 100.0, "crit_low": 45.0, "crit_high": 400.0, "range_str": "70 - 100 mg/dL", "source": "ISPAD / WHO"},
        },
        "what_it_measures": "Measures blood glucose concentration after at least 8 hours of overnight fasting.",
        "high_low_meaning": "Values above range suggest elevated circulating glucose that may warrant discussion with a doctor. Values below range suggest reduced blood glucose.",
        "non_medical_factors": "Fasting duration, stress, acute infections, steroid medications, or high carbohydrate dinners.",
        "questions_for_doctor": [
            "Would you suggest repeating this fasting test to confirm?",
            "Are there non-pharmacological dietary habits you recommend reviewing?",
            "Should we monitor post-meal glucose or HbA1c as well?"
        ],
        "lifestyle_info": "Balanced dietary fiber, regular physical movement, and consistent meal timing support metabolic balance."
    },
    "PPBS": {
        "canonical_name": "Postprandial Blood Sugar (PPBS)",
        "unit": "mg/dL",
        "panel": "Glycaemic Profile",
        "demographics": {
            "adult_male":   {"low": 80.0, "high": 140.0, "crit_low": 50.0, "crit_high": 500.0, "range_str": "< 140 mg/dL", "source": "ADA 2024 / ICMR"},
            "adult_female": {"low": 80.0, "high": 140.0, "crit_low": 50.0, "crit_high": 500.0, "range_str": "< 140 mg/dL", "source": "ADA 2024 / ICMR"},
            "child":        {"low": 80.0, "high": 140.0, "crit_low": 50.0, "crit_high": 400.0, "range_str": "< 140 mg/dL", "source": "ISPAD / WHO"},
        },
        "what_it_measures": "Measures blood sugar spike approximately 2 hours after a standard meal.",
        "high_low_meaning": "Values above range reflect how the body processes carbohydrates post-meal. May be worth discussing with your doctor.",
        "non_medical_factors": "Meal composition, heavy carbohydrates, physical inactivity immediately post-meal, or emotional stress.",
        "questions_for_doctor": [
            "Does the carbohydrate composition of my meals affect this reading?",
            "How often should post-meal readings be evaluated?"
        ],
        "lifestyle_info": "A 15-minute post-meal gentle stroll and complex carbohydrates help moderate postprandial glycemic excursions."
    },
    "HBA1C": {
        "canonical_name": "HbA1c (Glycated Hemoglobin)",
        "unit": "%",
        "panel": "Glycaemic Profile",
        "demographics": {
            "adult_male":   {"low": 4.0, "high": 5.6, "crit_low": 3.5, "crit_high": 10.0, "range_str": "4.0 - 5.6 %", "source": "ADA 2024 / ICMR"},
            "adult_female": {"low": 4.0, "high": 5.6, "crit_low": 3.5, "crit_high": 10.0, "range_str": "4.0 - 5.6 %", "source": "ADA 2024 / ICMR"},
            "child":        {"low": 4.0, "high": 5.6, "crit_low": 3.5, "crit_high": 10.0, "range_str": "4.0 - 5.6 %", "source": "ISPAD 2024"},
        },
        "what_it_measures": "Measures average blood glucose exposure over the preceding 2 to 3 months attached to hemoglobin.",
        "high_low_meaning": "Values above 5.6% indicate higher average circulating glucose across the prior quarter. Worth discussing with a physician.",
        "non_medical_factors": "Hemoglobinopathies, anemia, recent blood transfusion, pregnancy, or erythrocyte lifespan variations.",
        "questions_for_doctor": [
            "How does this average align with daily fingerstick or fasting tests?",
            "What lifestyle modifications would be most beneficial to monitor over the next 90 days?"
        ],
        "lifestyle_info": "Consistent aerobic activity and dietary moderation promote long-term glycemic stability."
    },
    "HB": {
        "canonical_name": "Hemoglobin (Hb)",
        "unit": "g/dL",
        "panel": "Complete Blood Count",
        "demographics": {
            "adult_male":   {"low": 13.0, "high": 17.0, "crit_low": 7.0, "crit_high": 20.0, "range_str": "13.0 - 17.0 g/dL", "source": "WHO / ICMR Adult Male"},
            "adult_female": {"low": 12.0, "high": 16.0, "crit_low": 7.0, "crit_high": 20.0, "range_str": "12.0 - 16.0 g/dL", "source": "WHO / ICMR Adult Female"},
            "child":        {"low": 11.5, "high": 15.5, "crit_low": 7.0, "crit_high": 18.0, "range_str": "11.5 - 15.5 g/dL", "source": "WHO Pediatric Reference"},
        },
        "what_it_measures": "Measures the iron-containing protein in red blood cells that transports oxygen to bodily tissues.",
        "high_low_meaning": "Lower values indicate reduced oxygen-carrying capacity; higher values can reflect hemoconcentration or elevated red cell mass.",
        "non_medical_factors": "Hydration status, altitude, smoking, menstrual blood loss, or strenuous athletic conditioning.",
        "questions_for_doctor": [
            "Would iron profile (ferritin) or vitamin B12 testing provide helpful context?",
            "Could dietary iron sources be enhanced?"
        ],
        "lifestyle_info": "Iron-rich foods like leafy greens, lentils, and citrus fruits (vitamin C aids absorption) support hemoglobin production."
    },
    "WBC": {
        "canonical_name": "Total Leukocyte Count (WBC)",
        "unit": "/cumm",
        "panel": "Complete Blood Count",
        "demographics": {
            "adult_male":   {"low": 4000.0, "high": 11000.0, "crit_low": 2000.0, "crit_high": 30000.0, "range_str": "4,000 - 11,000 /cumm", "source": "ICMR Hematology Reference"},
            "adult_female": {"low": 4000.0, "high": 11000.0, "crit_low": 2000.0, "crit_high": 30000.0, "range_str": "4,000 - 11,000 /cumm", "source": "ICMR Hematology Reference"},
            "child":        {"low": 5000.0, "high": 15000.0, "crit_low": 2500.0, "crit_high": 35000.0, "range_str": "5,000 - 15,000 /cumm", "source": "WHO Pediatric Reference"},
        },
        "what_it_measures": "Evaluates the total circulating white blood cells that defend the body against immune challenges.",
        "high_low_meaning": "Elevated counts often reflect recent physiological stress or immune activation; lower counts indicate decreased production or increased clearance.",
        "non_medical_factors": "Recent viral illnesses, vigorous exercise, psychological stress, allergies, or tobacco use.",
        "questions_for_doctor": [
            "Does the differential count (neutrophils, lymphocytes) point toward a recent cold or allergy?",
            "Is a repeat CBC warranted in a few weeks?"
        ],
        "lifestyle_info": "Restful sleep, stress management, and hygienic recovery support immune system equilibrium."
    },
    "PLATELETS": {
        "canonical_name": "Platelet Count",
        "unit": "/mcL",
        "panel": "Complete Blood Count",
        "demographics": {
            "adult_male":   {"low": 150000.0, "high": 450000.0, "crit_low": 50000.0, "crit_high": 1000000.0, "range_str": "150,000 - 450,000 /mcL", "source": "ICMR Hematology Reference"},
            "adult_female": {"low": 150000.0, "high": 450000.0, "crit_low": 50000.0, "crit_high": 1000000.0, "range_str": "150,000 - 450,000 /mcL", "source": "ICMR Hematology Reference"},
            "child":        {"low": 150000.0, "high": 450000.0, "crit_low": 50000.0, "crit_high": 1000000.0, "range_str": "150,000 - 450,000 /mcL", "source": "WHO Pediatric Reference"},
        },
        "what_it_measures": "Quantifies platelet cell fragments critical for standard blood coagulation and hemostasis.",
        "high_low_meaning": "Reduced platelets may heighten bruising propensity; elevated platelets can arise as a reactive acute-phase response.",
        "non_medical_factors": "Recent viral infections (e.g. dengue or flu), laboratory specimen clumping, or intense physical training.",
        "questions_for_doctor": [
            "Should a manual peripheral blood smear verify absence of platelet clumping in the tube?",
            "Are there any activities or OTC medicines to be mindful of?"
        ],
        "lifestyle_info": "Adequate hydration, avoidance of unverified supplements, and balanced nutrition support bone marrow health."
    },
    "TOTAL_CHOLESTEROL": {
        "canonical_name": "Serum Total Cholesterol",
        "unit": "mg/dL",
        "panel": "Lipid Panel",
        "demographics": {
            "adult_male":   {"low": 120.0, "high": 200.0, "crit_low": 80.0, "crit_high": 300.0, "range_str": "< 200 mg/dL", "source": "NCEP ATP III / ACC/AHA"},
            "adult_female": {"low": 120.0, "high": 200.0, "crit_low": 80.0, "crit_high": 300.0, "range_str": "< 200 mg/dL", "source": "NCEP ATP III / ACC/AHA"},
            "child":        {"low": 100.0, "high": 170.0, "crit_low": 70.0, "crit_high": 250.0, "range_str": "< 170 mg/dL", "source": "AAP Pediatric Guidelines"},
        },
        "what_it_measures": "Measures all circulating cholesterol carried across lipoprotein fractions.",
        "high_low_meaning": "Readings above 200 mg/dL reflect higher circulating lipid mass that may be worth discussing with your doctor.",
        "non_medical_factors": "High saturated or trans fat meals preceding the test, pregnancy, lack of sleep, or genetic predisposition.",
        "questions_for_doctor": [
            "How do my HDL and LDL proportions shape overall cardiovascular context?",
            "What dietary adjustments would you recommend focusing on first?"
        ],
        "lifestyle_info": "Cooking with cold-pressed unsaturated oils, increasing soluble oats/legume fiber, and brisk walking promote healthy lipid profiles."
    },
    "LDL": {
        "canonical_name": "LDL (Bad) Cholesterol",
        "unit": "mg/dL",
        "panel": "Lipid Panel",
        "demographics": {
            "adult_male":   {"low": 50.0, "high": 100.0, "crit_low": 30.0, "crit_high": 190.0, "range_str": "< 100 mg/dL", "source": "ACC/AHA 2019 / Lipid Association of India"},
            "adult_female": {"low": 50.0, "high": 100.0, "crit_low": 30.0, "crit_high": 190.0, "range_str": "< 100 mg/dL", "source": "ACC/AHA 2019 / Lipid Association of India"},
            "child":        {"low": 50.0, "high": 110.0, "crit_low": 30.0, "crit_high": 160.0, "range_str": "< 110 mg/dL", "source": "AAP Guidelines"},
        },
        "what_it_measures": "Low-density lipoprotein cholesterol particles transporting lipid through vascular circulation.",
        "high_low_meaning": "Values above reference range reflect elevated atherogenic particle counts. May be worth discussing with your doctor.",
        "non_medical_factors": "Diet high in saturated animal fats, palm oils, lack of cardiovascular exercise, or thyroid variations.",
        "questions_for_doctor": [
            "Do family history factors contribute to my LDL level?",
            "What is a reasonable timeline to recheck this after dietary changes?"
        ],
        "lifestyle_info": "Replacing saturated fats with polyunsaturated fats (nuts, seeds) and regular cardio workouts support LDL clearance."
    },
    "HDL": {
        "canonical_name": "HDL (Good) Cholesterol",
        "unit": "mg/dL",
        "panel": "Lipid Panel",
        "demographics": {
            "adult_male":   {"low": 40.0, "high": 100.0, "crit_low": 25.0, "crit_high": 120.0, "range_str": "> 40 mg/dL", "source": "ACC/AHA 2019 Adult Male"},
            "adult_female": {"low": 50.0, "high": 100.0, "crit_low": 25.0, "crit_high": 120.0, "range_str": "> 50 mg/dL", "source": "ACC/AHA 2019 Adult Female"},
            "child":        {"low": 45.0, "high": 100.0, "crit_low": 25.0, "crit_high": 120.0, "range_str": "> 45 mg/dL", "source": "AAP Pediatric Guidelines"},
        },
        "what_it_measures": "High-density lipoprotein particles involved in reverse cholesterol transport toward the liver.",
        "high_low_meaning": "Higher levels provide protective lipid clearance; levels below range indicate lower reverse transport capacity.",
        "non_medical_factors": "Sedentary lifestyle, smoking, refined carbohydrates, or genetic factors.",
        "questions_for_doctor": [
            "What types of physical exercise most reliably support HDL levels?",
            "Does my overall cholesterol-to-HDL ratio provide better context?"
        ],
        "lifestyle_info": "Sustained moderate aerobic workouts and healthy dietary fats like olive oil and walnuts aid HDL function."
    },
    "TRIGLYCERIDES": {
        "canonical_name": "Triglycerides",
        "unit": "mg/dL",
        "panel": "Lipid Panel",
        "demographics": {
            "adult_male":   {"low": 40.0, "high": 150.0, "crit_low": 20.0, "crit_high": 500.0, "range_str": "< 150 mg/dL", "source": "NCEP ATP III / ACC/AHA"},
            "adult_female": {"low": 40.0, "high": 150.0, "crit_low": 20.0, "crit_high": 500.0, "range_str": "< 150 mg/dL", "source": "NCEP ATP III / ACC/AHA"},
            "child":        {"low": 40.0, "high": 100.0, "crit_low": 20.0, "crit_high": 300.0, "range_str": "< 100 mg/dL", "source": "AAP Guidelines"},
        },
        "what_it_measures": "Circulating form of energy storage fats in bloodstream derived from excess dietary calories.",
        "high_low_meaning": "Elevated triglycerides are linked with dietary sugar or alcohol intake. May be worth discussing with your doctor.",
        "non_medical_factors": "Incomplete fasting (less than 12h), recent sugar consumption, alcohol intake, or metabolic stress.",
        "questions_for_doctor": [
            "Could this reading be influenced by meal timing the night before the lab test?",
            "What dietary adjustments target triglycerides most effectively?"
        ],
        "lifestyle_info": "Limiting sugar-sweetened beverages, refined carbohydrates, and alcohol while increasing omega-3 fatty acids helps normalize levels."
    },
    "CREATININE": {
        "canonical_name": "Serum Creatinine",
        "unit": "mg/dL",
        "panel": "Kidney Function",
        "demographics": {
            "adult_male":   {"low": 0.70, "high": 1.30, "crit_low": 0.3, "crit_high": 10.0, "range_str": "0.70 - 1.30 mg/dL", "source": "KDIGO / ICMR Adult Male"},
            "adult_female": {"low": 0.55, "high": 1.10, "crit_low": 0.3, "crit_high": 10.0, "range_str": "0.55 - 1.10 mg/dL", "source": "KDIGO / ICMR Adult Female"},
            "child":        {"low": 0.30, "high": 0.70, "crit_low": 0.2, "crit_high": 5.0,  "range_str": "0.30 - 0.70 mg/dL", "source": "Pediatric Nephrology Reference"},
        },
        "what_it_measures": "Muscle metabolic breakdown byproduct filtered almost entirely by kidney glomeruli.",
        "high_low_meaning": "Values above range suggest reduced kidney filtration efficiency or high muscular breakdown. Worth discussing with a physician.",
        "non_medical_factors": "Dehydration, high meat consumption before test, intense bodybuilding workouts, or creatine supplements.",
        "questions_for_doctor": [
            "Does my eGFR (estimated glomerular filtration rate) correspond to normal kidney function?",
            "Was hydration status a potential factor in this reading?"
        ],
        "lifestyle_info": "Maintaining adequate daily water hydration and moderating heavy non-steroidal painkiller (NSAID) usage protects kidney health."
    },
    "UREA": {
        "canonical_name": "Blood Urea Nitrogen (BUN)",
        "unit": "mg/dL",
        "panel": "Kidney Function",
        "demographics": {
            "adult_male":   {"low": 7.0, "high": 20.0, "crit_low": 3.0, "crit_high": 100.0, "range_str": "7 - 20 mg/dL", "source": "KDIGO / ICMR"},
            "adult_female": {"low": 7.0, "high": 20.0, "crit_low": 3.0, "crit_high": 100.0, "range_str": "7 - 20 mg/dL", "source": "KDIGO / ICMR"},
            "child":        {"low": 5.0, "high": 18.0, "crit_low": 3.0, "crit_high": 80.0,  "range_str": "5 - 18 mg/dL", "source": "Pediatric Reference"},
        },
        "what_it_measures": "Nitrogen waste byproduct produced in liver from dietary protein breakdown and excreted by kidneys.",
        "high_low_meaning": "High values indicate reduced renal clearance or dehydration; lower values can reflect reduced dietary protein or liver clearance changes.",
        "non_medical_factors": "Dehydration, high-protein diets, gastrointestinal bleed, or vigorous training.",
        "questions_for_doctor": [
            "How does my BUN-to-creatinine ratio look for assessing hydration?",
            "Should I adjust fluid intake before re-testing?"
        ],
        "lifestyle_info": "Consistent hydration and balanced protein portioning promote steady waste clearance."
    },
    "URIC_ACID": {
        "canonical_name": "Serum Uric Acid",
        "unit": "mg/dL",
        "panel": "Kidney Function",
        "demographics": {
            "adult_male":   {"low": 3.5, "high": 7.2, "crit_low": 1.5, "crit_high": 13.0, "range_str": "3.5 - 7.2 mg/dL", "source": "ACR / ICMR Adult Male"},
            "adult_female": {"low": 2.6, "high": 6.0, "crit_low": 1.5, "crit_high": 13.0, "range_str": "2.6 - 6.0 mg/dL", "source": "ACR / ICMR Adult Female"},
            "child":        {"low": 2.0, "high": 5.5, "crit_low": 1.0, "crit_high": 10.0, "range_str": "2.0 - 5.5 mg/dL", "source": "Pediatric Guidelines"},
        },
        "what_it_measures": "Metabolic end product of purine nucleotide degradation filtered by renal tubules.",
        "high_low_meaning": "Values above range reflect increased purine metabolism or reduced urinary excretion. May be worth discussing with your doctor.",
        "non_medical_factors": "High purine foods (red meat, seafood, beer), dehydration, fructose-rich drinks, or fasting states.",
        "questions_for_doctor": [
            "Are there specific dietary triggers I should monitor regarding joint comfort?",
            "Would increased daily water intake help support natural excretion?"
        ],
        "lifestyle_info": "Ample hydration and moderating red meat, shellfish, and sweetened beverages help maintain comfortable uric acid levels."
    },
    "TSH": {
        "canonical_name": "TSH (Thyroid Stimulating Hormone)",
        "unit": "uIU/mL",
        "panel": "Thyroid Panel",
        "demographics": {
            "adult_male":   {"low": 0.35, "high": 4.94, "crit_low": 0.10, "crit_high": 10.0, "range_str": "0.35 - 4.94 uIU/mL", "source": "ATA 2024 / Endocrine Society"},
            "adult_female": {"low": 0.35, "high": 4.94, "crit_low": 0.10, "crit_high": 10.0, "range_str": "0.35 - 4.94 uIU/mL", "source": "ATA 2024 / Endocrine Society"},
            "child":        {"low": 0.70, "high": 5.90, "crit_low": 0.10, "crit_high": 12.0, "range_str": "0.70 - 5.90 uIU/mL", "source": "Pediatric Endocrine Reference"},
        },
        "what_it_measures": "Pituitary hormone regulating thyroid gland synthesis of thyroxine (T4) and triiodothyronine (T3).",
        "high_low_meaning": "Elevated TSH suggests the pituitary is signalling for more thyroid output; lower TSH reflects suppressed pituitary signalling.",
        "non_medical_factors": "Circadian rhythm variations (peaks early morning), acute illness recovery, biotin supplements, or pregnancy.",
        "questions_for_doctor": [
            "Would checking Free T3 and Free T4 provide a clearer complete picture?",
            "Do any morning supplements interfere with thyroid lab accuracy?"
        ],
        "lifestyle_info": "Adequate dietary iodine (iodized salt) and selenium support thyroid enzyme biochemistry."
    },
    "SGOT": {
        "canonical_name": "SGOT / AST (Aspartate Aminotransferase)",
        "unit": "U/L",
        "panel": "Liver Function",
        "demographics": {
            "adult_male":   {"low": 10.0, "high": 40.0, "crit_low": 5.0, "crit_high": 200.0, "range_str": "10 - 40 U/L", "source": "ACG Guidelines / ICMR"},
            "adult_female": {"low": 10.0, "high": 35.0, "crit_low": 5.0, "crit_high": 200.0, "range_str": "10 - 35 U/L", "source": "ACG Guidelines / ICMR"},
            "child":        {"low": 15.0, "high": 50.0, "crit_low": 5.0, "crit_high": 250.0, "range_str": "15 - 50 U/L", "source": "Pediatric Reference"},
        },
        "what_it_measures": "Intracellular enzyme found in hepatocytes, cardiac myocytes, and skeletal muscle tissue.",
        "high_low_meaning": "Values above range reflect enzyme leakage from cellular distress. Worth discussing with a healthcare professional.",
        "non_medical_factors": "Strenuous physical workouts prior to blood draw, muscle strain, alcohol, or medications.",
        "questions_for_doctor": [
            "Could recent physical exercise or medications have contributed to this reading?",
            "Is the ratio between SGOT and SGPT informative?"
        ],
        "lifestyle_info": "Avoiding alcohol, staying active, and moderating processed foods support liver health."
    },
    "SGPT": {
        "canonical_name": "SGPT / ALT (Alanine Aminotransferase)",
        "unit": "U/L",
        "panel": "Liver Function",
        "demographics": {
            "adult_male":   {"low": 7.0, "high": 56.0, "crit_low": 5.0, "crit_high": 200.0, "range_str": "7 - 56 U/L", "source": "ACG Guidelines / ICMR"},
            "adult_female": {"low": 7.0, "high": 45.0, "crit_low": 5.0, "crit_high": 200.0, "range_str": "7 - 45 U/L", "source": "ACG Guidelines / ICMR"},
            "child":        {"low": 10.0, "high": 45.0, "crit_low": 5.0, "crit_high": 200.0, "range_str": "10 - 45 U/L", "source": "Pediatric Reference"},
        },
        "what_it_measures": "Primary liver-specific enzyme responsible for amino acid metabolism in hepatocytes.",
        "high_low_meaning": "Values above range indicate liver cell stress or inflammation. May be worth discussing with your doctor.",
        "non_medical_factors": "Over-the-counter paracetamol, alcohol intake, visceral adiposity, or viral infections.",
        "questions_for_doctor": [
            "Are there lifestyle steps to reduce hepatic metabolic strain?",
            "Should an ultrasound or repeat liver panel be scheduled?"
        ],
        "lifestyle_info": "Weight management, limiting refined sugars, and avoiding alcohol directly foster liver cell recovery."
    },
    "VITAMIN_D": {
        "canonical_name": "Vitamin D (25-Hydroxy)",
        "unit": "ng/mL",
        "panel": "Vitamins & Micronutrients",
        "demographics": {
            "adult_male":   {"low": 20.0, "high": 50.0, "crit_low": 10.0, "crit_high": 100.0, "range_str": "20 - 50 ng/mL", "source": "Endocrine Society / ICMR"},
            "adult_female": {"low": 20.0, "high": 50.0, "crit_low": 10.0, "crit_high": 100.0, "range_str": "20 - 50 ng/mL", "source": "Endocrine Society / ICMR"},
            "child":        {"low": 20.0, "high": 50.0, "crit_low": 10.0, "crit_high": 100.0, "range_str": "20 - 50 ng/mL", "source": "Pediatric Endocrine Reference"},
        },
        "what_it_measures": "Quantifies circulating 25(OH)D indicating total bodily stores from sunlight and nutrition.",
        "high_low_meaning": "Lower values suggest insufficient synthesis or dietary intake; values above range are typically from high-dose supplementation.",
        "non_medical_factors": "Limited sun exposure, sunscreen use, skin melanin content, or seasonal winter changes.",
        "questions_for_doctor": [
            "Would guided supplementation or dietary modifications be advisable?",
            "Should calcium levels be evaluated concurrently?"
        ],
        "lifestyle_info": "15 to 20 minutes of mid-morning sun exposure on forearms and fortified foods support vitamin D synthesis."
    },
    "VITAMIN_B12": {
        "canonical_name": "Vitamin B12 (Cobalamin)",
        "unit": "pg/mL",
        "panel": "Vitamins & Micronutrients",
        "demographics": {
            "adult_male":   {"low": 200.0, "high": 900.0, "crit_low": 100.0, "crit_high": 1500.0, "range_str": "200 - 900 pg/mL", "source": "WHO / ICMR Nutritional Standards"},
            "adult_female": {"low": 200.0, "high": 900.0, "crit_low": 100.0, "crit_high": 1500.0, "range_str": "200 - 900 pg/mL", "source": "WHO / ICMR Nutritional Standards"},
            "child":        {"low": 200.0, "high": 900.0, "crit_low": 100.0, "crit_high": 1500.0, "range_str": "200 - 900 pg/mL", "source": "Pediatric Reference"},
        },
        "what_it_measures": "Water-soluble vitamin essential for neurological function, red blood cell synthesis, and DNA methylation.",
        "high_low_meaning": "Lower values indicate insufficient gastrointestinal absorption or dietary intake. May be worth discussing with your doctor.",
        "non_medical_factors": "Strict vegetarian or vegan diets, proton pump inhibitors (acid reducers), or gut absorption issues.",
        "questions_for_doctor": [
            "Does this level suggest dietary supplementation might be beneficial?",
            "Are there symptoms like fatigue or tingling I should watch for?"
        ],
        "lifestyle_info": "Dairy products, fermented foods, fortified nutritional yeast, or fortified grains supply bioavailable B12."
    }
}


def get_demographic_key(age: Optional[int] = 35, sex: Optional[str] = "male") -> str:
    """Resolves demographic cohort key based on patient age and sex."""
    if age is not None and age < 18:
        return "child"
    s = (sex or "male").lower().strip()
    if s.startswith("f") or s == "female":
        return "adult_female"
    return "adult_male"


def evaluate_biomarker(
    test_key: str,
    value: float,
    reported_range_str: Optional[str] = None,
    age: Optional[int] = 35,
    sex: Optional[str] = "male"
) -> Dict[str, Any]:
    """
    Evaluates a biomarker against reference ranges.
    Prefers reported range string if provided, falls back to standard table.
    Determines status: Normal, Low, High, Critical-Low, Critical-High.
    """
    test_key = test_key.upper()
    info = REFERENCE_TABLE.get(test_key)
    if not info:
        return {
            "status": "Normal",
            "severity_colour": "green",
            "severity_label": "Normal",
            "range_used": reported_range_str or "Standard Reference",
            "range_source": "Laboratory Report" if reported_range_str else "General Clinical Reference",
            "is_critical": False,
        }

    demo_key = get_demographic_key(age, sex)
    demo_data = info["demographics"].get(demo_key) or info["demographics"]["adult_male"]

    # Determine range used and source
    if reported_range_str and reported_range_str.strip():
        range_used = reported_range_str.strip()
        range_source = "Printed on your lab report"
    else:
        range_used = demo_data["range_str"]
        range_source = f"{demo_data['source']} ({demo_key.replace('_', ' ').title()})"

    low = demo_data.get("low", 0.0)
    high = demo_data.get("high", 999999.0)
    crit_low = demo_data.get("crit_low")
    crit_high = demo_data.get("crit_high")

    # Evaluate status
    status = "Normal"
    severity_colour = "green"
    severity_label = "Normal"
    is_critical = False

    if crit_low is not None and value < crit_low:
        status = "Critical-Low"
        severity_colour = "darkred"
        severity_label = "Critical Low"
        is_critical = True
    elif crit_high is not None and value >= crit_high:
        status = "Critical-High"
        severity_colour = "darkred"
        severity_label = "Critical High"
        is_critical = True
    elif value < low:
        status = "Low"
        severity_colour = "amber"
        severity_label = "Low"
    elif value > high:
        status = "High"
        severity_colour = "rose"
        severity_label = "High"

    return {
        "status": status,
        "severity_colour": severity_colour,
        "severity_label": severity_label,
        "range_used": range_used,
        "range_source": range_source,
        "is_critical": is_critical,
        "canonical_name": info["canonical_name"],
        "unit": info["unit"],
        "panel": info["panel"],
        "what_it_measures": info["what_it_measures"],
        "high_low_meaning": info["high_low_meaning"],
        "non_medical_factors": info["non_medical_factors"],
        "questions_for_doctor": info["questions_for_doctor"],
        "lifestyle_info": info["lifestyle_info"],
    }
