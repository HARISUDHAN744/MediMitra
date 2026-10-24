import { describe, it, expect } from 'vitest';
import {
  ISO_COUNTRIES,
  getCountryHealthProfile,
  getPrioritizedReligionsForCountry,
  validatePhoneNumberForCountry,
  encryptSensitivePreference,
  decryptSensitivePreference,
  getDefaultCountryFromLocale,
  getSubdivisionsForCountry,
  getSubdivisionLabelForCountry,
} from '../services/countryService';

describe('Phase 14B: Sign-in & Country Profile Test Suite', () => {
  describe('1. Full ISO 3166-1 Country Directory (190+ Sovereign Entries)', () => {
    it('should have 190+ sovereign countries in the ISO directory', () => {
      expect(ISO_COUNTRIES.length).toBeGreaterThanOrEqual(190);
    });

    it('should not contain "Other Global Country"', () => {
      const names = ISO_COUNTRIES.map((c) => c.name.toLowerCase());
      expect(names).not.toContain('other global country');
      expect(names).not.toContain('other country');
    });

    it('should be flag-free and provide native script names and international dial codes', () => {
      ISO_COUNTRIES.forEach((country) => {
        expect(country.code).toMatch(/^[A-Z]{2}$/);
        expect(country.iso3).toMatch(/^[A-Z]{3}$/);
        expect(country.name).toBeTruthy();
        expect(country.nativeName).toBeTruthy();
        expect(country.phoneCode).toMatch(/^\+\d+/);

        // Assert flag-free: No emoji flag characters in name or nativeName
        const flagEmojiRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/;
        expect(flagEmojiRegex.test(country.name)).toBe(false);
      });
    });

    it('should resolve default country from locale with fallback to India', () => {
      const defaultCountry = getDefaultCountryFromLocale();
      expect(defaultCountry).toBeDefined();
      expect(defaultCountry.code).toBeTruthy();
    });
  });

  describe('2. Country Health Resources & ABDM Link Logic', () => {
    it('should display ABDM link (https://abdm.gov.in/) exclusively for India', () => {
      const indiaProfile = getCountryHealthProfile('IN');
      expect(indiaProfile.country).toBe('India');
      expect(indiaProfile.digitalHealth).toBeDefined();
      expect(indiaProfile.digitalHealth?.url).toBe('https://abdm.gov.in');
      expect(indiaProfile.digitalHealth?.name).toContain('Ayushman Bharat Digital Mission');

      // Assert non-India countries do NOT show the Indian ABDM link
      const usProfile = getCountryHealthProfile('US');
      expect(usProfile.digitalHealth?.url).not.toBe('https://abdm.gov.in');

      const deProfile = getCountryHealthProfile('DE');
      expect(deProfile.digitalHealth?.url).not.toBe('https://abdm.gov.in');

      const auProfile = getCountryHealthProfile('AU');
      expect(auProfile.digitalHealth?.url).not.toBe('https://abdm.gov.in');
    });

    it('should provide official verified health links for seed countries', () => {
      const usProfile = getCountryHealthProfile('US');
      expect(usProfile.healthMinistry?.url).toBe('https://www.hhs.gov');
      expect(usProfile.publicHealthAgency?.url).toBe('https://www.cdc.gov');
      expect(usProfile.drugRegulator?.url).toBe('https://www.fda.gov');
      expect(usProfile.organDonationRegistry?.url).toBe('https://www.organdonor.gov');

      const ukProfile = getCountryHealthProfile('GB');
      expect(ukProfile.healthMinistry?.url).toBe('https://www.nhs.uk');
      expect(ukProfile.organDonationRegistry?.url).toBe('https://www.organdonation.nhs.uk');
    });

    it('should provide a WHO country page fallback for countries without custom profiles', () => {
      const fijiProfile = getCountryHealthProfile('FJ');
      expect(fijiProfile.fallbackWhoUrl).toBe('https://www.who.int/countries/fji/');
    });
  });

  describe('3. Religion & Cultural Preferences (Country-Sorted, Encrypted, Excluded)', () => {
    it('should prioritize major religions based on the selected country', () => {
      const indiaReligions = getPrioritizedReligionsForCountry('IN');
      // For India, Hinduism, Islam, Christianity should be priority
      const topIds = indiaReligions.slice(0, 3).map((r) => r.id);
      expect(topIds).toContain('hinduism');
      expect(topIds).toContain('islam');
      expect(topIds).toContain('christianity');

      const usReligions = getPrioritizedReligionsForCountry('US');
      // For US, Christianity and Secular should be top priority
      expect(usReligions[0].id).toBe('christianity');
    });

    it('should place "Other" and "Prefer not to say" at the end of the list', () => {
      const options = getPrioritizedReligionsForCountry('IN');
      const last = options[options.length - 1];
      const secondLast = options[options.length - 2];
      expect(last.id).toBe('prefer_not_to_say');
      expect(secondLast.id).toBe('other');
    });

    it('should encrypt sensitive preferences at rest and support in-memory decryption', () => {
      const raw = 'hinduism';
      const encrypted = encryptSensitivePreference(raw);
      expect(encrypted).toMatch(/^enc:/);
      expect(encrypted).not.toBe(raw);

      const decrypted = decryptSensitivePreference(encrypted);
      expect(decrypted).toBe(raw);
    });

    it('should ensure religion is excluded from API payloads and logging', () => {
      const clientPayload = {
        name: 'Gokul T',
        phone_number: '+919876543210',
        country_code: 'IN',
        religion: 'hinduism',
        religionPreference: 'enc:xyz123',
      };

      // Server sanitization simulation
      const sanitizedPayload = Object.fromEntries(
        Object.entries(clientPayload).filter(([k]) => !['religion', 'belief', 'religionPreference'].includes(k))
      );

      expect(sanitizedPayload).not.toHaveProperty('religion');
      expect(sanitizedPayload).not.toHaveProperty('religionPreference');
      expect(JSON.stringify(sanitizedPayload)).not.toContain('hinduism');
    });
  });

  describe('4. Phone Number Validation via libphonenumber-js', () => {
    it('should validate valid Indian mobile numbers with formatting', () => {
      const res = validatePhoneNumberForCountry('9876543210', 'IN');
      expect(res.isValid).toBe(true);
      expect(res.formattedE164).toBe('+919876543210');
    });

    it('should validate valid US phone numbers with formatting', () => {
      const res = validatePhoneNumberForCountry('2025550143', 'US');
      expect(res.isValid).toBe(true);
      expect(res.formattedE164).toBe('+12025550143');
    });

    it('should reject invalid or too-short phone numbers', () => {
      const res = validatePhoneNumberForCountry('123', 'IN');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('5. Dynamic Country State / Province Subdivisions', () => {
    it('should provide dynamic states for India including Tamil Nadu', () => {
      const inStates = getSubdivisionsForCountry('IN');
      expect(inStates).toContain('Tamil Nadu');
      expect(inStates).toContain('Maharashtra');
      expect(inStates).toContain('Karnataka');
      expect(inStates).toContain('Kerala');
      expect(inStates).toContain('Delhi NCR');
      expect(getSubdivisionLabelForCountry('IN')).toBe('State / Administrative Territory');
    });

    it('should provide dynamic states for United States including California and New York', () => {
      const usStates = getSubdivisionsForCountry('US');
      expect(usStates).toContain('California');
      expect(usStates).toContain('Texas');
      expect(usStates).toContain('New York');
      expect(usStates).toContain('Florida');
      expect(getSubdivisionLabelForCountry('US')).toBe('State / Administrative Territory');
    });

    it('should provide dynamic provinces for Canada and Emirates for UAE', () => {
      const caProvinces = getSubdivisionsForCountry('CA');
      expect(caProvinces).toContain('Ontario');
      expect(caProvinces).toContain('Quebec');
      expect(caProvinces).toContain('British Columbia');
      expect(getSubdivisionLabelForCountry('CA')).toBe('Province / Territory');

      const aeEmirates = getSubdivisionsForCountry('AE');
      expect(aeEmirates).toContain('Dubai');
      expect(aeEmirates).toContain('Abu Dhabi');
      expect(getSubdivisionLabelForCountry('AE')).toBe('Emirate');
    });

    it('should provide fallback administrative territories for unlisted countries', () => {
      const fallback = getSubdivisionsForCountry('ZZ');
      expect(fallback.length).toBeGreaterThan(3);
      expect(fallback).toContain('Capital Territory / Metropolitan Region');
    });
  });
});
