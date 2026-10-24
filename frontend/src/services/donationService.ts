/**
 * donationService.ts
 * -------------------------------------------------------------------
 * Clinical logic and data access layer for Phase 14A: Donation Hub
 * Adheres strictly to Global Privacy, Safety, and Honesty rules:
 * - No individual donor pins or private contact leaks ($k >= 5$ aggregation)
 * - Clear "Demo data" labelling for seed records
 * - Attributions with source, lastVerified, and feedback reporting
 */

import donationOrgsData from '../data/donation_orgs.json';
import transplantCentresData from '../data/transplant_centres.json';
import ambulanceDirectoryData from '../data/ambulance_directory.json';
import countryResourcesData from '../data/country_resources.json';

export interface DonationOrg {
  id: string;
  name: string;
  country: string;
  type: 'Government' | 'NGO' | 'Hospital network';
  description: string;
  website: string;
  domain: string;
  helpline: string;
  source: string;
  lastVerified: string;
}

export interface TransplantCentre {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  organsHandled: string[];
  type: string;
  phone?: string;
  source: string;
  lastVerified: string;
}

export interface AmbulanceService {
  id: string;
  code?: string;
  name: string;
  phone: string;
  city?: string;
  state?: string;
  type?: string;
  description?: string;
  operatingHours: string;
  coverage?: string;
  charge?: string;
  website?: string;
  source: string;
  lastVerified: string;
}

export interface AirAmbulanceService {
  id: string;
  name: string;
  phone: string;
  website: string;
  baseCities: string[];
  aircraftType: string;
  capabilities: string;
  advisory: string;
  source: string;
  lastVerified: string;
}

export interface DonorRegistryEntry {
  id: string;
  alias: string; // Anonymous handle or first name only
  bloodGroup: string;
  cityArea: string; // City / Neighborhood only (NO street address, NO GPS pin)
  isAvailable: boolean;
  ageConfirmed: boolean;
  registeredDate: string;
  isDemoData: boolean;
}

export interface AggregatedDonorCluster {
  cityArea: string;
  count: number;
  lat: number;
  lng: number;
  availableCount: number;
  bloodGroupsSummary: Record<string, number>;
}

// 8 Standard Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

// Blood Compatibility Rules (Red Blood Cells)
export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canGiveTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  },
};

// Known approximate city centroids for privacy-preserving donor aggregation
const CITY_CENTROIDS: Record<string, [number, number]> = {
  'chennai': [13.0827, 80.2707],
  'chennai - anna nagar': [13.0850, 80.2101],
  'chennai - t nagar': [13.0418, 80.2341],
  'chennai - guindy': [13.0067, 80.2025],
  'new delhi - central': [28.6139, 77.2090],
  'new delhi - south': [28.5355, 77.2410],
  'mumbai - south': [18.9220, 72.8347],
  'mumbai - suburbs': [19.0760, 72.8777],
  'bengaluru - central': [12.9716, 77.5946],
  'bengaluru - koramangala': [12.9352, 77.6245],
  'hyderabad - banjara hills': [17.4156, 78.4350],
  'salem': [11.6643, 78.1460],
  'coimbatore': [11.0168, 76.9558],
};

