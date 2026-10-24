import React, { useState, useEffect } from 'react';
import { Pill, AlertTriangle, ShieldCheck, ExternalLink, Loader2, X, Info, Sparkles } from 'lucide-react';
import { searchDrugInfo, DrugInfoResult } from '../services/drugInfo';

interface DrugInfoModalProps {
  drugName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DrugInfoModal: React.FC<DrugInfoModalProps> = ({ drugName, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [drugInfo, setDrugInfo] = useState<DrugInfoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && drugName) {
      fetchInfo(drugName);
    }
  }, [isOpen, drugName]);

  const fetchInfo = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchDrugInfo(name);
      if (data) {
        setDrugInfo(data);
      } else {
        setError(`No official FDA label found for "${name}". Please verify the medication name or consult your pharmacist.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drug information from openFDA.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-sky-200 flex items-center justify-between bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-tight">
                  openFDA Drug Safety & Label Info
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Official US FDA Label
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Querying: <span className="font-bold text-white">{drugName}</span> (US label, may differ for India)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed bg-white">
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <span className="font-semibold text-sky-700">Querying official openFDA drug safety registry...</span>
            </div>
          ) : drugInfo ? (
            <>
              {/* Names Overview */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">
                    Brand Name
                  </span>
                  <span className="font-bold text-sky-800 text-xs">
                    {drugInfo.brandName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">
                    Generic Active Ingredient
                  </span>
                  <span className="font-semibold text-[#328CC1] text-xs truncate block" title={drugInfo.genericName}>
                    {drugInfo.genericName}
                  </span>
                </div>
              </div>

              {/* Purpose / Indications */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-sky-800 mb-1.5 text-xs">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Approved Medical Purpose & Indications</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {drugInfo.purpose}
                </p>
              </div>

              {/* Warnings / Precautions */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>FDA Warnings & Safety Precautions</span>
                </div>
                <p className="text-amber-800 text-xs leading-relaxed">
                  {drugInfo.warnings}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified against official U.S. FDA Drug Labeling Database (api.fda.gov)</span>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <p>{error || 'No drug information available.'}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Source: U.S. FDA openFDA API</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 text-xs shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
