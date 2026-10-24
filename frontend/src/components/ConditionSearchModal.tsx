import React, { useState } from 'react';
import { Search, Database, ExternalLink, Loader2, X, CheckCircle, Copy, Sparkles } from 'lucide-react';
import { searchMedicalCondition, MedicalConditionResult } from '../services/medicalConditions';

interface ConditionSearchModalProps {
  initialQuery?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ConditionSearchModal: React.FC<ConditionSearchModalProps> = ({
  initialQuery = '',
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<MedicalConditionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchTerm(initialQuery);
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMedicalCondition(term);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-sky-200 flex items-center justify-between bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-tight">
                  NIH Standardized Medical Database (ICD-10)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Live API
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                National Library of Medicine (NIH) Clinical Tables Service
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

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#328CC1]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search condition or symptom (e.g. Hypertension, Diabetes, Asthma)..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#328CC1] focus:ring-1 focus:ring-[#328CC1] shadow-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#D9534F] hover:bg-[#c94541] text-white text-xs font-bold disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50">
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <span className="font-semibold text-sky-700">Querying NIH Clinical Tables database...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((res, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#328CC1] bg-white hover:shadow-sm transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5">
                    {res.primaryName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      ICD-10-CM:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(res.icd10Codes)}
                      title="Click to copy ICD-10 code"
                      className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 font-mono text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <span>{res.icd10Codes || 'N/A'}</span>
                      <Copy className="w-3 h-3 opacity-70" />
                    </button>
                    {copiedCode === res.icd10Codes && (
                      <span className="text-[10px] text-emerald-700 font-bold animate-fadeIn">Copied!</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Standardized</span>
                </span>
              </div>
            ))
          ) : searched ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No standardized conditions found matching &ldquo;{searchTerm}&rdquo;. Try another medical term.
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Enter a clinical condition above to query official ICD-10-CM codes dynamically from the NIH database.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Source: U.S. National Library of Medicine (NIH)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
