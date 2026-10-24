import os
from PIL import Image, ImageDraw, ImageFont

def create_prescription_1(output_path):
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Header Clinic banner
    draw.rectangle([(20, 20), (780, 110)], fill=(240, 248, 255), outline=(59, 130, 246), width=2)
    draw.text((40, 30), "APOLLO CLINIC - INDIRANAGAR", fill=(30, 58, 138))
    draw.text((40, 55), "100ft Road, HAL 2nd Stage, Bengaluru - 560038 | Tel: +91 80 2520 1234", fill=(71, 85, 105))
    draw.text((40, 75), "Dr. Ananya Iyer, MD (Internal Medicine), Reg No: KMC-58291", fill=(15, 23, 42))
    
    # Patient Details Bar
    draw.rectangle([(20, 120), (780, 175)], fill=(248, 250, 252), outline=(203, 213, 225), width=1)
    draw.text((35, 130), "Patient Name: Rajesh Sharma", fill=(15, 23, 42))
    draw.text((450, 130), "Age/Sex: 52 Y / Male", fill=(15, 23, 42))
    draw.text((35, 150), "Date: 2026-09-15", fill=(15, 23, 42))
    draw.text((450, 150), "UHID: AP-2026-98124", fill=(15, 23, 42))
    
    # Vitals & Diagnosis
    draw.text((35, 195), "Vitals: BP: 142/90 mmHg | Pulse: 76 bpm | Weight: 78 kg | Fasting Glucose: 148 mg/dL", fill=(51, 65, 85))
    draw.line([(20, 225), (780, 225)], fill=(226, 232, 240), width=2)
    
    draw.text((35, 240), "DIAGNOSIS:", fill=(15, 23, 42))
    draw.text((35, 265), "1. Essential Hypertension (Grade 1)", fill=(30, 41, 59))
    draw.text((35, 285), "2. Type 2 Diabetes Mellitus", fill=(30, 41, 59))
    
    # Rx Section
    draw.text((35, 330), "Rx (Prescription):", fill=(30, 58, 138))
    draw.line([(20, 360), (780, 360)], fill=(59, 130, 246), width=1)
    
    # Medicines
    meds = [
        ("1. Tab. Metformin 500mg", "1 - 0 - 1 (Twice Daily, After Meals)", "30 Days", "Take with meals to prevent GI discomfort"),
        ("2. Tab. Telmisartan 40mg", "1 - 0 - 0 (Once Daily, Morning)", "30 Days", "Take with water in morning"),
        ("3. Tab. Atorvastatin 10mg", "0 - 0 - 1 (Once Daily, Bedtime)", "30 Days", "Take at night before sleep"),
    ]
    
    y = 380
    for title, freq, dur, inst in meds:
        draw.text((40, y), title, fill=(15, 23, 42))
        draw.text((320, y), freq, fill=(30, 41, 59))
        draw.text((620, y), dur, fill=(71, 85, 105))
        draw.text((60, y + 22), f"-> Instructions: {inst}", fill=(100, 116, 139))
        y += 65
    
    # Advice / Followup
    draw.line([(20, 600), (780, 600)], fill=(226, 232, 240), width=1)
    draw.text((35, 620), "ADVICE & DIET PLAN:", fill=(15, 23, 42))
    draw.text((35, 645), "- Low salt (< 5g/day), low carbohydrate, high fiber diabetic diet.", fill=(51, 65, 85))
    draw.text((35, 665), "- 30 mins brisk walking daily. Avoid refined sugars and trans fats.", fill=(51, 65, 85))
    draw.text((35, 685), "- Follow up after 30 days with repeat Fasting Blood Sugar and HbA1c tests.", fill=(51, 65, 85))
    
    # Doctor Signature Footer
    draw.line([(520, 840), (740, 840)], fill=(15, 23, 42), width=1)
    draw.text((540, 850), "Dr. Ananya Iyer", fill=(15, 23, 42))
    draw.text((530, 870), "Consultant Physician", fill=(71, 85, 105))
    
    # Save image
    img.save(output_path, "PNG")

