import { UploadResponse, ExtractedMedicalDocument } from '../types/medical';
import { UserProfile } from '../types/user';

export interface VaultFolder {
  id: string;
  name: string;
  patientName: string;
  description: string;
  color: 'sky' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'purple';
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaultRecord {
  id: string;
  folderId: string;
  folderName: string;
  filename: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  docType: string;
  patientName: string;
  doctorName: string;
  hospitalOrClinic: string;
  date: string;
  summary: string;
  model: string;
  medicinesCount: number;
  testsCount: number;
  diagnoses: string[];
  medicines: any[];
  tests: any[];
  uploadResponse: UploadResponse;
  createdAt: string;
}

const STORAGE_KEY_FOLDERS = 'medimitra_vault_folders_v2';
const STORAGE_KEY_RECORDS = 'medimitra_vault_records_v2';

const FOLDER_COLORS: Array<VaultFolder['color']> = ['sky', 'emerald', 'indigo', 'amber', 'rose', 'purple'];

// Initial Seed Data to ensure rich first-time display
const INITIAL_FOLDERS: VaultFolder[] = [
  {
    id: 'folder-gokul-t',
    name: "Gokul T's Health Vault",
    patientName: 'Gokul T',
    description: 'Primary clinical vault for Gokul T with cardiology prescriptions & metabolic panels.',
    color: 'sky',
    documentCount: 3,
    createdAt: '2026-09-15T09:30:00Z',
    updatedAt: '2026-10-08T14:20:00Z',
  },
  {
    id: 'folder-apollo-cardio',
    name: 'Apollo Hospital & Diagnostic Care',
    patientName: 'Dr. Sundaramurthy Patients',
    description: 'Specialist consultation prescriptions and discharge notes from Apollo Health Center.',
    color: 'indigo',
    documentCount: 1,
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-10-02T16:45:00Z',
  },
];

const INITIAL_RECORDS: VaultRecord[] = [
  {
    id: 'rec-init-1',
    folderId: 'folder-gokul-t',
    folderName: "Gokul T's Health Vault",
    filename: 'Apollo_Cardio_Prescription_2026.png',
    fileSizeBytes: 49356,
    fileSizeFormatted: '48.2 KB',
    docType: 'Prescription',
    patientName: 'Gokul T',
    doctorName: 'Dr. Sundaramurthy (MD Cardiology)',
    hospitalOrClinic: 'Apollo Specialty Hospital',
    date: '2026-10-08',
    summary: 'Hypertension & Dyslipidemia management with Telmisartan 40mg & Rosuvastatin 10mg.',
    model: 'Gemini 3.5 Flash Vision',
    medicinesCount: 2,
    testsCount: 0,
    diagnoses: ['Essential Primary Hypertension (I10)', 'Hyperlipidemia (E78.5)'],
    medicines: [
      { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily (morning)', instructions: 'Take with water after breakfast' },
      { name: 'Rosuvastatin', dosage: '10 mg', frequency: 'Once daily (bedtime)', instructions: 'Take at night' },
    ],
    tests: [],
    uploadResponse: {
      success: true,
      message: 'Archived record retrieved from local clinical vault.',
      file_hash: 'apollo-cardio-hash-1',
      filename: 'Apollo_Cardio_Prescription_2026.png',
      file_size_bytes: 49356,
      mime_type: 'image/png',
      is_cached: true,
      is_fallback: false,
      model_used: 'Gemini 3.5 Flash Vision',
      created_at: '2026-10-08T14:20:00Z',
      data: {
        document_type: 'prescription',
        patient_name: 'Gokul T',
        doctor_name: 'Dr. Sundaramurthy (MD Cardiology)',
        hospital_or_clinic: 'Apollo Specialty Hospital',
        document_date: '2026-10-08',
        diagnoses: ['Essential Primary Hypertension (I10)', 'Hyperlipidemia (E78.5)'],
        medicines: [
          { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily', instructions: 'Take with water after breakfast' },
          { name: 'Rosuvastatin', dosage: '10 mg', frequency: 'Bedtime', instructions: 'Take at night' },
        ],
        tests: [],
      },
    },
    createdAt: '2026-10-08T14:20:00Z',
  },
  {
    id: 'rec-init-2',
    folderId: 'folder-gokul-t',
    folderName: "Gokul T's Health Vault",
    filename: 'Complete_Metabolic_Lab_Report.png',
    fileSizeBytes: 52633,
    fileSizeFormatted: '51.4 KB',
    docType: 'Lab Report',
    patientName: 'Gokul T',
    doctorName: 'Dr. Ananya Iyer (MD Pathology)',
    hospitalOrClinic: 'Thyrocare / Metropolis Diagnostics',
    date: '2026-09-24',
    summary: 'Fasting Glucose 118 mg/dL (High), HbA1c 6.8% (Elevated), Serum Creatinine 0.95 mg/dL (Normal).',
    model: 'Gemini 3.5 Flash Vision',
    medicinesCount: 0,
    testsCount: 3,
    diagnoses: ['Pre-Diabetes Mellitus (R73.03)'],
    medicines: [],
    tests: [
      { name: 'Fasting Blood Sugar', value: '118', unit: 'mg/dL', reference_range: '70-99', interpretation: 'Elevated' },
      { name: 'HbA1c Glycated Hemoglobin', value: '6.8', unit: '%', reference_range: '4.0-5.6', interpretation: 'Elevated' },
      { name: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', reference_range: '0.7-1.3', interpretation: 'Normal' },
    ],
    uploadResponse: {
      success: true,
      message: 'Archived metabolic lab report.',
      file_hash: 'metabolic-lab-hash-2',
      filename: 'Complete_Metabolic_Lab_Report.png',
      file_size_bytes: 52633,
      mime_type: 'image/png',
      is_cached: true,
      is_fallback: false,
      model_used: 'Gemini 3.5 Flash Vision',
      created_at: '2026-09-24T10:15:00Z',
      data: {
        document_type: 'lab_report',
        patient_name: 'Gokul T',
        doctor_name: 'Dr. Ananya Iyer (MD Pathology)',
        hospital_or_clinic: 'Thyrocare Diagnostics',
        document_date: '2026-09-24',
        diagnoses: ['Pre-Diabetes Mellitus (R73.03)'],
        medicines: [],
        tests: [
          { name: 'Fasting Blood Sugar', value: '118', unit: 'mg/dL', reference_range: '70-99', interpretation: 'Elevated' },
          { name: 'HbA1c', value: '6.8', unit: '%', reference_range: '4.0-5.6', interpretation: 'Elevated' },
        ],
      },
    },
    createdAt: '2026-09-24T10:15:00Z',
  },
  {
    id: 'rec-init-3',
    folderId: 'folder-gokul-t',
    folderName: "Gokul T's Health Vault",
    filename: 'Kovai_Medical_Discharge_Summary.pdf',
    fileSizeBytes: 127795,
    fileSizeFormatted: '124.8 KB',
    docType: 'Discharge Summary',
    patientName: 'Gokul T',
    doctorName: 'Dr. R. Natarajan',
    hospitalOrClinic: 'KMCH Hospital',
    date: '2026-08-15',
    summary: 'Post-viral recovery, hemodynamic stability achieved, vitals normal upon discharge.',
    model: 'Gemini 3.5 Flash Vision',
    medicinesCount: 3,
    testsCount: 1,
    diagnoses: ['Post-Viral Syndrome Recovery'],
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '650 mg', frequency: 'As needed for fever', instructions: 'After food' },
      { name: 'Vitamin C & Zinc', dosage: '500 mg', frequency: 'Once daily for 10 days', instructions: 'Morning' },
    ],
    tests: [{ name: 'Platelet Count', value: '2.4', unit: 'Lakhs/mcL', reference_range: '1.5-4.5', interpretation: 'Normal' }],
    uploadResponse: {
      success: true,
      message: 'Hospital discharge card archived in vault.',
      file_hash: 'kovai-discharge-hash-3',
      filename: 'Kovai_Medical_Discharge_Summary.pdf',
      file_size_bytes: 127795,
      mime_type: 'application/pdf',
      is_cached: true,
      is_fallback: false,
      model_used: 'Gemini 3.5 Flash Vision',
      created_at: '2026-08-15T16:00:00Z',
      data: {
        document_type: 'discharge_summary',
        patient_name: 'Gokul T',
        doctor_name: 'Dr. R. Natarajan',
        hospital_or_clinic: 'KMCH Hospital',
        document_date: '2026-08-15',
        diagnoses: ['Post-Viral Recovery'],
        medicines: [{ name: 'Paracetamol', dosage: '650 mg', frequency: 'SOS' }],
        tests: [{ name: 'Platelet Count', value: '2.4', unit: 'Lakhs/mcL' }],
      },
    },
    createdAt: '2026-08-15T16:00:00Z',
  },
  {
    id: 'rec-init-4',
    folderId: 'folder-apollo-cardio',
    folderName: 'Apollo Hospital & Diagnostic Care',
    filename: 'Voice_Consultation_Transcript_Tamil.mp3',
    fileSizeBytes: 215040,
    fileSizeFormatted: '210.0 KB',
    docType: 'Voice Dictation',
    patientName: 'Dr. Sundaramurthy Patients',
    doctorName: 'Dr. Priyadharshini',
    hospitalOrClinic: 'Apollo TeleHealth Studio',
    date: '2026-10-02',
    summary: 'Oral dictation in Tamil regarding acute respiratory symptoms & antihistamine prescription.',
    model: 'Whisper-1 + Gemini Audio',
    medicinesCount: 2,
    testsCount: 0,
    diagnoses: ['Allergic Rhinitis & Pharyngitis'],
    medicines: [{ name: 'Levocetirizine', dosage: '5 mg', frequency: 'Bedtime', instructions: 'Take with water' }],
    tests: [],
    uploadResponse: {
      success: true,
      message: 'Voice dictation transcript archived in vault.',
      file_hash: 'voice-tamil-hash-4',
      filename: 'Voice_Consultation_Transcript_Tamil.mp3',
      file_size_bytes: 215040,
      mime_type: 'audio/mp3',
      is_cached: true,
      is_fallback: false,
      model_used: 'Whisper-1 + Gemini Audio',
      created_at: '2026-10-02T16:45:00Z',
      data: {
        document_type: 'voice_prescription',
        patient_name: 'Dr. Sundaramurthy Patients',
        doctor_name: 'Dr. Priyadharshini',
        hospital_or_clinic: 'Apollo TeleHealth Studio',
        document_date: '2026-10-02',
        diagnoses: ['Allergic Rhinitis'],
        medicines: [{ name: 'Levocetirizine', dosage: '5 mg' }],
        tests: [],
      },
    },
    createdAt: '2026-10-02T16:45:00Z',
  },
];

// Helper: Read stored folders
export function getVaultFolders(): VaultFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(INITIAL_FOLDERS));
      return INITIAL_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FOLDERS;
  } catch {
    return INITIAL_FOLDERS;
  }
}

