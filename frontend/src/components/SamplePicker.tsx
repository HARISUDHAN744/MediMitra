import React from 'react';
import { Activity, Pill, ArrowRight, Sparkles, FileCode2 } from 'lucide-react';
import { SampleDoc } from '../types/medical';
import { LanguageDetail } from '../services/languageService';

interface SamplePickerProps {
  samples: SampleDoc[];
  onSelectSample: (sample: SampleDoc) => void;
  isLoading: boolean;
  language: LanguageDetail;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({ samples, onSelectSample, isLoading, language }) => {
  if (!samples || samples.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-300 text-sky-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide font-mono">
              Fast Demonstration & Verified Clinical Datasets
            </h3>
            <p className="text-[11px] text-slate-500">Click any document to trigger instant full-pipeline extraction</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
          3 Synthetic Samples
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {samples.map((s) => {
          const isLab = s.document_type === 'lab_report';
          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              disabled={isLoading}
              className="group text-left p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-white transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5 ${
                      isLab
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isLab ? <Activity className="w-3.5 h-3.5 text-sky-600" /> : <Pill className="w-3.5 h-3.5 text-emerald-600" />}
                    {isLab ? 'Lab Report' : 'Prescription'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 group-hover:text-sky-600 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Patient: <span className="font-semibold text-slate-700">{s.patient_name}</span>
                </p>
                {s.doctor_or_lab && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {s.doctor_or_lab}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#D9534F] font-bold">
                <span className="group-hover:underline">Instant Extraction &rarr;</span>
                <span className="text-[10px] font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 border border-slate-300">.png</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