def create_lab_report_1(output_path):
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Lab Header
    draw.rectangle([(20, 20), (780, 100)], fill=(240, 253, 244), outline=(34, 197, 94), width=2)
    draw.text((40, 30), "METROPOLIS DIAGNOSTIC CENTER - CHENNAI", fill=(20, 83, 45))
    draw.text((40, 55), "NABL & CAP Accredited Laboratory | Tel: +91 44 4567 8900 | www.metropolis.in", fill=(71, 85, 105))
    draw.text((40, 75), "Chief Pathologist: Dr. Ramesh Kulkarni, MD (Pathology)", fill=(15, 23, 42))
    
    # Patient Info
    draw.rectangle([(20, 110), (780, 170)], fill=(248, 250, 252), outline=(203, 213, 225), width=1)
    draw.text((35, 120), "Patient Name: Priya Venkatesh", fill=(15, 23, 42))
    draw.text((450, 120), "Age/Sex: 34 Y / Female", fill=(15, 23, 42))
    draw.text((35, 140), "Sample Date: 2026-09-28", fill=(15, 23, 42))
    draw.text((450, 140), "Referred By: Self / Dr. Rao", fill=(15, 23, 42))
    
    # Table Header
    draw.rectangle([(20, 190), (780, 225)], fill=(226, 232, 240))
    draw.text((35, 200), "TEST PARAMETER", fill=(15, 23, 42))
    draw.text((330, 200), "RESULT", fill=(15, 23, 42))
    draw.text((430, 200), "UNIT", fill=(15, 23, 42))
    draw.text((530, 200), "REFERENCE RANGE", fill=(15, 23, 42))
    draw.text((700, 200), "STATUS", fill=(15, 23, 42))
    
    # Lab Rows
    tests = [
        ("Hemoglobin (Hb)", "10.8", "g/dL", "12.0 - 15.5", "LOW"),
        ("Total Leukocyte Count (WBC)", "6800", "/cumm", "4000 - 11000", "NORMAL"),
        ("Platelet Count", "240000", "/cumm", "150000 - 450000", "NORMAL"),
        ("Fasting Blood Sugar (Glucose)", "94", "mg/dL", "70 - 99", "NORMAL"),
        ("Total Cholesterol", "218", "mg/dL", "< 200", "HIGH"),
        ("Serum Creatinine", "0.85", "mg/dL", "0.6 - 1.2", "NORMAL"),
    ]
    
    y = 240
    for name, val, unit, ref, stat in tests:
        color = (220, 38, 38) if stat in ["LOW", "HIGH"] else (15, 23, 42)
        draw.text((35, y), name, fill=(15, 23, 42))
        draw.text((330, y), val, fill=color)
        draw.text((430, y), unit, fill=(71, 85, 105))
        draw.text((530, y), ref, fill=(71, 85, 105))
        draw.text((700, y), stat, fill=color)
        draw.line([(20, y + 30), (780, y + 30)], fill=(241, 245, 249), width=1)
        y += 45
    
    # Interpretation & Note
    draw.rectangle([(20, 560), (780, 660)], fill=(254, 242, 242), outline=(252, 165, 165), width=1)
    draw.text((35, 575), "DIAGNOSTIC IMPRESSION / NOTES:", fill=(153, 27, 27))
    draw.text((35, 600), "1. Mild Microcytic Hypochromic Anemia (Hb: 10.8 g/dL). Recommend Serum Ferritin.", fill=(69, 10, 10))
    draw.text((35, 625), "2. Borderline Hyperlipidemia (Total Cholesterol: 218 mg/dL). Dietary control suggested.", fill=(69, 10, 10))
    
    # Signatures
    draw.line([(520, 840), (740, 840)], fill=(15, 23, 42), width=1)
    draw.text((530, 850), "Dr. Ramesh Kulkarni", fill=(15, 23, 42))
    draw.text((530, 870), "Senior Consultant Pathologist", fill=(71, 85, 105))
    
    img.save(output_path, "PNG")

