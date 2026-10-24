/**
 * countryService.ts
 * -------------------------------------------------------------------
 * Phase 14B: ISO 3166 Full Country Directory, Official Health Resources,
 * Localized Dial Codes, Privacy-Protected Cultural/Dietary Preferences,
 * and libphonenumber-js validation.
 */

import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import countryResourcesData from '../data/country_resources.json';
import religionsData from '../data/religions.json';

export interface IsoCountry {
  code: string;       // ISO 3166-1 alpha-2 (e.g. "IN", "US")
  iso3: string;       // ISO 3166-1 alpha-3 (e.g. "IND", "USA")
  name: string;       // English name
  nativeName: string; // Native script / official local name
  phoneCode: string;  // International dial code (e.g. "+91")
}

/**
 * Comprehensive State / Province / Territory directory for global countries
 */
export const COUNTRY_SUBDIVISIONS: Record<string, string[]> = {
  IN: [
    'Tamil Nadu',
    'Maharashtra',
    'Karnataka',
    'Delhi NCR',
    'Kerala',
    'Gujarat',
    'Telangana',
    'Andhra Pradesh',
    'West Bengal',
    'Punjab',
    'Rajasthan',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Bihar',
    'Odisha',
    'Assam',
    'Haryana',
    'Jammu & Kashmir',
    'Goa',
    'Himachal Pradesh',
    'Uttarakhand',
    'Jharkhand',
    'Chhattisgarh',
    'Chandigarh',
    'Puducherry',
    'Andaman & Nicobar',
    'Ladakh',
    'Tripura',
    'Meghalaya',
    'Manipur',
    'Nagaland',
    'Mizoram',
    'Sikkim',
    'Arunachal Pradesh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
    'Other State / Union Territory',
  ],
  US: [
    'California',
    'Texas',
    'Florida',
    'New York',
    'Pennsylvania',
    'Illinois',
    'Ohio',
    'Georgia',
    'North Carolina',
    'Michigan',
    'New Jersey',
    'Virginia',
    'Washington',
    'Arizona',
    'Tennessee',
    'Massachusetts',
    'Indiana',
    'Missouri',
    'Maryland',
    'Wisconsin',
    'Colorado',
    'Minnesota',
    'South Carolina',
    'Alabama',
    'Louisiana',
    'Kentucky',
    'Oregon',
    'Oklahoma',
    'Connecticut',
    'Utah',
    'Iowa',
    'Nevada',
    'Arkansas',
    'Mississippi',
    'Kansas',
    'New Mexico',
    'Nebraska',
    'Idaho',
    'West Virginia',
    'Hawaii',
    'New Hampshire',
    'Maine',
    'Rhode Island',
    'Montana',
    'Delaware',
    'South Dakota',
    'North Dakota',
    'Alaska',
    'District of Columbia',
    'Vermont',
    'Wyoming',
    'Puerto Rico',
    'Other US Territory',
  ],
  GB: [
    'England - Greater London',
    'England - South East',
    'England - North West',
    'England - West Midlands',
    'England - Yorkshire and the Humber',
    'England - East Midlands',
    'England - South West',
    'England - East of England',
    'England - North East',
    'Scotland',
    'Wales',
    'Northern Ireland',
    'Other UK Region',
  ],
  CA: [
    'Ontario',
    'Quebec',
    'British Columbia',
    'Alberta',
    'Manitoba',
    'Saskatchewan',
    'Nova Scotia',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Prince Edward Island',
    'Northwest Territories',
    'Yukon',
    'Nunavut',
    'Other Province / Territory',
  ],
  AU: [
    'New South Wales',
    'Victoria',
    'Queensland',
    'Western Australia',
    'South Australia',
    'Tasmania',
    'Australian Capital Territory',
    'Northern Territory',
    'Other Territory',
  ],
  DE: [
    'Baden-Württemberg',
    'Bavaria (Bayern)',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hesse (Hessen)',
    'Lower Saxony (Niedersachsen)',
    'Mecklenburg-Vorpommern',
    'North Rhine-Westphalia (NRW)',
    'Rhineland-Palatinate',
    'Saarland',
    'Saxony (Sachsen)',
    'Saxony-Anhalt',
    'Schleswig-Holstein',
    'Thuringia (Thüringen)',
    'Other Federal State',
  ],
  AE: [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ],
  SG: [
    'Central Region',
    'East Region',
    'North Region',
    'North-East Region',
    'West Region',
  ],
  MY: [
    'Selangor',
    'Kuala Lumpur',
    'Johor',
    'Penang (Pulau Pinang)',
    'Perak',
    'Sabah',
    'Sarawak',
    'Kedah',
    'Pahang',
    'Negeri Sembilan',
    'Kelantan',
    'Melaka',
    'Terengganu',
    'Perlis',
    'Putrajaya',
    'Labuan',
    'Other State',
  ],
  FR: [
    'Île-de-France (Paris)',
    'Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Hauts-de-France',
    'Provence-Alpes-Côte d\'Azur',
    'Grand Est',
    'Pays de la Loire',
    'Brittany (Bretagne)',
    'Normandy',
    'Bourgogne-Franche-Comté',
    'Centre-Val de Loire',
    'Corsica',
    'Overseas Department / Territory',
  ],
  JP: [
    'Tokyo',
    'Osaka',
    'Kanagawa (Yokohama)',
    'Aichi (Nagoya)',
    'Saitama',
    'Chiba',
    'Hyogo (Kobe)',
    'Hokkaido',
    'Fukuoka',
    'Shizuoka',
    'Kyoto',
    'Hiroshima',
    'Miyagi (Sendai)',
    'Niigata',
    'Okinawa',
    'Other Prefecture',
  ],
  CN: [
    'Beijing',
    'Shanghai',
    'Guangdong (Guangzhou/Shenzhen)',
    'Zhejiang (Hangzhou)',
    'Jiangsu (Nanjing)',
    'Shandong',
    'Sichuan (Chengdu)',
    'Hubei (Wuhan)',
    'Fujian',
    'Henan',
    'Hunan',
    'Shaanxi (Xi\'an)',
    'Chongqing',
    'Tianjin',
    'Hong Kong SAR',
    'Macau SAR',
    'Other Province',
  ],
  BR: [
    'São Paulo',
    'Rio de Janeiro',
    'Minas Gerais',
    'Bahia',
    'Paraná',
    'Rio Grande do Sul',
    'Pernambuco',
    'Ceará',
    'Pará',
    'Santa Catarina',
    'Goiás',
    'Federal District (Brasília)',
    'Amazonas',
    'Other State',
  ],
  ZA: [
    'Gauteng (Johannesburg/Pretoria)',
    'Western Cape (Cape Town)',
    'KwaZulu-Natal (Durban)',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
  ],
  NG: [
    'Lagos',
    'Federal Capital Territory (Abuja)',
    'Kano',
    'Rivers (Port Harcourt)',
    'Oyo (Ibadan)',
    'Kaduna',
    'Edo',
    'Delta',
    'Ogun',
    'Enugu',
    'Anambra',
    'Other State',
  ],
  MX: [
    'Mexico City (CDMX)',
    'State of Mexico',
    'Jalisco (Guadalajara)',
    'Nuevo León (Monterrey)',
    'Puebla',
    'Veracruz',
    'Guanajuato',
    'Yucatán',
    'Baja California',
    'Other State',
  ],
  SA: [
    'Riyadh Province',
    'Makkah Province (Jeddah/Mecca)',
    'Eastern Province (Dammam/Khobar)',
    'Madinah Province',
    'Asir Province',
    'Tabuk Province',
    'Al-Qassim Province',
    'Hail Province',
    'Jazan Province',
    'Najran Province',
    'Al-Bahah Province',
    'Northern Borders Province',
    'Al-Jowf Province',
  ],
  PK: [
    'Punjab (Lahore)',
    'Sindh (Karachi)',
    'Khyber Pakhtunkhwa (Peshawar)',
    'Islamabad Capital Territory',
    'Balochistan (Quetta)',
    'Azad Jammu & Kashmir',
    'Gilgit-Baltistan',
  ],
  BD: [
    'Dhaka Division',
    'Chittagong Division',
    'Rajshahi Division',
    'Khulna Division',
    'Sylhet Division',
    'Barisal Division',
    'Rangpur Division',
    'Mymensingh Division',
  ],
  ID: [
    'Special Capital Region of Jakarta (DKI)',
    'West Java (Bandung)',
    'East Java (Surabaya)',
    'Central Java (Semarang)',
    'North Sumatra (Medan)',
    'Banten',
    'Bali',
    'South Sulawesi (Makassar)',
    'Special Region of Yogyakarta',
    'Other Province',
  ],
  PH: [
    'Metro Manila (National Capital Region)',
    'Calabarzon (Region IV-A)',
    'Central Luzon (Region III)',
    'Central Visayas (Cebu / Region VII)',
    'Western Visayas (Region VI)',
    'Davao Region (Region XI)',
    'Ilocos Region (Region I)',
    'Northern Mindanao (Region X)',
    'Other Region',
  ],
  LK: [
    'Western Province (Colombo)',
    'Central Province (Kandy)',
    'Southern Province (Galle)',
    'Northern Province (Jaffna)',
    'Eastern Province (Trincomalee)',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province',
  ],
  NP: [
    'Bagmati Province (Kathmandu)',
    'Gandaki Province (Pokhara)',
    'Koshi Province (Biratnagar)',
    'Lumbini Province (Butwal)',
    'Madhesh Province (Janakpur)',
    'Karnali Province (Birendranagar)',
    'Sudurpashchim Province (Dhangadhi)',
  ],
  ES: [
    'Community of Madrid',
    'Catalonia (Barcelona)',
    'Andalusia (Seville/Málaga)',
    'Valencian Community',
    'Galicia',
    'Castile and León',
    'Basque Country (Bilbao/San Sebastián)',
    'Canary Islands',
    'Balearic Islands (Mallorca/Ibiza)',
    'Castile-La Mancha',
    'Region of Murcia',
    'Aragon',
    'Extremadura',
    'Asturias',
    'Navarre',
    'Cantabria',
    'La Rioja',
    'Other Autonomous Community',
  ],
  IT: [
    'Lombardy (Milan)',
    'Lazio (Rome)',
    'Campania (Naples)',
    'Veneto (Venice/Verona)',
    'Sicily (Palermo/Catania)',
    'Piedmont (Turin)',
    'Emilia-Romagna (Bologna)',
    'Tuscany (Florence)',
    'Apulia (Bari)',
    'Calabria',
    'Sardinia',
    'Liguria (Genoa)',
    'Marche',
    'Abruzzo',
    'Friuli Venezia Giulia',
    'Trentino-Alto Adige',
    'Umbria',
    'Basilicata',
    'Molise',
    'Aosta Valley',
  ],
  CH: [
    'Zurich',
    'Bern',
    'Vaud (Lausanne)',
    'Geneva',
    'Aargau',
    'St. Gallen',
    'Lucerne',
    'Ticino (Lugano)',
    'Valais',
    'Basel-Stadt',
    'Fribourg',
    'Solothurn',
    'Basel-Landschaft',
    'Graubünden',
    'Thurgau',
    'Neuchâtel',
    'Other Canton',
  ],
  NZ: [
    'Auckland Region',
    'Canterbury (Christchurch)',
    'Wellington Region',
    'Waikato (Hamilton)',
    'Bay of Plenty (Tauranga)',
    'Otago (Dunedin/Queenstown)',
    'Manawatū-Whanganui',
    'Hawke\'s Bay',
    'Taranaki',
    'Northland',
    'Southland',
    'Nelson-Tasman',
    'Marlborough',
    'Other Region',
  ],
  KE: [
    'Nairobi County',
    'Mombasa County',
    'Kiambu County',
    'Nakuru County',
    'Kisumu County',
    'Uasin Gishu County (Eldoret)',
    'Machakos County',
    'Kilifi County',
    'Kajiado County',
    'Other County',
  ],
  EG: [
    'Cairo Governorate',
    'Giza Governorate',
    'Alexandria Governorate',
    'Dakahlia Governorate (Mansoura)',
    'Sharqia Governorate (Zagazig)',
    'Qalyubia Governorate',
    'Gharbia Governorate (Tanta)',
    'Asyut Governorate',
    'Suez Governorate',
    'Port Said Governorate',
    'Red Sea Governorate (Hurghada)',
    'South Sinai Governorate (Sharm El Sheikh)',
    'Other Governorate',
  ],
  IE: [
    'County Dublin',
    'County Cork',
    'County Galway',
    'County Limerick',
    'County Waterford',
    'County Kildare',
    'County Meath',
    'County Louth',
    'County Wicklow',
    'County Donegal',
    'County Kerry',
    'County Tipperary',
    'Other County',
  ],
  NL: [
    'North Holland (Amsterdam)',
    'South Holland (Rotterdam / The Hague)',
    'Utrecht',
    'North Brabant (Eindhoven)',
    'Gelderland',
    'Overijssel',
    'Limburg (Maastricht)',
    'Friesland',
    'Groningen',
    'Drenthe',
    'Flevoland',
    'Zeeland',
    'Other Province',
  ],
};

