export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'Patient' | 'Doctor' | 'Healthcare Worker' | 'Pharmacist';
  regionState: string;
  country: string;
  countryCode?: string;
  religionPreference?: string; // Encrypted at rest, excluded from AI prompts and API logs
  medicalId: string;
  isVerified: boolean;
  avatarUrl?: string;
  abhaLinked?: boolean;
  abhaId?: string;
  createdAt: string;
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr_gokul_2026',
  name: 'Gokul T',
  email: 'gokul.health@medimitra.ai',
  phoneNumber: '+91 98765 43210',
  role: 'Patient',
  regionState: 'Tamil Nadu',
  country: 'India',
  countryCode: 'IN',
  religionPreference: 'enc:prefer_not_to_say',
  medicalId: 'MM-IND-TN-9821',
  isVerified: true,
  abhaLinked: true,
  abhaId: '91-4821-9920-1123',
  createdAt: new Date().toISOString(),
};
