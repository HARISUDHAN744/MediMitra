import React, { useState, useEffect, useTransition } from 'react';
import {
  TrendingUp,
  Search,
  Pill,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Download,
  Filter,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Clock,
  Layers,
  MapPin,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import { DrugInfoModal } from './DrugInfoModal';
import { LanguageDetail } from '../services/languageService';
import {
  searchMedicines,
  getMedicineDetail,
  getMedicineSubstitutes,
  checkInteractions,
  checkDuplicateIngredients,
  getMedicineReportPdfUrl,
  MedicineSummary,
  MedicineDetail,
  SubstituteResponse,
  InteractionCheckResponse,
  DuplicateCheckResponse,
} from '../services/medicinesService';

interface LiveRatesViewProps {
  language: LanguageDetail;
  onNavigateToMap?: () => void;
}

export const LiveRatesView: React.FC<LiveRatesViewProps> = ({ language, onNavigateToMap }) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'prescription'>('catalog');

  // Search & Catalog state
  const [searchTerm, setSearchTerm] = useState('');
  const [rxFilter, setRxFilter] = useState<string | undefined>(undefined);
  const [nlemOnly, setNlemOnly] = useState(false);
  const [janAushadhiOnly, setJanAushadhiOnly] = useState(false);
  const [medicines, setMedicines] = useState<MedicineSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Substitute modal
  const [selectedSubMedId, setSelectedSubMedId] = useState<string | null>(null);
  const [substituteData, setSubstituteData] = useState<SubstituteResponse | null>(null);
  const [subMedDetail, setSubMedDetail] = useState<MedicineDetail | null>(null);
  const [loadingSubstitutes, setLoadingSubstitutes] = useState(false);

  // openFDA modal
  const [selectedDrugModal, setSelectedDrugModal] = useState<string | null>(null);

  // Prescription Cross-Check State
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<string[]>([
    'Crocin 650',
    'Calpol 650',
    'Brufen 400',
  ]);
  const [newMedInput, setNewMedInput] = useState('');
  const [checkingPrescription, setCheckingPrescription] = useState(false);
  const [interactionResult, setInteractionResult] = useState<InteractionCheckResponse | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResponse | null>(null);

  // Load catalog on mount & when filters change
  useEffect(() => {
    loadMedicines();
  }, [rxFilter, nlemOnly, janAushadhiOnly]);

  // Debounced search on term change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedicines();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMedicines = async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const data = await searchMedicines(searchTerm, rxFilter, nlemOnly, janAushadhiOnly);
      setMedicines(data);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to load medicine knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubstitutes = async (medId: string) => {
    setSelectedSubMedId(medId);
    setLoadingSubstitutes(true);
    try {
      const [subs, detail] = await Promise.all([
        getMedicineSubstitutes(medId),
        getMedicineDetail(medId),
      ]);
      setSubstituteData(subs);
      setSubMedDetail(detail);
    } catch (err) {
      console.error('Failed to load substitute details', err);
    } finally {
      setLoadingSubstitutes(false);
    }
  };

  const handleCloseSubstitutes = () => {
    setSelectedSubMedId(null);
    setSubstituteData(null);
    setSubMedDetail(null);
  };

  const handleAddPrescriptionMed = (name?: string) => {
    const medToAdd = (name || newMedInput).trim();
    if (medToAdd && !prescriptionMedicines.includes(medToAdd)) {
      setPrescriptionMedicines([...prescriptionMedicines, medToAdd]);
      setNewMedInput('');
    }
  };

  const handleRemovePrescriptionMed = (medToRemove: string) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((m) => m !== medToRemove));
  };

  const handleRunPrescriptionCheck = async () => {
    if (prescriptionMedicines.length === 0) return;
    setCheckingPrescription(true);
    try {
      const [interactions, duplicates] = await Promise.all([
        checkInteractions(undefined, prescriptionMedicines),
        checkDuplicateIngredients(prescriptionMedicines),
      ]);
      setInteractionResult(interactions);
      setDuplicateResult(duplicates);
    } catch (err) {
      console.error('Failed to run prescription checks', err);
    } finally {
      setCheckingPrescription(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* openFDA Modal */}
      {selectedDrugModal && (
        <DrugInfoModal
          isOpen={true}
          drugName={selectedDrugModal}
          onClose={() => setSelectedDrugModal(null)}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 shadow-sm">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-sky-900 tracking-tight">
                Medicine Knowledge Base & Safety Guide
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                NPPA DPCO Ceilings
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PMBJP Generic Equivalence
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Statutory ceiling rates, Jan Aushadhi generic alternatives, and official openFDA label disclosures.
            </p>
          </div>
        </div>

        {onNavigateToMap && (
          <button
            onClick={onNavigateToMap}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>Locate Jan Aushadhi Stores</span>
          </button>
        )}
      </div>

      {/* Primary Tab Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Formulations & Generic Substitutes</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('prescription');
            if (!interactionResult) handleRunPrescriptionCheck();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'prescription'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Prescription Safety & Duplicate Checker</span>
          {prescriptionMedicines.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200 text-sky-800">
              {prescriptionMedicines.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Search & Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Filter Chips */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brand name or active substance (e.g., Metformin, Dolo, Augmentin)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setRxFilter(undefined)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  rxFilter === undefined
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Regulations
              </button>
              <button
                onClick={() => setRxFilter(rxFilter === 'OTC' ? undefined : 'OTC')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  rxFilter === 'OTC'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                OTC Only
              </button>
              <button
                onClick={() => setRxFilter(rxFilter === 'Rx' ? undefined : 'Rx')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  rxFilter === 'Rx'
                    ? 'bg-sky-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Schedule H (Rx)
              </button>
              <button
                onClick={() => setNlemOnly(!nlemOnly)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  nlemOnly
                    ? 'bg-indigo-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                NLEM Capped
              </button>
              <button
                onClick={() => setJanAushadhiOnly(!janAushadhiOnly)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  janAushadhiOnly
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Jan Aushadhi Match
              </button>
            </div>
          </div>

          {/* Stale Price Context Notification */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Price Transparency Policy:</strong> All displayed retail maximum prices (MRP) reflect official statutory notifications or public catalog dates. Items older than 90 days are flagged.
              </span>
            </div>
            <span className="text-slate-400 font-medium shrink-0">Total Formulations: {medicines.length}</span>
          </div>

          {/* Medicines Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" />
              <span className="text-xs font-semibold">Querying Medicine Knowledge Base...</span>
            </div>
          ) : searchError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {searchError}
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
              No matching medicines or active substances found for "{searchTerm}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((med) => {
                const primaryIngredient = med.ingredients.length > 0 ? med.ingredients[0].name : '';
                return (
                  <div
                    key={med.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-sky-950 group-hover:text-sky-600 transition-colors">
                            {med.brand_name}
                          </h3>
                          <p className="text-xs text-sky-700 font-medium">
                            {med.ingredients.map((i) => `${i.name} (${i.strength_value}${i.strength_unit})`).join(' + ')}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{med.manufacturer || 'Licensed Indian Pharma'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {med.dosage_form}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-semibold ${
                              med.schedule_h_flag
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {med.schedule_h_flag ? 'Schedule H (Rx)' : 'OTC'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Breakdown Box */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Retail Brand MRP:</span>
                          <span className="text-slate-900 font-bold">
                            ₹{med.mrp.toFixed(2)}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">
                              (₹{med.price_per_unit.toFixed(2)}/unit)
                            </span>
                          </span>
                        </div>

                        {med.jan_aushadhi_price && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Jan Aushadhi Generic:
                            </span>
                            <span className="text-emerald-700 font-bold">
                              ₹{med.jan_aushadhi_price.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            As of {med.price_as_of} &bull; {med.source_name}
                          </span>
                          <span>{med.pack_size} {med.pack_unit}</span>
                        </div>

                        {med.is_stale_price && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Price record &gt;90 days old; verify at pharmacy counter</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenSubstitutes(med.id)}
                        className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Compare Substitutes & Savings</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDrugModal(primaryIngredient)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[11px] font-semibold text-sky-700 flex items-center justify-center gap-1 transition-all"
                        >
                          <Info className="w-3 h-3" />
                          <span>openFDA Datasheet</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddPrescriptionMed(med.brand_name)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-semibold text-slate-700 transition-all"
                          title="Add to Prescription Cross-Checker"
                        >
                          + Prescribe
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prescription Cross-Check Panel */}
      {activeTab === 'prescription' && (
        <div className="space-y-6">
          {/* Prescription Medicine Manager */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-sky-900">
                  Prescription Multi-Drug Interaction & Duplicate Substance Checker
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cross-checks active therapeutic substances to prevent accidental toxicity from taking multiple brands with the same ingredient.
                </p>
              </div>

              <button
                onClick={handleRunPrescriptionCheck}
                disabled={checkingPrescription || prescriptionMedicines.length === 0}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0"
              >
                {checkingPrescription ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Run Clinical Safety Audit</span>
              </button>
            </div>

            {/* Current Medicines Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {prescriptionMedicines.map((medName) => (
                <span
                  key={medName}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium flex items-center gap-2"
                >
                  <Pill className="w-3 h-3 text-sky-600" />
                  <span>{medName}</span>
                  <button
                    onClick={() => handleRemovePrescriptionMed(medName)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Add Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newMedInput}
                  onChange={(e) => setNewMedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPrescriptionMed()}
                  placeholder="Type medicine name..."
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => handleAddPrescriptionMed()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Duplicate Active Ingredient Findings */}
          {duplicateResult && (
            <div
              className={`p-5 rounded-2xl border ${
                duplicateResult.duplicates_detected
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              } space-y-3`}
            >
              <div className="flex items-center gap-2.5 font-bold text-sm">
                {duplicateResult.duplicates_detected ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
                <span>
                  {duplicateResult.duplicates_detected
                    ? `Duplicate Active Ingredient Detected (${duplicateResult.duplicate_count})`
                    : 'No Duplicate Active Substances Detected'}
                </span>
              </div>

              <p className="text-xs leading-relaxed">{duplicateResult.notice}</p>

              {duplicateResult.findings.map((finding, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/80 border border-rose-300 text-xs space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">
                      Duplicate Substance
                    </span>
                    <span>{finding.ingredient_name}</span>
                  </div>
                  <p className="text-slate-700">{finding.warning}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Found in: <strong>{finding.matched_medicines.join(', ')}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Drug Interactions Findings */}
          {interactionResult && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600" />
                  <h4 className="text-sm font-bold text-sky-950">
                    Official Label Interaction Disclosures
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {interactionResult.general_notice}
                </span>
              </div>

              {interactionResult.interactions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  No explicit interaction warnings flagged in indexed official labels for these medications.
                </div>
              ) : (
                <div className="space-y-3">
                  {interactionResult.interactions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span>
                          {item.drug_a} &bull; {item.drug_b}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 text-[10px]">
                          {item.source}
                        </span>
                      </div>
                      <p className="text-amber-900 italic font-mono text-[11px] leading-relaxed bg-white/70 p-2.5 rounded-lg border border-amber-200">
                        {item.quoted_sentence}
                      </p>
                      <p className="text-[10px] text-amber-700">
                        {item.severity_note} &bull; US label disclosure, may differ for Indian indications.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandatory Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                <strong>Medical Disclaimer:</strong> {interactionResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Substitute & Generic Modal */}
      {selectedSubMedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-800 to-sky-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">
                    Generic Equivalence & Substitute Comparison
                  </h3>
                  <p className="text-xs text-sky-200">
                    Comparing identical formulations (same ingredient, strength, and form)
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseSubstitutes}
                className="w-8 h-8 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {loadingSubstitutes || !substituteData || !subMedDetail ? (
                <div className="py-16 text-center flex flex-col items-center gap-3 text-slate-500">
                  <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" />
                  <span className="font-semibold text-xs">Calculating bioequivalent substitutes & savings...</span>
                </div>
              ) : (
                <>
                  {/* Reference Medicine Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Current Prescribed Brand
                      </span>
                      <h4 className="text-base font-bold text-sky-950 mt-0.5">
                        {substituteData.reference_brand_name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {subMedDetail.ingredients.map((i) => `${i.name} (${i.strength_value}${i.strength_unit})`).join(' + ')} &bull; {substituteData.reference_dosage_form}
                      </p>
                    </div>
                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                      <span className="text-xs text-slate-500">Brand MRP:</span>
                      <p className="text-lg font-bold text-slate-900">₹{substituteData.reference_mrp.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500">₹{subMedDetail.price_per_unit.toFixed(2)} / unit</p>
                    </div>
                  </div>

                  {/* Mandatory Generic Substitution Notice */}
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-sky-950">Generic Substitution Rule:</strong>
                      <span className="text-xs">{substituteData.substitution_notice}</span>
                    </div>
                  </div>

                  {/* Jan Aushadhi Generic Alternative (Highlighted) */}
                  {substituteData.jan_aushadhi_option && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                              PMBJP Jan Aushadhi
                            </span>
                            <span className="text-xs font-bold text-emerald-800">Affordable Generic</span>
                          </div>
                          <h5 className="text-sm font-bold mt-1 text-emerald-950">
                            {substituteData.jan_aushadhi_option.brand_name}
                          </h5>
                          <p className="text-[11px] text-emerald-800">
                            Pradhan Mantri Bhartiya Janaushadhi Pariyojana
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-800">
                            ₹{substituteData.jan_aushadhi_option.mrp.toFixed(2)}
                          </p>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-200 text-emerald-900">
                            Save {substituteData.jan_aushadhi_option.savings_percentage}% (₹{substituteData.jan_aushadhi_option.savings_rupees.toFixed(2)}/unit)
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-800 flex items-center justify-between pt-1 border-t border-emerald-200">
                        <span>As of {substituteData.jan_aushadhi_option.price_as_of} &bull; {substituteData.jan_aushadhi_option.source}</span>
                        <span>Available at Government Jan Aushadhi Kendras</span>
                      </div>
                    </div>
                  )}

                  {/* Other Commercial Substitutes Table */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-800">
                      Other Brand-Name Equivalents ({substituteData.substitutes.length})
                    </h5>

                    {substituteData.substitutes.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-xs">
                        No other commercial retail brands catalogued with the identical strength and dosage form.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                            <tr>
                              <th className="p-2.5">Brand</th>
                              <th className="p-2.5">Manufacturer</th>
                              <th className="p-2.5">MRP</th>
                              <th className="p-2.5">Unit Price</th>
                              <th className="p-2.5">Savings</th>
                              <th className="p-2.5">Price Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {substituteData.substitutes.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-2.5 font-bold text-slate-800">{sub.brand_name}</td>
                                <td className="p-2.5 text-slate-500 text-[11px]">{sub.manufacturer || 'Pharma'}</td>
                                <td className="p-2.5 text-slate-700">₹{sub.mrp.toFixed(2)}</td>
                                <td className="p-2.5 font-semibold text-slate-900">₹{sub.price_per_unit.toFixed(2)}</td>
                                <td className="p-2.5">
                                  {sub.savings_percentage > 0 ? (
                                    <span className="font-bold text-emerald-700">
                                      {sub.savings_percentage}% (₹{sub.savings_rupees.toFixed(2)})
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">Baseline</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-[10px] text-slate-500">{sub.price_as_of}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Quoted FDA Label Text */}
                  {Object.keys(subMedDetail.label_sections).length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Official Label Disclosures ({subMedDetail.label_source})</span>
                        <span className="text-[10px] text-sky-700">{subMedDetail.label_context}</span>
                      </div>
                      {Object.entries(subMedDetail.label_sections).map(([sec, txt]) => (
                        <div key={sec} className="text-[11px] text-slate-600">
                          <strong className="text-slate-800 capitalize">{sec.replace('_', ' ')}: </strong>
                          <span>"{txt}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer with PDF Export */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <a
                href={getMedicineReportPdfUrl(selectedSubMedId)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF Brief</span>
              </a>

              <button
                onClick={handleCloseSubstitutes}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong>Medical & Regulatory Disclaimer:</strong> MediMitra provides pharmaceutical price transparency and generic equivalence mapping for educational purposes. Dosing and prescribing decisions require the clinical judgment of a licensed physician. Never start, stop, or adjust prescription medication without consulting your doctor or pharmacist. In a medical emergency, call 112 immediately.
        </div>
      </div>
    </div>
  );
};