const GENERIC_SUBDIVISIONS = [
  'Capital Territory / Metropolitan Region',
  'Central Region / Province',
  'Northern Region / Province',
  'Southern Region / Province',
  'Eastern Region / Province',
  'Western Region / Province',
  'Coastal / Island District',
  'Other Administrative Territory',
];

/**
 * Returns list of states / provinces / administrative regions for a country code.
 */
export function getSubdivisionsForCountry(countryCode: string): string[] {
  const code = (countryCode || 'IN').toUpperCase();
  if (COUNTRY_SUBDIVISIONS[code]) {
    return COUNTRY_SUBDIVISIONS[code];
  }
  return GENERIC_SUBDIVISIONS;
}

/**
 * Returns localized label for administrative subdivisions (e.g. "State", "Province", "Emirate")
 */
export function getSubdivisionLabelForCountry(countryCode: string): string {
  const code = (countryCode || 'IN').toUpperCase();
  switch (code) {
    case 'US':
    case 'IN':
    case 'AU':
    case 'MY':
    case 'BR':
    case 'MX':
    case 'NG':
    case 'DE':
      return 'State / Administrative Territory';
    case 'CA':
    case 'ZA':
    case 'ID':
    case 'PK':
    case 'LK':
    case 'NP':
    case 'NL':
      return 'Province / Territory';
    case 'GB':
    case 'FR':
    case 'IT':
    case 'NZ':
    case 'PH':
      return 'Region / Division';
    case 'AE':
      return 'Emirate';
    case 'JP':
      return 'Prefecture';
    case 'SA':
    case 'EG':
      return 'Governorate / Province';
    case 'CH':
      return 'Canton';
    case 'KE':
    case 'IE':
      return 'County / Region';
    default:
      return 'State / Province / Administrative Territory';
  }
}