// Helper: Save folders
function saveVaultFolders(folders: VaultFolder[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save vault folders to localStorage:', err);
  }
}

// Helper: Read stored records
export function getVaultRecords(folderId?: string): VaultRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    let records: VaultRecord[] = INITIAL_RECORDS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        records = parsed;
      }
    } else {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_RECORDS));
    }

    if (folderId) {
      return records.filter((r) => r.folderId === folderId);
    }
    return records;
  } catch {
    return folderId ? INITIAL_RECORDS.filter((r) => r.folderId === folderId) : INITIAL_RECORDS;
  }
}

// Helper: Save records
function saveVaultRecords(records: VaultRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save vault records to localStorage:', err);
  }
}

/**
 * Automatically creates a new folder for the user (if one does not already exist)
 * and stores the extracted medical/lab report securely in the Vault!
 */
export function autoSaveDocumentToVault(
  result: UploadResponse,
  currentUser?: UserProfile | null
): { folder: VaultFolder; record: VaultRecord; isNewFolder: boolean } {
  const folders = getVaultFolders();
  const records = getVaultRecords();

  const doc = result.data || ({} as ExtractedMedicalDocument);

  // 1. Determine User / Patient Name for the folder
  let patientName = (doc.patient_name || '').trim();
  if (!patientName || patientName.toLowerCase() === 'null' || patientName.toLowerCase() === 'unknown') {
    patientName = currentUser?.name?.trim() || 'Personal Health Records';
  }

  // Normalize patient key
  const normKey = patientName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 2. Check if a folder for this user / patient already exists
  let targetFolder = folders.find((f) => {
    const folderNorm = f.patientName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return folderNorm === normKey || f.name.toLowerCase().includes(patientName.toLowerCase());
  });

  let isNewFolder = false;

  if (!targetFolder) {
    // Automatically create a brand new folder for this user!
    isNewFolder = true;
    const colorIndex = folders.length % FOLDER_COLORS.length;
    targetFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${patientName}'s Medical Vault`,
      patientName: patientName,
      description: `Automatically created clinical vault folder for ${patientName}. Contains prescriptions, laboratory panels, and health summaries.`,
      color: FOLDER_COLORS[colorIndex],
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folders.unshift(targetFolder);
  }

  // 3. Prepare summary & metrics for the record
  const medicines = doc.medicines || [];
  const tests = doc.tests || [];
  const diagnoses = doc.diagnoses || [];

  let summaryParts: string[] = [];
  if (diagnoses.length > 0) {
    summaryParts.push(`Diagnosis: ${diagnoses.slice(0, 2).join(', ')}`);
  }
  if (medicines.length > 0) {
    const medNames = medicines.slice(0, 3).map((m: any) => m.name || m);
    summaryParts.push(`${medicines.length} Medication(s): ${medNames.join(', ')}`);
  }
  if (tests.length > 0) {
    const testNames = tests.slice(0, 3).map((t: any) => `${t.name || 'Test'} (${t.value || ''} ${t.unit || ''})`);
    summaryParts.push(`${tests.length} Lab Test(s): ${testNames.join(', ')}`);
  }
  if (summaryParts.length === 0) {
    summaryParts.push(`Extracted clinical document record processed via ${result.model_used || 'AI Multimodal Vision'}.`);
  }

  const docTypeLabel =
    result.data.document_type === 'lab_report' || tests.length > 0
      ? 'Lab Report'
      : result.data.document_type === 'discharge_summary'
      ? 'Discharge Summary'
      : result.data.document_type === 'voice_prescription'
      ? 'Voice Dictation'
      : 'Prescription';

  const fileSizeBytes = result.file_size_bytes || 45000;
  const fileSizeFormatted = fileSizeBytes > 1048576
    ? `${(fileSizeBytes / 1048576).toFixed(1)} MB`
    : `${(fileSizeBytes / 1024).toFixed(1)} KB`;

  // 4. Create the Vault Record
  const newRecordId = `vault-${Date.now()}-${result.file_hash?.substring(0, 8) || Math.random().toString(36).substring(2, 6)}`;
  
  // Check if identical file_hash already exists in this folder to avoid duplicates
  const existingIdx = records.findIndex((r) => r.uploadResponse?.file_hash && r.uploadResponse.file_hash === result.file_hash);

  const newRecord: VaultRecord = {
    id: existingIdx >= 0 ? records[existingIdx].id : newRecordId,
    folderId: targetFolder.id,
    folderName: targetFolder.name,
    filename: result.filename || `Medical_Report_${new Date().toISOString().split('T')[0]}.png`,
    fileSizeBytes: fileSizeBytes,
    fileSizeFormatted: fileSizeFormatted,
    docType: docTypeLabel,
    patientName: patientName,
    doctorName: doc.doctor_name || 'Dr. Attending Physician',
    hospitalOrClinic: doc.hospital_or_clinic || 'Diagnostic Medical Center',
    date: doc.document_date || new Date().toISOString().split('T')[0],
    summary: summaryParts.join(' • '),
    model: result.model_used || 'Gemini 3.5 Flash Vision',
    medicinesCount: medicines.length,
    testsCount: tests.length,
    diagnoses: diagnoses,
    medicines: medicines,
    tests: tests,
    uploadResponse: result,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    records[existingIdx] = newRecord;
  } else {
    records.unshift(newRecord);
    targetFolder.documentCount += 1;
  }

  targetFolder.updatedAt = new Date().toISOString();

  // Save to persistent localStorage
  saveVaultFolders(folders);
  saveVaultRecords(records);

  // Notify listeners across app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('medimitra:vault-updated', {
        detail: { folder: targetFolder, record: newRecord, isNewFolder },
      })
    );
  }

  return {
    folder: targetFolder,
    record: newRecord,
    isNewFolder,
  };
}

