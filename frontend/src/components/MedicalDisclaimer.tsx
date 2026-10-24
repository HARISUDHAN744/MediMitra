import React from 'react';
import { ShieldAlert, HeartPulse } from 'lucide-react';
import { LanguageDetail, getUiTranslations } from '../services/languageService';

interface MedicalDisclaimerProps {
  language?: LanguageDetail;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ language }) => {
  const t = language ? getUiTranslations(language.code) : null;

  return (
    <footer className="mt-14 mb-8 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs leading-relaxed shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-sm">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-amber-900 block mb-1 text-xs tracking-wide">
            {t?.disclaimerTitle || 'Important Medical & Clinical Safety Disclaimer'}
          </span>
          <p className="text-amber-800/90 leading-relaxed text-[11px]">
            {t?.disclaimerText ||
              'MediMitra is an AI-powered personal health copilot designed for informational and assistive document digitization purposes only. This application does not provide medical diagnoses, emergency care, or authoritative treatment plans. Always consult a licensed healthcare professional before making clinical decisions.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