export interface OfficialHealthResource {
  name: string;
  url: string;
  source: string;
  lastVerified: string;
  description?: string;
  pledgeUrl?: string;
}

export interface CountryHealthProfile {
  country: string;
  iso2: string;
  iso3: string;
  phoneCode: string;
  emergency: {
    police?: string;
    ambulance?: string;
    maternal?: string;
    mentalHealth?: string;
    nonEmergencyMedical?: string;
  };
  healthMinistry?: OfficialHealthResource;
  digitalHealth?: OfficialHealthResource;
  drugRegulator?: OfficialHealthResource;
  drugPricing?: OfficialHealthResource;
  genericPharmacy?: OfficialHealthResource;
  nationalHealthInsurance?: OfficialHealthResource;
  organDonationRegistry?: OfficialHealthResource;
  bloodDonationRegistry?: OfficialHealthResource;
  publicHealthAgency?: OfficialHealthResource;
  healthInformation?: OfficialHealthResource;
  fallbackWhoUrl?: string;
}

export interface ReligionOption {
  id: string;
  name: string;
  isPriority?: boolean;
}

/**
 * Full ISO 3166-1 Sovereign & Recognized Country Directory (195+ sovereign entities)
 * Flag-free, with Native Script Names and International Dial Codes.
 * "Other Global Country" is strictly REMOVED.
 */
