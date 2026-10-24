import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, RefreshCw, Sparkles, ShieldCheck, Cpu, Mic } from 'lucide-react';
import { LanguageDetail, getUiTranslations } from '../services/languageService';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  activeFile: File | null;
  onClear: () => void;
  language: LanguageDetail;
  onOpenVoiceModal?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading,
  activeFile,
  onClear,
  language,
  onOpenVoiceModal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getUiTranslations(language.code);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const validateAndPassFile = (file: File) => {
    setFileError(null);
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      setFileError('Invalid file format. Please upload a JPG, PNG, WEBP, or PDF file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError('File size exceeds 20MB limit.');
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        disabled={isLoading}
      />

      {!activeFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 relative overflow-hidden group bg-white ${
            isDragOver
              ? 'border-[#328CC1] bg-[#EAF4FA]/40 scale-[1.01] shadow-lg'
              : 'border-slate-300 hover:border-[#328CC1] hover:bg-slate-50 shadow-sm'
          }`}
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4 shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 text-sky-600" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 tracking-wide font-mono">
            {t.uploadBoxTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {t.uploadBoxSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-bold transition-all shadow-md group-hover:shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>{t.selectDocBtn}</span>
            </div>

            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVoiceModal();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 border border-sky-400 text-white text-xs font-semibold hover:bg-sky-700 transition-all shadow-sm"
              >
                <Mic className="w-4 h-4 text-sky-200 animate-pulse" />
                <span>🎤 Voice Dictation (99+ Languages)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-sky-600" /> Multimodal Vision</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-sky-600" /> Whisper Audio</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SHA-256 Deduplication</span>
            <span>•</span>
            <span className="font-mono text-sky-700 font-semibold">150+ Languages</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                {activeFile.type.includes('pdf') ? (
                  <FileText className="w-6 h-6 text-sky-600" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-sky-600" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{activeFile.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono">{formatFileSize(activeFile.size)}</span>
                  <span>•</span>
                  <span className="capitalize text-[#328CC1] font-semibold">{activeFile.type.split('/')[1] || 'Document'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 hover:text-slate-900 hover:border-[#328CC1] hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Change File
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-medium">
                <span className="flex items-center gap-2 font-semibold text-sky-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  {t.analyzingStep}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">SHA-256 Check & Neural Extraction</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0EA5E9] h-full rounded-full animate-pulse-subtle w-3/4 transition-all duration-500 shadow-xs" />
              </div>
            </div>
          )}
        </div>
      )}

      {fileError && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
};
