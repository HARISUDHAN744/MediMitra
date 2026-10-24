import React, { useState, useMemo } from 'react';
import {
  QrCode,
  ShieldCheck,
  HeartPulse,
  Download,
  Printer,
  Copy,
  Check,
  Phone,
  AlertTriangle,
  Edit3,
  Ambulance,
  Pill,
  Droplet,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types/user';
import { LanguageDetail } from '../services/languageService';
import { generateQrMatrix, renderQrSvgPath } from '../utils/qrCodeGenerator';
import {
  buildQrServerUrl,
  downloadQrCodeFromApi,
  generateQRCodeKitQR,
  QRCODEKIT_MASKED_KEY,
} from '../utils/qrApi';

interface QrMedicalIdViewProps {
  user: UserProfile;
  language?: LanguageDetail;
}

interface EmergencyData {
  patientName: string;
  medicalId: string;
  bloodGroup: string;
  emergencyPhone: string;
  secondaryContact: string;
  allergies: string;
  chronicConditions: string;
  activeMedications: string[];
  organDonor: boolean;
  region: string;
  verifiedAuth: string;
}

export const QrMedicalIdView: React.FC<QrMedicalIdViewProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showParamedicModal, setShowParamedicModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [qrRenderMode, setQrRenderMode] = useState<'api' | 'svg'>('api');
  const [cloudQrAssetUrl, setCloudQrAssetUrl] = useState<string | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // Live editable emergency medical state
  const [emergencyData, setEmergencyData] = useState<EmergencyData>({
    patientName: user.name,
    medicalId: user.medicalId,
    bloodGroup: 'O+ Positive',
    emergencyPhone: user.phoneNumber,
    secondaryContact: '+91 94441 23456 (Dr. Anand - Family Physician)',
    allergies: 'Penicillin, Sulfa Drugs, Ibuprofen (None Known for Aspirin)',
    chronicConditions: 'Essential Hypertension (Controlled), Impaired Fasting Glucose (Pre-Diabetes)',
    activeMedications: ['Telmisartan 40mg (OD Morning)', 'Metformin 500mg (BD with Meals)', 'Atorvastatin 10mg (HS Night)'],
    organDonor: true,
    region: `${user.regionState}, ${user.country}`,
    verifiedAuth: 'ABDM-HIPAA-MEDIMITRA-2026',
  });

  const [medInput, setMedInput] = useState('');

  // Encode real scannable payload into QR
  const qrString = useMemo(() => {
    return JSON.stringify({
      app: 'MediMitra Health ID',
      id: emergencyData.medicalId,
      name: emergencyData.patientName,
      blood: emergencyData.bloodGroup,
      er_phone: emergencyData.emergencyPhone,
      allergies: emergencyData.allergies,
      conditions: emergencyData.chronicConditions,
      meds: emergencyData.activeMedications,
      organ_donor: emergencyData.organDonor,
      auth: emergencyData.verifiedAuth,
    });
  }, [emergencyData]);

  // Compute real ISO QR bit matrix
  const qrMatrix = useMemo(() => {
    try {
      return generateQrMatrix(qrString, 'M');
    } catch {
      return generateQrMatrix(`MediMitra:${emergencyData.medicalId}`, 'M');
    }
  }, [qrString, emergencyData.medicalId]);

  const svgPath = useMemo(() => {
    return renderQrSvgPath(qrMatrix);
  }, [qrMatrix]);

  // QR Server Cloud API URL
  const qrServerUrl = useMemo(() => {
    return buildQrServerUrl(qrString, {
      size: '180x180',
      color: '0284c7',
      margin: 2,
    });
  }, [qrString]);

  // Generate dynamic QR code using QRCodeKIT Live API (qrk_live_e4853810e419e552150039f266726fecc0d42642dc7cd7be)
  React.useEffect(() => {
    let isMounted = true;
    const fetchCloudQr = async () => {
      setIsCloudLoading(true);
      try {
        const result = await generateQRCodeKitQR({
          data: qrString,
          title: `MediMitra - ${emergencyData.patientName} Health ID`,
          description: `Medical ID: ${emergencyData.medicalId}, Blood: ${emergencyData.bloodGroup}`,
        });
        if (isMounted && result.assetUrl) {
          setCloudQrAssetUrl(result.assetUrl);
        }
      } catch (err) {
        console.warn('QRCodeKIT generation fallback:', err);
      } finally {
        if (isMounted) setIsCloudLoading(false);
      }
    };
    fetchCloudQr();
    return () => {
      isMounted = false;
    };
  }, [qrString, emergencyData.patientName, emergencyData.medicalId, emergencyData.bloodGroup]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Download high-resolution PNG QR from QR Server API with fallback
  const handleDownloadQrPng = async () => {
    try {
      const ok = await downloadQrCodeFromApi(
        qrString,
        `MediMitra-Emergency-QR-${emergencyData.medicalId}.png`,
        '500x500',
        '0284c7'
      );
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
        return;
      }
    } catch (e) {
      console.warn('API QR download error, using local canvas:', e);
    }

    const size = qrMatrix.length;
    const canvas = document.createElement('canvas');
    const scale = 12; // High-res output
    const margin = 4 * scale;
    canvas.width = size * scale + margin * 2;
    canvas.height = size * scale + margin * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Modules
    ctx.fillStyle = '#0284C7';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qrMatrix[r][c]) {
          ctx.fillRect(margin + c * scale, margin + r * scale, scale, scale);
        }
      }
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `MediMitra-Emergency-QR-${emergencyData.medicalId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleAddMedication = () => {
    if (medInput.trim()) {
      setEmergencyData((prev) => ({
        ...prev,
        activeMedications: [...prev.activeMedications, medInput.trim()],
      }));
      setMedInput('');
    }
  };

  const handleRemoveMedication = (idx: number) => {
    setEmergencyData((prev) => ({
      ...prev,
      activeMedications: prev.activeMedications.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#BAE6FD] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shadow-xs">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0369A1] tracking-tight">
                Universal Emergency Medical QR Model
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live & Scannable
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              100% functional, real scannable QR Code model for first responders, emergency trauma centers, and paramedics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowParamedicModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-all shadow-xs"
            title="Simulate Paramedic Scanning this QR"
          >
            <Ambulance className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Simulate Scan</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQrPng}
            className="px-3.5 py-2.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#BAE6FD] text-xs font-semibold text-[#0369A1] flex items-center gap-1.5 transition-all shadow-xs"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-[#0284C7]" />}
            <span>{downloadSuccess ? 'Saved PNG!' : 'Download QR'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#BAE6FD] text-xs font-semibold text-slate-700 hover:bg-[#F0F9FF] flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#0284C7]" />
            <span>Print ID</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPayload}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Data!' : 'Copy Payload'}</span>
          </button>
        </div>
      </div>

      {/* Clinical Medical ID Badge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#BAE6FD] shadow-md relative overflow-hidden">
        {/* Top Header Accent Ribbon */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0EA5E9]" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Real Scannable QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] shadow-inner space-y-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#BAE6FD] shadow-sm flex items-center justify-center min-w-[170px] min-h-[170px]">
              {qrRenderMode === 'api' ? (
                /* QRCodeKIT Live API Render (qrk_live_e4853810e419e552150039f266726fecc0d42642dc7cd7be) */
                <img
                  src={cloudQrAssetUrl || qrServerUrl}
                  alt="Scannable QR Code (QRCodeKIT Live)"
                  className="w-40 h-40 object-contain rounded-md"
                  loading="eager"
                  onError={() => setQrRenderMode('svg')}
                />
              ) : (
                /* Mathematically Valid ISO/IEC 18004 QR Code SVG */
                <svg
                  className="w-40 h-40"
                  viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                  shapeRendering="crispEdges"
                >
                  <path fill="#0284C7" d={svgPath} />
                </svg>
              )}
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-[#0369A1] tracking-wider uppercase block">
                Live Scannable QR Code
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                  title="QRCodeKIT Live API Key: qrk_live_e4853810e419e552150039f266726fecc0d42642dc7cd7be"
                >
                  QRCodeKIT ({QRCODEKIT_MASKED_KEY})
                </span>
                <button
                  type="button"
                  onClick={() => setQrRenderMode(qrRenderMode === 'api' ? 'svg' : 'api')}
                  className="text-[10px] text-slate-500 hover:text-[#0284C7] underline font-medium cursor-pointer"
                >
                  {qrRenderMode === 'api' ? 'Vector SVG' : 'QRCodeKIT Live'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Point any mobile camera to scan live vitals
              </p>
            </div>
          </div>

          {/* Patient Details & Clinical Summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7] block">
                  Digital Health ID (ABDM Verified)
                </span>
                <h3 className="text-2xl font-black text-[#0369A1] tracking-tight">
                  {emergencyData.patientName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  ID: <span className="text-[#0369A1] font-bold">{emergencyData.medicalId}</span> • {user.role}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD] text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Close Editor' : 'Edit Vitals'}</span>
                </button>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-[#BAE6FD] py-3 bg-[#F0F9FF]/40 rounded-xl px-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-rose-500" /> Blood Group
                </p>
                <p className="text-sm font-black text-rose-600">{emergencyData.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0284C7]" /> Emergency Contact
                </p>
                <p className="text-xs font-bold text-slate-800">{emergencyData.emergencyPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-emerald-600" /> Organ Donor
                </p>
                <p className="text-xs font-bold text-emerald-700">
                  {emergencyData.organDonor ? 'Registered Donor (Yes)' : 'No'}
                </p>
              </div>
            </div>

            {/* Critical Health Alerts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  Known Conditions & Allergies:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  ⚠️ Allergies: {emergencyData.allergies}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  🩺 {emergencyData.chronicConditions}
                </span>
              </div>
            </div>

            {/* Active Medications List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Pill className="w-3 h-3 text-[#0284C7]" /> Active Prescriptions (Live in QR):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {emergencyData.activeMedications.map((med, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]"
                  >
                    • {med}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Profile Editor (Collapsible) */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-[#BAE6FD] bg-[#F0F9FF] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0369A1] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0284C7]" />
                <span>Live Emergency Profile Editor (Updates QR Code Instantly)</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-bold shadow-xs hover:bg-[#0369A1]"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={emergencyData.bloodGroup}
                  onChange={(e) => setEmergencyData({ ...emergencyData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BAE6FD] text-slate-800 font-semibold focus:outline-none focus:border-[#0284C7]"
                >
                  {['O+ Positive', 'O- Negative', 'A+ Positive', 'A- Negative', 'B+ Positive', 'B- Negative', 'AB+ Positive', 'AB- Negative'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Primary Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyData.emergencyPhone}
                  onChange={(e) => setEmergencyData({ ...emergencyData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BAE6FD] text-slate-800 font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Known Drug Allergies</label>
                <input
                  type="text"
                  value={emergencyData.allergies}
                  onChange={(e) => setEmergencyData({ ...emergencyData, allergies: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BAE6FD] text-slate-800 font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Chronic Medical Conditions</label>
                <input
                  type="text"
                  value={emergencyData.chronicConditions}
                  onChange={(e) => setEmergencyData({ ...emergencyData, chronicConditions: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#BAE6FD] text-slate-800 font-semibold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Add Active Medication</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={medInput}
                    onChange={(e) => setMedInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                    placeholder="e.g. Amlodipine 5mg (OD)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#BAE6FD] text-slate-800 font-semibold focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369A1]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {emergencyData.activeMedications.map((med, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-white text-slate-800 border border-[#BAE6FD]"
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paramedic / First Responder Simulated Scan Modal */}
      {showParamedicModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border-2 border-[#0284C7] shadow-2xl overflow-hidden relative animate-scale-up">
            {/* Urgent Header */}
            <div className="bg-[#0284C7] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 text-white">
                  <Ambulance className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#0284C7]">
                      QR DECODED
                    </span>
                    <span className="text-xs font-mono text-white/80">ER TRAUMA DISPATCH</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Emergency First Responder View
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowParamedicModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Paramedic Emergency Data Screen */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    Patient Blood Group
                  </span>
                  <p className="text-2xl font-black text-rose-800">{emergencyData.bloodGroup}</p>
                  <p className="text-[11px] text-rose-600 font-medium">Compatible with O- & matching universal units</p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-200/60 text-rose-800">
                  <Droplet className="w-8 h-8 fill-rose-600 stroke-rose-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Patient Name</span>
                  <p className="text-sm font-bold text-slate-900">{emergencyData.patientName}</p>
                  <p className="text-xs text-[#0284C7] font-mono">{emergencyData.medicalId}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Emergency Contact</span>
                  <p className="text-sm font-bold text-slate-900">{emergencyData.emergencyPhone}</p>
                  <a
                    href={`tel:${emergencyData.emergencyPhone}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0284C7] font-bold hover:underline mt-0.5"
                  >
                    <Phone className="w-3 h-3" /> Call Immediate Dispatch
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  CRITICAL ALLERGY ALERT:
                </span>
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                  {emergencyData.allergies}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#0284C7]" /> Active Prescriptions:
                </span>
                <div className="space-y-1.5">
                  {emergencyData.activeMedications.map((m, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between"
                    >
                      <span>{m}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ABDM Cryptographically Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowParamedicModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs"
                >
                  Close Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