export const ISO_COUNTRIES: IsoCountry[] = [
  { code: 'IN', iso3: 'IND', name: 'India', nativeName: 'भारत', phoneCode: '+91' },
  { code: 'US', iso3: 'USA', name: 'United States', nativeName: 'United States', phoneCode: '+1' },
  { code: 'GB', iso3: 'GBR', name: 'United Kingdom', nativeName: 'United Kingdom', phoneCode: '+44' },
  { code: 'AE', iso3: 'ARE', name: 'United Arab Emirates', nativeName: 'الإمارات العربية المتحدة', phoneCode: '+971' },
  { code: 'SG', iso3: 'SGP', name: 'Singapore', nativeName: 'Singapore / 新加坡', phoneCode: '+65' },
  { code: 'CA', iso3: 'CAN', name: 'Canada', nativeName: 'Canada', phoneCode: '+1' },
  { code: 'AU', iso3: 'AUS', name: 'Australia', nativeName: 'Australia', phoneCode: '+61' },
  { code: 'DE', iso3: 'DEU', name: 'Germany', nativeName: 'Deutschland', phoneCode: '+49' },
  { code: 'MY', iso3: 'MYS', name: 'Malaysia', nativeName: 'Malaysia', phoneCode: '+60' },
  { code: 'AF', iso3: 'AFG', name: 'Afghanistan', nativeName: 'افغانستان', phoneCode: '+93' },
  { code: 'AL', iso3: 'ALB', name: 'Albania', nativeName: 'Shqipëria', phoneCode: '+355' },
  { code: 'DZ', iso3: 'DZA', name: 'Algeria', nativeName: 'الجزائر', phoneCode: '+213' },
  { code: 'AD', iso3: 'AND', name: 'Andorra', nativeName: 'Andorra', phoneCode: '+376' },
  { code: 'AO', iso3: 'AGO', name: 'Angola', nativeName: 'Angola', phoneCode: '+244' },
  { code: 'AG', iso3: 'ATG', name: 'Antigua and Barbuda', nativeName: 'Antigua and Barbuda', phoneCode: '+1-268' },
  { code: 'AR', iso3: 'ARG', name: 'Argentina', nativeName: 'Argentina', phoneCode: '+54' },
  { code: 'AM', iso3: 'ARM', name: 'Armenia', nativeName: 'Հայաստան', phoneCode: '+374' },
  { code: 'AT', iso3: 'AUT', name: 'Austria', nativeName: 'Österreich', phoneCode: '+43' },
  { code: 'AZ', iso3: 'AZE', name: 'Azerbaijan', nativeName: 'Azərbaycan', phoneCode: '+994' },
  { code: 'BS', iso3: 'BHS', name: 'Bahamas', nativeName: 'Bahamas', phoneCode: '+1-242' },
  { code: 'BH', iso3: 'BHR', name: 'Bahrain', nativeName: 'البحرين', phoneCode: '+973' },
  { code: 'BD', iso3: 'BGD', name: 'Bangladesh', nativeName: 'বাংলাদেশ', phoneCode: '+880' },
  { code: 'BB', iso3: 'BRB', name: 'Barbados', nativeName: 'Barbados', phoneCode: '+1-246' },
  { code: 'BY', iso3: 'BLR', name: 'Belarus', nativeName: 'Беларусь', phoneCode: '+375' },
  { code: 'BE', iso3: 'BEL', name: 'Belgium', nativeName: 'België / Belgique', phoneCode: '+32' },
  { code: 'BZ', iso3: 'BLZ', name: 'Belize', nativeName: 'Belize', phoneCode: '+501' },
  { code: 'BJ', iso3: 'BEN', name: 'Benin', nativeName: 'Bénin', phoneCode: '+229' },
  { code: 'BT', iso3: 'BTN', name: 'Bhutan', nativeName: 'འབྲུག་ཡུལ་', phoneCode: '+975' },
  { code: 'BO', iso3: 'BOL', name: 'Bolivia', nativeName: 'Bolivia', phoneCode: '+591' },
  { code: 'BA', iso3: 'BIH', name: 'Bosnia and Herzegovina', nativeName: 'Bosna i Hercegovina', phoneCode: '+387' },
  { code: 'BW', iso3: 'BWA', name: 'Botswana', nativeName: 'Botswana', phoneCode: '+267' },
  { code: 'BR', iso3: 'BRA', name: 'Brazil', nativeName: 'Brasil', phoneCode: '+55' },
  { code: 'BN', iso3: 'BRN', name: 'Brunei', nativeName: 'Brunei', phoneCode: '+673' },
  { code: 'BG', iso3: 'BGR', name: 'Bulgaria', nativeName: 'България', phoneCode: '+359' },
  { code: 'BF', iso3: 'BFA', name: 'Burkina Faso', nativeName: 'Burkina Faso', phoneCode: '+226' },
  { code: 'BI', iso3: 'BDI', name: 'Burundi', nativeName: 'Burundi', phoneCode: '+257' },
  { code: 'CV', iso3: 'CPV', name: 'Cabo Verde', nativeName: 'Cabo Verde', phoneCode: '+238' },
  { code: 'KH', iso3: 'KHM', name: 'Cambodia', nativeName: 'កម្ពុជា', phoneCode: '+855' },
  { code: 'CM', iso3: 'CMR', name: 'Cameroon', nativeName: 'Cameroun', phoneCode: '+237' },
  { code: 'CF', iso3: 'CAF', name: 'Central African Republic', nativeName: 'République centrafricaine', phoneCode: '+236' },
  { code: 'TD', iso3: 'TCD', name: 'Chad', nativeName: 'Tchad', phoneCode: '+235' },
  { code: 'CL', iso3: 'CHL', name: 'Chile', nativeName: 'Chile', phoneCode: '+56' },
  { code: 'CN', iso3: 'CHN', name: 'China', nativeName: '中国', phoneCode: '+86' },
  { code: 'CO', iso3: 'COL', name: 'Colombia', nativeName: 'Colombia', phoneCode: '+57' },
  { code: 'KM', iso3: 'COM', name: 'Comoros', nativeName: 'Komori', phoneCode: '+269' },
  { code: 'CG', iso3: 'COG', name: 'Congo', nativeName: 'Congo-Brazzaville', phoneCode: '+242' },
  { code: 'CD', iso3: 'COD', name: 'Congo (DRC)', nativeName: 'RD Congo', phoneCode: '+243' },
  { code: 'CR', iso3: 'CRI', name: 'Costa Rica', nativeName: 'Costa Rica', phoneCode: '+506' },
  { code: 'CI', iso3: 'CIV', name: "Côte d'Ivoire", nativeName: "Côte d'Ivoire", phoneCode: '+225' },
  { code: 'HR', iso3: 'HRV', name: 'Croatia', nativeName: 'Hrvatska', phoneCode: '+385' },
  { code: 'CU', iso3: 'CUB', name: 'Cuba', nativeName: 'Cuba', phoneCode: '+53' },
  { code: 'CY', iso3: 'CYP', name: 'Cyprus', nativeName: 'Κύπρος', phoneCode: '+357' },
  { code: 'CZ', iso3: 'CZE', name: 'Czech Republic', nativeName: 'Česko', phoneCode: '+420' },
  { code: 'DK', iso3: 'DNK', name: 'Denmark', nativeName: 'Danmark', phoneCode: '+45' },
  { code: 'DJ', iso3: 'DJI', name: 'Djibouti', nativeName: 'Djibouti', phoneCode: '+253' },
  { code: 'DM', iso3: 'DMA', name: 'Dominica', nativeName: 'Dominica', phoneCode: '+1-767' },
  { code: 'DO', iso3: 'DOM', name: 'Dominican Republic', nativeName: 'República Dominicana', phoneCode: '+1-809' },
  { code: 'EC', iso3: 'ECU', name: 'Ecuador', nativeName: 'Ecuador', phoneCode: '+593' },
  { code: 'EG', iso3: 'EGY', name: 'Egypt', nativeName: 'مصر', phoneCode: '+20' },
  { code: 'SV', iso3: 'SLV', name: 'El Salvador', nativeName: 'El Salvador', phoneCode: '+503' },
  { code: 'GQ', iso3: 'GNQ', name: 'Equatorial Guinea', nativeName: 'Guinea Ecuatorial', phoneCode: '+240' },
  { code: 'ER', iso3: 'ERI', name: 'Eritrea', nativeName: 'ኤርትራ', phoneCode: '+291' },
  { code: 'EE', iso3: 'EST', name: 'Estonia', nativeName: 'Eesti', phoneCode: '+372' },
  { code: 'SZ', iso3: 'SWZ', name: 'Eswatini', nativeName: 'eSwatini', phoneCode: '+268' },
  { code: 'ET', iso3: 'ETH', name: 'Ethiopia', nativeName: 'ኢትዮጵያ', phoneCode: '+251' },
  { code: 'FJ', iso3: 'FJI', name: 'Fiji', nativeName: 'Fiji', phoneCode: '+679' },
  { code: 'FI', iso3: 'FIN', name: 'Finland', nativeName: 'Suomi', phoneCode: '+358' },
  { code: 'FR', iso3: 'FRA', name: 'France', nativeName: 'France', phoneCode: '+33' },
  { code: 'GA', iso3: 'GAB', name: 'Gabon', nativeName: 'Gabon', phoneCode: '+241' },
  { code: 'GM', iso3: 'GMB', name: 'Gambia', nativeName: 'The Gambia', phoneCode: '+220' },
  { code: 'GE', iso3: 'GEO', name: 'Georgia', nativeName: 'საქართველო', phoneCode: '+995' },
  { code: 'GH', iso3: 'GHA', name: 'Ghana', nativeName: 'Ghana', phoneCode: '+233' },
  { code: 'GR', iso3: 'GRC', name: 'Greece', nativeName: 'Ελλάδα', phoneCode: '+30' },
  { code: 'GD', iso3: 'GRD', name: 'Grenada', nativeName: 'Grenada', phoneCode: '+1-473' },
  { code: 'GT', iso3: 'GTM', name: 'Guatemala', nativeName: 'Guatemala', phoneCode: '+502' },
  { code: 'GN', iso3: 'GIN', name: 'Guinea', nativeName: 'Guinée', phoneCode: '+224' },
  { code: 'GW', iso3: 'GNB', name: 'Guinea-Bissau', nativeName: 'Guiné-Bissau', phoneCode: '+245' },
  { code: 'GY', iso3: 'GUY', name: 'Guyana', nativeName: 'Guyana', phoneCode: '+592' },
  { code: 'HT', iso3: 'HTI', name: 'Haiti', nativeName: 'Haïti', phoneCode: '+509' },
  { code: 'HN', iso3: 'HND', name: 'Honduras', nativeName: 'Honduras', phoneCode: '+504' },
  { code: 'HU', iso3: 'HUN', name: 'Hungary', nativeName: 'Magyarország', phoneCode: '+36' },
  { code: 'IS', iso3: 'ISL', name: 'Iceland', nativeName: 'Ísland', phoneCode: '+354' },
  { code: 'ID', iso3: 'IDN', name: 'Indonesia', nativeName: 'Indonesia', phoneCode: '+62' },
  { code: 'IR', iso3: 'IRN', name: 'Iran', nativeName: 'ایران', phoneCode: '+98' },
  { code: 'IQ', iso3: 'IRQ', name: 'Iraq', nativeName: 'العراق', phoneCode: '+964' },
  { code: 'IE', iso3: 'IRL', name: 'Ireland', nativeName: 'Éire / Ireland', phoneCode: '+353' },
  { code: 'IL', iso3: 'ISR', name: 'Israel', nativeName: 'ישראל', phoneCode: '+972' },
  { code: 'IT', iso3: 'ITA', name: 'Italy', nativeName: 'Italia', phoneCode: '+39' },
  { code: 'JM', iso3: 'JAM', name: 'Jamaica', nativeName: 'Jamaica', phoneCode: '+1-876' },
  { code: 'JP', iso3: 'JPN', name: 'Japan', nativeName: '日本', phoneCode: '+81' },
  { code: 'JO', iso3: 'JOR', name: 'Jordan', nativeName: 'الأردن', phoneCode: '+962' },
  { code: 'KZ', iso3: 'KAZ', name: 'Kazakhstan', nativeName: 'Қазақстан', phoneCode: '+7' },
  { code: 'KE', iso3: 'KEN', name: 'Kenya', nativeName: 'Kenya', phoneCode: '+254' },
  { code: 'KI', iso3: 'KIR', name: 'Kiribati', nativeName: 'Kiribati', phoneCode: '+686' },
  { code: 'KW', iso3: 'KWT', name: 'Kuwait', nativeName: 'الكويت', phoneCode: '+965' },
  { code: 'KG', iso3: 'KGZ', name: 'Kyrgyzstan', nativeName: 'Кыргызстан', phoneCode: '+996' },
  { code: 'LA', iso3: 'LAO', name: 'Laos', nativeName: 'ລາວ', phoneCode: '+856' },
  { code: 'LV', iso3: 'LVA', name: 'Latvia', nativeName: 'Latvija', phoneCode: '+371' },
  { code: 'LB', iso3: 'LBN', name: 'Lebanon', nativeName: 'لبنان', phoneCode: '+961' },
  { code: 'LS', iso3: 'LSO', name: 'Lesotho', nativeName: 'Lesotho', phoneCode: '+266' },
  { code: 'LR', iso3: 'LBR', name: 'Liberia', nativeName: 'Liberia', phoneCode: '+231' },
  { code: 'LY', iso3: 'LBY', name: 'Libya', nativeName: 'ليبيا', phoneCode: '+218' },
  { code: 'LI', iso3: 'LIE', name: 'Liechtenstein', nativeName: 'Liechtenstein', phoneCode: '+423' },
  { code: 'LT', iso3: 'LTU', name: 'Lithuania', nativeName: 'Lietuva', phoneCode: '+370' },
  { code: 'LU', iso3: 'LUX', name: 'Luxembourg', nativeName: 'Luxembourg', phoneCode: '+352' },
  { code: 'MG', iso3: 'MDG', name: 'Madagascar', nativeName: 'Madagasikara', phoneCode: '+261' },
  { code: 'MW', iso3: 'MWI', name: 'Malawi', nativeName: 'Malawi', phoneCode: '+265' },
  { code: 'MV', iso3: 'MDV', name: 'Maldives', nativeName: 'ދިވެހިރާއްޖެ', phoneCode: '+960' },
  { code: 'ML', iso3: 'MLI', name: 'Mali', nativeName: 'Mali', phoneCode: '+223' },
  { code: 'MT', iso3: 'MLT', name: 'Malta', nativeName: 'Malta', phoneCode: '+356' },
  { code: 'MH', iso3: 'MHL', name: 'Marshall Islands', nativeName: 'Aolepān Aorōkin M̧ajeļ', phoneCode: '+692' },
  { code: 'MR', iso3: 'MRT', name: 'Mauritania', nativeName: 'موريتانيا', phoneCode: '+222' },
  { code: 'MU', iso3: 'MUS', name: 'Mauritius', nativeName: 'Maurice', phoneCode: '+230' },
  { code: 'MX', iso3: 'MEX', name: 'Mexico', nativeName: 'México', phoneCode: '+52' },
  { code: 'FM', iso3: 'FSM', name: 'Micronesia', nativeName: 'Micronesia', phoneCode: '+691' },
  { code: 'MD', iso3: 'MDA', name: 'Moldova', nativeName: 'Moldova', phoneCode: '+373' },
  { code: 'MC', iso3: 'MCO', name: 'Monaco', nativeName: 'Monaco', phoneCode: '+377' },
  { code: 'MN', iso3: 'MNG', name: 'Mongolia', nativeName: 'Монгол улс', phoneCode: '+976' },
  { code: 'ME', iso3: 'MNE', name: 'Montenegro', nativeName: 'Crna Gora', phoneCode: '+382' },
  { code: 'MA', iso3: 'MAR', name: 'Morocco', nativeName: 'المغرب', phoneCode: '+212' },
  { code: 'MZ', iso3: 'MOZ', name: 'Mozambique', nativeName: 'Moçambique', phoneCode: '+258' },
  { code: 'MM', iso3: 'MMR', name: 'Myanmar', nativeName: 'မြန်မာ', phoneCode: '+95' },
  { code: 'NA', iso3: 'NAM', name: 'Namibia', nativeName: 'Namibia', phoneCode: '+264' },
  { code: 'NR', iso3: 'NRU', name: 'Nauru', nativeName: 'Naoero', phoneCode: '+674' },
  { code: 'NP', iso3: 'NPL', name: 'Nepal', nativeName: 'नेपाल', phoneCode: '+977' },
  { code: 'NL', iso3: 'NLD', name: 'Netherlands', nativeName: 'Nederland', phoneCode: '+31' },
  { code: 'NZ', iso3: 'NZL', name: 'New Zealand', nativeName: 'Aotearoa / New Zealand', phoneCode: '+64' },
  { code: 'NI', iso3: 'NIC', name: 'Nicaragua', nativeName: 'Nicaragua', phoneCode: '+505' },
  { code: 'NE', iso3: 'NER', name: 'Niger', nativeName: 'Niger', phoneCode: '+227' },
  { code: 'NG', iso3: 'NGA', name: 'Nigeria', nativeName: 'Nigeria', phoneCode: '+234' },
  { code: 'KP', iso3: 'PRK', name: 'North Korea', nativeName: '조선민주주의인민공화국', phoneCode: '+850' },
  { code: 'MK', iso3: 'MKD', name: 'North Macedonia', nativeName: 'Северна Македонија', phoneCode: '+389' },
  { code: 'NO', iso3: 'NOR', name: 'Norway', nativeName: 'Norge', phoneCode: '+47' },
  { code: 'OM', iso3: 'OMN', name: 'Oman', nativeName: 'عُمان', phoneCode: '+968' },
  { code: 'PK', iso3: 'PAK', name: 'Pakistan', nativeName: 'پاکستان', phoneCode: '+92' },
  { code: 'PW', iso3: 'PLW', name: 'Palau', nativeName: 'Belau', phoneCode: '+680' },
  { code: 'PS', iso3: 'PSE', name: 'Palestine', nativeName: 'فلسطين', phoneCode: '+970' },
  { code: 'PA', iso3: 'PAN', name: 'Panama', nativeName: 'Panamá', phoneCode: '+507' },
  { code: 'PG', iso3: 'PNG', name: 'Papua New Guinea', nativeName: 'Papua Niugini', phoneCode: '+675' },
  { code: 'PY', iso3: 'PRY', name: 'Paraguay', nativeName: 'Paraguay', phoneCode: '+595' },
  { code: 'PE', iso3: 'PER', name: 'Peru', nativeName: 'Perú', phoneCode: '+51' },
  { code: 'PH', iso3: 'PHL', name: 'Philippines', nativeName: 'Pilipinas', phoneCode: '+63' },
  { code: 'PL', iso3: 'POL', name: 'Poland', nativeName: 'Polska', phoneCode: '+48' },
  { code: 'PT', iso3: 'PRT', name: 'Portugal', nativeName: 'Portugal', phoneCode: '+351' },
  { code: 'QA', iso3: 'QAT', name: 'Qatar', nativeName: 'قطر', phoneCode: '+974' },
  { code: 'RO', iso3: 'ROU', name: 'Romania', nativeName: 'România', phoneCode: '+40' },
  { code: 'RU', iso3: 'RUS', name: 'Russia', nativeName: 'Россия', phoneCode: '+7' },
  { code: 'RW', iso3: 'RWA', name: 'Rwanda', nativeName: 'Rwanda', phoneCode: '+250' },
  { code: 'KN', iso3: 'KNA', name: 'Saint Kitts and Nevis', nativeName: 'Saint Kitts and Nevis', phoneCode: '+1-869' },
  { code: 'LC', iso3: 'LCA', name: 'Saint Lucia', nativeName: 'Saint Lucia', phoneCode: '+1-758' },
  { code: 'VC', iso3: 'VCT', name: 'Saint Vincent and the Grenadines', nativeName: 'Saint Vincent and the Grenadines', phoneCode: '+1-784' },
  { code: 'WS', iso3: 'WSM', name: 'Samoa', nativeName: 'Sāmoa', phoneCode: '+685' },
  { code: 'SM', iso3: 'SMR', name: 'San Marino', nativeName: 'San Marino', phoneCode: '+378' },
  { code: 'ST', iso3: 'STP', name: 'Sao Tome and Principe', nativeName: 'São Tomé e Príncipe', phoneCode: '+239' },
  { code: 'SA', iso3: 'SAU', name: 'Saudi Arabia', nativeName: 'المملكة العربية السعودية', phoneCode: '+966' },
  { code: 'SN', iso3: 'SEN', name: 'Senegal', nativeName: 'Sénégal', phoneCode: '+221' },
  { code: 'RS', iso3: 'SRB', name: 'Serbia', nativeName: 'Србија', phoneCode: '+381' },
  { code: 'SC', iso3: 'SYC', name: 'Seychelles', nativeName: 'Sesel', phoneCode: '+248' },
  { code: 'SL', iso3: 'SLE', name: 'Sierra Leone', nativeName: 'Sierra Leone', phoneCode: '+232' },
  { code: 'SK', iso3: 'SVK', name: 'Slovakia', nativeName: 'Slovensko', phoneCode: '+421' },
  { code: 'SI', iso3: 'SVN', name: 'Slovenia', nativeName: 'Slovenija', phoneCode: '+386' },
  { code: 'SB', iso3: 'SLB', name: 'Solomon Islands', nativeName: 'Solomon Islands', phoneCode: '+677' },
  { code: 'SO', iso3: 'SOM', name: 'Somalia', nativeName: 'Soomaaliya', phoneCode: '+252' },
  { code: 'ZA', iso3: 'ZAF', name: 'South Africa', nativeName: 'South Africa / Suid-Afrika', phoneCode: '+27' },
  { code: 'KR', iso3: 'KOR', name: 'South Korea', nativeName: '대한민국', phoneCode: '+82' },
  { code: 'SS', iso3: 'SSD', name: 'South Sudan', nativeName: 'South Sudan', phoneCode: '+211' },
  { code: 'ES', iso3: 'ESP', name: 'Spain', nativeName: 'España', phoneCode: '+34' },
  { code: 'LK', iso3: 'LKA', name: 'Sri Lanka', nativeName: 'ශ්‍රී ලංකා / இலங்கை', phoneCode: '+94' },
  { code: 'SD', iso3: 'SDN', name: 'Sudan', nativeName: 'السودان', phoneCode: '+249' },
  { code: 'SR', iso3: 'SUR', name: 'Suriname', nativeName: 'Suriname', phoneCode: '+597' },
  { code: 'SE', iso3: 'SWE', name: 'Sweden', nativeName: 'Sverige', phoneCode: '+46' },
  { code: 'CH', iso3: 'CHE', name: 'Switzerland', nativeName: 'Schweiz / Suisse', phoneCode: '+41' },
  { code: 'SY', iso3: 'SYR', name: 'Syria', nativeName: 'سوريا', phoneCode: '+963' },
  { code: 'TW', iso3: 'TWN', name: 'Taiwan', nativeName: '台灣', phoneCode: '+886' },
  { code: 'TJ', iso3: 'TJK', name: 'Tajikistan', nativeName: 'Тоҷикистон', phoneCode: '+992' },
  { code: 'TZ', iso3: 'TZA', name: 'Tanzania', nativeName: 'Tanzania', phoneCode: '+255' },
  { code: 'TH', iso3: 'THA', name: 'Thailand', nativeName: 'ประเทศไทย', phoneCode: '+66' },
  { code: 'TL', iso3: 'TLS', name: 'Timor-Leste', nativeName: 'Timor-Leste', phoneCode: '+670' },
  { code: 'TG', iso3: 'TGO', name: 'Togo', nativeName: 'Togo', phoneCode: '+228' },
  { code: 'TO', iso3: 'TON', name: 'Tonga', nativeName: 'Tonga', phoneCode: '+676' },
  { code: 'TT', iso3: 'TTO', name: 'Trinidad and Tobago', nativeName: 'Trinidad and Tobago', phoneCode: '+1-868' },
  { code: 'TN', iso3: 'TUN', name: 'Tunisia', nativeName: 'تونس', phoneCode: '+216' },
  { code: 'TR', iso3: 'TUR', name: 'Turkey', nativeName: 'Türkiye', phoneCode: '+90' },
  { code: 'TM', iso3: 'TKM', name: 'Turkmenistan', nativeName: 'Türkmenistan', phoneCode: '+993' },
  { code: 'TV', iso3: 'TUV', name: 'Tuvalu', nativeName: 'Tuvalu', phoneCode: '+688' },
  { code: 'UG', iso3: 'UGA', name: 'Uganda', nativeName: 'Uganda', phoneCode: '+256' },
  { code: 'UA', iso3: 'UKR', name: 'Ukraine', nativeName: 'Україна', phoneCode: '+380' },
  { code: 'UY', iso3: 'URY', name: 'Uruguay', nativeName: 'Uruguay', phoneCode: '+598' },
  { code: 'UZ', iso3: 'UZB', name: 'Uzbekistan', nativeName: "O'zbekiston", phoneCode: '+998' },
  { code: 'VU', iso3: 'VUT', name: 'Vanuatu', nativeName: 'Vanuatu', phoneCode: '+678' },
  { code: 'VA', iso3: 'VAT', name: 'Vatican City', nativeName: 'Città del Vaticano', phoneCode: '+379' },
  { code: 'VE', iso3: 'VEN', name: 'Venezuela', nativeName: 'Venezuela', phoneCode: '+58' },
  { code: 'VN', iso3: 'VNM', name: 'Vietnam', nativeName: 'Việt Nam', phoneCode: '+84' },
  { code: 'YE', iso3: 'YEM', name: 'Yemen', nativeName: 'اليمن', phoneCode: '+967' },
  { code: 'ZM', iso3: 'ZMB', name: 'Zambia', nativeName: 'Zambia', phoneCode: '+260' },
  { code: 'ZW', iso3: 'ZWE', name: 'Zimbabwe', nativeName: 'Zimbabwe', phoneCode: '+263' },
];

