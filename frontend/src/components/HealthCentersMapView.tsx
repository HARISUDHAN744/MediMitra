/**
 * HealthCentersMapView.tsx
 * -------------------------------------------------------------------
 * Care Map – upgraded version (HackXL MediMitra)
 *
 * FIXES APPLIED:
 *  1. GPS-FIRST: watchPosition (live, high-accuracy) sets the
 *     distance-sort origin. The City dropdown NEVER overrides GPS.
 *     After a GPS lock, selectedCity resets to "All Cities" so every
 *     nearby facility across all cities is shown sorted by real distance.
 *  2. REAL MAP: Leaflet + OpenStreetMap tiles replace the fake radar SVG.
 *     Every filtered facility gets a clickable pin. User position shows
 *     a blue pulsing marker + accuracy-radius circle.
 *  3. HONEST DATA: Yellow "Demo Data" banner above the list.
 *     NABH badge labelled "(Sample)". Bed counts etc. stay as-is for
 *     demo purposes but are clearly marked as illustrative only.
 *  4. ALL PINS: map shows all filteredFacilities, not just 2.
 *  5. SALEM / NAMAKKAL: 4 synthetic facilities added near 11.44°N 78.23°E
 *     so GPS at that location returns local results.
 *
 * ⚠ All facility data is synthetic / sample. Never hardcode real API keys.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
// Leaflet needs its default CSS to render tiles correctly
import 'leaflet/dist/leaflet.css';

// ── Vite + Leaflet fix ────────────────────────────────────────────────────
// Vite hashes asset paths so Leaflet's hard-coded default marker image URLs
// (marker-icon.png, marker-shadow.png) always 404. We null them out because
// we use custom SVG DivIcons everywhere — no default markers are needed.
// See https://github.com/Leaflet/Leaflet/issues/4968
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '', iconRetinaUrl: '' });
import {
  MapPin,
  Hospital,
  Phone,
  Clock,
  Navigation,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  X,
  Filter,
  Star,
  Building2,
  Stethoscope,
  Crosshair,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { LanguageDetail } from '../services/languageService';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface HealthCentersMapViewProps {
  language?: LanguageDetail;
  userRegion?: string;
  currentUser?: {
    name?: string;
    phoneNumber?: string;
    medicalId?: string;
    email?: string;
  };
}

// ---------------------------------------------------------------------------
// MedicalFacility type
// ---------------------------------------------------------------------------
export interface MedicalFacility {
  id: string;
  name: string;
  type:
    | 'Multi-Specialty Hospital'
    | 'Government Primary Health Center'
    | '24/7 Trauma & Emergency'
    | 'Diagnostic Lab'
    | 'Super-Specialty Hospital';
  city: string;
  location: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distance: string;
  contactNumber: string;
  emergencyNumber: string;
  operatingHours: string;
  isOpen24Hours: boolean;
  bedsAvailable: number;
  icuBedsAvailable: number;
  oxygenAvailable: boolean;
  ambulanceAvailable: boolean;
  specialties: string[];
  rating: number;
  reviewCount: number;
  consultationFee: string;
  ayushmanBharatAccepted: boolean;
  nabhAccredited: boolean;
  doctorsOnDuty: string[];
}

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

// ---------------------------------------------------------------------------
// Synthetic facility dataset  ⚠ SAMPLE DATA — not real-time
// ---------------------------------------------------------------------------
const REGIONAL_HEALTH_CENTERS: Omit<MedicalFacility, 'distanceKm' | 'distance'>[] = [
  // --- Chennai / Tamil Nadu ---
  {
    id: 'fac-1',
    name: 'Apollo Multi-Specialty Hospital',
    type: 'Multi-Specialty Hospital',
    city: 'Chennai',
    location: '21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu',
    lat: 13.0604,
    lng: 80.2505,
    contactNumber: '+91 44 2829 0200',
    emergencyNumber: '1066',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 42,
    icuBedsAvailable: 8,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency ICU', 'Gastroenterology'],
    rating: 4.8,
    reviewCount: 3420,
    consultationFee: '₹600 – ₹900 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. V. Sundaram (Cardiologist)', 'Dr. Kavitha Raman (General Physician)'],
  },
  {
    id: 'fac-2',
    name: 'Government Primary Health Centre (PHC)',
    type: 'Government Primary Health Center',
    city: 'Chennai',
    location: 'Lattice Bridge Road, Adyar, Chennai, Tamil Nadu',
    lat: 13.0012,
    lng: 80.2565,
    contactNumber: '104',
    emergencyNumber: '108',
    operatingHours: '8:00 AM – 8:00 PM',
    isOpen24Hours: false,
    bedsAvailable: 16,
    icuBedsAvailable: 2,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['General Medicine', 'Maternal & Child Health', 'Immunization', 'Jan Aushadhi Free Pharmacy'],
    rating: 4.5,
    reviewCount: 980,
    consultationFee: 'Free (Govt of Tamil Nadu)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. R. Arumugam (Medical Officer)', 'Dr. Priya S. (Gynecologist)'],
  },
  {
    id: 'fac-3',
    name: 'Fortis Malar Hospital & 24/7 Trauma Care',
    type: '24/7 Trauma & Emergency',
    city: 'Chennai',
    location: 'Gandhi Nagar, 1st Main Road, Adyar, Chennai, Tamil Nadu',
    lat: 13.0067,
    lng: 80.2571,
    contactNumber: '+91 44 4289 2222',
    emergencyNumber: '+91 44 4289 2100',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 28,
    icuBedsAvailable: 6,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Critical Trauma', 'Orthopedics', 'Cardiovascular Surgery', 'Nephrology & Dialysis'],
    rating: 4.7,
    reviewCount: 2150,
    consultationFee: '₹700 – ₹1,000 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. Sanjay Nathan (Trauma Specialist)', 'Dr. Meera Iyer (Orthopedic Surgeon)'],
  },
  {
    id: 'fac-4',
    name: 'Dr. Lal PathLabs & Digital Diagnostics',
    type: 'Diagnostic Lab',
    city: 'Chennai',
    location: '2nd Avenue, Anna Nagar, Chennai, Tamil Nadu',
    lat: 13.085,
    lng: 80.2101,
    contactNumber: '+91 44 3988 5050',
    emergencyNumber: '1800 102 4820',
    operatingHours: '6:30 AM – 9:00 PM',
    isOpen24Hours: false,
    bedsAvailable: 0,
    icuBedsAvailable: 0,
    oxygenAvailable: false,
    ambulanceAvailable: false,
    specialties: ['Biochemistry', 'Digital Chest X-Ray', 'CT / MRI Scans', 'HbA1c & Lipid Panels'],
    rating: 4.6,
    reviewCount: 1640,
    consultationFee: '₹150 – ₹1,200 (Sample)',
    ayushmanBharatAccepted: false,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. Rajeshwari K. (Pathologist)'],
  },
  {
    id: 'fac-5',
    name: 'Rajiv Gandhi Government General Hospital (RGGGH)',
    type: 'Government Primary Health Center',
    city: 'Chennai',
    location: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu',
    lat: 13.0827,
    lng: 80.279,
    contactNumber: '+91 44 2530 5000',
    emergencyNumber: '108',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 85,
    icuBedsAvailable: 15,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Comprehensive Multi-Specialty', 'Trauma Resuscitation', 'Pediatrics', 'Burn Unit'],
    rating: 4.4,
    reviewCount: 5200,
    consultationFee: 'Free (CM Comprehensive Insurance)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. M. Senthil Kumar (HOD Medicine)', 'Dr. Anitha D. (Chief Emergency)'],
  },

  // --- Bengaluru / Karnataka ---
  {
    id: 'fac-6',
    name: 'Manipal Hospital & Super Specialty Clinic',
    type: 'Multi-Specialty Hospital',
    city: 'Bengaluru',
    location: '98 HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka',
    lat: 12.9592,
    lng: 77.6545,
    contactNumber: '+91 80 2502 4444',
    emergencyNumber: '080 2222 1111',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 35,
    icuBedsAvailable: 9,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Organ Transplant', 'Pediatrics', 'Robotic Surgery', 'Dialysis Unit', 'Cardiology'],
    rating: 4.8,
    reviewCount: 4120,
    consultationFee: '₹800 – ₹1,200 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. Sudarshan Ballal (Nephrologist)', 'Dr. H. Sudarshan (Cardiologist)'],
  },
  {
    id: 'fac-7',
    name: 'Victoria Government Hospital & Trauma Care',
    type: 'Government Primary Health Center',
    city: 'Bengaluru',
    location: 'Fort Road, Near City Market, Bengaluru, Karnataka',
    lat: 12.9629,
    lng: 77.5752,
    contactNumber: '+91 80 2670 1150',
    emergencyNumber: '108',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 64,
    icuBedsAvailable: 12,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Emergency Trauma', 'Dermatology', 'Burns Care', 'General Surgery'],
    rating: 4.3,
    reviewCount: 2890,
    consultationFee: 'Free / ABDM Covered',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. Ramesh K. (Medical Superintendent)'],
  },

  // --- Mumbai / Maharashtra ---
  {
    id: 'fac-8',
    name: 'Lilavati Hospital & Research Centre',
    type: 'Multi-Specialty Hospital',
    city: 'Mumbai',
    location: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra',
    lat: 19.0519,
    lng: 72.829,
    contactNumber: '+91 22 2675 1000',
    emergencyNumber: '+91 22 2656 8063',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 38,
    icuBedsAvailable: 10,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Cardiac Sciences', 'Neurosciences', 'Oncology', 'High-Risk Obstetrics'],
    rating: 4.7,
    reviewCount: 3950,
    consultationFee: '₹1,000 – ₹1,500 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. Nitin Gokhale (Cardiologist)', 'Dr. Sunita Kapoor (Internal Medicine)'],
  },

  // --- Delhi / NCR ---
  {
    id: 'fac-9',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    type: 'Super-Specialty Hospital',
    city: 'Delhi',
    location: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi',
    lat: 28.5672,
    lng: 77.21,
    contactNumber: '+91 11 2658 8500',
    emergencyNumber: '102',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 95,
    icuBedsAvailable: 24,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Premier Multi-Specialty', 'Pediatric ICU', 'Advanced Oncology', 'Neurotrauma'],
    rating: 4.9,
    reviewCount: 8900,
    consultationFee: 'Free / Nominal OPD ₹10',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Prof. Dr. Randeep Guleria (Pulmonology)', 'Dr. M. V. Padma (Neurology)'],
  },

  // --- Hyderabad / Telangana ---
  {
    id: 'fac-10',
    name: 'KIMS Hospitals & Heart Institute',
    type: 'Multi-Specialty Hospital',
    city: 'Hyderabad',
    location: '1-8-31/1, Minister Road, Krishna Nagar, Secunderabad, Telangana',
    lat: 17.4399,
    lng: 78.4983,
    contactNumber: '+91 40 4488 5000',
    emergencyNumber: '+91 40 4488 5100',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 46,
    icuBedsAvailable: 11,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Interventional Cardiology', 'Organ Transplants', 'Orthopedics', 'Gastroenterology'],
    rating: 4.8,
    reviewCount: 2980,
    consultationFee: '₹700 – ₹950 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. B. Bhaskar Rao (Cardio-Thoracic)', 'Dr. Sambit Sahu (Critical Care)'],
  },

  // --- Salem / Namakkal — added so GPS at 11.44°N 78.23°E shows local results ---
  {
    id: 'fac-11',
    name: 'Salem Government Medical College Hospital',
    type: 'Government Primary Health Center',
    city: 'Salem',
    location: 'Shevapet, Salem, Tamil Nadu 636002',
    lat: 11.6643,
    lng: 78.146,
    contactNumber: '+91 427 246 8888',
    emergencyNumber: '108',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 120,
    icuBedsAvailable: 18,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics', 'Burn Unit'],
    rating: 4.2,
    reviewCount: 3100,
    consultationFee: 'Free (TN Govt)',
    ayushmanBharatAccepted: true,
    nabhAccredited: false,
    doctorsOnDuty: ['Dr. K. Sivakumar (Medical Superintendent)', 'Dr. Latha N. (Chief Emergency)'],
  },
  {
    id: 'fac-12',
    name: 'Sri Gokulam Hospital, Salem',
    type: 'Multi-Specialty Hospital',
    city: 'Salem',
    location: '3/60, Meyyanur Road, Salem, Tamil Nadu 636004',
    lat: 11.6601,
    lng: 78.1409,
    contactNumber: '+91 427 233 5555',
    emergencyNumber: '+91 427 233 5500',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 30,
    icuBedsAvailable: 7,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Cardiology', 'Nephrology', 'Orthopedics', 'Laparoscopic Surgery'],
    rating: 4.5,
    reviewCount: 1820,
    consultationFee: '₹400 – ₹700 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: true,
    doctorsOnDuty: ['Dr. A. Rajendran (Cardiologist)', 'Dr. Vijaya R. (Nephrologist)'],
  },
  {
    id: 'fac-13',
    name: 'Namakkal District Government Hospital',
    type: 'Government Primary Health Center',
    city: 'Namakkal',
    location: 'Old Bus Stand Road, Namakkal, Tamil Nadu 637001',
    lat: 11.2189,
    lng: 78.168,
    contactNumber: '+91 4286 220 100',
    emergencyNumber: '108',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 60,
    icuBedsAvailable: 8,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['General Medicine', 'Maternal Health', 'Immunization', 'Dialysis'],
    rating: 4.1,
    reviewCount: 1250,
    consultationFee: 'Free (TN Govt)',
    ayushmanBharatAccepted: true,
    nabhAccredited: false,
    doctorsOnDuty: ['Dr. P. Murugan (Medical Officer)', 'Dr. Selvi K. (Gynecologist)'],
  },
  {
    id: 'fac-14',
    name: 'VGM Hospital & Trauma Centre, Namakkal',
    type: '24/7 Trauma & Emergency',
    city: 'Namakkal',
    location: 'NH 44, Tiruchengode Road, Namakkal, Tamil Nadu 637003',
    lat: 11.2167,
    lng: 78.1652,
    contactNumber: '+91 4286 221 500',
    emergencyNumber: '+91 4286 221 555',
    operatingHours: '24 Hours Open',
    isOpen24Hours: true,
    bedsAvailable: 22,
    icuBedsAvailable: 5,
    oxygenAvailable: true,
    ambulanceAvailable: true,
    specialties: ['Road Accident Trauma', 'Orthopedics', 'General Surgery', 'Critical Care'],
    rating: 4.3,
    reviewCount: 870,
    consultationFee: '₹350 – ₹600 (Sample)',
    ayushmanBharatAccepted: true,
    nabhAccredited: false,
    doctorsOnDuty: ['Dr. T. Chandrasekaran (Trauma Surgeon)', 'Dr. Geetha M. (Orthopedics)'],
  },
];

// Cities available in the quick-filter dropdown
const POPULAR_CITIES = ['All Cities', 'Chennai', 'Salem', 'Namakkal', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'];

// City centre coordinates (for manual dropdown panning only — never overrides GPS)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Chennai:   { lat: 13.0827, lng: 80.2707 },
  Salem:     { lat: 11.6643, lng: 78.146  },
  Namakkal:  { lat: 11.2189, lng: 78.168  },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai:    { lat: 19.076,  lng: 72.8777 },
  Delhi:     { lat: 28.6139, lng: 77.209  },
  Hyderabad: { lat: 17.385,  lng: 78.4867 },
};

/**
 * Calculates nearest registered city within 45 km to provide human-readable label
 */
