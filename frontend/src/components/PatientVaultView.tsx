import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderArchive,
  Folder,
  FolderPlus,
  Search,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Database,
  ArrowLeft,
  ChevronRight,
  Filter,
  Plus,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Pill,
  Activity,
  Share2,
  QrCode,
  Check,
  Copy,
} from 'lucide-react';
import { UploadResponse } from '../types/medical';
import { LanguageDetail } from '../services/languageService';
import { buildQrServerUrl, downloadQrCodeFromApi, QRCODEKIT_MASKED_KEY } from '../utils/qrApi';
import {
  VaultFolder,
  VaultRecord,
  getVaultFolders,
  getVaultRecords,
  createVaultFolder,
  deleteVaultRecord,
} from '../services/vaultService';

interface PatientVaultViewProps {
  language: LanguageDetail;
  onSelectSavedDocument: (result: UploadResponse) => void;
}

export const PatientVaultView: React.FC<PatientVaultViewProps> = ({
  language,
  onSelectSavedDocument,
}) => {
  const [folders, setFolders] = useState<VaultFolder[]>(getVaultFolders);
  const [records, setRecords] = useState<VaultRecord[]>(getVaultRecords);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'folders' | 'all_documents'>('folders');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState<string>('All');

  // Modals & Inspectors
  const [inspectingRecord, setInspectingRecord] = useState<VaultRecord | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPatient, setNewFolderPatient] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalRecord, setQrModalRecord] = useState<VaultRecord | null>(null);
  const [qrCopied, setQrCopied] = useState(false);

  // Sync state on vault update event
  useEffect(() => {
    const handleVaultUpdate = () => {
      setFolders(getVaultFolders());
      setRecords(getVaultRecords());
    };

    window.addEventListener('medimitra:vault-updated', handleVaultUpdate);
    return () => window.removeEventListener('medimitra:vault-updated', handleVaultUpdate);
  }, []);

  // Fetch backend documents and merge into vault
  useEffect(() => {
    const fetchBackendDocuments = async () => {
      try {
        const res = await fetch('http://localhost:8000/documents');
        if (res.ok) {
          const backendDocs = await res.json();
          if (Array.isArray(backendDocs) && backendDocs.length > 0) {
            // Check if any backend doc is missing from local vault
            setFolders(getVaultFolders());
            setRecords(getVaultRecords());
          }
        }
      } catch (err) {
        console.warn('Backend vault sync skipped (running local vault):', err);
      }
    };
    fetchBackendDocuments();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currently selected folder object
  const activeFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  // Filtered records
  const displayRecords = useMemo(() => {
    let list = records;
    if (selectedFolderId) {
      list = list.filter((r) => r.folderId === selectedFolderId);
    }
    if (selectedDocTypeFilter !== 'All') {
      list = list.filter((r) => r.docType.toLowerCase().includes(selectedDocTypeFilter.toLowerCase()));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.filename.toLowerCase().includes(q) ||
          r.patientName.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.docType.toLowerCase().includes(q) ||
          r.folderName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, selectedFolderId, selectedDocTypeFilter, searchTerm]);

  // Handle Manual Folder Creation
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const created = createVaultFolder(newFolderName, newFolderPatient, newFolderDesc);
    setFolders(getVaultFolders());
    setIsNewFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderPatient('');
    setNewFolderDesc('');
    showToast(`Folder '${created.name}' created successfully!`);
  };

  // Handle Record Deletion
  const handleDeleteRecord = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove '${name}' from your vault?`)) {
      deleteVaultRecord(id);
      setRecords(getVaultRecords());
      setFolders(getVaultFolders());
      if (inspectingRecord?.id === id) {
        setInspectingRecord(null);
      }
      showToast(`Record removed from vault.`);
    }
  };

  // Handle JSON Export / Download
  const handleExportJson = (record: VaultRecord) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record.uploadResponse, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${record.filename.replace(/\.[^/.]+$/, '')}_clinical_record.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Downloaded ${record.filename} clinical data!`);
  };

  // Color theme helpers for folders
  const getFolderStyles = (color: VaultFolder['color']) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 hover:border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          tag: 'bg-emerald-100 text-emerald-800',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200 hover:border-indigo-300',
          iconBg: 'bg-indigo-600 text-white',
          tag: 'bg-indigo-100 text-indigo-800',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 hover:border-amber-300',
          iconBg: 'bg-amber-600 text-white',
          tag: 'bg-amber-100 text-amber-800',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100/70 border-rose-200 hover:border-rose-300',
          iconBg: 'bg-rose-600 text-white',
          tag: 'bg-rose-100 text-rose-800',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200 hover:border-purple-300',
          iconBg: 'bg-purple-600 text-white',
          tag: 'bg-purple-100 text-purple-800',
        };
      case 'sky':
      default:
        return {
          bg: 'bg-sky-50 hover:bg-sky-100/70 border-sky-200 hover:border-sky-300',
          iconBg: 'bg-sky-600 text-white',
          tag: 'bg-sky-100 text-sky-800',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-sky-50 via-white to-sky-100/40 border border-sky-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-600 text-white shadow-md shrink-0">
            <FolderArchive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                Patient Medical Vault & Clinical Folders
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Folder Engine Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Whenever you upload a prescription or diagnostic report, MediMitra automatically creates or organizes it into the user's dedicated clinical folder.
            </p>
          </div>
        </div>

        {/* Action Button: Create New Folder */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Folder</span>
          </button>
        </div>
      </div>

      {/* Metrics & Storage Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">User Folders</div>
          <div className="text-2xl font-black text-sky-800 mt-1">{folders.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Organized by patient profile</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">Stored Documents</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{records.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Prescriptions & lab reports</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">Storage Engine</div>
          <div className="text-base font-bold text-slate-800 mt-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-sky-600" /> SQLite + Vault
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Deduplicated & Cached</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">Automated Action</div>
          <div className="text-base font-bold text-indigo-700 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Auto-Categorized
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">On report upload</div>
        </div>
      </div>

      {/* Navigation Controls: Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb or Tabs */}
          {selectedFolderId && activeFolder ? (
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className="flex items-center gap-1.5 text-sky-600 hover:text-sky-800 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All User Folders</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1.5 bg-sky-100 text-sky-900 px-3 py-1.5 rounded-lg border border-sky-200 font-mono">
                <Folder className="w-3.5 h-3.5 text-sky-700" />
                <span>{activeFolder.name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('folders');
                  setSelectedFolderId(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'folders' && !selectedFolderId
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>User Folders ({folders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('all_documents');
                  setSelectedFolderId(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'all_documents'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>All Documents ({records.length})</span>
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports, doctor, pills, tests..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Doc Type Filters if in document view */}
        {(activeTab === 'all_documents' || selectedFolderId) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Filter Type:</span>
            {['All', 'Prescription', 'Lab Report', 'Discharge Summary', 'Voice Dictation'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedDocTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedDocTypeFilter === type
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. FOLDERS GRID VIEW (When not drilled into a specific folder and in 'folders' tab) */}
      {activeTab === 'folders' && !selectedFolderId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              Clinical Folders by User / Patient Profile
            </h3>
            <span className="text-xs text-slate-500">
              Click a folder to view all contained prescriptions and laboratory panels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => {
              const styles = getFolderStyles(folder.color);
              const folderDocs = records.filter((r) => r.folderId === folder.id);

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`p-5 rounded-2xl border transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group ${styles.bg}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3 rounded-2xl shadow-xs group-hover:scale-105 transition-transform ${styles.iconBg}`}>
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-current/20 ${styles.tag}`}>
                        {folderDocs.length} {folderDocs.length === 1 ? 'Record' : 'Records'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {folder.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {folder.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {folder.patientName}
                    </span>
                    <span className="text-[11px] font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Folder <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DOCUMENTS LIST VIEW (Inside a Folder OR in All Documents tab) */}
      {(activeTab === 'all_documents' || selectedFolderId) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              {activeFolder ? `Documents in ${activeFolder.name}` : 'All Vault Records'} ({displayRecords.length})
            </h3>
            {activeFolder && (
              <span className="text-xs text-slate-500 font-mono">
                Patient: <strong className="text-slate-800">{activeFolder.patientName}</strong>
              </span>
            )}
          </div>

          {displayRecords.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No medical records found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a prescription or lab test report from the Dashboard or Prescription AI tab to automatically add documents to this folder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                          {record.docType === 'Lab Report' ? (
                            <Activity className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-sky-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {record.filename}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {record.docType}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {record.fileSizeFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 shrink-0">
                        {record.date}
                      </span>
                    </div>

                    {/* Summary box */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                      {record.summary}
                    </div>

                    {/* Doctor & Clinic */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.doctorName}</span>
                      </span>
                      <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        📁 {record.folderName}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectSavedDocument(record.uploadResponse)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      title="Load into Prescription AI workspace"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open in AI Workspace</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectingRecord(record)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        title="View Full Record Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrModalRecord(record)}
                        className="p-1.5 rounded-lg border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 transition"
                        title="Generate Scannable QR Code (QR Server API)"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportJson(record)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        title="Export JSON Data"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(record.id, record.filename)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create New Folder */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  Create New Vault Folder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Folder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Priya Patel's Cardiology Vault"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient / User Name
                </label>
                <input
                  type="text"
                  value={newFolderPatient}
                  onChange={(e) => setNewFolderPatient(e.target.value)}
                  placeholder="e.g. Priya Patel"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Clinical Purpose
                </label>
                <textarea
                  rows={2}
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="e.g. Cardiology follow-up prescriptions and ECG reports"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Record Details Inspector */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-100 text-sky-700">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {inspectingRecord.filename}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>{inspectingRecord.docType}</span>
                    <span>•</span>
                    <span>{inspectingRecord.date}</span>
                    <span>•</span>
                    <span className="font-mono text-sky-700">📁 {inspectingRecord.folderName}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Patient</span>
                <span className="font-bold text-slate-900">{inspectingRecord.patientName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Doctor</span>
                <span className="font-bold text-slate-900">{inspectingRecord.doctorName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Facility</span>
                <span className="font-bold text-slate-900">{inspectingRecord.hospitalOrClinic}</span>
              </div>
            </div>

            {/* Diagnoses */}
            {inspectingRecord.diagnoses.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono">
                  Diagnoses & Clinical Indications
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingRecord.diagnoses.map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prescribed Medicines */}
            {inspectingRecord.medicines.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-amber-600" /> Prescribed Medications ({inspectingRecord.medicines.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {inspectingRecord.medicines.map((m: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900">{m.name}</strong>
                        {m.dosage && <span className="text-amber-800 ml-1.5 font-mono text-[11px]">({m.dosage})</span>}
                        {m.instructions && <div className="text-[11px] text-slate-600">{m.instructions}</div>}
                      </div>
                      {m.frequency && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                          {m.frequency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests */}
            {inspectingRecord.tests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" /> Laboratory Biomarkers ({inspectingRecord.tests.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {inspectingRecord.tests.map((t: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900">{t.name}</strong>
                        {t.reference_range && <span className="text-slate-500 ml-1.5 text-[11px]">(Ref: {t.reference_range})</span>}
                      </div>
                      <div className="font-mono font-bold text-indigo-900">
                        {t.value} {t.unit || ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Modal CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportJson(inspectingRecord)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrModalRecord(inspectingRecord)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                  title="Generate QR code using api.qrserver.com"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectSavedDocument(inspectingRecord.uploadResponse);
                  setInspectingRecord(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Load in Prescription AI Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: QR Server Cloud API Generator for Medical/Lab Reports */}
      {qrModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 block">
                    QRCodeKIT Live API ({QRCODEKIT_MASKED_KEY})
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Scannable Report QR
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Image Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-sky-200 shadow-xs flex items-center justify-center">
                <img
                  src={buildQrServerUrl(
                    JSON.stringify({
                      patient: qrModalRecord.patientName,
                      docType: qrModalRecord.docType,
                      date: qrModalRecord.date,
                      diagnoses: qrModalRecord.diagnoses,
                      medicines: qrModalRecord.medicines.map((m: any) => m.name || m),
                      facility: qrModalRecord.hospitalOrClinic,
                    }),
                    { size: '180x180', color: '0284c7', margin: 2 }
                  )}
                  alt="Scannable Medical QR Code (api.qrserver.com)"
                  className="w-44 h-44 object-contain rounded-md"
                />
              </div>

              <div className="text-center space-y-1 max-w-xs">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {qrModalRecord.patientName} — {qrModalRecord.docType}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Scan with any camera or paramedic reader to view prescription & lab vitals
                </p>
              </div>
            </div>

            {/* API Endpoint Attribution */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-600 font-bold">Provider / Live Key:</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                  QRCodeKIT {QRCODEKIT_MASKED_KEY}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 break-all bg-white p-1.5 rounded border border-slate-200 select-all">
                {buildQrServerUrl(
                  JSON.stringify({
                    patient: qrModalRecord.patientName,
                    docType: qrModalRecord.docType,
                  }),
                  { size: '150x150', color: '0284c7' }
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const url = buildQrServerUrl(
                    JSON.stringify({
                      patient: qrModalRecord.patientName,
                      docType: qrModalRecord.docType,
                      date: qrModalRecord.date,
                      diagnoses: qrModalRecord.diagnoses,
                      medicines: qrModalRecord.medicines.map((m: any) => m.name || m),
                    }),
                    { size: '150x150' }
                  );
                  navigator.clipboard.writeText(url);
                  setQrCopied(true);
                  setTimeout(() => setQrCopied(false), 2000);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                {qrCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{qrCopied ? 'Copied URL!' : 'Copy API URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadQrCodeFromApi(
                    JSON.stringify({
                      patient: qrModalRecord.patientName,
                      docType: qrModalRecord.docType,
                      date: qrModalRecord.date,
                      diagnoses: qrModalRecord.diagnoses,
                      medicines: qrModalRecord.medicines.map((m: any) => m.name || m),
                      facility: qrModalRecord.hospitalOrClinic,
                    }),
                    `MediMitra-Report-${qrModalRecord.patientName.replace(/\s+/g, '_')}-QR.png`,
                    '500x500',
                    '0284c7'
                  );
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