/**
 * Creates a new user folder manually in the vault.
 */
export function createVaultFolder(name: string, patientName?: string, description?: string): VaultFolder {
  const folders = getVaultFolders();
  const colorIndex = folders.length % FOLDER_COLORS.length;
  const newFolder: VaultFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    patientName: (patientName || name).trim(),
    description: description?.trim() || `Personal medical archive folder for ${name}.`,
    color: FOLDER_COLORS[colorIndex],
    documentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  folders.unshift(newFolder);
  saveVaultFolders(folders);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('medimitra:vault-updated', { detail: { folder: newFolder, isNewFolder: true } }));
  }

  return newFolder;
}

/**
 * Deletes a record from the vault and updates the folder's document count.
 */
export function deleteVaultRecord(recordId: string): boolean {
  const records = getVaultRecords();
  const target = records.find((r) => r.id === recordId);
  if (!target) return false;

  const filtered = records.filter((r) => r.id !== recordId);
  saveVaultRecords(filtered);

  // Update folder count
  const folders = getVaultFolders();
  const folder = folders.find((f) => f.id === target.folderId);
  if (folder) {
    folder.documentCount = Math.max(0, folder.documentCount - 1);
    folder.updatedAt = new Date().toISOString();
    saveVaultFolders(folders);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('medimitra:vault-updated', { detail: { deletedRecordId: recordId } }));
  }

  return true;
}
