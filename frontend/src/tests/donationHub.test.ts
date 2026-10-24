import { describe, it, expect } from 'vitest';
import {
  getDonationOrganisations,
  getTransplantCentres,
  getAmbulanceDirectory,
  getCountryResources,
  getAggregatedDonorClusters,
  BLOOD_COMPATIBILITY,
  registerVoluntaryDonor,
  getVoluntaryDonors,
} from '../services/donationService';
import { getUiTranslations, CURATED_LANGUAGES } from '../services/languageService';

describe('Phase 14A: Donation Hub & Emergency Directory Test Suite', () => {
  describe('1. Data Schema & Verified Resource Integrity', () => {
    it('should load verified donation organisations with all required fields', () => {
      const orgs = getDonationOrganisations();
      expect(orgs.length).toBeGreaterThanOrEqual(10);

      orgs.forEach((org) => {
        expect(org.id).toBeTruthy();
        expect(org.name).toBeTruthy();
        expect(org.country).toBeTruthy();
        expect(['Government', 'NGO', 'Hospital network']).toContain(org.type);
        expect(org.website).toMatch(/^https:\/\//);
        expect(org.domain).toBeTruthy();
        expect(org.helpline).toBeTruthy();
        expect(org.source).toBeTruthy();
        expect(org.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should include core Indian apex registries: NOTTO, e-RaktKosh, NBTC, and Red Cross', () => {
      const orgs = getDonationOrganisations();
      const orgIds = orgs.map((o) => o.id);
      expect(orgIds).toContain('notto-in');
      expect(orgIds).toContain('eraktkosh-in');
      expect(orgIds).toContain('nbtc-in');
      expect(orgIds).toContain('ircs-in');
    });

    it('should load verified transplant centres with valid geographic coordinates', () => {
      const centres = getTransplantCentres();
      expect(centres.length).toBeGreaterThanOrEqual(5);

      centres.forEach((tc) => {
        expect(tc.name).toBeTruthy();
        expect(tc.city).toBeTruthy();
        expect(tc.state).toBeTruthy();
        expect(tc.lat).toBeGreaterThan(8.0);
        expect(tc.lat).toBeLessThan(36.0);
        expect(tc.lng).toBeGreaterThan(68.0);
        expect(tc.lng).toBeLessThan(98.0);
        expect(Array.isArray(tc.organsHandled)).toBe(true);
        expect(tc.organsHandled.length).toBeGreaterThan(0);
        expect(tc.source).toBeTruthy();
      });
    });

    it('should load complete ambulance directory (National, Regional, and Air)', () => {
      const amb = getAmbulanceDirectory();
      expect(amb.nationalOfficial.length).toBeGreaterThanOrEqual(3);

      const codes = amb.nationalOfficial.map((n) => n.phone);
      expect(codes).toContain('112');
      expect(codes).toContain('108');
      expect(codes).toContain('102');

      expect(amb.airAmbulance.length).toBeGreaterThanOrEqual(3);
      amb.airAmbulance.forEach((air) => {
        expect(air.phone).toBeTruthy();
        expect(air.website).toMatch(/^https:\/\//);
        expect(air.advisory).toContain('Not endorsed');
      });
    });

    it('should load country resources with official government portals', () => {
      const india = getCountryResources('IN') as any;
      expect(india.country).toBe('India');
      expect(india.emergency.ambulance).toBe('108');
      expect(india.organDonationRegistry.url).toContain('notto.mohfw.gov.in');
      expect(india.bloodDonationRegistry.url).toContain('eraktkosh.mohfw.gov.in');
      expect(india.healthMinistry.url).toContain('mohfw.gov.in');
    });
  });

  describe('2. Privacy & K-Anonymity (Strict No-Individual-Pin Guarantee)', () => {
    it('should enforce k >= 5 anonymity threshold and suppress isolated donors', () => {
      const clusters = getAggregatedDonorClusters(5);
      expect(clusters.length).toBeGreaterThan(0);

      // Verify that every cluster that gets exposed on the map has at least 5 donors
      clusters.forEach((cluster) => {
        expect(cluster.count).toBeGreaterThanOrEqual(5);
        expect(cluster.cityArea).toBeTruthy();
        expect(cluster.lat).toBeTruthy();
        expect(cluster.lng).toBeTruthy();

        // STRICT PRIVACY CHECK: No personal details in cluster payload
        const rawJson = JSON.stringify(cluster);
        expect(rawJson).not.toContain('name');
        expect(rawJson).not.toContain('phone');
        expect(rawJson).not.toContain('email');
        expect(rawJson).not.toContain('address');
        expect(rawJson).not.toContain('alias');
      });

      // Assert that an isolated area with only 1 donor (e.g. Salem solo demo) is suppressed
      const salemCluster = clusters.find((c) => c.cityArea.toLowerCase().includes('salem'));
      expect(salemCluster).toBeUndefined();
    });

    it('should require explicit consent and age >= 18 to register as a voluntary donor', () => {
      const failConsent = registerVoluntaryDonor({
        alias: 'Test User',
        bloodGroup: 'B+',
        cityArea: 'Chennai',
        ageConfirmed: true,
        consentGiven: false,
      });
      expect(failConsent.success).toBe(false);
      expect(failConsent.error).toContain('Explicit consent is required');

      const failAge = registerVoluntaryDonor({
        alias: 'Test User',
        bloodGroup: 'B+',
        cityArea: 'Chennai',
        ageConfirmed: false,
        consentGiven: true,
      });
      expect(failAge.success).toBe(false);
      expect(failAge.error).toContain('18 years of age');
    });
  });

  describe('3. Blood Compatibility Rules', () => {
    it('should confirm O- as universal red blood cell donor', () => {
      const oNeg = BLOOD_COMPATIBILITY['O-'];
      expect(oNeg.canGiveTo.length).toBe(8);
      expect(oNeg.canGiveTo).toContain('A+');
      expect(oNeg.canGiveTo).toContain('B+');
      expect(oNeg.canGiveTo).toContain('AB+');
      expect(oNeg.canGiveTo).toContain('O+');
      expect(oNeg.canReceiveFrom).toEqual(['O-']);
    });

    it('should confirm AB+ as universal red blood cell recipient', () => {
      const abPos = BLOOD_COMPATIBILITY['AB+'];
      expect(abPos.canGiveTo).toEqual(['AB+']);
      expect(abPos.canReceiveFrom.length).toBe(8);
      expect(abPos.canReceiveFrom).toContain('O-');
      expect(abPos.canReceiveFrom).toContain('A+');
      expect(abPos.canReceiveFrom).toContain('B-');
    });
  });

  describe('4. Translation Keys Completeness', () => {
    it('should provide donationNav in English and across all full UI languages', () => {
      const enTrans = getUiTranslations('en');
      expect(enTrans.donationNav).toBe('Donation Hub');

      const testLangs = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'es', 'fr', 'de', 'ar'];
      testLangs.forEach((lang) => {
        const trans = getUiTranslations(lang);
        expect(trans.donationNav).toBeTruthy();
        expect(typeof trans.donationNav).toBe('string');
        expect(trans.donationNav.length).toBeGreaterThan(0);
      });
    });

    it('should never return undefined for donationNav across any curated language', () => {
      CURATED_LANGUAGES.forEach((lang) => {
        const trans = getUiTranslations(lang.code);
        expect(trans.donationNav).toBeDefined();
        expect(trans.donationNav).not.toBe('');
      });
    });
  });
});