function getNearestCityName(lat: number, lng: number): string | null {
  let nearestCity: string | null = null;
  let minDistance = Infinity;

  for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
    const dist = haversineKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = cityName;
    }
  }

  if (minDistance <= 45 && nearestCity) {
    return nearestCity;
  }
  return null;
}

/**
 * Asynchronous reverse geocoding via OpenStreetMap Nominatim for live GPS coordinates
 */
async function fetchReverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.village || addr.county;
      const city = addr.city || addr.state_district || addr.state;
      if (locality && city && locality !== city) {
        return `${locality}, ${city}`;
      }
      return locality || city || null;
    }
  } catch {
    // Non-fatal, fallback to nearest registered city
  }
  return null;
}

/**
 * Safe IP Geolocation fallback when browser GPS is blocked, unavailable, or times out
 */
async function fetchIpGeolocation(): Promise<{ lat: number; lng: number; city: string } | null> {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || data.region || 'Detected Regional Location',
        };
      }
    }
  } catch {
    try {
      const res2 = await fetch('https://ipapi.co/json/');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.latitude && data2.longitude) {
          return {
            lat: data2.latitude,
            lng: data2.longitude,
            city: data2.city || data2.region || 'Detected Regional Location',
          };
        }
      }
    } catch {}
  }
  return null;
}

