# MediMitra Clinical Decision Support & Pattern Rules

> **Auditable Rule Registry for MediMitra Laboratory Diagnostics**  
> *Compliant with Medical Non-Diagnostic Safety Mandate*

This document catalogs every automated cross-marker pattern detection rule in MediMitra. Each rule is deterministic, explainable, and grounded directly in peer-reviewed clinical guidelines and national healthcare standards.

---

## 1. Safety Mandate & Boundaries

1. **Non-Diagnostic Constraint**: No rule or text output asserts a definitive diagnosis (e.g., phrases such as *"you have diabetes"* or *"pre-diabetic impairment"* are strictly forbidden). All outputs are framed as *"above the reference range"* or *"may be worth discussing with your doctor"*.
2. **Medication Prescription Prohibition**: The system never suggests starting, stopping, altering, or dosing any medication, and never sets treatment targets (e.g. *"target < 6.5%"*). Medications are only cited if they appear on the patient's own uploaded prescription and are explicitly labelled *"from your prescription"*.
3. **Emergency Escalation**: Whenever critical physiological limits are breached, the interface and report present: *"Please contact a doctor soon. In an emergency call 112."*
4. **Prediction Bounds**: Every forecast is explicitly labelled *"Trend estimate, not a diagnosis"* and displayed as a range with an uncertainty band, never a single exact number.

---

## 2. Cross-Marker Pattern Rule Catalog

### Rule ID: `GLY-01`
- **Panel**: Glycaemic Profile
- **Title**: Combined Fasting & Post-Meal Glycaemic Elevation
- **Trigger Logic**:
  ```python
  FBS > 99.0 mg/dL AND PPBS > 140.0 mg/dL AND HbA1c > 5.6 %
  ```
- **Clinical Rationale**: Fasting glucose, postprandial glucose, and glycated hemoglobin measure glucose dynamics across acute (overnight fasting), subacute (2-hour postprandial), and longitudinal (8-12 weeks) windows. Elevation across all three markers indicates systemic glycemic deviation.
- **Label Shown**: *"Pattern noticed: Glycaemic panel — all three markers above reference range."*
- **Guideline Citations**:
  - *Indian Council of Medical Research (ICMR) Guidelines for Management of Type 2 Diabetes (2023)*
  - *American Diabetes Association (ADA) Standards of Care in Diabetes (2024)*, Chapter 2: Classification and Diagnosis of Diabetes.

---

### Rule ID: `LIP-01`
- **Panel**: Lipid Panel
- **Title**: Atherogenic Dyslipidemia Pattern (LDL & Triglycerides)
- **Trigger Logic**:
  ```python
  LDL > 100.0 mg/dL AND Triglycerides > 150.0 mg/dL
  ```
- **Clinical Rationale**: High-density atherogenic particle count reflected by elevated LDL paired with triglyceride-rich remnant lipoproteins indicates increased circulating lipid mass.
- **Label Shown**: *"Pattern noticed: Lipid panel — LDL and triglycerides above reference range."*
- **Guideline Citations**:
  - *ACC/AHA Guideline on the Management of Blood Cholesterol (2019)*
  - *Lipid Association of India (LAI) Expert Consensus Statement on Dyslipidemia (2020)*
  - *National Cholesterol Education Program (NCEP) Adult Treatment Panel III (ATP III)*

---

### Rule ID: `LIP-02`
- **Panel**: Lipid Panel
- **Title**: High Triglycerides with Reduced Protective HDL
- **Trigger Logic**:
  ```python
  Triglycerides > 150.0 mg/dL AND HDL < 40.0 mg/dL (Male) / < 50.0 mg/dL (Female)
  ```
- **Clinical Rationale**: Elevated triglycerides coupled with diminished high-density lipoprotein is a well-established surrogate marker of insulin resistance and metabolic stress.
- **Label Shown**: *"Pattern noticed: High triglycerides with reduced protective HDL."*
- **Guideline Citations**:
  - *NCEP ATP III Metabolic Syndrome Criteria*
  - *American Association of Clinical Endocrinology (AACE) Clinical Guidelines*

---

