/**
 * DonationHubView.tsx
 * -------------------------------------------------------------------
 * Phase 14A: Comprehensive Donation Hub, Verified Organisations,
 * Near Me Map (Leaflet + OSM with k-anonymity), and Emergency Ambulance
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  HeartHandshake,
  Droplet,
  Heart,
  Building2,
  MapPin,
  Ambulance,
  Phone,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Share2,
  Printer,
  Compass,
  Copy,
  Users,
  Send,
  Flag,
  X,
  HelpCircle,
  Calendar,
  Lock,
  Eye,
  Award,
} from 'lucide-react';
import { LanguageDetail, getUiTranslations } from '../services/languageService';
import {
  DonationOrg,
  TransplantCentre,
  AmbulanceService,
  AirAmbulanceService,
  DonorRegistryEntry,
  AggregatedDonorCluster,
  BLOOD_GROUPS,
  BloodGroup,
  BLOOD_COMPATIBILITY,
  getDonationOrganisations,
  getTransplantCentres,
  getAmbulanceDirectory,
  getCountryResources,
  getVoluntaryDonors,
  registerVoluntaryDonor,
  getAggregatedDonorClusters,
  sendAnonymousDonorRequest,
  reportIncorrectInfo,
} from '../services/donationService';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '', iconRetinaUrl: '' });

interface DonationHubViewProps {
  language: LanguageDetail;
  userCountry?: string;
  onNavigateToSection?: (section: string) => void;
}

type HubTab = 'overview' | 'blood' | 'organ' | 'organisations' | 'map' | 'ambulance';

export const DonationHubView: React.FC<DonationHubViewProps> = ({
  language,
  userCountry = 'IN',
}) => {
  const t = getUiTranslations(language.code);
  const [activeTab, setActiveTab] = useState<HubTab>('overview');

  // Country Resources
  const countryRes = useMemo(() => getCountryResources(userCountry), [userCountry]);

  // Tab 2: Blood Donation State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O+');
  const [isRegisterDonorModalOpen, setIsRegisterDonorModalOpen] = useState(false);
  const [newDonorAlias, setNewDonorAlias] = useState('');
  const [newDonorGroup, setNewDonorGroup] = useState<BloodGroup>('O+');
  const [newDonorArea, setNewDonorArea] = useState('Chennai - Anna Nagar');
  const [donorAgeConfirmed, setDonorAgeConfirmed] = useState(false);
  const [donorConsentGiven, setDonorConsentGiven] = useState(false);
  const [donorRegistrationMsg, setDonorRegistrationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // In-app Contact Request Modal State
  const [requestTargetDonor, setRequestTargetDonor] = useState<DonorRegistryEntry | null>(null);
  const [patientAlias, setPatientAlias] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Tab 3: Organ Donation State
  const [donorIntentName, setDonorIntentName] = useState('Gokul Patient');
  const [donorIntentBlood, setDonorIntentBlood] = useState<BloodGroup>('O+');
  const [intentCardPrinted, setIntentCardPrinted] = useState(false);

  // Tab 4: Organisations State
  const [orgFilter, setOrgFilter] = useState<'All' | 'Government' | 'NGO' | 'Hospital network'>('All');
  const [orgSearch, setOrgSearch] = useState('');
  const organisations = useMemo(() => getDonationOrganisations(), []);

  // "Report Incorrect Info" Modal State
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; category: 'Organisation' | 'Transplant Centre' | 'Ambulance' | 'Other' } | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportCorrection, setReportCorrection] = useState('');
  const [reportFeedbackSent, setReportFeedbackSent] = useState(false);

  // Tab 5: Map State
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLayerBloodBanks, setMapLayerBloodBanks] = useState(true);
  const [mapLayerTransplantCentres, setMapLayerTransplantCentres] = useState(true);
  const [mapLayerDonorClusters, setMapLayerDonorClusters] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai

  // Tab 6: Ambulance State
  const ambulanceData = useMemo(() => getAmbulanceDirectory(), []);
  const [locationCopied, setLocationCopied] = useState(false);

  // Filtered Organisations
  const filteredOrgs = useMemo(() => {
    return organisations.filter((org) => {
      const matchType = orgFilter === 'All' || org.type === orgFilter;
      const q = orgSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        org.name.toLowerCase().includes(q) ||
        org.description.toLowerCase().includes(q) ||
        org.country.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [organisations, orgFilter, orgSearch]);

  // Registered Voluntary Donors List
  const [voluntaryDonors, setVoluntaryDonors] = useState<DonorRegistryEntry[]>([]);
  useEffect(() => {
    setVoluntaryDonors(getVoluntaryDonors());
  }, []);

  // Donor Clusters for Map (min group size k >= 5)
  const donorClusters: AggregatedDonorCluster[] = useMemo(() => {
    return getAggregatedDonorClusters(5);
  }, [voluntaryDonors]);

  const transplantCentres = useMemo(() => getTransplantCentres(), []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (activeTab !== 'map' && activeTab !== 'ambulance') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Blood Banks & Healthcare Layers
    if (mapLayerBloodBanks) {
      // Curated verified Blood Banks
      const sampleBloodBanks = [
        { name: 'Red Cross Blood Bank', lat: 13.0732, lng: 80.2612, city: 'Chennai', phone: '044-28554425' },
        { name: 'Govt General Hospital Blood Bank', lat: 13.0805, lng: 80.2785, city: 'Chennai', phone: '044-25305000' },
        { name: 'Rotary Central TTK Blood Bank', lat: 13.0418, lng: 80.2520, city: 'Chennai', phone: '044-28114444' },
      ];

      sampleBloodBanks.forEach((bb) => {
        const iconHtml = `
          <div style="background-color: #EF4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
        const marker = L.marker([bb.lat, bb.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: bold; color: #991B1B; font-size: 14px;">${bb.name}</div>
            <div style="color: #4B5563; margin-top: 4px;">Verified Blood Bank • ${bb.city}</div>
            <div style="margin-top: 6px;"><a href="tel:${bb.phone}" style="display: inline-block; background: #DC2626; color: white; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">Call ${bb.phone}</a></div>
            <div style="margin-top: 6px; font-size: 11px; color: #6B7280;">Source: e-RaktKosh Verified Center</div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 2. Transplant Centres Layer
    if (mapLayerTransplantCentres) {
      transplantCentres.forEach((tc) => {
        const iconHtml = `
          <div style="background-color: #0284C7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
        const marker = L.marker([tc.lat, tc.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: bold; color: #0369A1; font-size: 14px;">${tc.name}</div>
            <div style="color: #4B5563; margin-top: 4px;">${tc.type} • ${tc.city}, ${tc.state}</div>
            <div style="margin-top: 6px; font-size: 11px; background: #E0F2FE; color: #0369A1; padding: 3px 6px; border-radius: 4px; display: inline-block;">
              Organs: ${tc.organsHandled.join(', ')}
            </div>
            ${tc.phone ? `<div style="margin-top: 6px;"><a href="tel:${tc.phone}" style="color: #0284C7; font-weight: bold; text-decoration: none;">Call: ${tc.phone}</a></div>` : ''}
            <div style="margin-top: 4px; font-size: 10px; color: #9CA3AF;">Source: ${tc.source} (Verified: ${tc.lastVerified})</div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }

    // 3. PRIVACY-PRESERVING DONOR CLUSTERS (k >= 5)
    // Strictly NO individual pins, names, or exact locations!
    if (mapLayerDonorClusters) {
      donorClusters.forEach((cluster) => {
        const iconHtml = `
          <div style="background-color: #059669; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 3px solid #D1FAE5; box-shadow: 0 4px 8px rgba(0,0,0,0.25);">
            <span style="font-size: 14px; font-weight: 900; line-height: 1;">${cluster.count}</span>
            <span style="font-size: 8px; font-weight: bold; text-transform: uppercase;">Donors</span>
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] });
        const marker = L.marker([cluster.lat, cluster.lng], { icon });

        // Circle radius to visually represent neighborhood area privacy bubble
        const circle = L.circle([cluster.lat, cluster.lng], {
          radius: 1200,
          color: '#10B981',
          fillColor: '#34D399',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4',
        });
        markersGroup.addLayer(circle);

        const breakdown = Object.entries(cluster.bloodGroupsSummary)
          .map(([bg, cnt]) => `<span style="display:inline-block; background:#E5E7EB; padding:2px 6px; border-radius:4px; font-size:11px; margin:2px;">${bg}: <strong>${cnt}</strong></span>`)
          .join(' ');

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: bold; color: #065F46; font-size: 14px;">Area Donor Bubble: ${cluster.cityArea}</div>
            <div style="color: #4B5563; margin-top: 4px;">
              <strong>${cluster.availableCount}</strong> of ${cluster.count} voluntary donors available right now.
            </div>
            <div style="margin-top: 6px;">${breakdown}</div>
            <div style="margin-top: 8px; font-size: 11px; color: #047857; background: #ECFDF5; padding: 4px 6px; border-radius: 4px; border: 1px solid #A7F3D0;">
              🔒 <strong>Privacy Shield (k &ge; 5)</strong>: Individual names, phone numbers, and exact addresses are never disclosed.
            </div>
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }
  }, [activeTab, mapLayerBloodBanks, mapLayerTransplantCentres, mapLayerDonorClusters, donorClusters, transplantCentres, mapCenter]);

  // Handle Share Live Location (Tab 6)
  const handleShareLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
        const locationText = `EMERGENCY LOCATION:\nLatitude: ${lat}\nLongitude: ${lng}\nLive Map Link: ${osmUrl}`;
        navigator.clipboard.writeText(locationText);
        setLocationCopied(true);
        setTimeout(() => setLocationCopied(false), 4000);
      },
      (err) => {
        // Fallback with user city centroid
        const fallbackText = `EMERGENCY LOCATION (Estimated Area): Chennai, Tamil Nadu\nApprox Map: https://www.openstreetmap.org/?mlat=13.0827&mlon=80.2707#map=14/13.0827/80.2707`;
        navigator.clipboard.writeText(fallbackText);
        setLocationCopied(true);
        setTimeout(() => setLocationCopied(false), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Voluntary Donor Registration
  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerVoluntaryDonor({
      alias: newDonorAlias,
      bloodGroup: newDonorGroup,
      cityArea: newDonorArea,
      ageConfirmed: donorAgeConfirmed,
      consentGiven: donorConsentGiven,
    });

    if (res.success) {
      setDonorRegistrationMsg({ type: 'success', text: 'Thank you! You have successfully registered as a voluntary donor.' });
      setVoluntaryDonors(getVoluntaryDonors());
      setTimeout(() => {
        setIsRegisterDonorModalOpen(false);
        setDonorRegistrationMsg(null);
        setNewDonorAlias('');
      }, 2000);
    } else {
      setDonorRegistrationMsg({ type: 'error', text: res.error || 'Failed to register.' });
    }
  };

  // Send In-App Contact Request
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTargetDonor) return;
    const res = sendAnonymousDonorRequest({
      donorId: requestTargetDonor.id,
      patientAlias,
      requiredBloodGroup: requestTargetDonor.bloodGroup,
      hospitalName,
      urgency: urgencyLevel,
      message: requestMessage,
    });
    if (res.success) {
      setRequestStatus('In-app message sent safely. The donor can review your request without exposing private contacts.');
      setTimeout(() => {
        setRequestTargetDonor(null);
        setRequestStatus(null);
        setPatientAlias('');
        setHospitalName('');
        setRequestMessage('');
      }, 2500);
    }
  };

  // Submit Report Incorrect Info
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    reportIncorrectInfo({
      resourceId: reportTarget.id,
      resourceName: reportTarget.name,
      category: reportTarget.category,
      issueDescription: reportDescription,
      suggestedCorrection: reportCorrection,
    });
    setReportFeedbackSent(true);
    setTimeout(() => {
      setReportTarget(null);
      setReportFeedbackSent(false);
      setReportDescription('');
      setReportCorrection('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner & Safety Notice */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#38BDF8] text-white border border-[#BAE6FD] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/30">
            <HeartHandshake className="w-3.5 h-3.5 text-white" />
            <span>Phase 14A • Verified Clinical Directory & Emergency Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
            {t.donationNav || 'Donation Hub & Emergency Services'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            A privacy-preserving, verified platform for blood and organ donation, government health registries,
            transplant centres, and emergency ambulance dispatch.
          </p>
        </div>

        {/* Official Registry Gateway Badge */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-2 shrink-0">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200">
            Official National Registry
          </span>
          <div className="flex items-center gap-2">
            <a
              href="https://notto.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white text-[#0369A1] font-bold text-xs hover:bg-sky-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>NOTTO Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://eraktkosh.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>e-RaktKosh</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Medical & Legal Disclaimer</p>
          <p className="text-amber-800 leading-relaxed">
            MediMitra does not provide clinical diagnosis or individual dosing advice. All donor criteria are general guidance;
            blood banks and licensed transplant surgeons make the final clinical decisions. Organ pledges made in this application
            are expressions of donor intent and do not substitute for statutory registration under national transplantation acts.
          </p>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { id: 'overview' as HubTab, label: 'Overview', icon: HeartHandshake },
          { id: 'blood' as HubTab, label: 'Blood Donation', icon: Droplet },
          { id: 'organ' as HubTab, label: 'Organ Donation', icon: Heart },
          { id: 'organisations' as HubTab, label: 'Organisations & NGOs', icon: Building2 },
          { id: 'map' as HubTab, label: 'Near Me Map', icon: MapPin },
          { id: 'ambulance' as HubTab, label: 'Ambulance & Emergency', icon: Ambulance },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Donation Card */}
            <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-mono">Blood Donation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A single voluntary blood donation can save up to 3 lives. Whole blood is separated into red cells,
                platelets, and plasma for cancer patients, trauma care, and surgical interventions.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('blood')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Check Eligibility & Donors →</span>
              </button>
            </div>

            {/* Organ Donation Card */}
            <div className="p-6 rounded-2xl bg-white border border-sky-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-mono">Organ Donation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One deceased organ donor can save up to 8 lives (heart, lungs, liver, kidneys, pancreas, intestines)
                and heal up to 75 more through cornea, skin, and tissue restoration.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('organ')}
                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1"
              >
                <span>Pledge Guidance & Myths vs Facts →</span>
              </button>
            </div>

            {/* Ambulance Dispatch Card */}
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Ambulance className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-mono">Ambulance & Emergency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate access to national emergency dispatch lines (112, 108, 102), state ambulance fleets,
                and accredited aeromedical evacuation operators with one-click location sharing.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ambulance')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Call Emergency Dispatch →</span>
              </button>
            </div>
          </div>

          {/* National Official Registries Section */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">Verified National Health Portals</h3>
                <p className="text-xs text-slate-500">
                  Direct official portals maintained by the Ministry of Health and authorized agencies.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                HTTPS Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://notto.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] shadow-xs hover:shadow-md transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0369A1]">NOTTO India</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7]" />
                </div>
                <p className="text-[11px] text-slate-500">Apex Organ Transplant Registry</p>
                <span className="text-[10px] font-mono text-slate-400">notto.mohfw.gov.in</span>
              </a>

              <a
                href="https://eraktkosh.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-rose-500 shadow-xs hover:shadow-md transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600">e-RaktKosh</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                </div>
                <p className="text-[11px] text-slate-500">Central Blood Bank Portal</p>
                <span className="text-[10px] font-mono text-slate-400">eraktkosh.mohfw.gov.in</span>
              </a>

              <a
                href="https://nbtc.naco.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-500 shadow-xs hover:shadow-md transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700">NBTC Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
                </div>
                <p className="text-[11px] text-slate-500">National Blood Transfusion Council</p>
                <span className="text-[10px] font-mono text-slate-400">nbtc.naco.gov.in</span>
              </a>

              <a
                href="https://www.indianredcross.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700">Indian Red Cross</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-500">National Humanitarian Society</p>
                <span className="text-[10px] font-mono text-slate-400">indianredcross.org</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BLOOD DONATION
         ========================================================================= */}
      {activeTab === 'blood' && (
        <div className="space-y-6">
          {/* Eligibility Criteria Cards */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-mono">Blood Donor Eligibility Guidance</h3>
                <p className="text-xs text-slate-500">
                  Standard criteria published by the National Blood Transfusion Council (NBTC) & WHO.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-full border border-[#BAE6FD] w-fit">
                Source: NBTC / MoHFW Standards
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Age Window</span>
                <p className="text-base font-bold text-slate-900 font-mono">18 to 65 Years</p>
                <p className="text-[10px] text-slate-500">First-time donors up to 60 years</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Minimum Weight</span>
                <p className="text-base font-bold text-slate-900 font-mono">&ge; 45 to 50 kg</p>
                <p className="text-[10px] text-slate-500">Ensures 350ml - 450ml safe draw</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Hemoglobin Level</span>
                <p className="text-base font-bold text-slate-900 font-mono">&ge; 12.5 g/dL</p>
                <p className="text-[10px] text-slate-500">Verified by finger-prick test</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Donation Intervals</span>
                <p className="text-base font-bold text-slate-900 font-mono">90 / 120 Days</p>
                <p className="text-[10px] text-slate-500">3 mos (males), 4 mos (females)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
              <span>
                <strong>Notice:</strong> General guidance only. The blood bank medical officer makes the final decision
                following a health check on the day of donation.
              </span>
              <a
                href="https://nbtc.naco.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-rose-700 underline shrink-0 ml-2"
              >
                Official NBTC Guidelines
              </a>
            </div>
          </div>

          {/* Blood Compatibility Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-mono">Red Blood Cell Compatibility Matrix</h3>
                <p className="text-xs text-slate-500">
                  Select a blood group to view compatible donors and recipients.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Find Blood Bank on Map</span>
              </button>
            </div>

            {/* Blood Group Selectors */}
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-xs transition-all ${
                    selectedBloodGroup === bg
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Compatibility Result Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs font-mono">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  <span>Can Give Blood To ({selectedBloodGroup} Donors)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BLOOD_COMPATIBILITY[selectedBloodGroup].canGiveTo.map((target) => (
                    <span
                      key={target}
                      className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-mono font-bold text-xs shadow-xs"
                    >
                      {target}
                    </span>
                  ))}
                </div>
                {selectedBloodGroup === 'O-' && (
                  <p className="text-[11px] text-rose-700 pt-1 font-semibold">
                    ⭐ <strong>Universal Donor:</strong> Type O- red cells can be safely given to recipients of all blood groups.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-[#BAE6FD] space-y-2">
                <div className="flex items-center gap-2 text-[#0369A1] font-bold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Can Receive Blood From ({selectedBloodGroup} Patients)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BLOOD_COMPATIBILITY[selectedBloodGroup].canReceiveFrom.map((source) => (
                    <span
                      key={source}
                      className="px-3 py-1 rounded-lg bg-white border border-[#BAE6FD] text-[#0369A1] font-mono font-bold text-xs shadow-xs"
                    >
                      {source}
                    </span>
                  ))}
                </div>
                {selectedBloodGroup === 'AB+' && (
                  <p className="text-[11px] text-[#0369A1] pt-1 font-semibold">
                    ⭐ <strong>Universal Recipient:</strong> Type AB+ patients can safely receive red blood cells from any blood group.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Privacy-Preserving Voluntary Blood Donor Registry */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 font-mono">Voluntary Blood Donor Network</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                    Privacy-Shielded
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Voluntary donors in your district. Contact requests are routed through in-app messages;
                  personal telephone numbers are never published.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterDonorModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Become a Donor</span>
              </button>
            </div>

            {/* List of Registered Voluntary Donors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {voluntaryDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-black text-xs">
                        {donor.bloodGroup}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{donor.alias}</p>
                        <p className="text-[10px] text-slate-500">{donor.cityArea}</p>
                      </div>
                    </div>
                    {donor.isDemoData && (
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                        Demo data
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[10px] font-bold ${
                        donor.isAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {donor.isAvailable ? '● Available' : '○ Temporarily Paused'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setRequestTargetDonor(donor)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-[#0284C7] font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Request Blood</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ORGAN DONATION
         ========================================================================= */}
      {activeTab === 'organ' && (
        <div className="space-y-6">
          {/* Living vs Deceased Donation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-mono">Living Organ Donation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A living person can donate one kidney, a portion of the liver (which regenerates), or bone marrow.
                Donations are strictly regulated under national laws to prevent commercialization and require statutory
                authorization committee approval.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Common organs: Kidney, Liver segment, Bone marrow
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-mono">Deceased (Cadaveric) Donation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Occurs after irreversible brain-stem death in an ICU while cardiac circulation is mechanically maintained.
                One deceased donor can provide heart, lungs, liver, both kidneys, pancreas, intestines, and corneas.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Common tissues: Corneas, heart valves, skin, bone, tendons
              </div>
            </div>
          </div>

          {/* Brain Death Clinical Basics */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#0284C7]" />
              <h3 className="text-base font-bold text-slate-900 font-mono">Understanding Brain Death</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Brain-stem death is the permanent, irreversible cessation of all brain activity and brain-stem reflexes.
              It is <strong>not</strong> a coma or persistent vegetative state. Under the Transplantation of Human Organs
              Act (THOTA), brain death is certified by a mandatory statutory panel of 4 independent doctors (including
              a neurologist/neurosurgeon and the medical superintendent of the hospital), evaluated twice 6 hours apart.
            </p>
          </div>

          {/* Evidence-Grounded Myths vs Facts */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-mono">Myths vs Facts (Evidence-Based)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-rose-700">❌ Myth: "Doctors won't work hard to save me if I'm a donor."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ✅ <strong>Fact:</strong> The medical team treating you in trauma care is completely separate from the transplant team. Organ donation is only considered after all life-saving efforts have failed and death is certified.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-rose-700">❌ Myth: "Organ donation disfigures the body."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ✅ <strong>Fact:</strong> Organ and tissue retrieval is performed by trained surgeons with the utmost surgical dignity. The incisions are neatly closed, and open-casket viewing is undisturbed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-rose-700">❌ Myth: "I am too old or have health problems."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ✅ <strong>Fact:</strong> Strict clinical criteria determine suitability at the time of death. Donors in their 70s and 80s have successfully donated corneas and kidneys.
                </p>
              </div>
            </div>
          </div>

          {/* How to Pledge & Talk to Family Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-mono">How to Pledge Officially</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pledging your organs takes less than 2 minutes on your country's official government registry portal.
                In India, registration is conducted through NOTTO under the Ministry of Health.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                ⚠️ <strong>Statutory Notice:</strong> This app does not record a legally binding pledge under national transplantation laws. Please complete your registration on NOTTO.
              </div>
              <a
                href="https://notto.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Pledge on NOTTO Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Talk to Your Family Checklist */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 font-mono">Talk to Your Family Checklist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By law in most countries, your next-of-kin must provide consent for organ donation even if you have signed a donor card.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Inform your family about your decision to pledge.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Explain what organs and tissues you are comfortable donating.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Share your shareable Donor Intent Card with them.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Shareable Donor Intent Card Generator (Contains strictly NO medical data) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold font-mono tracking-wide text-white">Shareable Donor Intent Card</h3>
                <p className="text-xs text-slate-400">
                  Dignified intention card to share with family. Strictly zero medical history or sensitive records included.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIntentCardPrinted(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
              </div>
            </div>

            {/* Rendered Intent Card */}
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-[#0369A1] to-[#0284C7] text-white border border-sky-300 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-sky-200/30 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
                  <span className="font-mono font-black text-sm tracking-wider">ORGAN DONOR INTENT</span>
                </div>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded font-bold">
                  {donorIntentBlood}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase text-sky-200">Donor Name</p>
                <p className="text-lg font-bold font-mono">{donorIntentName}</p>
              </div>

              <p className="text-xs text-sky-100 italic leading-relaxed">
                "I have expressed my sincere wish to donate my organs and tissues after death to give life and healing to others.
                I request my family to honor this wish."
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-sky-200/30 text-[10px] font-mono text-sky-200">
                <span>Date: {new Date().toISOString().split('T')[0]}</span>
                <span>MediMitra Intent Card</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ORGANISATIONS & NGOS
         ========================================================================= */}
      {activeTab === 'organisations' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Government', 'NGO', 'Hospital network'] as const).map((tFilter) => (
                <button
                  key={tFilter}
                  type="button"
                  onClick={() => setOrgFilter(tFilter)}
                  className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs whitespace-nowrap transition-all ${
                    orgFilter === tFilter
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tFilter}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search organisations..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        org.type === 'Government'
                          ? 'bg-blue-100 text-blue-800'
                          : org.type === 'NGO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {org.type} • {org.country}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Verified: {org.lastVerified}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 font-mono">{org.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{org.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Helpline: <strong className="text-slate-800">{org.helpline}</strong></span>
                    <span className="text-[10px] text-slate-400">{org.domain}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setReportTarget({
                          id: org.id,
                          name: org.name,
                          category: 'Organisation',
                        })
                      }
                      className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report incorrect info</span>
                    </button>

                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Open Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: NEAR ME MAP (LEAFLET + OSM)
         ========================================================================= */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Map Controls */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayerBloodBanks}
                  onChange={(e) => setMapLayerBloodBanks(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Blood Banks (OSM)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1] bg-[#E0F2FE] px-3 py-1.5 rounded-xl border border-[#BAE6FD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayerTransplantCentres}
                  onChange={(e) => setMapLayerTransplantCentres(e.target.checked)}
                  className="rounded text-[#0284C7]"
                />
                <span>Transplant Centres</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayerDonorClusters}
                  onChange={(e) => setMapLayerDonorClusters(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Donor Area Bubbles (k &ge; 5)</span>
              </label>
            </div>

            <div className="text-xs font-mono text-slate-500">
              🔒 Privacy Protected • OpenStreetMap
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="rounded-3xl border border-slate-300 overflow-hidden shadow-sm h-[520px] relative z-10">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Map Legend */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span>Blood Bank / Camp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7]" />
              <span>Transplant Centre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <span>Aggregated Donor Area Bubble (Counts only, no individual pins)</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: AMBULANCE & EMERGENCY
         ========================================================================= */}
      {activeTab === 'ambulance' && (
        <div className="space-y-6">
          {/* Emergency Quick Dial Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-rose-600 text-white shadow-md space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-bold">
                  Unified Emergency
                </span>
                <h3 className="text-3xl font-black font-mono tracking-tight mt-1">112</h3>
                <p className="text-xs text-rose-100 mt-1">
                  National Emergency Response Support System (ERSS) for all medical, police, and fire dispatches.
                </p>
              </div>
              <a
                href="tel:112"
                className="w-full py-3 rounded-xl bg-white text-rose-700 font-bold text-sm text-center shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call 112 (Toll-Free)</span>
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-amber-500 text-white shadow-md space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-bold">
                  Emergency Ambulance
                </span>
                <h3 className="text-3xl font-black font-mono tracking-tight mt-1">108</h3>
                <p className="text-xs text-amber-100 mt-1">
                  Free public ambulance service for trauma, accidents, stroke, cardiac events, and acute critical care.
                </p>
              </div>
              <a
                href="tel:108"
                className="w-full py-3 rounded-xl bg-white text-amber-800 font-bold text-sm text-center shadow-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call 108 (Emergency)</span>
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-[#0284C7] text-white shadow-md space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-bold">
                  Maternal & Child
                </span>
                <h3 className="text-3xl font-black font-mono tracking-tight mt-1">102</h3>
                <p className="text-xs text-sky-100 mt-1">
                  Janani Shishu Suraksha Karyakram transport dedicated to pregnant mothers and sick infants.
                </p>
              </div>
              <a
                href="tel:102"
                className="w-full py-3 rounded-xl bg-white text-[#0369A1] font-bold text-sm text-center shadow-sm hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call 102 (Free)</span>
              </a>
            </div>
          </div>

          {/* Share My Live Location Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 font-mono">Share Live Location with Dispatcher</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                One-tap copy of your precise GPS latitude, longitude, and map link to read aloud or SMS to 112/108 dispatchers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleShareLiveLocation}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 ${
                locationCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {locationCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{locationCopied ? 'Coordinates Copied!' : 'Copy GPS Coordinates'}</span>
            </button>
          </div>

          {/* State & Private Ambulance Fleet Directory */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-mono">State & Hospital Fleet Directory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambulanceData.regionalAndPrivate.map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {srv.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Verified: {srv.lastVerified}</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 font-mono">{srv.name}</h5>
                  <p className="text-xs text-slate-500">Coverage: {srv.coverage} • Hours: {srv.operatingHours}</p>
                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={`tel:${srv.phone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call {srv.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setReportTarget({ id: srv.id, name: srv.name, category: 'Ambulance' })}
                      className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center gap-1"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Air Ambulance Section */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold text-slate-900 font-mono">Air Ambulance & Aeromedical Transport</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Curated public directory of certified aeromedical evacuation operators.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              ⚠️ <strong>Notice:</strong> Not endorsed. Verify directly. Costs vary significantly depending on aircraft charter, flight clearances, and physician escort. No fake bookings; only verified direct phone and website contacts.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambulanceData.airAmbulance.map((air) => (
                <div key={air.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900 font-mono">{air.name}</h5>
                    <span className="text-[10px] font-mono text-slate-400">Verified: {air.lastVerified}</span>
                  </div>
                  <p className="text-xs text-slate-600">Aircraft: {air.aircraftType}</p>
                  <p className="text-xs text-slate-500">Base Cities: {air.baseCities.join(', ')}</p>
                  <p className="text-[11px] text-slate-500 italic">Capabilities: {air.capabilities}</p>
                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={`tel:${air.phone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call {air.phone}</span>
                    </a>
                    <a
                      href={air.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0284C7] font-bold flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BECOME A VOLUNTARY BLOOD DONOR
         ========================================================================= */}
      {isRegisterDonorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-mono">Voluntary Donor Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterDonorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name / Anonymous Alias
                </label>
                <input
                  type="text"
                  required
                  value={newDonorAlias}
                  onChange={(e) => setNewDonorAlias(e.target.value)}
                  placeholder="e.g. Ramesh K. (no full surname needed)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newDonorGroup}
                    onChange={(e) => setNewDonorGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District Area</label>
                  <input
                    type="text"
                    required
                    value={newDonorArea}
                    onChange={(e) => setNewDonorArea(e.target.value)}
                    placeholder="e.g. Chennai - Guindy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Strictly no street address</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={donorAgeConfirmed}
                    onChange={(e) => setDonorAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600"
                  />
                  <span>I confirm that I am at least 18 years of age.</span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={donorConsentGiven}
                    onChange={(e) => setDonorConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600"
                  />
                  <span>
                    I consent to register as a voluntary blood donor. I understand my phone number is never shown publicly,
                    and contact requests arrive only through in-app notification.
                  </span>
                </label>
              </div>

              {donorRegistrationMsg && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    donorRegistrationMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {donorRegistrationMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterDonorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IN-APP ANONYMOUS CONTACT REQUEST
         ========================================================================= */}
      {requestTargetDonor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold text-slate-900 font-mono">Request Blood Donation</h3>
              </div>
              <button
                type="button"
                onClick={() => setRequestTargetDonor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                Requesting: <strong>{requestTargetDonor.bloodGroup} Blood</strong> for donor in{' '}
                <strong>{requestTargetDonor.cityArea}</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient / Attendant Alias</label>
                <input
                  type="text"
                  required
                  value={patientAlias}
                  onChange={(e) => setPatientAlias(e.target.value)}
                  placeholder="e.g. Patient Family Attendant"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admitted Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Rajiv Gandhi Govt General Hospital"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Urgency</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value as 'Routine' | 'Urgent' | 'Emergency')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="Routine">Routine Elective Procedure</option>
                  <option value="Urgent">Urgent (Within 24 Hours)</option>
                  <option value="Emergency">Emergency (Immediate Trauma/ICU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message to Donor</label>
                <textarea
                  rows={2}
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Provide requirement details (units required, replacement available)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {requestStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {requestStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestTargetDonor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send In-App Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REPORT INCORRECT INFO
         ========================================================================= */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-mono">Report Incorrect Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                Reporting on: <strong>{reportTarget.name}</strong> ({reportTarget.category})
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What is incorrect?</label>
                <textarea
                  rows={3}
                  required
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="e.g. Phone number is outdated, website link changed, or address has moved..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Suggested correction (Optional)</label>
                <input
                  type="text"
                  value={reportCorrection}
                  onChange={(e) => setReportCorrection(e.target.value)}
                  placeholder="Correct phone, URL, or details if known"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {reportFeedbackSent && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  Thank you! Your feedback has been logged for our verification audit.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