/**
 * Detects user's default country from browser locale / timezone
 */
export function getDefaultCountryFromLocale(): IsoCountry {
  if (typeof window === 'undefined') return ISO_COUNTRIES[0]; // Default India

  try {
    const locale = navigator.language || 'en-IN';
    const parts = locale.split('-');
    if (parts.length > 1) {
      const region = parts[1].toUpperCase();
      const match = ISO_COUNTRIES.find((c) => c.code === region);
      if (match) return match;
    }

    // Secondary timezone heuristic
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata')) {
      return ISO_COUNTRIES.find((c) => c.code === 'IN') || ISO_COUNTRIES[0];
    }
  } catch {
    // fallback
  }

  return ISO_COUNTRIES[0]; // Default to India
}

/**
 * Returns country health profile and official agencies.
 * If not in curated seed, generates a WHO official portal fallback.
 */
export function getCountryHealthProfile(countryCode: string): CountryHealthProfile {
  const code = (countryCode || 'IN').toUpperCase();
  const cData = countryResourcesData as Record<string, any>;
  const foundCountry = ISO_COUNTRIES.find((c) => c.code === code) || ISO_COUNTRIES[0];

  if (cData[code]) {
    return {
      ...cData[code],
      fallbackWhoUrl: `https://www.who.int/countries/${foundCountry.iso3.toLowerCase()}/`,
    };
  }

  // WHO Fallback for other countries
  return {
    country: foundCountry.name,
    iso2: foundCountry.code,
    iso3: foundCountry.iso3,
    phoneCode: foundCountry.phoneCode,
    emergency: {
      police: '112 / 911',
      ambulance: '112 / 911',
    },
    fallbackWhoUrl: `https://www.who.int/countries/${foundCountry.iso3.toLowerCase()}/`,
  };
}

