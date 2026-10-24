import { describe, it, expect } from 'vitest';
import {
  CURATED_ROUTE_REMEDIES,
  getRouteAndRemedyAdvice,
} from '../services/routeRemedyService';

describe('AI Medication Route & Disease Remedy Copilot', () => {
  it('should provide comprehensive route guidance and disease remedies for Pantoprazole/GERD', async () => {
    const advice = await getRouteAndRemedyAdvice('Pantoprazole route and acid reflux remedies');
    expect(advice.conditionOrMedicine).toContain('Pantoprazole');
    expect(advice.routeTitle).toContain('Oral Route');
    expect(advice.routeGuidance.some((g) => g.includes('empty stomach'))).toBe(true);
    expect(advice.remediesForDisease.some((r) => r.includes('Elevate the head'))).toBe(true);
    expect(advice.clinicalAssessmentQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it('should provide route guidance and disease remedies for Metformin/Diabetes', async () => {
    const advice = await getRouteAndRemedyAdvice('Metformin diabetes blood sugar');
    expect(advice.conditionOrMedicine).toContain('Metformin');
    expect(advice.routeGuidance.some((g) => g.includes('with meals'))).toBe(true);
    expect(advice.remediesForDisease.some((r) => r.includes('Walking'))).toBe(true);
    expect(advice.clinicalAssessmentQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it('should provide route guidance and DASH remedies for Telmisartan/Blood Pressure', async () => {
    const advice = await getRouteAndRemedyAdvice('Telmisartan blood pressure hypertension');
    expect(advice.conditionOrMedicine).toContain('Telmisartan');
    expect(advice.routeGuidance.some((g) => g.includes('EXACT SAME TIME'))).toBe(true);
    expect(advice.remediesForDisease.some((r) => r.includes('DASH'))).toBe(true);
  });

  it('should provide route guidance and cardiovascular remedies for Aspirin', async () => {
    const advice = await getRouteAndRemedyAdvice('Ecosprin aspirin heart protection');
    expect(advice.conditionOrMedicine).toContain('Ecosprin');
    expect(advice.routeGuidance.some((g) => g.includes('after food'))).toBe(true);
    expect(advice.remediesForDisease.some((r) => r.includes('Mediterranean'))).toBe(true);
  });

  it('should provide bedtime lipid route guidance and remedies for Atorvastatin', async () => {
    const advice = await getRouteAndRemedyAdvice('Atorvastatin cholesterol lipid reduction');
    expect(advice.conditionOrMedicine).toContain('Atorvastatin');
    expect(advice.routeGuidance.some((g) => g.includes('Bedtime') || g.includes('Evening') || g.includes('sleep'))).toBe(true);
    expect(advice.remediesForDisease.some((r) => r.includes('Fiber'))).toBe(true);
  });

  it('should always include safety disclaimer and when to see doctor alerts', async () => {
    const advice = await getRouteAndRemedyAdvice('any medicine');
    expect(advice.disclaimer).toBeTruthy();
    expect(advice.whenToSeeDoctor.length).toBeGreaterThan(0);
    expect(advice.precautions.length).toBeGreaterThan(0);
  });
});