// Seed demo donors (all clearly marked Demo data with k >= 5 clusters)
const INITIAL_DEMO_DONORS: DonorRegistryEntry[] = [
  // Chennai Anna Nagar Cluster (6 donors -> passes k >= 5 threshold)
  { id: 'd-1', alias: 'Ravi K.', bloodGroup: 'O+', cityArea: 'Chennai - Anna Nagar', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-12', isDemoData: true },
  { id: 'd-2', alias: 'Kavitha S.', bloodGroup: 'A+', cityArea: 'Chennai - Anna Nagar', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-15', isDemoData: true },
  { id: 'd-3', alias: 'Manoj P.', bloodGroup: 'B+', cityArea: 'Chennai - Anna Nagar', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-20', isDemoData: true },
  { id: 'd-4', alias: 'Divya R.', bloodGroup: 'O-', cityArea: 'Chennai - Anna Nagar', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-01', isDemoData: true },
  { id: 'd-5', alias: 'Suresh V.', bloodGroup: 'AB+', cityArea: 'Chennai - Anna Nagar', isAvailable: false, ageConfirmed: true, registeredDate: '2026-10-04', isDemoData: true },
  { id: 'd-6', alias: 'Ananya B.', bloodGroup: 'A+', cityArea: 'Chennai - Anna Nagar', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-10', isDemoData: true },

  // New Delhi Central Cluster (5 donors -> passes k >= 5 threshold)
  { id: 'd-7', alias: 'Amitabh G.', bloodGroup: 'B+', cityArea: 'New Delhi - Central', isAvailable: true, ageConfirmed: true, registeredDate: '2026-08-11', isDemoData: true },
  { id: 'd-8', alias: 'Pooja M.', bloodGroup: 'O+', cityArea: 'New Delhi - Central', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-02', isDemoData: true },
  { id: 'd-9', alias: 'Deepak T.', bloodGroup: 'A-', cityArea: 'New Delhi - Central', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-18', isDemoData: true },
  { id: 'd-10', alias: 'Simran K.', bloodGroup: 'AB-', cityArea: 'New Delhi - Central', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-05', isDemoData: true },
  { id: 'd-11', alias: 'Harpreet S.', bloodGroup: 'O+', cityArea: 'New Delhi - Central', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-12', isDemoData: true },

  // Bengaluru Koramangala Cluster (5 donors -> passes k >= 5 threshold)
  { id: 'd-12', alias: 'Karthik N.', bloodGroup: 'O-', cityArea: 'Bengaluru - Koramangala', isAvailable: true, ageConfirmed: true, registeredDate: '2026-08-30', isDemoData: true },
  { id: 'd-13', alias: 'Sneha R.', bloodGroup: 'A+', cityArea: 'Bengaluru - Koramangala', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-10', isDemoData: true },
  { id: 'd-14', alias: 'Varun M.', bloodGroup: 'B+', cityArea: 'Bengaluru - Koramangala', isAvailable: true, ageConfirmed: true, registeredDate: '2026-09-24', isDemoData: true },
  { id: 'd-15', alias: 'Meera C.', bloodGroup: 'O+', cityArea: 'Bengaluru - Koramangala', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-02', isDemoData: true },
  { id: 'd-16', alias: 'Naveen D.', bloodGroup: 'AB+', cityArea: 'Bengaluru - Koramangala', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-14', isDemoData: true },

  // Isolated entry with size < 5 (MUST be suppressed by K-anonymity filter)
  { id: 'd-17', alias: 'Sample Solo', bloodGroup: 'O+', cityArea: 'Salem', isAvailable: true, ageConfirmed: true, registeredDate: '2026-10-15', isDemoData: true },
];

const LOCAL_STORAGE_DONORS_KEY = 'medimitra_voluntary_blood_donors';
const LOCAL_STORAGE_REPORTS_KEY = 'medimitra_donation_hub_reports';
const LOCAL_STORAGE_REQUESTS_KEY = 'medimitra_donation_hub_requests';

/**
 * Loads all donation organisations from verified data file
 */
export function getDonationOrganisations(): DonationOrg[] {
  return donationOrgsData as DonationOrg[];
}

/**
 * Loads verified transplant centres
 */
export function getTransplantCentres(): TransplantCentre[] {
  return transplantCentresData as TransplantCentre[];
}

/**
 * Loads ambulance directory
 */
export function getAmbulanceDirectory() {
  return ambulanceDirectoryData as {
    nationalOfficial: AmbulanceService[];
    regionalAndPrivate: AmbulanceService[];
    airAmbulance: AirAmbulanceService[];
  };
}

/**
 * Loads country official health resources
 */
export function getCountryResources(countryCode: string = 'IN') {
  const data = countryResourcesData as Record<string, unknown>;
  const upper = countryCode.toUpperCase();
  return (data[upper] || data['IN']) as Record<string, unknown>;
}

/**
 * Loads registered blood donors (combining demo seed and user opt-in entries)
 */
export function getVoluntaryDonors(): DonorRegistryEntry[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_DONORS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DONORS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(INITIAL_DEMO_DONORS));
      return INITIAL_DEMO_DONORS;
    }
    return JSON.parse(raw) as DonorRegistryEntry[];
  } catch {
    return INITIAL_DEMO_DONORS;
  }
}

/**
 * Registers a new voluntary blood donor with explicit privacy protections:
 * - NO exact address, NO GPS coordinates stored
 * - Opt-in consent required
 */
export function registerVoluntaryDonor(params: {
  alias: string;
  bloodGroup: string;
  cityArea: string;
  ageConfirmed: boolean;
  consentGiven: boolean;
}): { success: boolean; error?: string } {
  if (!params.consentGiven) {
    return { success: false, error: 'Explicit consent is required to register as a voluntary donor.' };
  }
  if (!params.ageConfirmed) {
    return { success: false, error: 'You must confirm that you are at least 18 years of age.' };
  }
  if (!params.alias.trim() || !params.bloodGroup || !params.cityArea.trim()) {
    return { success: false, error: 'Please provide all required fields.' };
  }

  const existing = getVoluntaryDonors();
  const newEntry: DonorRegistryEntry = {
    id: `user-donor-${Date.now()}`,
    alias: params.alias.trim(),
    bloodGroup: params.bloodGroup,
    cityArea: params.cityArea.trim(),
    isAvailable: true,
    ageConfirmed: true,
    registeredDate: new Date().toISOString().split('T')[0],
    isDemoData: false,
  };

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(updated));
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to save registration locally.' };
  }
}

/**
 * PRIVACY RULE: Aggregates voluntary donors into area bubbles on the map.
 * Enforces K-Anonymity (min group size k >= 5).
 * Any area with fewer than 5 registered donors is suppressed from the map
 * to guarantee that individual donors can never be singled out or identified.
 */
export function getAggregatedDonorClusters(kThreshold: number = 5): AggregatedDonorCluster[] {
  const donors = getVoluntaryDonors();
  const grouped: Record<string, DonorRegistryEntry[]> = {};

  for (const donor of donors) {
    const key = donor.cityArea.toLowerCase().trim();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(donor);
  }

  const clusters: AggregatedDonorCluster[] = [];

  for (const [key, areaDonors] of Object.entries(grouped)) {
    // Strict K-Anonymity Filter
    if (areaDonors.length < kThreshold) {
      continue; // Suppress cluster to protect donor anonymity
    }

    // Lookup approximate coordinate for area
    const coords = CITY_CENTROIDS[key] || [13.0827, 80.2707]; // Default Chennai centroid fallback

    const bloodGroupsSummary: Record<string, number> = {};
    let availableCount = 0;

    for (const d of areaDonors) {
      bloodGroupsSummary[d.bloodGroup] = (bloodGroupsSummary[d.bloodGroup] || 0) + 1;
      if (d.isAvailable) availableCount++;
    }

    clusters.push({
      cityArea: areaDonors[0].cityArea,
      count: areaDonors.length,
      lat: coords[0],
      lng: coords[1],
      availableCount,
      bloodGroupsSummary,
    });
  }

  return clusters;
}

/**
 * Sends an anonymous in-app patient request to an area donor.
 * Contact details are never revealed unless the donor explicitly chooses to reply.
 */
export function sendAnonymousDonorRequest(params: {
  donorId: string;
  patientAlias: string;
  requiredBloodGroup: string;
  hospitalName: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  message: string;
}): { success: boolean; requestId: string } {
  const requestId = `req-${Date.now()}`;
  const requestPayload = {
    ...params,
    requestId,
    timestamp: new Date().toISOString(),
    status: 'Pending Donor Review',
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.push(requestPayload);
    localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(existing));
  } catch {
    // fallback
  }

  return { success: true, requestId };
}

/**
 * Report incorrect info submission
 */
export function reportIncorrectInfo(params: {
  resourceId: string;
  resourceName: string;
  category: 'Organisation' | 'Transplant Centre' | 'Ambulance' | 'Other';
  issueDescription: string;
  suggestedCorrection?: string;
}): { success: boolean } {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.push({
      ...params,
      timestamp: new Date().toISOString(),
      reportId: `rep-${Date.now()}`,
    });
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(existing));
    return { success: true };
  } catch {
    return { success: false };
  }
}