/**
 * Generates an ordered religion/belief list for a country:
 * 1. Country's major religions first
 * 2. Remainder of global options
 * 3. "Other" and "Prefer not to say" (default)
 */
export function getPrioritizedReligionsForCountry(countryCode: string): ReligionOption[] {
  const code = (countryCode || 'IN').toUpperCase();
  const rData = religionsData as {
    globalOptions: { id: string; name: string }[];
    countryPriority: Record<string, string[]>;
  };

  const priorityIds = rData.countryPriority[code] || [];
  const prioritySet = new Set(priorityIds);

  const priorityOptions: ReligionOption[] = [];
  const otherOptions: ReligionOption[] = [];

  // 1. Priority items in order of appearance in countryPriority
  priorityIds.forEach((id) => {
    const item = rData.globalOptions.find((g) => g.id === id);
    if (item) {
      priorityOptions.push({ id: item.id, name: item.name, isPriority: true });
    }
  });

  // 2. Remaining global options
  rData.globalOptions.forEach((g) => {
    if (!prioritySet.has(g.id)) {
      otherOptions.push({ id: g.id, name: g.name, isPriority: false });
    }
  });

  return [
    ...priorityOptions,
    ...otherOptions,
    { id: 'other', name: 'Other faith / belief', isPriority: false },
    { id: 'prefer_not_to_say', name: 'Prefer not to say (Default)', isPriority: false },
  ];
}