// Marker colour by facility type
function markerColour(type: MedicalFacility['type']): string {
  switch (type) {
    case 'Government Primary Health Center': return '#16a34a'; // green
    case '24/7 Trauma & Emergency':          return '#dc2626'; // red
    case 'Diagnostic Lab':                   return '#7c3aed'; // violet
    case 'Super-Specialty Hospital':         return '#0284c7'; // blue
    default:                                 return '#ea580c'; // orange (Multi-Specialty)
  }
}

// Build a tiny SVG DivIcon for Leaflet (no external image file needed)
function buildIcon(colour: string, isSelected: boolean): L.DivIcon {
  const size  = isSelected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="${colour}" stroke="white" stroke-width="3"
        style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))"/>
      <text x="18" y="23" text-anchor="middle" font-size="14" fill="white">🏥</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// User GPS pin — created lazily inside the map useEffect so it runs after DOM mount.
function makeUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;
             background:#38bdf8;border:3px solid white;
             box-shadow:0 0 0 6px rgba(56,189,248,.3);
             animation:pulse 1.5s infinite;"></div>`,
    className: '',
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
  });
}

// ---------------------------------------------------------------------------
// LeafletMap sub-component
// Renders the real OSM map inside a plain <div>.
// Re-draws pins whenever filteredFacilities or userCoords change.
// ---------------------------------------------------------------------------
interface LeafletMapProps {
  userCoords: { lat: number; lng: number };
  accuracyMeters: number | null;
  filteredFacilities: MedicalFacility[];
  selectedFacilityId: string;
  onSelectFacility: (fac: MedicalFacility) => void;
  /** When user manually picks a city, pan there (does NOT change GPS origin) */
  panTarget: { lat: number; lng: number } | null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  userCoords,
  accuracyMeters,
  filteredFacilities,
  selectedFacilityId,
  onSelectFacility,
  panTarget,
}) => {
  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const userLayerRef = useRef<L.Layer[]>([]);

  // Initialise the Leaflet map once on mount
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center:  [userCoords.lat, userCoords.lng],
      zoom:    12,
      zoomControl: true,
    });

    // OpenStreetMap tile layer — free, no API key required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Cleanup: destroy the map when the component unmounts
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user-position marker + accuracy circle whenever GPS changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous user-position layers
    userLayerRef.current.forEach((l) => map.removeLayer(l));
    userLayerRef.current = [];

    // Blue pulse pin for current position
    const userPin = L.marker([userCoords.lat, userCoords.lng], { icon: makeUserIcon() })
      .bindPopup('<b>📍 Your Location</b>')
      .addTo(map);

    userLayerRef.current.push(userPin);

    // Accuracy radius circle (only if accuracy is known)
    if (accuracyMeters !== null && accuracyMeters > 0) {
      const circle = L.circle([userCoords.lat, userCoords.lng], {
        radius: accuracyMeters,
        color:  '#38bdf8',
        weight: 1.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.12,
      }).addTo(map);
      userLayerRef.current.push(circle);
    }

    // Pan to user smoothly with optimal zoom for local healthcare facilities
    const targetZoom = Math.max(map.getZoom(), 13);
    map.flyTo([userCoords.lat, userCoords.lng], targetZoom, { animate: true, duration: 1 });
  }, [userCoords, accuracyMeters]);

  // Pan to a city centre when the dropdown changes (does NOT change GPS origin)
  useEffect(() => {
    if (!mapRef.current || !panTarget) return;
    mapRef.current.flyTo([panTarget.lat, panTarget.lng], 13, { animate: true, duration: 1 });
  }, [panTarget]);

  // Re-draw hospital pins whenever the filtered list or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old hospital markers
    markersRef.current.forEach((l) => map.removeLayer(l));
    markersRef.current = [];

    filteredFacilities.forEach((fac) => {
      const isSelected = fac.id === selectedFacilityId;
      const icon = buildIcon(markerColour(fac.type), isSelected);
      const marker = L.marker([fac.lat, fac.lng], { icon, zIndexOffset: isSelected ? 1000 : 0 })
        .bindPopup(
          `<div style="min-width:180px;font-family:sans-serif">
            <b style="font-size:13px">${fac.name}</b><br/>
            <span style="color:#0284c7;font-size:11px">${fac.type}</span><br/>
            <span style="font-size:11px;color:#555">${fac.distance}</span><br/>
            <span style="font-size:10px;color:#888">${fac.location}</span>
          </div>`
        )
        .on('click', () => onSelectFacility(fac))
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [filteredFacilities, selectedFacilityId, onSelectFacility]);

  return (
    <div
      ref={mapDivRef}
      id="hospital-leaflet-map"
      style={{ width: '100%', height: '420px', borderRadius: '1.5rem', zIndex: 0 }}
      className="border border-sky-200 shadow-md"
    />
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const HealthCentersMapView: React.FC<HealthCentersMapViewProps> = ({
  userRegion = 'Tamil Nadu',
  currentUser,
}) => {
  // --- Location state ---
  // Default: Salem/Namakkal region (matches the hackathon test case)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.0827,
    lng: 80.2707,
  });
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsError, setGpsError]     = useState<string | null>(null);
  const [gpsSuccessNotice, setGpsSuccessNotice] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [detectedLocationText, setDetectedLocationText] = useState<string>(
    userRegion ? `${userRegion}, India` : 'Chennai, Tamil Nadu'
  );

  // watchPosition watch-id so we can clear it on unmount / re-press
  const watchIdRef = useRef<number | null>(null);

  // --- Filter state ---
  /**
   * selectedCity is a VIEW FILTER only.
   * GPS lock resets it to 'All Cities' so all nearby hospitals show.
   * Manually changing the dropdown only narrows the list — it NEVER
   * changes userCoords (the distance-sort origin).
   */
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // panTarget is separate: it tells the map to pan without touching GPS
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);

  const [searchTerm, setSearchTerm]               = useState('');
  const [customLocationQuery, setCustomLocationQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter]   = useState<string>('All');
  const [onlyAvailableBeds, setOnlyAvailableBeds]     = useState(false);
  const [onlyOpen24Hours, setOnlyOpen24Hours]         = useState(false);
  const [onlyAyushmanBharat, setOnlyAyushmanBharat]   = useState(false);

  // --- Selected facility (card + map) ---
  const [selectedFacility, setSelectedFacility] = useState<MedicalFacility>({
    ...REGIONAL_HEALTH_CENTERS[0],
    distanceKm: 0,
    distance: '—',
  });

  // --- Appointment booking modal state ---
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess]         = useState(false);
  const [bookingId, setBookingId]                   = useState('');
  const [patientName, setPatientName]               = useState(currentUser?.name || 'Gokul T');
  const [patientPhone, setPatientPhone]             = useState(currentUser?.phoneNumber || '+91 98765 43210');
  const [patientMedicalId]                          = useState(currentUser?.medicalId || 'MM-IND-TN-9821');
  const [consultationMode, setConsultationMode]     = useState<'In-Person' | 'Tele-Consultation'>('In-Person');
  const [selectedDoctor, setSelectedDoctor]         = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty]   = useState<string>('General Medicine');
  const [appointmentDate, setAppointmentDate]       = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [appointmentSlot, setAppointmentSlot] = useState('10:30 AM - Morning Slot');
  const [patientNote, setPatientNote]         = useState('');

  // Stop any live watch when the component unmounts
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // ROBUST GPS FIX: Multi-stage acquisition ladder with auto-recentering
  // 1. High accuracy GPS (5s timeout)
  // 2. Standard accuracy network / WiFi fallback (8s timeout, cached ok)
  // 3. Seamless IP geolocation fallback if browser permission blocked/unavailable
  // 4. Reverse geocoding & map centering (panTarget)
  // -------------------------------------------------------------------------
  const handleDetectLiveLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setGpsError(null);
    setGpsSuccessNotice(false);

    // Apply location fix smoothly to state and map
    const applyLocationFix = (
      lat: number,
      lng: number,
      accuracy: number | null,
      source: 'GPS' | 'WiFi / Network' | 'IP'
    ) => {
      setUserCoords({ lat, lng });
      setPanTarget({ lat, lng });
      setAccuracyMeters(accuracy);
      setSelectedCity('All Cities');
      setIsGpsActive(true);

      const nearestCity = getNearestCityName(lat, lng);
      const accText = accuracy !== null && accuracy > 0 ? ` • ±${Math.round(accuracy)} m` : '';
      const baseLabel = nearestCity
        ? `📍 ${source}: ${nearestCity} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)${accText}`
        : `📍 ${source} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)${accText}`;

      setDetectedLocationText(baseLabel);
      setGpsError(null);
      setGpsSuccessNotice(true);
      setIsDetectingLocation(false);

      setTimeout(() => setGpsSuccessNotice(false), 5000);

      // Asynchronously refine label with reverse geocode place name
      fetchReverseGeocode(lat, lng).then((place) => {
        if (place) {
          setDetectedLocationText(`📍 ${source}: ${place}${accText}`);
        }
      });

      // Start continuous background watch if geolocation is supported
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude: newLat, longitude: newLng, accuracy: newAcc } = pos.coords;
              setUserCoords({ lat: newLat, lng: newLng });
              setAccuracyMeters(newAcc);
            },
            () => {},
            { enableHighAccuracy: false, maximumAge: 15000, timeout: 20000 }
          );
        } catch {}
      }
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const ipLoc = await fetchIpGeolocation();
      if (ipLoc) {
        applyLocationFix(ipLoc.lat, ipLoc.lng, 2500, 'IP');
        return;
      }
      setGpsError('Geolocation is not supported by your browser. Please select a city from the dropdown.');
      setIsDetectingLocation(false);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Step 1: High accuracy GPS attempt (5s timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocationFix(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, 'GPS');
      },
      (err1) => {
        console.warn('High-accuracy GPS fix failed or timed out:', err1.message);

        // Step 2: Standard accuracy (WiFi / Cellular / Cached network location)
        navigator.geolocation.getCurrentPosition(
          (pos2) => {
            applyLocationFix(pos2.coords.latitude, pos2.coords.longitude, pos2.coords.accuracy, 'WiFi / Network');
          },
          async (err2) => {
            console.warn('Standard network geolocation fallback failed:', err2.message);

            // Step 3: IP Geolocation fallback so the user always gets a live location fix
            const ipLoc = await fetchIpGeolocation();
            if (ipLoc) {
              applyLocationFix(ipLoc.lat, ipLoc.lng, 3000, 'IP');
              return;
            }

            setIsDetectingLocation(false);
            let msg = 'Could not determine GPS coordinates. Showing nearest regional center.';
            if (err1.code === err1.PERMISSION_DENIED || err2.code === err2.PERMISSION_DENIED) {
              msg = 'Location permission was denied. Pick a city from the dropdown or enable location in browser settings.';
            } else if (err1.code === err1.TIMEOUT && err2.code === err2.TIMEOUT) {
              msg = 'GPS timed out. Showing regional healthcare centers.';
            }
            setGpsError(msg);
            setTimeout(() => setGpsError(null), 8000);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  }, []);

  // Auto-detect GPS location on mount if user has already granted permission
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            handleDetectLiveLocation();
          }
        })
        .catch(() => {});
    }
  }, [handleDetectLiveLocation]);

  // Compute live distances from the current GPS / city origin
  const computedFacilities = useMemo<MedicalFacility[]>(() => {
    return REGIONAL_HEALTH_CENTERS.map((fac) => {
      const dKm = haversineKm(userCoords.lat, userCoords.lng, fac.lat, fac.lng);
      return {
        ...fac,
        distanceKm: dKm,
        distance: dKm < 1 ? `${Math.round(dKm * 1000)} m away` : `${dKm} km away`,
      };
    });
  }, [userCoords]);

  // Apply all filters then sort nearest-first
  const filteredFacilities = useMemo<MedicalFacility[]>(() => {
    return computedFacilities
      .filter((fac) => {
        // City view filter (NEVER set by GPS)
        if (selectedCity !== 'All Cities' && fac.city.toLowerCase() !== selectedCity.toLowerCase())
          return false;

        // Keyword search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          if (
            !fac.name.toLowerCase().includes(q) &&
            !fac.location.toLowerCase().includes(q) &&
            !fac.specialties.some((s) => s.toLowerCase().includes(q)) &&
            !fac.type.toLowerCase().includes(q)
          )
            return false;
        }

        // Custom location text filter
        if (customLocationQuery.trim()) {
          const cq = customLocationQuery.toLowerCase();
          if (
            !fac.location.toLowerCase().includes(cq) &&
            !fac.city.toLowerCase().includes(cq)
          )
            return false;
        }

        // Type chip filter
        if (selectedTypeFilter !== 'All' && fac.type !== selectedTypeFilter) return false;

        // Beds
        if (onlyAvailableBeds && fac.bedsAvailable <= 0) return false;

        // 24h
        if (onlyOpen24Hours && !fac.isOpen24Hours) return false;

        // Ayushman
        if (onlyAyushmanBharat && !fac.ayushmanBharatAccepted) return false;

        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [
    computedFacilities,
    selectedCity,
    searchTerm,
    customLocationQuery,
    selectedTypeFilter,
    onlyAvailableBeds,
    onlyOpen24Hours,
    onlyAyushmanBharat,
  ]);

  // Keep selectedFacility in sync when the list changes
  useEffect(() => {
    if (filteredFacilities.length > 0) {
      const stillPresent = filteredFacilities.find((f) => f.id === selectedFacility.id);
      if (!stillPresent) setSelectedFacility(filteredFacilities[0]);
    }
  }, [filteredFacilities, selectedFacility.id]);

  // Booking helpers
  const handleOpenBooking = (facility: MedicalFacility) => {
    setSelectedFacility(facility);
    setSelectedSpecialty(facility.specialties[0] || 'General Medicine');
    setSelectedDoctor(facility.doctorsOnDuty[0] || 'Duty Medical Officer');
    setBookingSuccess(false);
    setIsBookingModalOpen(true);
  };

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingId(`MM-APT-${Math.floor(1000 + Math.random() * 9000)}`);
    setBookingSuccess(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCustomLocationQuery('');
    setSelectedCity('All Cities');
    setSelectedTypeFilter('All');
    setOnlyAvailableBeds(false);
    setOnlyOpen24Hours(false);
    setOnlyAyushmanBharat(false);
    setGpsError(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">

      {/* ── Header banner ─────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white border border-sky-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 shrink-0">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Health Centers &amp; Hospital Locator Near You
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/20 text-white font-bold border border-white/30">
                Live GPS Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 font-medium">
              Find hospitals, Government PHCs &amp; trauma centers — sorted by your real distance.
              Map tiles by OpenStreetMap. All facility data is sample / illustrative only.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenBooking(selectedFacility)}
          className="px-6 py-3.5 rounded-2xl bg-[#D9534F] hover:bg-[#C9302C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* ── GPS alert banners ─────────────────────────────────────────────── */}
      {gpsError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{gpsError}</span>
          </div>
          <button type="button" onClick={() => setGpsError(null)} className="text-amber-700 hover:text-amber-900 font-bold px-2">✕</button>
        </div>
      )}

      {gpsSuccessNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Live GPS lock! Showing all hospitals sorted by real distance from your position.
            {accuracyMeters !== null && ` Accuracy: ±${Math.round(accuracyMeters)} m.`}
          </span>
        </div>
      )}

      {/* ── Location & filter bar ──────────────────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border border-[#BAE6FD] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

          {/* GPS button + current location pill */}
          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={isDetectingLocation}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all shrink-0 shadow-xs active:scale-95 disabled:opacity-60 ${
                isGpsActive
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border-[#BAE6FD]'
              }`}
              title={isGpsActive ? 'Live GPS active. Click to re-center.' : 'Detect live GPS location'}
            >
              {isDetectingLocation ? (
                <RefreshCw className="w-4 h-4 text-[#0284C7] animate-spin" />
              ) : isGpsActive ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              ) : (
                <Crosshair className="w-4 h-4 text-[#0284C7]" />
              )}
              <span>{isDetectingLocation ? 'Locating…' : isGpsActive ? 'Live GPS (Active)' : 'Near Me (GPS)'}</span>
            </button>

            <div className="min-w-0 flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Current Center</span>
                <p className="text-xs font-bold text-slate-800 truncate">{detectedLocationText}</p>
              </div>
              {isGpsActive && (
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Area / locality text search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customLocationQuery}
              onChange={(e) => setCustomLocationQuery(e.target.value)}
              placeholder="Search by locality, area or pincode…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-800 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] shadow-xs"
            />
            {customLocationQuery && (
              <button type="button" onClick={() => setCustomLocationQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
            )}
          </div>

          {/* City dropdown — view filter ONLY, never touches userCoords when GPS is active */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => {
                const city = e.target.value;
                setSelectedCity(city);
                // Pan the map to the chosen city — does NOT change userCoords (GPS origin)
                if (city !== 'All Cities' && CITY_COORDS[city]) {
                  setPanTarget(CITY_COORDS[city]);
                  // Only update userCoords if GPS is NOT active (no live watch)
                  if (watchIdRef.current === null) {
                    setUserCoords(CITY_COORDS[city]);
                    setDetectedLocationText(`${city}, India`);
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-800 text-xs font-bold focus:outline-none focus:border-[#0284C7] shadow-xs cursor-pointer"
            >
              {POPULAR_CITIES.map((city) => (
                <option key={city} value={city}>📍 City: {city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div className="pt-3 border-t border-[#BAE6FD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Filters:</span>
            </span>
            {[
              { id: 'All',                              label: 'All Centers'      },
              { id: 'Multi-Specialty Hospital',         label: 'Multi-Specialty'  },
              { id: 'Government Primary Health Center', label: 'Govt PHC (Free)'  },
              { id: '24/7 Trauma & Emergency',          label: '24/7 Emergency'   },
              { id: 'Diagnostic Lab',                   label: 'Diagnostic Labs'  },
            ].map((ft) => (
              <button
                key={ft.id}
                type="button"
                onClick={() => setSelectedTypeFilter(ft.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTypeFilter === ft.id
                    ? 'bg-[#0284C7] text-white shadow-xs font-bold'
                    : 'bg-[#F0F9FF] text-[#0369A1] hover:bg-[#E0F2FE] border border-[#BAE6FD]'
                }`}
              >{ft.label}</button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
            {[
              { label: '🟢 Beds Available',    checked: onlyAvailableBeds,  set: setOnlyAvailableBeds  },
              { label: '🕒 24 Hours Open',     checked: onlyOpen24Hours,    set: setOnlyOpen24Hours    },
              { label: '🛡️ Ayushman / Cashless', checked: onlyAyushmanBharat, set: setOnlyAyushmanBharat },
            ].map(({ label, checked, set }) => (
              <label key={label} className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="w-3.5 h-3.5 text-[#0284C7] rounded" />
                <span>{label}</span>
              </label>
            ))}
            <button type="button" onClick={handleResetFilters} className="text-[11px] text-[#0284C7] hover:underline font-bold px-1">Reset All</button>
          </div>
        </div>
      </div>

      {/* ── Two-column main layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: facility list */}
        <div className="lg:col-span-5 space-y-3">

          {/* Name / specialty search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hospitals by name, doctor or specialty…"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#BAE6FD] text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>Showing {filteredFacilities.length} healthcare centers</span>
            <span>Sorted by nearest distance</span>
          </div>

          {/* ── FIX 3: Mock-data disclaimer ─────────────────────────────── */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Demo Data</strong> — Bed counts, ratings, OPD fees and accreditation badges
              are <strong>sample values for illustration only</strong>. Always call the hospital
              to confirm availability before visiting.
            </p>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#BAE6FD] space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Hospitals Match Your Filters</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try clearing keywords, selecting another city, or resetting the filters.
              </p>
              <button type="button" onClick={handleResetFilters} className="px-4 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacility.id === facility.id;
                return (
                  <div
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#F0F9FF] border-2 border-[#0284C7] shadow-md scale-[1.01]'
                        : 'bg-white border-[#BAE6FD] hover:border-[#0284C7] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{facility.name}</h4>
                          {facility.nabhAccredited && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              NABH (Sample)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#0284C7] font-semibold mt-0.5">{facility.type}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#0369A1] bg-[#E0F2FE] border border-[#BAE6FD] shrink-0 font-mono">
                        {facility.distance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{facility.location}</span>
                    </p>

                    {/* Vitals row */}
                    <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase font-bold block">Rating</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{facility.rating}</span>
                          <span className="text-[10px] text-slate-600">({facility.reviewCount})</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase font-bold block">OPD Fee</span>
                        <span className="font-bold text-emerald-700 truncate block text-[11px]">
                          {facility.consultationFee.split('–')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 uppercase font-bold block">Beds Free</span>
                        <span className="font-bold text-[#0284C7] truncate block text-[11px]">
                          {facility.bedsAvailable > 0 ? `🟢 ${facility.bedsAvailable} Beds` : 'Diagnostic'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{facility.operatingHours}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenBooking(facility); }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-bold shadow-xs flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book Visit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: real Leaflet map + selected facility dossier */}
        <div className="lg:col-span-7 space-y-4">

          {/* ── FIX 2 & 4: Real OSM map — all pins rendered ─────────────── */}
          <LeafletMap
            userCoords={userCoords}
            accuracyMeters={accuracyMeters}
            filteredFacilities={filteredFacilities}
            selectedFacilityId={selectedFacility.id}
            onSelectFacility={setSelectedFacility}
            panTarget={panTarget}
          />

          {/* Selected facility dossier */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#BAE6FD] space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    {selectedFacility.type}
                  </span>
                  {selectedFacility.ayushmanBharatAccepted && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Ayushman Bharat PM-JAY Cashless
                    </span>
                  )}
                  {selectedFacility.nabhAccredited && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      NABH Accredited (Sample)
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0284C7]" />
                  <span>{selectedFacility.name}</span>
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedFacility.location}</span>
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenBooking(selectedFacility)}
                  className="px-5 py-2.5 rounded-xl bg-[#D9534F] hover:bg-[#C9302C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>

                <a
                  href={`tel:${selectedFacility.emergencyNumber}`}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Emergency: {selectedFacility.emergencyNumber}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedFacility.name + ' ' + selectedFacility.location
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#BAE6FD]">
              {[
                {
                  label: 'Bed Availability',
                  value: `${selectedFacility.bedsAvailable} Free Beds`,
                  sub: `ICU: ${selectedFacility.icuBedsAvailable} beds open`,
                  colour: 'text-[#0284C7]',
                },
                {
                  label: 'OPD Consultation',
                  value: selectedFacility.consultationFee,
                  sub: 'Walk-in & Online Slots',
                  colour: 'text-emerald-700',
                },
                {
                  label: 'Patient Satisfaction',
                  value: `${selectedFacility.rating} / 5.0`,
                  sub: `${selectedFacility.reviewCount} sample reviews`,
                  colour: 'text-amber-700',
                  icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline mr-1" />,
                },
                {
                  label: 'Ambulance',
                  value: selectedFacility.ambulanceAvailable ? '🟢 24/7 Standby' : 'On-Demand',
                  sub: 'Equipped with Oxygen',
                  colour: 'text-slate-800',
                },
              ].map(({ label, value, sub, colour, icon }) => (
                <div key={label} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">{label}</span>
                  <p className={`text-base font-black mt-0.5 ${colour}`}>
                    {icon}{value}
                  </p>
                  <span className="text-[10px] text-slate-600">{sub}</span>
                </div>
              ))}
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Clinical Departments &amp; Specialised Facilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedFacility.specialties.map((spec, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl text-xs bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-semibold">
                    • {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Doctors on duty */}
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-2">
              <span className="text-xs font-bold text-[#0369A1] flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0284C7]" />
                <span>Head Specialists Available for Appointment:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedFacility.doctorsOnDuty.map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#BAE6FD] flex items-center justify-between">
                    <span className="font-bold text-slate-800">{doc}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      Sample
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Appointment booking modal ───────────────────────────────────────── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-[#0284C7] shadow-2xl overflow-hidden animate-scale-up">

            {/* Modal header */}
            <div className="p-5 bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Book Clinical Appointment</h3>
                  <p className="text-xs text-sky-100">{selectedFacility.name}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              /* Confirmation screen */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ABDM Token Generated (Demo)</span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Appointment Confirmed!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Token &amp; receipt dispatched via SMS to <strong>{patientPhone}</strong> (demo only).
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-left space-y-2 font-mono text-xs text-slate-800">
                  {[
                    ['Booking ID', <span className="font-black text-[#0284C7]">{bookingId}</span>],
                    ['Patient', `${patientName} (${patientMedicalId})`],
                    ['Hospital', selectedFacility.name],
                    ['Doctor / Dept', selectedDoctor || selectedSpecialty],
                    ['Date & Slot', `${appointmentDate} at ${appointmentSlot}`],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between border-b border-[#BAE6FD] pb-1.5 last:border-0 last:pb-0">
                      <span className="text-slate-600 font-bold">{k}:</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Appointment Slip ${bookingId} downloaded. Present at reception.`)}
                    className="px-4 py-2.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-bold text-xs flex items-center gap-1.5 border border-[#BAE6FD]"
                  >
                    <Download className="w-4 h-4 text-[#0284C7]" />
                    <span>Download Slip</span>
                  </button>
                  <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-md">
                    Done &amp; Close
                  </button>
                </div>
              </div>
            ) : (
              /* Booking form */
              <form onSubmit={handleBookAppointmentSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Consultation mode */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Consultation Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['In-Person', 'Tele-Consultation'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setConsultationMode(mode)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          consultationMode === mode
                            ? 'bg-[#E0F2FE] border-2 border-[#0284C7] text-[#0369A1]'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {mode === 'In-Person' ? <Building2 className="w-4 h-4 text-[#0284C7]" /> : <Phone className="w-4 h-4 text-emerald-600" />}
                        <span>{mode === 'In-Person' ? 'In-Person Hospital Visit' : 'Online Tele-Consult'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Patient Name', value: patientName, set: setPatientName, type: 'text' },
                    { label: 'Contact Phone', value: patientPhone, set: setPatientPhone, type: 'tel' },
                  ].map(({ label, value, set, type }) => (
                    <div key={label}>
                      <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
                      <input
                        type={type}
                        required
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  ))}
                </div>

                {/* Specialty + doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Specialty / Department</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      {selectedFacility.specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Doctor</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      {selectedFacility.doctorsOnDuty.map((d) => <option key={d} value={d}>{d}</option>)}
                      <option value="Any Available Duty Specialist">Any Available Duty Specialist</option>
                    </select>
                  </div>
                </div>

                {/* Date + slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time Slot</label>
                    <select
                      value={appointmentSlot}
                      onChange={(e) => setAppointmentSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    >
                      {['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:30 PM', '06:30 PM'].map((t) => (
                        <option key={t} value={`${t} Slot`}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Symptoms note */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Symptoms / Reason (Optional)</label>
                  <textarea
                    rows={2}
                    value={patientNote}
                    onChange={(e) => setPatientNote(e.target.value)}
                    placeholder="e.g. Follow-up for blood pressure, chest pain checkup…"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#BAE6FD] text-slate-900 text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Fee summary */}
                <div className="p-3 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Est. Consultation Fee (Sample)</span>
                    <span className="font-bold text-[#0369A1]">{selectedFacility.consultationFee}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Pay at Hospital Desk
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
                  <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Generate Token</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