### Rule ID: `KID-01`
- **Panel**: Kidney Function
- **Title**: Renal Excretion Marker Elevation (Creatinine & Urea)
- **Trigger Logic**:
  ```python
  Serum Creatinine > 1.30 mg/dL (Male) / > 1.10 mg/dL (Female) AND BUN > 20.0 mg/dL
  ```
- **Clinical Rationale**: Concomitant elevation of nitrogen waste products (blood urea nitrogen) and muscular filtration byproducts (creatinine) indicates reduced glomerular filtration efficiency, prerenal azotemia, or significant dehydration.
- **Label Shown**: *"Pattern noticed: Kidney panel — both markers above reference range."*
- **Guideline Citations**:
  - *Kidney Disease: Improving Global Outcomes (KDIGO) Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease (2024)*
  - *ICMR Consensus Document for Nephrology Practice*

---

### Rule ID: `LIV-01`
- **Panel**: Liver Function
- **Title**: Concomitant Transaminase Elevation (SGOT & SGPT)
- **Trigger Logic**:
  ```python
  SGOT (AST) > 40.0 U/L AND SGPT (ALT) > 56.0 U/L (Male) / > 45.0 U/L (Female)
  ```
- **Clinical Rationale**: AST and ALT are intracellular transaminase enzymes released during hepatocellular distress. Simultaneous elevation highlights metabolic liver stress or toxic/pharmacological exposure.
- **Label Shown**: *"Pattern noticed: Liver panel — both SGOT and SGPT above reference range."*
- **Guideline Citations**:
  - *American College of Gastroenterology (ACG) Clinical Guideline: Evaluation of Abnormal Liver Chemistries (2017)*
  - *ICMR Guidelines on Non-Alcoholic Fatty Liver Disease*

---

### Rule ID: `CBC-01`
- **Panel**: Complete Blood Count
- **Title**: Low Hemoglobin with Preserved/Elevated Platelets
- **Trigger Logic**:
  ```python
  Hemoglobin < 12.0 g/dL (Female) / < 13.0 g/dL (Male) AND Platelets >= 150,000 /mcL
  ```
- **Clinical Rationale**: Microcytic anemia profile typical of nutritional iron insufficiency, where erythropoiesis is attenuated while megakaryocyte lineages are preserved or reactively elevated.
- **Label Shown**: *"Pattern noticed: Hemoglobin below reference range with preserved platelet count."*
- **Guideline Citations**:
  - *World Health Organization (WHO) Guideline on Haemoglobin Concentrations for the Diagnosis of Anaemia (2024)*
  - *ICMR National Task Force Study on Nutritional Anemia*

---

## 3. Mathematical Trend Prediction Algorithm

MediMitra utilizes **Ordinary Least Squares (OLS) Linear Regression** over time-series coordinates $(t_i, y_i)$, where $t_i$ represents elapsed days from the baseline test report:

$$\hat{y} = \beta_0 + \beta_1 t$$

$$\beta_1 = \frac{\sum (t_i - \bar{t})(y_i - \bar{y})}{\sum (t_i - \bar{t})^2}$$

### Requirements & Guardrails:
- **Minimum Data Requirement**: $\ge 3$ verified clinical records. If $n < 3$, output is strictly *"insufficient_data"* with *"Not enough data for a trend yet"*.
- **Uncertainty Band**: The projected 60-day point estimate $\hat{y}_{t+60}$ is never output as a discrete scalar. It is presented as a range:
  $$[\hat{y}_{t+60} - 1.5 \cdot s_e, \ \hat{y}_{t+60} + 1.5 \cdot s_e]$$
  where $s_e$ is the standard error of regression residuals.
- **Directional Classification**:
  - **Improving**: Downward slope for atherogenic/glycemic markers toward normal; upward slope for hemoglobin, HDL, or vitamins.
  - **Stable**: Monthly rate of change $|\beta_{\text{month}}| \le \text{Threshold}$ (e.g. $< 0.08\%$ for HbA1c).
  - **Worsening**: Upward deviation away from reference bounds for glycemic or lipid markers.
  - **Unclear**: $R^2 < 0.25$ indicates high fluctuation with no linear trajectory.