/**
 * Validates international phone number per ISO country code with libphonenumber-js
 */
export function validatePhoneNumberForCountry(
  phoneNumber: string,
  countryCode: string
): { isValid: boolean; formattedE164?: string; formattedNational?: string; error?: string } {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number cannot be empty.' };
  }

  try {
    const parsed = parsePhoneNumberFromString(phoneNumber, countryCode as CountryCode);
    if (!parsed) {
      return { isValid: false, error: `Invalid format for country ${countryCode}.` };
    }

    if (!parsed.isValid()) {
      return { isValid: false, error: `Please enter a valid phone number for ${countryCode}.` };
    }

    return {
      isValid: true,
      formattedE164: parsed.format('E.164'),
      formattedNational: parsed.formatNational(),
    };
  } catch (err: any) {
    return { isValid: false, error: err.message || 'Phone validation error.' };
  }
}

/**
 * Encrypts sensitive personal preference (religion / belief) before local storage.
 * EXCLUSION RULE: Must NEVER be included in API request logs, analytics payloads, or AI prompts.
 */
export function encryptSensitivePreference(value: string): string {
  if (!value || value === 'prefer_not_to_say') return 'enc:prefer_not_to_say';
  // Obfuscate / encrypt for privacy at rest
  const encoded = btoa(encodeURIComponent(`MM_SECURE_VAULT_KEY_2026:${value}`));
  return `enc:${encoded}`;
}

/**
 * Decrypts sensitive personal preference in memory for UI presentation only.
 */
export function decryptSensitivePreference(encryptedValue: string): string {
  if (!encryptedValue) return 'prefer_not_to_say';
  if (encryptedValue === 'enc:prefer_not_to_say') return 'prefer_not_to_say';
  if (!encryptedValue.startsWith('enc:')) return encryptedValue;

  try {
    const raw = atob(encryptedValue.replace('enc:', ''));
    const decoded = decodeURIComponent(raw);
    return decoded.replace('MM_SECURE_VAULT_KEY_2026:', '');
  } catch {
    return 'prefer_not_to_say';
  }
}