def create_prescription_2(output_path):
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Clinic Banner
    draw.rectangle([(20, 20), (780, 110)], fill=(254, 243, 199), outline=(245, 158, 11), width=2)
    draw.text((40, 30), "FORTIS HOSPITAL - PULMONOLOGY DEPARTMENT", fill=(146, 64, 14))
    draw.text((40, 55), "Bannerghatta Road, Bengaluru - 560076 | Emergency: 105711", fill=(71, 85, 105))
    draw.text((40, 75), "Dr. Sunita Deshmukh, MD (Pulmonology, Chest Specialist)", fill=(15, 23, 42))
    
    # Patient Info
    draw.rectangle([(20, 120), (780, 175)], fill=(248, 250, 252), outline=(203, 213, 225), width=1)
    draw.text((35, 130), "Patient Name: Arjun Mehta", fill=(15, 23, 42))
    draw.text((450, 130), "Age/Sex: 28 Y / Male", fill=(15, 23, 42))
    draw.text((35, 150), "Date: 2026-10-02", fill=(15, 23, 42))
    draw.text((450, 150), "UHID: FH-BLR-44219", fill=(15, 23, 42))
    
    # Diagnosis
    draw.text((35, 200), "DIAGNOSIS & CLINICAL FINDINGS:", fill=(15, 23, 42))
    draw.text((35, 225), "1. Acute Bronchitis with productive cough (SpO2: 98% on room air, Temp: 100.4 F)", fill=(30, 41, 59))
    draw.text((35, 245), "2. Allergic Rhinitis", fill=(30, 41, 59))
    
    # Rx
    draw.text((35, 290), "MEDICATIONS PRESCRIBED:", fill=(146, 64, 14))
    draw.line([(20, 315), (780, 315)], fill=(245, 158, 11), width=1)
    
    meds = [
        ("1. Tab. Augmentin 625 (Amoxicillin + Clavulanate)", "1 - 0 - 1 (Twice Daily, After Food)", "5 Days", "Complete the full 5 days course without stopping"),
        ("2. Tab. Levocetirizine 5mg + Montelukast 10mg", "0 - 0 - 1 (Once Daily, Night)", "10 Days", "Take at bedtime with water"),
        ("3. Tab. Dolo 650 (Paracetamol)", "1 tab SOS (If fever > 100 F or body ache)", "3 Days", "Max 3 times daily as needed"),
    ]
    
    y = 335
    for title, freq, dur, inst in meds:
        draw.text((40, y), title, fill=(15, 23, 42))
        draw.text((420, y), freq, fill=(30, 41, 59))
        draw.text((680, y), dur, fill=(71, 85, 105))
        draw.text((60, y + 22), f"Instructions: {inst}", fill=(100, 116, 139))
        y += 65
        
    # Tests advised
    draw.line([(20, 560), (780, 560)], fill=(226, 232, 240), width=1)
    draw.text((35, 580), "INVESTIGATIONS ADVISED:", fill=(15, 23, 42))
    draw.text((35, 605), "- Chest X-Ray (PA View) if productive cough persists beyond 7 days.", fill=(51, 65, 85))
    
    # General instructions
    draw.text((35, 640), "GENERAL ADVICE:", fill=(15, 23, 42))
    draw.text((35, 665), "- Steam inhalation with saline twice daily. Drink warm water.", fill=(51, 65, 85))
    draw.text((35, 685), "- Avoid cold drinks and dust exposure. Rest adequately.", fill=(51, 65, 85))
    
    # Signature
    draw.line([(520, 840), (740, 840)], fill=(15, 23, 42), width=1)
    draw.text((530, 850), "Dr. Sunita Deshmukh", fill=(15, 23, 42))
    draw.text((530, 870), "Pulmonologist & Sleep Specialist", fill=(71, 85, 105))
    
    img.save(output_path, "PNG")

if __name__ == '__main__':
    samples_dir = os.path.dirname(__file__)
    create_prescription_1(os.path.join(samples_dir, "sample_prescription_1.png"))
    create_lab_report_1(os.path.join(samples_dir, "sample_lab_report_1.png"))
    create_prescription_2(os.path.join(samples_dir, "sample_prescription_2.png"))
    print("Created sample document images successfully!")
