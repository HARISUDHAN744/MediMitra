/**
 * routeRemedyService.ts
 * -------------------------------------------------------------------
 * Clinical AI Route of Administration & Disease Remedy Copilot Service.
 * Provides interactive questioning about drug administration routes,
 * meal/empty-stomach timings, and evidence-backed lifestyle/dietary remedies.
 */

export interface RouteRemedyAdvice {
  conditionOrMedicine: string;
  routeTitle: string;
  routeGuidance: string[];
  remediesForDisease: string[];
  clinicalAssessmentQuestions: string[];
  precautions: string[];
  whenToSeeDoctor: string[];
  disclaimer: string;
}

export const CURATED_ROUTE_REMEDIES: Record<string, RouteRemedyAdvice> = {
  pantoprazole: {
    conditionOrMedicine: 'Pantoprazole / Acid Reflux & GERD',
    routeTitle: 'Oral Route (Delayed-Release / Enteric-Coated)',
    routeGuidance: [
      'Take on an empty stomach 30 to 60 minutes BEFORE the first meal of the day (breakfast) with a full glass of warm water.',
      'Must be swallowed whole — NEVER crush, split, or chew enteric-coated tablets, as stomach acid will destroy the active ingredient before absorption.',
      'Reason for Timing: Proton pumps (H+/K+ ATPase) are stimulated by food intake; the drug must enter the bloodstream before pumps become active.',
      'If prescribed twice daily, take the second dose 30–60 minutes before the evening meal.',
    ],
    remediesForDisease: [
      'Elevate the head of your bed by 6–8 inches (use bed risers or wedge pillow, not extra soft pillows) to prevent nocturnal acid reflux.',
      'Avoid lying down or reclining within 3 hours after eating a meal.',
      'Consume fresh ginger tea or warm water to soothe gastric mucosal inflammation.',
      'Eat smaller, more frequent meals rather than large, heavy meals that exert pressure on the lower esophageal sphincter (LES).',
      'Identify and limit personal dietary triggers: deep-fried food, caffeine, mint, carbonated drinks, citrus, and raw tomatoes.',
    ],
    clinicalAssessmentQuestions: [
      'Do you take this pill strictly on an empty stomach at least 30 minutes before food?',
      'Do you experience nighttime acid regurgitation or a bitter taste in your throat when lying flat?',
      'Have you noticed symptoms triggered by specific foods or eating too close to bedtime?',
    ],
    precautions: [
      'Do not take antacids (like Gelusil/Digene) within 2 hours of Pantoprazole as they may alter enteric coating dissolution.',
      'Long-term use may affect Vitamin B12 and Magnesium absorption; periodic monitoring is advised.',
    ],
    whenToSeeDoctor: [
      'Difficulty swallowing (dysphagia) or painful swallowing (odynophagia).',
      'Persistent vomiting, vomit with blood (coffee-ground emesis), or black tarry stools.',
      'Unexplained weight loss or chest pain radiating to the jaw, neck, or arm.',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },

  metformin: {
    conditionOrMedicine: 'Metformin / Type 2 Diabetes Glycemic Control',
    routeTitle: 'Oral Route with Food (GI Protective Timing)',
    routeGuidance: [
      'Take IMMEDIATELY with meals or right at the end of breakfast/dinner with a full glass of water.',
      'Reason for Timing: Food in the stomach significantly buffers the gastrointestinal tract, reducing nausea, metallic taste, abdominal cramps, and diarrhea.',
      'If using Extended Release (XR/SR) formulation, swallow whole — do not chew, split, or crush.',
      'Stay consistently hydrated throughout the day to support healthy renal clearance.',
    ],
    remediesForDisease: [
      'Post-Meal 15-Minute Walking: A brisk 10–15 minute walk after meals significantly activates non-insulin-dependent GLUT4 glucose uptake in skeletal muscle.',
      'Fenugreek (Methi) Water: Soaking 1 teaspoon of fenugreek seeds overnight and drinking in the morning aids carbohydrate digestion.',
      'High-Fiber Low-GI Diet: Emphasize whole legumes, oats, millets, green vegetables, and chia/flax seeds to slow glucose absorption.',
      'Cinnamon & Apple Cider Vinegar (in moderation): Can help improve insulin sensitivity when combined with a balanced meal.',
      'Maintain consistent meal timings to avoid sudden glucose fluctuations.',
    ],
    clinicalAssessmentQuestions: [
      'Do you experience stomach cramps, diarrhea, or metallic taste after taking Metformin?',
      'Are you taking it in the middle or end of your meal with adequate water?',
      'Are you tracking both fasting and 2-hour post-prandial blood sugar levels?',
    ],
    precautions: [
      'Avoid excessive alcohol consumption while on Metformin to prevent the rare risk of lactic acidosis.',
      'Inform your physician if you are scheduled for any CT scan or procedure requiring iodinated radiocontrast dye.',
    ],
    whenToSeeDoctor: [
      'Unexplained severe fatigue, muscle aches, breathing difficulty, or extreme abdominal discomfort.',
      'Persistent severe diarrhea or vomiting that prevents oral fluid intake.',
      'Signs of severe hypoglycemia (shakiness, sweating, confusion, tachycardia) if combined with sulfonylureas or insulin.',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },

  telmisartan: {
    conditionOrMedicine: 'Telmisartan / Blood Pressure Regulation',
    routeTitle: 'Oral Route (Consistent Daily Rhythm)',
    routeGuidance: [
      'Can be taken with or without food, but must be taken at the EXACT SAME TIME every day with a glass of water.',
      'Reason for Consistency: Telmisartan has a long 24-hour elimination half-life; taking it at regular 24-hour intervals provides steady daytime and nighttime vascular protection.',
      'Morning vs Evening: If morning BP is high (morning surge), many cardiologists recommend morning dosing. Follow your doctor’s scheduled slot.',
    ],
    remediesForDisease: [
      'DASH Diet Pattern: Rich in vegetables, fruits, low-fat dairy, and whole grains, delivering natural potassium, magnesium, and calcium.',
      'Sodium Reduction: Aim for less than 1,500–2,000 mg of sodium daily (avoid processed snacks, pickles, and hidden salt).',
      'Hibiscus Tea: Drinking unsweetened hibiscus tea has been shown in clinical trials to gently support healthy arterial relaxation.',
      'Daily 30-Minute Aerobic Activity: Regular brisk walking or cycling reduces systemic vascular resistance.',
      'Slow Diaphragmatic Breathing: 5–10 minutes of slow 6-breaths-per-minute breathing dampens sympathetic nervous system overactivity.',
    ],
    clinicalAssessmentQuestions: [
      'Do you take your blood pressure medication at the exact same hour every day?',
      'Do you experience dizziness or lightheadedness when rising rapidly from a sitting or lying position?',
      'Have you been tracking your home blood pressure readings in a logbook or app?',
    ],
    precautions: [
      'Avoid potassium supplements or potassium-containing salt substitutes without checking with your doctor, as ARBs can raise serum potassium.',
      'Stay hydrated in warm weather or during illness to prevent sudden hypotension.',
    ],
    whenToSeeDoctor: [
      'Blood pressure consistently measuring >180/120 mmHg or <90/60 mmHg with symptoms.',
      'Severe headache, blurry vision, chest pressure, or shortness of breath.',
      'Swelling of the face, lips, tongue, or throat (angioedema).',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },

  ecosprin: {
    conditionOrMedicine: 'Ecosprin (Aspirin) / Cardiovascular Protection',
    routeTitle: 'Oral Route with Food (Gastric Mucosa Protection)',
    routeGuidance: [
      'Always take with or immediately after food (e.g. lunch or dinner) with a full glass of water.',
      'Remain upright (sitting or standing) for at least 15–30 minutes after taking it to prevent esophageal irritation.',
      'Swallow the enteric-coated tablet whole. Do not chew or crush unless explicitly instructed during an acute emergency event.',
      'Taking it with food buffers the stomach lining against salicylic acid irritation.',
    ],
    remediesForDisease: [
      'Mediterranean Heart Diet: Abundant in extra virgin olive oil, nuts (walnuts, almonds), avocados, and wild fatty fish rich in EPA/DHA omega-3s.',
      'Garlic & Turmeric (Dietary amounts): Mild natural circulation support through diet.',
      'Maintain adequate daily hydration to support healthy blood volume and fluid balance.',
      'Stop smoking and avoid second-hand smoke completely to protect coronary endothelial linings.',
      'Engage in heart-rate elevated cardio exercises as approved by your cardiologist.',
    ],
    clinicalAssessmentQuestions: [
      'Do you always take your aspirin with or right after a meal?',
      'Have you noticed any stomach discomfort, acid burning, or unusual bruising?',
      'Are you taking any other pain relievers (like ibuprofen or naproxen) concurrently?',
    ],
    precautions: [
      'Do NOT take over-the-counter NSAIDs (like Ibuprofen/Brufen) without medical advice, as they compete with Aspirin’s antiplatelet action.',
      'Inform dentists and surgeons that you take daily antiplatelet therapy prior to any procedural work.',
    ],
    whenToSeeDoctor: [
      'Black, tarry bowel movements or vomit that resembles coffee grounds.',
      'Unexplained, severe nosebleeds or bleeding that doesn’t stop after direct pressure.',
      'Sudden severe chest pain, shortness of breath, or numbness in limbs.',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },

  atorvastatin: {
    conditionOrMedicine: 'Atorvastatin / Lipid & Cholesterol Regulation',
    routeTitle: 'Oral Route (Preferred Evening / Bedtime Dosing)',
    routeGuidance: [
      'Can be taken with or without food. Evening or bedtime administration is preferred.',
      'Reason for Bedtime Timing: Physiological hepatic cholesterol synthesis by HMG-CoA reductase peaks during sleep and overnight fasting.',
      'Swallow with water. Maintain a consistent daily time slot.',
      'Strictly avoid consuming large quantities of grapefruit or grapefruit juice, as it inhibits hepatic CYP3A4 enzymes and raises drug concentration.',
    ],
    remediesForDisease: [
      'Soluble Fiber Loading: 5–10 grams of soluble fiber daily (from oats, barley, chia seeds, psyllium husk) binds to digestive bile acids and lowers LDL.',
      'Plant Phytosterols: Nuts, seeds, legumes, and unrefined vegetable oils naturally compete with intestinal cholesterol absorption.',
      'Eliminate Trans Fats: Avoid hydrogenated oils, bakery shortenings, and reused frying oils.',
      'Antioxidant-Rich Diet: Blueberries, amla (Indian gooseberry), green tea, and spinach reduce LDL oxidation.',
      'Aerobic Exercise: 150 minutes per week increases cardioprotective HDL cholesterol and lowers triglycerides.',
    ],
    clinicalAssessmentQuestions: [
      'Do you take your statin consistently at night before sleep?',
      'Have you felt any unexplained muscle soreness, weakness, or tenderness in your legs/arms?',
      'Do you consume grapefruit products or taking interacting herbal supplements?',
    ],
    precautions: [
      'Limit alcohol consumption to protect liver enzyme activity.',
      'Report any persistent, unexplained muscle pains or dark cola-colored urine immediately.',
    ],
    whenToSeeDoctor: [
      'Severe, unexplained muscle pain (myalgia), tenderness, or weakness.',
      'Yellowing of the skin or eyes (jaundice) or persistent nausea (liver signals).',
      'Unusual dark or brown urine.',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },

  general_route_remedy: {
    conditionOrMedicine: 'General Administration Route & Disease Remedies',
    routeTitle: 'Universal Clinical Route Guidelines',
    routeGuidance: [
      'Oral Empty Stomach: Requires ingestion 1 hour before or 2 hours after food with water (e.g. PPIs, Thyroid hormones, certain antibiotics).',
      'Oral with Food: Ingest with meals to prevent gastric mucosal irritation or enhance absorption (e.g. NSAIDs, Metformin, Fat-soluble vitamins).',
      'Swallow Whole Rule: Any tablet or capsule marked SR, XR, CR, or EC has specialized release coatings. Never crush or chew.',
      'Posture: Always drink at least 150–200 mL of water and avoid lying flat immediately after swallowing pills to prevent pill-induced esophagitis.',
    ],
    remediesForDisease: [
      'Hydration: Drink 2–2.5 liters of clean water daily unless restricted by renal or cardiac conditions.',
      'Sleep Hygiene: Aim for 7–8 hours of sound sleep to regulate immune cytokines and metabolic hormones.',
      'Whole Foods Nutrition: Minimize refined sugars, processed sodium, and ultra-processed ingredients.',
      'Movement: Incorporate physical activity daily to enhance systemic circulation and drug transport.',
      'Stress Reduction: Mindfulness meditation, prayer, and deep breathing reduce cortisol and autonomic strain.',
    ],
    clinicalAssessmentQuestions: [
      'What specific medicine or disease condition are you seeking route guidance and remedies for?',
      'Do you have trouble swallowing pills, or experience stomach burning after taking your medications?',
      'Are you taking multiple medications at the same time slot?',
    ],
    precautions: [
      'Never alter your prescribed dose or administration route based solely on lifestyle advice.',
      'Check with your pharmacist regarding drug-food interactions before starting new dietary remedies.',
    ],
    whenToSeeDoctor: [
      'Any severe allergic symptoms: hives, facial swelling, wheezing, or difficulty breathing.',
      'Severe unexpected drug side effects or worsening of original medical symptoms.',
    ],
    disclaimer:
      'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
  },
};

/**
 * Queries AI Route & Disease Remedy Copilot
 */
export async function getRouteAndRemedyAdvice(
  userQuery: string,
  languageCode: string = 'en',
  medicineHint?: string
): Promise<RouteRemedyAdvice> {
  const queryLower = (userQuery || '').toLowerCase();
  const hintLower = (medicineHint || '').toLowerCase();

  // Fast local resolution during tests or offline environments
  const globalProc = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process;
  const isTestEnv = globalProc?.env?.NODE_ENV === 'test';

  if (!isTestEnv) {
    // Try calling backend AI assistant if available with fast 1.5s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch('http://localhost:8000/ask-medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: `Medical Route of Administration and Disease Remedy Inquiry: ${userQuery}. Focus on route administration timings, empty stomach vs with meals, pill swallowing instructions, and non-pharmacological evidence-backed remedies for the underlying disease condition.`,
          language: languageCode,
          context: {
            category: 'medication_route_and_disease_remedy',
            medicineHint,
          },
        }),
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          return {
            conditionOrMedicine: medicineHint || userQuery,
            routeTitle: 'Clinical Route & Administration Intelligence',
            routeGuidance: data.key_points || [data.answer.substring(0, 200)],
            remediesForDisease: data.lifestyle_diet || [
              'Follow structured nutritional guidelines and regular hydration.',
              'Incorporate light physical activity and stress reduction.',
            ],
            clinicalAssessmentQuestions: [
              'Are you taking this medication with or without meals as recommended?',
              'Have you noticed any adverse symptoms related to the administration route?',
              'Would you like to explore complementary dietary modifications?',
            ],
            precautions: data.precautions || [
              'Do not alter prescribed dosages without physician consultation.',
            ],
            whenToSeeDoctor: data.when_to_see_doctor || [
              'Seek immediate medical care for severe symptoms, chest pain, or allergic reactions.',
            ],
            disclaimer:
              'AI Remedial & Route Guidance is for educational support. Always consult your treating physician before altering any prescription medication.',
          };
        }
      }
    } catch {
      // Fallback to local clinical engine
    }
  }

  // Local Matcher
  if (queryLower.includes('panto') || queryLower.includes('reflux') || queryLower.includes('gerd') || queryLower.includes('acid') || hintLower.includes('panto')) {
    return CURATED_ROUTE_REMEDIES.pantoprazole;
  }
  if (queryLower.includes('metform') || queryLower.includes('sugar') || queryLower.includes('diabet') || hintLower.includes('metformin')) {
    return CURATED_ROUTE_REMEDIES.metformin;
  }
  if (queryLower.includes('telmi') || queryLower.includes('pressure') || queryLower.includes('bp') || queryLower.includes('hypertens') || hintLower.includes('telmi')) {
    return CURATED_ROUTE_REMEDIES.telmisartan;
  }
  if (queryLower.includes('aspirin') || queryLower.includes('ecosprin') || queryLower.includes('heart') || queryLower.includes('cardio') || hintLower.includes('aspirin')) {
    return CURATED_ROUTE_REMEDIES.ecosprin;
  }
  if (queryLower.includes('atorva') || queryLower.includes('cholesterol') || queryLower.includes('lipid') || queryLower.includes('statin') || hintLower.includes('atorva')) {
    return CURATED_ROUTE_REMEDIES.atorvastatin;
  }

  return CURATED_ROUTE_REMEDIES.general_route_remedy;
}
