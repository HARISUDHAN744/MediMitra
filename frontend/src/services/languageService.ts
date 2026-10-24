import { iso6393 } from 'iso-639-3';
import { searchMedicalCondition, MedicalConditionResult } from './medicalConditions';

export type SupportLevel = 'FULL' | 'AI' | 'BASIC';

export interface LanguageDetail {
  code: string; // ISO 639-1 or 3
  isoCode3: string; // ISO 639-3
  name: string; // English Name
  nativeName: string; // Native Script
  scriptBadge: string; // Text representation of script (e.g. தமிழ், हिन्दी, Latin, العربية)
  region: 'Indian' | 'Global';
  direction: 'ltr' | 'rtl';
  supportLevel: SupportLevel; // FULL (UI translated), AI (AI explanations & voice), BASIC (Text)
  isBeta: boolean; // True for languages not yet reviewed by a native speaker
  aliases?: string[];
  flagEmoji?: string;
  isPopular?: boolean;
}

/**
 * Curated Top Registry of Indian & Global Languages with Native Names & Flags
 */
export const CURATED_LANGUAGES: LanguageDetail[] = [
  { code: "hi", isoCode3: "hin", name: "Hindi", nativeName: "हिन्दी", scriptBadge: "हिन्दी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["devanagari"] },
  { code: "en", isoCode3: "eng", name: "English", nativeName: "English", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: false, isPopular: true, aliases: ["british", "american"] },
  { code: "ta", isoCode3: "tam", name: "Tamil", nativeName: "தமிழ்", scriptBadge: "தமிழ்", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["tamil"] },
  { code: "te", isoCode3: "tel", name: "Telugu", nativeName: "తెలుగు", scriptBadge: "తెలుగు", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["telugu"] },
  { code: "bn", isoCode3: "ben", name: "Bengali", nativeName: "বাংলা", scriptBadge: "বাংলা", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["bangla"] },
  { code: "mr", isoCode3: "mar", name: "Marathi", nativeName: "मराठी", scriptBadge: "मराठी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["marathi"] },
  { code: "gu", isoCode3: "guj", name: "Gujarati", nativeName: "ગુજરાતી", scriptBadge: "ગુજરાતી", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["gujarati"] },
  { code: "kn", isoCode3: "kan", name: "Kannada", nativeName: "ಕನ್ನಡ", scriptBadge: "ಕನ್ನಡ", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["kannada"] },
  { code: "ml", isoCode3: "mal", name: "Malayalam", nativeName: "മലയാളം", scriptBadge: "മലയാളം", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["malayalam"] },
  { code: "pa", isoCode3: "pan", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", scriptBadge: "ਪੰਜਾਬੀ", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["gurmukhi"] },
  { code: "or", isoCode3: "ori", name: "Odia", nativeName: "ଓଡ଼ିଆ", scriptBadge: "ଓଡ଼ିଆ", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["oriya"] },
  { code: "as", isoCode3: "asm", name: "Assamese", nativeName: "অসমীয়া", scriptBadge: "অসমীয়া", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["axomiya"] },
  { code: "ur", isoCode3: "urd", name: "Urdu", nativeName: "اردو", scriptBadge: "اردو", region: "Indian", direction: "rtl", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["urdu"] },
  { code: "sa", isoCode3: "san", name: "Sanskrit", nativeName: "संस्कृतम्", scriptBadge: "संस्कृत", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["samskritam"] },
  { code: "ne", isoCode3: "nep", name: "Nepali", nativeName: "नेपाली", scriptBadge: "नेपाली", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["nepalese"] },
  { code: "kok", isoCode3: "kok", name: "Konkani", nativeName: "कोंकणी", scriptBadge: "कोंकणी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["goan"] },
  { code: "mai", isoCode3: "mai", name: "Maithili", nativeName: "मैथिली", scriptBadge: "मैथिली", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["mithila"] },
  { code: "sat", isoCode3: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", scriptBadge: "ᱥᱟᱱᱛᱟᱲᱤ", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["ol chiki"] },
  { code: "ks", isoCode3: "kas", name: "Kashmiri", nativeName: "کٲشُر / कॉशुर", scriptBadge: "کٲشُر", region: "Indian", direction: "rtl", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["koshur"] },
  { code: "sd", isoCode3: "snd", name: "Sindhi", nativeName: "سنڌي", scriptBadge: "سنڌي", region: "Indian", direction: "rtl", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["sindhi"] },
  { code: "doi", isoCode3: "doi", name: "Dogri", nativeName: "डोगरी", scriptBadge: "डोगरी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["duggar", "dgo"] },
  { code: "brx", isoCode3: "brx", name: "Bodo", nativeName: "बर’", scriptBadge: "बर’", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["mech"] },
  { code: "mni", isoCode3: "mni", name: "Manipuri", nativeName: "ꯃꯩꯇꯩꯂꯣꯟ", scriptBadge: "ꯃꯩꯇꯩ", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["Meitei", "মৈতৈলোন্"] },
  { code: "bho", isoCode3: "bho", name: "Bhojpuri", nativeName: "भोजपुरी", scriptBadge: "भोजपुरी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["bhojpuri"] },
  { code: "raj", isoCode3: "raj", name: "Rajasthani", nativeName: "राजस्थानी", scriptBadge: "राजस्थानी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["rajasthani"] },
  { code: "mwr", isoCode3: "mwr", name: "Marwari", nativeName: "मारवाड़ी", scriptBadge: "मारवाड़ी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["marwadi"] },
  { code: "bgc", isoCode3: "bgc", name: "Haryanvi", nativeName: "हरियाणवी", scriptBadge: "हरियाणवी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["haryanvi"] },
  { code: "hne", isoCode3: "hne", name: "Chhattisgarhi", nativeName: "छत्तीसगढ़ी", scriptBadge: "छत्तीसगढ़ी", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["chhattisgarhi"] },
  { code: "tcy", isoCode3: "tcy", name: "Tulu", nativeName: "ತುಳು", scriptBadge: "ತುಳು", region: "Indian", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: false, aliases: ["tuluva"] },
  { code: "es", isoCode3: "spa", name: "Spanish", nativeName: "Español", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["castellano", "castilian", "esp"] },
  { code: "fr", isoCode3: "fra", name: "French", nativeName: "Français", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["francais"] },
  { code: "de", isoCode3: "deu", name: "German", nativeName: "Deutsch", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["deutsch"] },
  { code: "ar", isoCode3: "ara", name: "Arabic", nativeName: "العربية", scriptBadge: "العربية", region: "Global", direction: "rtl", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["arabic"] },
  { code: "zh", isoCode3: "zho", name: "Chinese (Simplified)", nativeName: "中文 (简体)", scriptBadge: "汉字", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["mandarin", "chinese", "putonghua"] },
  { code: "ja", isoCode3: "jpn", name: "Japanese", nativeName: "日本語", scriptBadge: "漢字", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["nihongo"] },
  { code: "ru", isoCode3: "rus", name: "Russian", nativeName: "Русский", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["russkiy"] },
  { code: "pt", isoCode3: "por", name: "Portuguese", nativeName: "Português", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["portugues"] },
  { code: "it", isoCode3: "ita", name: "Italian", nativeName: "Italiano", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["italiano"] },
  { code: "ko", isoCode3: "kor", name: "Korean", nativeName: "한국어", scriptBadge: "한글", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["hangul", "korean"] },
  { code: "id", isoCode3: "ind", name: "Indonesian", nativeName: "Bahasa Indonesia", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["bahasa"] },
  { code: "tr", isoCode3: "tur", name: "Turkish", nativeName: "Türkçe", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["turkce"] },
  { code: "vi", isoCode3: "vie", name: "Vietnamese", nativeName: "Tiếng Việt", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["tieng viet"] },
  { code: "nl", isoCode3: "nld", name: "Dutch", nativeName: "Nederlands", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["flemish", "nederlands"] },
  { code: "pl", isoCode3: "pol", name: "Polish", nativeName: "Polski", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "FULL", isBeta: true, isPopular: true, aliases: ["polski"] },
  { code: "fa", isoCode3: "fas", name: "Persian (Farsi)", nativeName: "فارسی", scriptBadge: "فارسی", region: "Global", direction: "rtl", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["farsi"] },
  { code: "uk", isoCode3: "ukr", name: "Ukrainian", nativeName: "Українська", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["ukrainian"] },
  { code: "th", isoCode3: "tha", name: "Thai", nativeName: "ไทย", scriptBadge: "ไทย", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["siamese"] },
  { code: "tl", isoCode3: "tgl", name: "Tagalog / Filipino", nativeName: "Tagalog", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["filipino", "tagalog"] },
  { code: "sw", isoCode3: "swa", name: "Swahili", nativeName: "Kiswahili", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["kiswahili"] },
  { code: "he", isoCode3: "heb", name: "Hebrew", nativeName: "עברית", scriptBadge: "עברית", region: "Global", direction: "rtl", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["ivrit"] },
  { code: "el", isoCode3: "ell", name: "Greek", nativeName: "Ελληνικά", scriptBadge: "Ελληνικά", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["ellinika"] },
  { code: "sv", isoCode3: "swe", name: "Swedish", nativeName: "Svenska", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["svenska"] },
  { code: "cs", isoCode3: "ces", name: "Czech", nativeName: "Čeština", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["cestina"] },
  { code: "hu", isoCode3: "hun", name: "Hungarian", nativeName: "Magyar", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["magyar"] },
  { code: "ro", isoCode3: "ron", name: "Romanian", nativeName: "Română", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["romana"] },
  { code: "ms", isoCode3: "msa", name: "Malay", nativeName: "Bahasa Melayu", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["melayu"] },
  { code: "my", isoCode3: "mya", name: "Burmese", nativeName: "မြန်မာစာ", scriptBadge: "မြန်မာ", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["myanmar"] },
  { code: "ps", isoCode3: "pus", name: "Pashto", nativeName: "پښتو", scriptBadge: "پښتو", region: "Global", direction: "rtl", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["pakhto"] },
  { code: "da", isoCode3: "dan", name: "Danish", nativeName: "Dansk", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["dansk"] },
  { code: "fi", isoCode3: "fin", name: "Finnish", nativeName: "Suomi", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["suomi"] },
  { code: "no", isoCode3: "nor", name: "Norwegian", nativeName: "Norsk", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["norsk", "bokmal"] },
  { code: "am", isoCode3: "amh", name: "Amharic", nativeName: "አማርኛ", scriptBadge: "ግዕዝ", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["amharic"] },
  { code: "yo", isoCode3: "yor", name: "Yoruba", nativeName: "Èdè Yorùbá", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["yoruba"] },
  { code: "ha", isoCode3: "hau", name: "Hausa", nativeName: "Harshen Hausa", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["hausa"] },
  { code: "zu", isoCode3: "zul", name: "Zulu", nativeName: "isiZulu", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["isizulu"] },
  { code: "uz", isoCode3: "uzb", name: "Uzbek", nativeName: "Oʻzbekcha", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["ozbekcha"] },
  { code: "kk", isoCode3: "kaz", name: "Kazakh", nativeName: "Қазақша", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["qazaqsha"] },
  { code: "az", isoCode3: "aze", name: "Azerbaijani", nativeName: "Azərbaycan", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["azerbaijani"] },
  { code: "bg", isoCode3: "bul", name: "Bulgarian", nativeName: "Български", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["bulgarian"] },
  { code: "sr", isoCode3: "srp", name: "Serbian", nativeName: "Српски", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["srpski"] },
  { code: "hr", isoCode3: "hrv", name: "Croatian", nativeName: "Hrvatski", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["hrvatski"] },
  { code: "sk", isoCode3: "slk", name: "Slovak", nativeName: "Slovenčina", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["slovencina"] },
  { code: "lt", isoCode3: "lit", name: "Lithuanian", nativeName: "Lietuvių", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["lietuviu"] },
  { code: "lv", isoCode3: "lav", name: "Latvian", nativeName: "Latviešu", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["latviesu"] },
  { code: "et", isoCode3: "est", name: "Estonian", nativeName: "Eesti", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["eesti"] },
  { code: "sl", isoCode3: "slv", name: "Slovenian", nativeName: "Slovenščina", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["slovenscina"] },
  { code: "is", isoCode3: "isl", name: "Icelandic", nativeName: "Íslenska", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["islenska"] },
  { code: "hy", isoCode3: "hye", name: "Armenian", nativeName: "Հայերեն", scriptBadge: "Հայերեն", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["hayeren"] },
  { code: "ka", isoCode3: "kat", name: "Georgian", nativeName: "ქართული", scriptBadge: "ქართული", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["kartuli"] },
  { code: "km", isoCode3: "khm", name: "Khmer", nativeName: "ភាសាខ្មែរ", scriptBadge: "ខ្មែរ", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["cambodian"] },
  { code: "lo", isoCode3: "lao", name: "Lao", nativeName: "ພາສາລາວ", scriptBadge: "ລາວ", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["laotian"] },
  { code: "si", isoCode3: "sin", name: "Sinhala", nativeName: "සිංහල", scriptBadge: "සිංහල", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["sinhalese"] },
  { code: "dv", isoCode3: "div", name: "Dhivehi", nativeName: "ދިވެހި", scriptBadge: "ދިވެހި", region: "Global", direction: "rtl", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["maldivian"] },
  { code: "so", isoCode3: "som", name: "Somali", nativeName: "Soomaaliga", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["somali"] },
  { code: "rw", isoCode3: "kin", name: "Kinyarwanda", nativeName: "Ikinyarwanda", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["kinyarwanda"] },
  { code: "mg", isoCode3: "mlg", name: "Malagasy", nativeName: "Malagasy", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["malagasy"] },
  { code: "af", isoCode3: "afr", name: "Afrikaans", nativeName: "Afrikaans", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["afrikaans"] },
  { code: "sq", isoCode3: "sqi", name: "Albanian", nativeName: "Shqip", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["shqip"] },
  { code: "bs", isoCode3: "bos", name: "Bosnian", nativeName: "Bosanski", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["bosanski"] },
  { code: "mk", isoCode3: "mkd", name: "Macedonian", nativeName: "Македонски", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["makedonski"] },
  { code: "be", isoCode3: "bel", name: "Belarusian", nativeName: "Беларуская", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["belarusian"] },
  { code: "mn", isoCode3: "mon", name: "Mongolian", nativeName: "Монгол", scriptBadge: "Кириллица", region: "Global", direction: "ltr", supportLevel: "AI", isBeta: true, isPopular: false, aliases: ["mongolian"] },
  { code: "cy", isoCode3: "cym", name: "Welsh", nativeName: "Cymraeg", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["cymraeg"] },
  { code: "ga", isoCode3: "gle", name: "Irish", nativeName: "Gaeilge", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["gaeilge"] },
  { code: "eu", isoCode3: "eus", name: "Basque", nativeName: "Euskara", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["euskara"] },
  { code: "ca", isoCode3: "cat", name: "Catalan", nativeName: "Català", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["catala"] },
  { code: "gl", isoCode3: "glg", name: "Galician", nativeName: "Galego", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["galego"] },
  { code: "mt", isoCode3: "mlt", name: "Maltese", nativeName: "Malti", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["malti"] },
  { code: "la", isoCode3: "lat", name: "Latin", nativeName: "Latina", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["lingua latina"] },
  { code: "eo", isoCode3: "epo", name: "Esperanto", nativeName: "Esperanto", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["esperanto"] },
  { code: "jw", isoCode3: "jaw", name: "Javanese", nativeName: "Basa Jawa", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["jawa"] },
  { code: "su", isoCode3: "sun", name: "Sundanese", nativeName: "Basa Sunda", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["sunda"] },
  { code: "ceb", isoCode3: "ceb", name: "Cebuano", nativeName: "Sinugboanon", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["bisaya"] },
  { code: "sn", isoCode3: "sna", name: "Shona", nativeName: "chiShona", scriptBadge: "Latin", region: "Global", direction: "ltr", supportLevel: "BASIC", isBeta: true, isPopular: false, aliases: ["chishona"] },
];

/**
 * Canonical Map from app language code to BCP-47 speech locale.
 * Used identically for both Speech Input (SpeechRecognition) and Speech Output (SpeechSynthesis).
 */
export const LANGUAGE_TO_BCP47: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ori: 'or-IN',
  as: 'as-IN',
  asm: 'as-IN',
  ur: 'ur-IN',
  sa: 'sa-IN',
  san: 'sa-IN',
  ne: 'ne-NP',
  nep: 'ne-NP',
  kok: 'kok-IN',
  mai: 'mai-IN',
  sat: 'sat-IN',
  ks: 'ks-IN',
  kas: 'ks-IN',
  sd: 'sd-IN',
  snd: 'sd-IN',
  doi: 'doi-IN',
  brx: 'brx-IN',
  mni: 'mni-IN',
  bho: 'bho-IN',
  raj: 'hi-IN',
  mwr: 'hi-IN',
  bgc: 'hi-IN',
  hne: 'hi-IN',
  tcy: 'kn-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  ko: 'ko-KR',
  tr: 'tr-TR',
  id: 'id-ID',
  ms: 'ms-MY',
  th: 'th-TH',
  vi: 'vi-VN',
  fa: 'fa-IR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  uk: 'uk-UA',
  he: 'he-IL',
  el: 'el-GR',
  sv: 'sv-SE',
  cs: 'cs-CZ',
  hu: 'hu-HU',
  ro: 'ro-RO',
  da: 'da-DK',
  fi: 'fi-FI',
  no: 'no-NO',
  sw: 'sw-KE',
};

// Aliased for backwards compatibility across components
export const BCP47_LOCALE_MAP: Record<string, string> = LANGUAGE_TO_BCP47;

/**
 * Official OpenAI Whisper Supported Languages (ISO 639-1).
 * Whisper supports ~99 languages globally, but does NOT support all 22 Indian scheduled languages
 * (e.g. Odia, Konkani, Maithili, Santali, Dogri, Kashmiri, Bodo, Manipuri are not supported by Whisper).
 */
export const WHISPER_SUPPORTED_LANGUAGES = new Set<string>([
  'af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo', 'br', 'bs',
  'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi',
  'fo', 'fr', 'gl', 'gu', 'ha', 'haw', 'he', 'hi', 'hr', 'ht', 'hu', 'hy',
  'id', 'is', 'it', 'ja', 'jw', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb',
  'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt',
  'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru',
  'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'uk', 'ur', 'uz', 'vi',
  'yi', 'yo', 'zh'
]);

/**
 * Returns BCP-47 locale tag or 'unsupported' if language is unknown.
 * Never returns fabricated locales like 'xx-XX'.
 */
export function getLocaleForLanguage(langCode: string): string {
  if (!langCode) return 'unsupported';
  const clean = langCode.trim().toLowerCase();
  return LANGUAGE_TO_BCP47[clean] || 'unsupported';
}

export type DeviceVoiceStatus = 'Full voice' | 'Output only' | 'Input only' | 'Text only';

// Comprehensive Indian & Global voice matching keywords (native script names, English names, and engine names)
export const INDIC_VOICE_KEYWORDS: Record<string, string[]> = {
  hi: ['hindi', 'hi-in', 'hi_in', 'हिन्दी', 'हिंदी', 'kalpana', 'hemant', 'swara', 'madhur'],
  ta: ['tamil', 'ta-in', 'ta_in', 'தமிழ்', 'valluvar'],
  te: ['telugu', 'te-in', 'te_in', 'తెలుగు', 'mohan', 'chitra'],
  kn: ['kannada', 'kn-in', 'kn_in', 'ಕನ್ನಡ', 'gagan', 'sapna'],
  ml: ['malayalam', 'ml-in', 'ml_in', 'മലയാളം', 'sobhana', 'midhun'],
  bn: ['bengali', 'bangla', 'bn-in', 'bn_in', 'বাংলা', 'bashkar', 'tanishaa'],
  mr: ['marathi', 'mr-in', 'mr_in', 'मराठी', 'aarohi', 'manohar'],
  gu: ['gujarati', 'gu-in', 'gu_in', 'ગુજરાતી', 'dhwani', 'niranjan'],
  pa: ['punjabi', 'pa-in', 'pa_in', 'ਪੰਜਾਬੀ', 'raajan', 'gurmukhi'],
  or: ['odia', 'oriya', 'or-in', 'or_in', 'ori-in', 'ଓଡ଼ିଆ'],
  as: ['assamese', 'as-in', 'as_in', 'asm-in', 'অসমীয়া', 'axomiya'],
  ur: ['urdu', 'ur-in', 'ur-pk', 'ur_in', 'اردو', 'aslam', 'gul'],
  sa: ['sanskrit', 'sa-in', 'sa_in', 'san-in', 'संस्कृतम्', 'संस्कृत', 'samskritam'],
  ne: ['nepali', 'ne-np', 'ne-in', 'ne_np', 'नेपाली', 'nepalese'],
  kok: ['konkani', 'kok-in', 'kok_in', 'कोंकणी', 'goan'],
  mai: ['maithili', 'mai-in', 'mai_in', 'मैथिली', 'mithila'],
  sat: ['santali', 'sat-in', 'sat_in', 'ᱥᱟᱱᱛᱟᱲᱤ', 'ol chiki'],
  ks: ['kashmiri', 'ks-in', 'ks_in', 'kas-in', 'کٲشُر', 'कॉशुर', 'koshur'],
  sd: ['sindhi', 'sd-in', 'sd_in', 'snd-in', 'سنڌي'],
  doi: ['dogri', 'doi-in', 'doi_in', 'डोगरी', 'duggar'],
  brx: ['bodo', 'brx-in', 'brx_in', 'बर’', 'mech'],
  mni: ['manipuri', 'mni-in', 'mni_in', 'ꯃꯩꯇꯩ', 'meitei'],
  bho: ['bhojpuri', 'bho-in', 'bho_in', 'भोजपुरी'],
  raj: ['rajasthani', 'raj-in', 'राजस्थानी'],
  mwr: ['marwari', 'mwr-in', 'मारवाड़ी', 'marwadi'],
  bgc: ['haryanvi', 'bgc-in', 'हरियाणवी'],
  hne: ['chhattisgarhi', 'hne-in', 'छत्तीसगढ़ी'],
  tcy: ['tulu', 'tcy-in', 'ತುಳು', 'tuluva'],
  en: ['english', 'en-in', 'en_in', 'en-us', 'en-gb', 'heera', 'ravi', 'neerja', 'prabhat'],
};

export function getVoiceMatchingKeywords(langCode: string): string[] {
  const raw = (langCode || 'en').toLowerCase().trim();
  const canonical = LANGUAGE_ALIASES[raw] || raw;
  const list = [...(INDIC_VOICE_KEYWORDS[canonical] || INDIC_VOICE_KEYWORDS[raw] || [])];

  const curated = CURATED_LANGUAGES.find((l) => l.code === canonical || l.code === raw);
  if (curated) {
    if (curated.name) list.push(curated.name.toLowerCase());
    if (curated.nativeName) list.push(curated.nativeName.toLowerCase());
    if (curated.aliases) {
      curated.aliases.forEach((a) => list.push(a.toLowerCase()));
    }
  }
  return Array.from(new Set(list));
}

export function isSpeechOutputAvailable(langCode: string, voices?: SpeechSynthesisVoice[]): boolean {
  if (typeof window === 'undefined') return false;
  const synth = (window as any).speechSynthesis;
  if (!synth || typeof synth.getVoices !== 'function') return false;
  const voiceList = voices || synth.getVoices();
  if (!voiceList || voiceList.length === 0) return false;

  const raw = (langCode || 'en').toLowerCase().trim();
  const canonical = LANGUAGE_ALIASES[raw] || raw;
  const primaryLocale = (LANGUAGE_TO_BCP47[canonical] || LANGUAGE_TO_BCP47[raw] || '').toLowerCase();
  if (!primaryLocale || primaryLocale === 'unsupported') return false;

  const langPrefix = primaryLocale.split('-')[0];
  const keywords = getVoiceMatchingKeywords(canonical);

  return voiceList.some((v: SpeechSynthesisVoice) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    const vName = v.name.toLowerCase();

    // Must not match English voices for non-English languages
    if (canonical !== 'en' && vLang.startsWith('en')) return false;

    // Exact BCP-47 locale match (e.g. 'ta-in' === 'ta-in')
    if (vLang === primaryLocale) return true;
    // Prefix match (e.g. 'ta' or 'ta-lk') but ONLY within the same language prefix
    if (vLang === langPrefix || vLang.startsWith(langPrefix + '-')) return true;

    // Specific keywords for Indian language voices installed in Windows/macOS/Android/Chrome
    if (keywords.some((kw) => vName.includes(kw) || vLang.includes(kw))) {
      return true;
    }

    return false;
  });
}

export function isSpeechInputAvailable(langCode: string): boolean {
  if (typeof window === 'undefined') return false;
  const hasRecognition = Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  if (!hasRecognition) return false;

  const raw = (langCode || 'en').toLowerCase().trim();
  const canonical = LANGUAGE_ALIASES[raw] || raw;
  const locale = LANGUAGE_TO_BCP47[canonical] || LANGUAGE_TO_BCP47[raw];

  return Boolean(locale && locale !== 'unsupported');
}

/**
 * Detects device voice status for a language:
 * 'Full voice' -> Both speech input and output work on this device
 * 'Output only' -> Speech synthesis voice exists, but live input not supported
 * 'Input only' -> Speech recognition supported, but no TTS voice found
 * 'Text only' -> Neither speech input nor output voice found on this device
 */
export function getDeviceVoiceStatus(langCode: string, voices?: SpeechSynthesisVoice[]): DeviceVoiceStatus {
  const hasOut = isSpeechOutputAvailable(langCode, voices);
  const hasIn = isSpeechInputAvailable(langCode);

  if (hasIn && hasOut) return 'Full voice';
  if (hasOut && !hasIn) return 'Output only';
  if (hasIn && !hasOut) return 'Input only';
  return 'Text only';
}

/**
 * Cloud Speech Output Availability:
 * Guarantees TTS voice synthesis via Google Speech API and Gnani.ai for Tamil, Telugu,
 * Hindi, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, etc.
 */
export function isCloudSpeechOutputAvailable(langCode: string): boolean {
  const code = (langCode || '').toLowerCase().split('-')[0].trim();
  return [
    'ta', 'te', 'hi', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'ur',
    'or', 'as', 'ne', 'sa', 'en', 'es', 'fr', 'ar', 'de'
  ].includes(code);
}

/**
 * Checks whether speech output is available either locally on device or via Cloud Speech API.
 * For Tamil ('ta') and Telugu ('te'), speech output is 100% available via Google Speech API.
 */
export function hasVoiceOutputSupport(langCode: string, voices?: SpeechSynthesisVoice[]): boolean {
  return isSpeechOutputAvailable(langCode, voices) || isCloudSpeechOutputAvailable(langCode);
}

/**
 * Returns effective voice status taking into account Cloud Speech APIs.
 * When local offline synthesis is absent on Windows/Android, Cloud Speech APIs ensure
 * Tamil and Telugu have full voice synthesis availability.
 */
export function getEffectiveVoiceStatus(langCode: string, voices?: SpeechSynthesisVoice[]): DeviceVoiceStatus {
  if (voices !== undefined) {
    return getDeviceVoiceStatus(langCode, voices);
  }
  const hasOut = isSpeechOutputAvailable(langCode) || isCloudSpeechOutputAvailable(langCode);
  const hasIn = isSpeechInputAvailable(langCode);

  if (hasIn && hasOut) return 'Full voice';
  if (hasOut && !hasIn) return 'Output only';
  if (hasIn && !hasOut) return 'Input only';
  return 'Text only';
}

export type LanguageSupportType = 'LIVE_SPEECH' | 'UPLOAD_ONLY' | 'TYPING_ONLY';

export interface LanguageSupportDetails {
  type: LanguageSupportType;
  badgeLabel: string;
  canLiveRecord: boolean;
  canUploadTranscribe: boolean;
  canType: boolean;
}

export function computeLanguageSupport(langCode: string, voices?: SpeechSynthesisVoice[]): LanguageSupportDetails {
  const code = (langCode || '').trim().toLowerCase();
  const locale = getLocaleForLanguage(code);
  const hasWhisper = WHISPER_SUPPORTED_LANGUAGES.has(code);
  const deviceStatus = getDeviceVoiceStatus(code, voices);

  let type: LanguageSupportType = 'TYPING_ONLY';
  if (deviceStatus === 'Full voice' || deviceStatus === 'Input only') {
    type = 'LIVE_SPEECH';
  } else if (hasWhisper) {
    type = 'UPLOAD_ONLY';
  }

  return {
    type,
    badgeLabel: deviceStatus,
    canLiveRecord: deviceStatus === 'Full voice' || deviceStatus === 'Input only',
    canUploadTranscribe: hasWhisper,
    canType: true,
  };
}

/**
 * 2. Universal Language & Localization Handler (150+ Languages Support via ISO 639-3 standard dataset)
 */
export function getGlobalLanguageDetails(codeOrName: string): LanguageDetail {
  if (!codeOrName) {
    return CURATED_LANGUAGES[1]; // Default to English
  }
  const query = codeOrName.toLowerCase().trim();

  // 1. Direct code or isoCode3 match
  const directMatch = CURATED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === query || l.isoCode3.toLowerCase() === query
  );
  if (directMatch) return directMatch;

  // 2. Name or Native Name match
  const nameMatch = CURATED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === query || l.nativeName.toLowerCase() === query
  );
  if (nameMatch) return nameMatch;

  // 3. Check aliases
  const aliasMatch = CURATED_LANGUAGES.find(
    (l) => l.aliases && l.aliases.some((a) => a.toLowerCase() === query)
  );
  if (aliasMatch) return aliasMatch;

  // 4. Resolved alias code
  const resolvedCode = LANGUAGE_ALIASES[query] || ISO3_ALIASES[query];
  if (resolvedCode) {
    const aliasResolved = CURATED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === resolvedCode.toLowerCase() || l.isoCode3.toLowerCase() === resolvedCode.toLowerCase()
    );
    if (aliasResolved) return aliasResolved;
  }

  // Fallback to English
  return CURATED_LANGUAGES[1];
}

/**
 * 3. Unified Patient Copilot Health Payload Builder
 */
export async function buildLocalizedHealthResponse(searchTerm: string, userLanguageCode: string) {
  const medicalData = await searchMedicalCondition(searchTerm);
  const languageInfo = getGlobalLanguageDetails(userLanguageCode);

  return {
    language: languageInfo,
    queryMatch: searchTerm,
    clinicalResults: medicalData,
    timestamp: new Date().toISOString(),
    status: 'Success',
  };
}

/**
 * UI Translations dictionary for common clinical UI elements
 */
export interface UiTranslations {
  appTitle: string;
  appSubtitle: string;
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  uploadBoxTitle: string;
  uploadBoxSubtitle: string;
  selectDocBtn: string;
  processingTitle: string;
  analyzingStep: string;
  diagnosesHeading: string;
  medicationsHeading: string;
  labTestsHeading: string;
  physicianNotesHeading: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  listenAudioBtn: string;
  stopAudioBtn: string;
  openNihLookup: string;
  openFdaInfo: string;
  disclaimerTitle: string;
  disclaimerText: string;
  switchLanguage: string;
  allLanguages: string;
  indianLanguages: string;
  globalLanguages: string;
  searchLangPlaceholder: string;
  verifiedIcdCodes: string;

  // Navigation & Full Webpage Translation Keys
  dashboardNav: string;
  medicalAiChatNav: string;
  prescriptionAiNav: string;
  labDiagnosticsNav: string;
  liveRatesNav: string;
  healthMapNav: string;
  voiceAssistantNav: string;
  medicationScheduleNav: string;
  patientVaultNav: string;
  qrMedicalIdNav: string;
  donationNav: string;
  medicalCopilotStatus: string;
  readyStatus: string;
  clinicalIntelligenceHub: string;
  spokenLanguage: string;
  verifiedClinicalPortal: string;
  welcomeBack: string;
  welcomeSubtitle: string;
  uploadMedicalDocBtn: string;
  multimodalVisionCard: string;
  standardAnalytesCard: string;
  languagesVoiceCard: string;
  emergencyIdCard: string;
  quickDocScanner: string;
  openFullScanner: string;
  voiceAssistantBtn: string;
  nihIcd10Btn: string;
  signOut: string;
}

export const TRANSLATIONS: Record<string, Partial<UiTranslations>> = {
  en: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-Powered Clinical Extraction & Health Copilot',
    heroTag: 'Universal Multimodal Health Intelligence • Clinical Document Extraction',
    heroTitle: 'Extract Clinical Intelligence from Medical Documents',
    heroDescription: 'Upload doctor prescriptions or diagnostic lab reports (JPG, PNG, WEBP, PDF). MediMitra parses medications, lab values, diagnoses, and confidence scores into structured JSON with multimodal multilingual translation and clinical guidance.',
    uploadBoxTitle: 'Upload Prescription or Diagnostic Lab Report',
    uploadBoxSubtitle: 'Drag and drop your medical file here, or click to browse. Supported formats: JPG, PNG, WEBP, and PDF (Max 20MB).',
    selectDocBtn: 'Select Medical Document',
    processingTitle: 'Processing Medical Document',
    analyzingStep: 'Analyzing with Gemini AI Multimodal Vision...',
    diagnosesHeading: 'Diagnoses & Clinical Findings',
    medicationsHeading: 'Prescribed Medications',
    labTestsHeading: 'Diagnostic Laboratory Biomarkers',
    physicianNotesHeading: 'Physician Advice & Clinical Remarks',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    instructions: 'Instructions & Safety Advice',
    listenAudioBtn: 'Listen in Voice',
    stopAudioBtn: 'Stop Audio',
    openNihLookup: 'NIH ICD-10 Lookup',
    openFdaInfo: 'openFDA Drug Safety',
    disclaimerTitle: 'Clinical Verification & Medical Safety Disclaimer',
    disclaimerText: 'MediMitra is an assistive AI tool designed to facilitate clinical data extraction. Always consult certified healthcare professionals before making medical decisions.',
    switchLanguage: 'Language',
    allLanguages: 'All Supported Languages',
    indianLanguages: 'Indian Languages (Official & Regional)',
    globalLanguages: 'Global Languages',
    searchLangPlaceholder: 'Search language by name or native script (e.g. Tamil, हिन्दी, Español, Français, Deutsch, 日本語)...',
    verifiedIcdCodes: 'Verified ICD-10 Medical Code',
    dashboardNav: 'Dashboard',
    medicalAiChatNav: 'Medical AI Q&A',
    prescriptionAiNav: 'Prescription AI',
    labDiagnosticsNav: 'Lab Diagnostics',
    liveRatesNav: 'Live Rates & Safety',
    healthMapNav: 'Health Centers Map',
    voiceAssistantNav: 'Voice AI Assistant',
    medicationScheduleNav: 'Medication Schedule',
    patientVaultNav: 'Patient Vault',
    qrMedicalIdNav: 'AI + QR System',

    donationNav: 'Donation Hub',
    medicalCopilotStatus: 'Medical Copilot',
    readyStatus: 'READY',
    clinicalIntelligenceHub: 'Clinical Intelligence Hub',
    spokenLanguage: 'Spoken Language',
    verifiedClinicalPortal: 'Verified Clinical Portal',
    welcomeBack: 'Welcome back',
    welcomeSubtitle: 'Your Multilingual Health Copilot is ready. Upload medical prescriptions, lab reports, or dictate voice notes in',
    uploadMedicalDocBtn: 'Upload Medical Doc',
    multimodalVisionCard: 'Multimodal Vision',
    standardAnalytesCard: '15 Standard Analytes',
    languagesVoiceCard: '150+ ISO Languages',
    emergencyIdCard: 'ABDM / QR Ready',
    quickDocScanner: 'Quick Medical Document Scanner',
    openFullScanner: 'Open Full Scanner →',
    voiceAssistantBtn: 'Voice Assistant',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Sign Out',
  },
  // --- FRENCH (Global) ---
  fr: {
    appTitle: 'MediMitra',
    appSubtitle: 'Extraction Clinique par IA et Copilote Médical',
    heroTag: 'Universal Multimodal Health Intelligence • Clinical Document Extraction',
    heroTitle: 'Extrayez l\'Intelligence Clinique de vos Documents Médicaux',
    heroDescription: 'Téléversez des ordonnances médicales ou des rapports de laboratoire (JPG, PNG, WEBP, PDF). MediMitra analyse les médicaments, diagnostics et résultats avec traduction en plus de 150 langues.',
    uploadBoxTitle: 'Téléverser une Ordonnance ou un Bilan Biologique',
    uploadBoxSubtitle: 'Glissez-déposez votre fichier médical ici, ou cliquez pour parcourir (Max 20 Mo).',
    selectDocBtn: 'Sélectionner un Document Médical',
    processingTitle: 'Traitement du Document Médical',
    analyzingStep: 'Analyse par Vision Multimodale Gemini AI...',
    diagnosesHeading: 'Diagnostics et Observations Cliniques',
    medicationsHeading: 'Médicaments Prescrits et Posologies',
    labTestsHeading: 'Biomarqueurs et Analyses de Laboratoire',
    physicianNotesHeading: 'Conseils et Remarques du Médecin',
    dosage: 'Posologie / Dosage',
    frequency: 'Fréquence de Prise',
    duration: 'Durée du Traitement',
    instructions: 'Instructions et Précautions d\'Emploi',
    listenAudioBtn: 'Écouter en Vocal',
    stopAudioBtn: 'Arrêter l\'Audio',
    openNihLookup: 'Recherche ICD-10 NIH',
    openFdaInfo: 'Sécurité Médicament openFDA',
    disclaimerTitle: 'Avertissement de Sécurité Médicale',
    disclaimerText: 'MediMitra est un outil d\'assistance par IA. Consultez toujours un médecin certifié avant de prendre une décision médicale.',
    switchLanguage: 'Langue',
    allLanguages: 'Toutes les 150+ Langues',
    indianLanguages: 'Langues Indiennes',
    globalLanguages: 'Langues Mondiales',
    searchLangPlaceholder: 'Rechercher une langue (ex. Français, Español, Hindi, English)...',
    verifiedIcdCodes: 'Code Médical ICD-10 Vérifié',
    dashboardNav: 'Tableau de bord',
    medicalAiChatNav: 'Questions & Réponses IA Médicale',
    prescriptionAiNav: 'Ordonnance IA',
    labDiagnosticsNav: 'Analyses de laboratoire',
    liveRatesNav: 'Tarifs & Sécurité',
    healthMapNav: 'Carte des centres de santé',
    voiceAssistantNav: 'Assistant vocal IA',
    medicationScheduleNav: 'Calendrier des prises',
    patientVaultNav: 'Dossier médical patient',
    qrMedicalIdNav: 'Système IA + QR',

    donationNav: 'Centre de Dons',
    medicalCopilotStatus: 'Copilote médical',
    readyStatus: 'PRÊT',
    clinicalIntelligenceHub: 'Pôle d\'Intelligence Clinique',
    spokenLanguage: 'Langue parlée',
    verifiedClinicalPortal: 'Portail clinique vérifié',
    welcomeBack: 'Bon retour',
    welcomeSubtitle: 'Votre copilote de santé multilingue est prêt. Téléversez des ordonnances, bilans ou dictez vos notes en',
    uploadMedicalDocBtn: 'Téléverser un document',
    multimodalVisionCard: 'Vision multimodale',
    standardAnalytesCard: '15 biomarqueurs standards',
    languagesVoiceCard: '100+ langues vocales',
    emergencyIdCard: 'Prêt ABDM / QR',
    quickDocScanner: 'Scanner rapide de document médical',
    openFullScanner: 'Ouvrir le scanner complet →',
    voiceAssistantBtn: 'Assistant vocal',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Déconnexion',
  },
  // --- GERMAN (Global) ---
  de: {
    appTitle: 'MediMitra',
    appSubtitle: 'KI-gestützte klinische Dokumentenextraktion & Gesundheits-Copilot',
    heroTag: 'Universal Multimodal Health Intelligence • Clinical Document Extraction',
    heroTitle: 'Klinische Erkenntnisse aus medizinischen Dokumenten extrahieren',
    heroDescription: 'Laden Sie Rezepte oder Laborberichte hoch (JPG, PNG, WEBP, PDF). MediMitra analysiert Medikamente, Dosierungen und Diagnosen in über 150 Sprachen.',
    uploadBoxTitle: 'Rezept oder Laborbericht hochladen',
    uploadBoxSubtitle: 'Datei hierher ziehen oder zum Auswählen klicken (Max. 20 MB).',
    selectDocBtn: 'Medizinisches Dokument auswählen',
    processingTitle: 'Dokument wird analysiert',
    analyzingStep: 'Analyse mit Gemini KI-Vision...',
    diagnosesHeading: 'Diagnosen & Klinische Befunde',
    medicationsHeading: 'Verschriebene Medikamente & Dosierung',
    labTestsHeading: 'Laborwerte & Biomarker',
    physicianNotesHeading: 'Ärztliche Ratschläge & Hinweise',
    dosage: 'Dosierung',
    frequency: 'Einnahmehäufigkeit',
    duration: 'Behandlungsdauer',
    instructions: 'Einnahmehinweise & Sicherheit',
    listenAudioBtn: 'Per Sprachausgabe anhören',
    stopAudioBtn: 'Audio stoppen',
    openNihLookup: 'NIH ICD-10 Suche',
    openFdaInfo: 'openFDA Arzneimittelsicherheit',
    disclaimerTitle: 'Medizinischer Haftungsausschluss',
    disclaimerText: 'MediMitra ist ein KI-Assistenzsystem. Konsultieren Sie immer einen qualifizierten Arzt vor medizinischen Entscheidungen.',
    switchLanguage: 'Sprache',
    allLanguages: 'Alle 100+ Sprachen',
    indianLanguages: 'Indische Sprachen',
    globalLanguages: 'Globale Sprachen',
    searchLangPlaceholder: 'Sprache suchen (z. B. Deutsch, English, Français)...',
    verifiedIcdCodes: 'Verifizierter ICD-10 Code',
    dashboardNav: 'Dashboard',
    medicalAiChatNav: 'Medizinische KI-Fragen & Antworten',
    prescriptionAiNav: 'Rezept-KI',
    labDiagnosticsNav: 'Labordiagnostik',
    liveRatesNav: 'Preise & Sicherheit',
    healthMapNav: 'Gesundheitszentren-Karte',
    voiceAssistantNav: 'Sprach-KI-Assistent',
    medicationScheduleNav: 'Medikationsplan',
    patientVaultNav: 'Patientenakte',
    qrMedicalIdNav: 'KI + QR-System',

    donationNav: 'Spendezentrum',
    medicalCopilotStatus: 'Medizinischer Copilot',
    readyStatus: 'BEREIT',
    clinicalIntelligenceHub: 'Klinisches Intelligenzzentrum',
    spokenLanguage: 'Gesprochene Sprache',
    verifiedClinicalPortal: 'Verifiziertes klinisches Portal',
    welcomeBack: 'Willkommen zurück',
    welcomeSubtitle: 'Ihr mehrsprachiger Gesundheits-Copilot ist einsatzbereit. Laden Sie Rezepte oder Berichte hoch:',
    uploadMedicalDocBtn: 'Dokument hochladen',
    multimodalVisionCard: 'Multimodale Vision',
    standardAnalytesCard: '15 Standard-Analyten',
    languagesVoiceCard: '100+ Sprachen Sprachunterstützung',
    emergencyIdCard: 'ABDM / QR bereit',
    quickDocScanner: 'Schneller Dokumentenscanner',
    openFullScanner: 'Vollständigen Scanner öffnen →',
    voiceAssistantBtn: 'Sprachassistent',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Abmelden',
  },
  // --- SPANISH (Global) ---
  es: {
    appTitle: 'MediMitra',
    appSubtitle: 'Copiloto de Salud y Extracción Clínica con Inteligencia Artificial',
    heroTag: 'Desafío Altrix Labs • Fase 1: Extracción de Documentos Médicos',
    heroTitle: 'Extraiga Inteligencia Clínica de Documentos Médicos',
    heroDescription: 'Cargue recetas médicas o informes de laboratorio (JPG, PNG, WEBP, PDF). MediMitra analiza medicamentos, diagnósticos y resultados con soporte en más de 150 idiomas.',
    uploadBoxTitle: 'Subir Receta o Informe de Laboratorio',
    uploadBoxSubtitle: 'Arrastre y suelte su archivo aquí, o haga clic para buscar (Máx 20MB).',
    selectDocBtn: 'Seleccionar Documento Médico',
    processingTitle: 'Procesando Documento Médico',
    analyzingStep: 'Analizando con Gemini AI Vision...',
    diagnosesHeading: 'Diagnósticos y Hallazgos Clínicos',
    medicationsHeading: 'Medicamentos Recetados',
    labTestsHeading: 'Biomarcadores de Laboratorio',
    physicianNotesHeading: 'Consejos y Observaciones Médicas',
    dosage: 'Dosis',
    frequency: 'Frecuencia',
    duration: 'Duración',
    instructions: 'Instrucciones y Consejos de Seguridad',
    listenAudioBtn: 'Escuchar en Voz',
    stopAudioBtn: 'Detener Audio',
    openNihLookup: 'Búsqueda ICD-10 NIH',
    openFdaInfo: 'Seguridad de Medicamentos openFDA',
    disclaimerTitle: 'Descargo de Responsabilidad Médica',
    disclaimerText: 'MediMitra es una herramienta de asistencia con IA. Consulte siempre a un profesional médico antes de tomar decisiones de salud.',
    switchLanguage: 'Idioma',
    allLanguages: 'Todos los 150+ Idiomas',
    indianLanguages: 'Idiomas de la India',
    globalLanguages: 'Idiomas Globales',
    searchLangPlaceholder: 'Buscar idioma por nombre (ej. Español, Hindi, English)...',
    verifiedIcdCodes: 'Código Médico ICD-10 Verificado',
    dashboardNav: 'Panel de Control',
    medicalAiChatNav: 'Preguntas y Respuestas IA Médica',
    prescriptionAiNav: 'IA de Recetas',
    labDiagnosticsNav: 'Diagnóstico de Laboratorio',
    liveRatesNav: 'Precios y Seguridad',
    healthMapNav: 'Mapa de Centros de Salud',
    voiceAssistantNav: 'Asistente de Voz IA',
    medicationScheduleNav: 'Horario de Medicación',
    patientVaultNav: 'Bóveda del Paciente',
    qrMedicalIdNav: 'Sistema IA + QR',

    donationNav: 'Centro de Donaciones',
    medicalCopilotStatus: 'Copiloto Médico',
    readyStatus: 'LISTO',
    clinicalIntelligenceHub: 'Centro de Inteligencia Clínica',
    spokenLanguage: 'Idioma Hablado',
    verifiedClinicalPortal: 'Portal Clínico Verificado',
    welcomeBack: 'Bienvenido de nuevo',
    welcomeSubtitle: 'Su copiloto de salud multilingüe está listo. Cargue recetas médicas o dicte notas de voz en',
    uploadMedicalDocBtn: 'Subir Documento Médico',
    multimodalVisionCard: 'Visión Multimodal',
    standardAnalytesCard: '15 Analitos Estándar',
    languagesVoiceCard: '150+ Idiomas de Voz',
    emergencyIdCard: 'Listo para ABDM / QR',
    quickDocScanner: 'Escáner Rápido de Documentos Médicos',
    openFullScanner: 'Abrir Escáner Completo →',
    voiceAssistantBtn: 'Asistente de Voz',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Cerrar Sesión',
  },
  // --- CHINESE (Global) ---
  zh: {
    appTitle: 'MediMitra (医疗智友)',
    appSubtitle: 'AI驱动的临床病历解析与个人健康助手',
    heroTag: 'Altrix Labs 挑战赛 • 阶段1：处方与化验单智能解析',
    heroTitle: '从医疗单据中提取结构化临床健康数据',
    heroDescription: '上传处方单或检验化验单（JPG、PNG、WEBP、PDF）。MediMitra精准解析药品剂量、服用频次、诊断结果和检验指标，并提供150多种语言实时翻译。',
    uploadBoxTitle: '上传医生处方或化验报告单',
    uploadBoxSubtitle: '将文件拖放至此处，或点击浏览上传（最大支持20MB）。',
    selectDocBtn: '选择医疗单据文件',
    processingTitle: '正在智能分析医疗单据',
    analyzingStep: '正在通过Gemini多模态视觉模型提取数据...',
    diagnosesHeading: '临床诊断与病症',
    medicationsHeading: '处方药品与用药指南',
    labTestsHeading: '实验室检验指标与生物标志物',
    physicianNotesHeading: '医生医嘱与健康建议',
    dosage: '单次剂量',
    frequency: '用药频次',
    duration: '用药疗程',
    instructions: '用法与安全须知',
    listenAudioBtn: '语音播报',
    stopAudioBtn: '停止播报',
    openNihLookup: '查询NIH ICD-10国际疾病代码',
    openFdaInfo: 'openFDA药品安全数据库',
    disclaimerTitle: '医疗安全免责声明',
    disclaimerText: 'MediMitra仅为AI辅助提取工具。在做出任何用药或治疗决定之前，请务必咨询专业执业医师。',
    switchLanguage: '切换语言',
    allLanguages: '全部150+种语言',
    indianLanguages: '印度官方及地方语言',
    globalLanguages: '全球主要语言',
    searchLangPlaceholder: '搜索语言名称（如 中文、English、Español）...',
    verifiedIcdCodes: '已验证ICD-10医学编码',
    dashboardNav: '仪表盘',
    medicalAiChatNav: '医疗人工智能问答',
    prescriptionAiNav: '处方 AI',
    labDiagnosticsNav: '化验诊断',
    liveRatesNav: '药品价格与安全',
    healthMapNav: '医疗中心地图',
    voiceAssistantNav: '语音 AI 助手',
    medicationScheduleNav: '用药时间表',
    patientVaultNav: '患者病历库',
    qrMedicalIdNav: 'AI + 二维码系统',

    donationNav: '捐献中心',
    medicalCopilotStatus: '医疗智能助手',
    readyStatus: '就绪',
    clinicalIntelligenceHub: '临床智能中心',
    spokenLanguage: '语音语言',
    verifiedClinicalPortal: '已验证临床门户',
    welcomeBack: '欢迎回来',
    welcomeSubtitle: '您的多语言健康助手已就绪。上传处方、化验单或用语音记录：',
    uploadMedicalDocBtn: '上传医疗文档',
    multimodalVisionCard: '多模态视觉',
    standardAnalytesCard: '15 项标准检验指标',
    languagesVoiceCard: '100+ 语言语音支持',
    emergencyIdCard: '支持 ABDM / 二维码',
    quickDocScanner: '快速医疗文档扫描器',
    openFullScanner: '打开完整扫描器 →',
    voiceAssistantBtn: '语音助手',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: '退出登录',
  },
  // --- JAPANESE (Global) ---
  ja: {
    appTitle: 'MediMitra (メディミトラ)',
    appSubtitle: 'AI搭載 臨床文書解析＆パーソナルヘルスナビゲーター',
    heroTag: 'Altrix Labs ハッカソン • フェーズ1：医療処方箋＆検査解析',
    heroTitle: '医療文書から臨床インテリジェンスを高精度抽出',
    heroDescription: '医師の処方箋や血液検査レポート（JPG、PNG、WEBP、PDF）をアップロード。薬品名、用法用量、検査数値を150以上の言語で瞬時に分かりやすく表示します。',
    uploadBoxTitle: '処方箋または検査レポートのアップロード',
    uploadBoxSubtitle: 'ここにファイルをドラッグ＆ドロップ、またはクリックして選択（最大20MB）。',
    selectDocBtn: '医療文書ファイルを選択',
    processingTitle: '医療文書をAI解析中',
    analyzingStep: 'Gemini AI ビジョンモデルでデータを抽出中...',
    diagnosesHeading: '診断名・臨床所見',
    medicationsHeading: '処方薬・用法用量',
    labTestsHeading: '臨床検査項目・バイオマーカー',
    physicianNotesHeading: '医師の指導・アドバイス',
    dosage: '用量',
    frequency: '服用回数・タイミング',
    duration: '服用期間',
    instructions: '服用方法・注意事項',
    listenAudioBtn: '音声で聴く',
    stopAudioBtn: '停止',
    openNihLookup: 'NIH ICD-10 コード検索',
    openFdaInfo: 'openFDA 医薬品安全性情報',
    disclaimerTitle: '医療免責事項',
    disclaimerText: 'MediMitraはAIアシストツールです。治療や服薬の変更については必ず医師または薬剤師にご相談ください。',
    switchLanguage: '言語変更',
    allLanguages: '全150+言語',
    indianLanguages: 'インドの言語',
    globalLanguages: '世界の主要言語',
    searchLangPlaceholder: '言語を検索（例: 日本語, English, Français）...',
    verifiedIcdCodes: '検証済みICD-10医療コード',
    dashboardNav: 'ダッシュボード',
    medicalAiChatNav: '医療AI Q&A',
    prescriptionAiNav: '処方箋 AI',
    labDiagnosticsNav: '検査診断',
    liveRatesNav: '薬価＆安全性',
    healthMapNav: '医療機関マップ',
    voiceAssistantNav: '音声 AI アシスタント',
    medicationScheduleNav: '服薬スケジュール',
    patientVaultNav: 'カルテ・保管庫',
    qrMedicalIdNav: 'AI + QRシステム',

    donationNav: 'ドネーションハブ',
    medicalCopilotStatus: 'メディカルコパイロット',
    readyStatus: '準備完了',
    clinicalIntelligenceHub: '臨床インテリジェンスハブ',
    spokenLanguage: '音声言語',
    verifiedClinicalPortal: '認証済み医療ポータル',
    welcomeBack: 'おかえりなさい',
    welcomeSubtitle: '多言語ヘルスケアアシスタントの準備が整いました。処方箋や検査結果をアップロードしてください：',
    uploadMedicalDocBtn: '医療文書をアップロード',
    multimodalVisionCard: 'マルチモーダル AI',
    standardAnalytesCard: '15 項目の標準検査',
    languagesVoiceCard: '150+ 言語の音声サポート',
    emergencyIdCard: 'ABDM / QR 対応',
    quickDocScanner: '簡易メディカルスキャナー',
    openFullScanner: 'フルスキャナーを開く →',
    voiceAssistantBtn: '音声アシスタント',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ログアウト',
  },
  // --- RUSSIAN (Global) ---
  ru: {
    appTitle: 'MediMitra',
    appSubtitle: 'ИИ-анализ медицинских документов и персональный помощник',
    heroTag: 'Altrix Labs Хакатон • Фаза 1: Анализ рецептов и результатов анализов',
    heroTitle: 'Извлечение клинических данных из медицинских документов',
    heroDescription: 'Загружайте рецепты врачей или лабораторные анализы (JPG, PNG, WEBP, PDF). MediMitra распознает препараты, дозировки и показатели на 150+ языках.',
    uploadBoxTitle: 'Загрузить рецепт или бланк анализов',
    uploadBoxSubtitle: 'Перетащите файл сюда или нажмите для выбора (до 20 МБ).',
    selectDocBtn: 'Выбрать медицинский документ',
    processingTitle: 'Обработка медицинского документа',
    analyzingStep: 'Анализ с помощью Gemini AI Vision...',
    diagnosesHeading: 'Диагнозы и клинические заключения',
    medicationsHeading: 'Назначенные медикаменты и дозировка',
    labTestsHeading: 'Лабораторные биомаркеры и анализы',
    physicianNotesHeading: 'Рекомендации и указания врача',
    dosage: 'Дозировка',
    frequency: 'Частота приема',
    duration: 'Длительность курса',
    instructions: 'Инструкции по применению',
    listenAudioBtn: 'Прослушать голосом',
    stopAudioBtn: 'Остановить',
    openNihLookup: 'Поиск кодов ICD-10 в NIH',
    openFdaInfo: 'Безопасность лекарств openFDA',
    disclaimerTitle: 'Медицинское предупреждение',
    disclaimerText: 'MediMitra — вспомогательный инструмент ИИ. Обязательно консультируйтесь с лечащим врачом перед приемом лекарств.',
    switchLanguage: 'Язык',
    allLanguages: 'Все 150+ языков',
    indianLanguages: 'Языки Индии',
    globalLanguages: 'Мировые языки',
    searchLangPlaceholder: 'Поиск языка (напр. Русский, English, Español)...',
    verifiedIcdCodes: 'Проверенный код ICD-10',
    dashboardNav: 'Панель управления',
    medicalAiChatNav: 'Медицинский ИИ Вопрос-Ответ',
    prescriptionAiNav: 'Рецепт-ИИ',
    labDiagnosticsNav: 'Лабораторная диагностика',
    liveRatesNav: 'Цены и безопасность',
    healthMapNav: 'Карта медцентров',
    voiceAssistantNav: 'Голосовой ИИ-помощник',
    medicationScheduleNav: 'График приема лекарств',
    patientVaultNav: 'Медицинская карта',
    qrMedicalIdNav: 'ИИ + QR-система',

    donationNav: 'Центр донорства',
    medicalCopilotStatus: 'Медицинский копилот',
    readyStatus: 'ГОТОВ',
    clinicalIntelligenceHub: 'Центр клинического интеллекта',
    spokenLanguage: 'Язык общения',
    verifiedClinicalPortal: 'Проверенный клинический портал',
    welcomeBack: 'С возвращением',
    welcomeSubtitle: 'Ваш мультиязычный медицинский помощник готов. Загружайте рецепты или диктуйте голосом на',
    uploadMedicalDocBtn: 'Загрузить мед. документ',
    multimodalVisionCard: 'Мультимодальное зрение',
    standardAnalytesCard: '15 стандартных анализов',
    languagesVoiceCard: '150+ языков с голосом',
    emergencyIdCard: 'ABDM / QR готов',
    quickDocScanner: 'Быстрый медицинский сканер',
    openFullScanner: 'Открыть полный сканер →',
    voiceAssistantBtn: 'Голосовой помощник',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Выйти',
  },
  // --- PORTUGUESE (Global) ---
  pt: {
    appTitle: 'MediMitra',
    appSubtitle: 'Extração Clínica com IA e Copiloto de Saúde Pessoal',
    heroTag: 'Desafio Altrix Labs • Fase 1: Extração de Receitas e Exames',
    heroTitle: 'Extraia Inteligência Clínica de Documentos Médicos',
    heroDescription: 'Envie receitas médicas ou laudos laboratoriais (JPG, PNG, WEBP, PDF). O MediMitra analisa medicamentos, dosagens e diagnósticos com suporte em mais de 150 idiomas.',
    uploadBoxTitle: 'Enviar Receita Médica ou Exame Laboratorial',
    uploadBoxSubtitle: 'Arraste e solte o arquivo aqui ou clique para selecionar (Máx 20MB).',
    selectDocBtn: 'Selecionar Documento Médico',
    processingTitle: 'Processando Documento Médico',
    analyzingStep: 'Analisando com visão multimodal do Gemini AI...',
    diagnosesHeading: 'Diagnósticos e Achados Clínicos',
    medicationsHeading: 'Medicamentos Prescritos e Posologia',
    labTestsHeading: 'Biomarcadores e Exames Laboratoriais',
    physicianNotesHeading: 'Orientações e Recomendações Médicas',
    dosage: 'Dosagem',
    frequency: 'Frequência de Uso',
    duration: 'Duração',
    instructions: 'Instruções e Recomendações de Uso',
    listenAudioBtn: 'Ouvir em Áudio',
    stopAudioBtn: 'Parar Áudio',
    openNihLookup: 'Consulta ICD-10 NIH',
    openFdaInfo: 'Segurança openFDA',
    disclaimerTitle: 'Aviso de Segurança Médica',
    disclaimerText: 'O MediMitra é uma ferramenta assistiva de IA. Sempre consulte um médico antes de tomar decisões sobre sua saúde.',
    switchLanguage: 'Idioma',
    allLanguages: 'Todos os 150+ Idiomas',
    indianLanguages: 'Idiomas Indianos',
    globalLanguages: 'Idiomas Globais',
    searchLangPlaceholder: 'Buscar idioma (ex. Português, Español, English)...',
    verifiedIcdCodes: 'Código Médico ICD-10 Verificado',
    dashboardNav: 'Painel Principal',
    medicalAiChatNav: 'Perguntas e Respostas IA Médica',
    prescriptionAiNav: 'IA de Prescrições',
    labDiagnosticsNav: 'Diagnóstico Laboratorial',
    liveRatesNav: 'Preços e Segurança',
    healthMapNav: 'Mapa de Centros de Saúde',
    voiceAssistantNav: 'Assistente de Voz IA',
    medicationScheduleNav: 'Agenda de Medicamentos',
    patientVaultNav: 'Prontuário do Paciente',
    qrMedicalIdNav: 'Sistema IA + QR',

    donationNav: 'Centro de Doação',
    medicalCopilotStatus: 'Copiloto Médico',
    readyStatus: 'PRONTO',
    clinicalIntelligenceHub: 'Centro de Inteligência Clínica',
    spokenLanguage: 'Idioma Falado',
    verifiedClinicalPortal: 'Portal Clínico Verificado',
    welcomeBack: 'Bem-vindo de volta',
    welcomeSubtitle: 'Seu copiloto de saúde multilíngue está pronto. Envie prescrições ou dite notas de voz em',
    uploadMedicalDocBtn: 'Enviar Documento',
    multimodalVisionCard: 'Visão Multimodal',
    standardAnalytesCard: '15 Analitos Padrão',
    languagesVoiceCard: '150+ Idiomas com Voz',
    emergencyIdCard: 'ABDM / QR Pronto',
    quickDocScanner: 'Scanner Rápido de Documentos',
    openFullScanner: 'Abrir Scanner Completo →',
    voiceAssistantBtn: 'Assistente de Voz',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Sair',
  },
  // --- ITALIAN (Global) ---
  it: {
    appTitle: 'MediMitra',
    appSubtitle: 'Estrazione Clinica con IA & Assistente Medico',
    heroTag: 'Hackathon Altrix Labs • Fase 1: Analisi Ricette e Referti',
    heroTitle: 'Estrai Dati Clinici da Documenti Medici e Referti',
    heroDescription: 'Carica prescrizioni mediche o referti di laboratorio (JPG, PNG, WEBP, PDF). MediMitra analizza farmaci, dosaggi e diagnosi in oltre 150 lingue.',
    uploadBoxTitle: 'Carica Prescrizione o Referto di Laboratorio',
    uploadBoxSubtitle: 'Trascina e rilascia il file qui, oppure clicca per selezionare (Max 20MB).',
    selectDocBtn: 'Seleziona Documento Medico',
    processingTitle: 'Elaborazione Documento Medico',
    analyzingStep: 'Analisi con Gemini AI Vision...',
    diagnosesHeading: 'Diagnosi e Riscontri Clinici',
    medicationsHeading: 'Farmaci Prescritti e Posologia',
    labTestsHeading: 'Biomarcatori e Test di Laboratorio',
    physicianNotesHeading: 'Indicazioni e Note del Medico',
    dosage: 'Dosaggio',
    frequency: 'Frequenza di Assunzione',
    duration: 'Durata',
    instructions: 'Istruzioni e Avvertenze',
    listenAudioBtn: 'Ascolta in Voce',
    stopAudioBtn: 'Interrompi Audio',
    openNihLookup: 'Cerca Codice ICD-10 NIH',
    openFdaInfo: 'Sicurezza Farmaci openFDA',
    disclaimerTitle: 'Disclaimer di Sicurezza Medica',
    disclaimerText: 'MediMitra è uno strumento di supporto basato su IA. Consulta sempre il tuo medico prima di assumere farmaci.',
    switchLanguage: 'Lingua',
    allLanguages: 'Tutte le 150+ Lingue',
    indianLanguages: 'Lingue Indiane',
    globalLanguages: 'Lingue Globali',
    searchLangPlaceholder: 'Cerca lingua (es. Italiano, English, Français)...',
    verifiedIcdCodes: 'Codice Medico ICD-10 Verificato',
    dashboardNav: 'Cruscotto',
    medicalAiChatNav: 'Domande e Risposte IA Medica',
    prescriptionAiNav: 'IA Ricette',
    labDiagnosticsNav: 'Diagnostica di Laboratorio',
    liveRatesNav: 'Prezzi e Sicurezza',
    healthMapNav: 'Mappa Centri Sanitari',
    voiceAssistantNav: 'Assistente Vocale IA',
    medicationScheduleNav: 'Orari Farmaci',
    patientVaultNav: 'Cartella Clinica',
    qrMedicalIdNav: 'Sistema IA + QR',

    donationNav: 'Centro Donazioni',
    medicalCopilotStatus: 'Copilota Medico',
    readyStatus: 'PRONTO',
    clinicalIntelligenceHub: 'Hub di Intelligenza Clinica',
    spokenLanguage: 'Lingua Parlata',
    verifiedClinicalPortal: 'Portale Clinico Verificato',
    welcomeBack: 'Bentornato',
    welcomeSubtitle: 'Il tuo copilota sanitario multilingue è pronto. Carica ricette mediche o detta note vocali in',
    uploadMedicalDocBtn: 'Carica Documento',
    multimodalVisionCard: 'Visione Multimodale',
    standardAnalytesCard: '15 Analiti Standard',
    languagesVoiceCard: '150+ Lingue Vocali',
    emergencyIdCard: 'Pronto per QR Medico',
    quickDocScanner: 'Scanner Rapido Documenti',
    openFullScanner: 'Apri Scanner Completo →',
    voiceAssistantBtn: 'Assistente Vocale',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Esci',
  },
  // --- KOREAN (Global) ---
  ko: {
    appTitle: 'MediMitra (메디미트라)',
    appSubtitle: 'AI 기반 임상 진료 문서 분석 및 개인 건강 코파일럿',
    heroTag: 'Altrix Labs 해커톤 • 1단계: 처방전 및 검사결과지 분석',
    heroTitle: '의료 처방전 및 검사 문서에서 임상 데이터 자동 추출',
    heroDescription: '의사 처방전이나 혈액 검사 결과지(JPG, PNG, WEBP, PDF)를 업로드하세요. 약품명, 복용법, 진단명, 검사 수치를 150개 이상의 언어로 즉시 번역합니다.',
    uploadBoxTitle: '처방전 또는 검사 결과지 업로드',
    uploadBoxSubtitle: '파일을 여기로 드래그하거나 클릭하여 선택하세요 (최대 20MB).',
    selectDocBtn: '의료 문서 선택',
    processingTitle: '의료 문서 분석 진행 중',
    analyzingStep: 'Gemini AI 비전 모델로 데이터 추출 중...',
    diagnosesHeading: '진단명 및 임상 소견',
    medicationsHeading: '처방 의약품 및 복용법',
    labTestsHeading: '진단 검사 항목 및 수치',
    physicianNotesHeading: '의사 권고사항 및 주의사항',
    dosage: '1회 투약량',
    frequency: '복용 횟수',
    duration: '투약 기간',
    instructions: '복용 지침 및 주의사항',
    listenAudioBtn: '음성으로 듣기',
    stopAudioBtn: '음성 중지',
    openNihLookup: 'NIH ICD-10 국제질병코드 조회',
    openFdaInfo: 'openFDA 의약품 안전 정보',
    disclaimerTitle: '의료 안전 면책 조항',
    disclaimerText: 'MediMitra는 AI 보조 도구입니다. 약 복용 및 건강에 관한 결정은 반드시 전문 의료진과 상의하세요.',
    switchLanguage: '언어 선택',
    allLanguages: '전체 150+개 언어',
    indianLanguages: '인도 공식 및 지역 언어',
    globalLanguages: '세계 주요 언어',
    searchLangPlaceholder: '언어 검색 (예: 한국어, English, 日本語)...',
    verifiedIcdCodes: '검증된 ICD-10 질병코드',
    dashboardNav: '대시보드',
    medicalAiChatNav: '의료 AI Q&A',
    prescriptionAiNav: '처방전 AI',
    labDiagnosticsNav: '검사 진단',
    liveRatesNav: '약가 및 안전성',
    healthMapNav: '의료기관 지도',
    voiceAssistantNav: '음성 AI 어시스턴트',
    medicationScheduleNav: '복약 일정',
    patientVaultNav: '진료기록 보관함',
    qrMedicalIdNav: 'AI + QR 시스템',

    donationNav: '기증 허브',
    medicalCopilotStatus: '메디컬 코파일럿',
    readyStatus: '준비 완료',
    clinicalIntelligenceHub: '임상 지능 허브',
    spokenLanguage: '음성 언어',
    verifiedClinicalPortal: '인증된 의료 포털',
    welcomeBack: '환영합니다',
    welcomeSubtitle: '다국어 헬스케어 코파일럿이 준비되었습니다. 처방전이나 검사 결과를 업로드하세요:',
    uploadMedicalDocBtn: '의료 문서 업로드',
    multimodalVisionCard: '멀티모달 비전',
    standardAnalytesCard: '15개 표준 검사항목',
    languagesVoiceCard: '100+ 언어 음성 지원',
    emergencyIdCard: 'ABDM / QR 준비',
    quickDocScanner: '빠른 의료 문서 스캐너',
    openFullScanner: '전체 스캐너 열기 →',
    voiceAssistantBtn: '음성 어시스턴트',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: '로그아웃',
  },
  // --- ARABIC (Global - RTL) ---
  ar: {
    appTitle: 'ميدي ميترا (MediMitra)',
    appSubtitle: 'المساعد الصحي السريري المدعوم بالذكاء الاصطناعي',
    heroTag: 'تحدي هاكاثون ألتريكس لابس • المرحلة 1: استخراج البيانات الطبية',
    heroTitle: 'استخراج البيانات السريرية من الوصفات والتقارير الطبية',
    heroDescription: 'قم برفع الوصفات الطبية أو تقارير المختبر (JPG, PNG, WEBP, PDF). يحلل ميدي ميترا الأدوية والجرعات والتشخيصات مع دعم أكثر من 150 لغة.',
    uploadBoxTitle: 'رفع وصفة طبية أو تقرير مختبر',
    uploadBoxSubtitle: 'اسحب وأفلت ملفك هنا، أو انقر للاختيار (الحد الأقصى 20 ميغابايت).',
    selectDocBtn: 'اختيار المستند الطبي',
    processingTitle: 'جارٍ معالجة المستند الطبي',
    analyzingStep: 'جارٍ التحليل باستخدام رؤية Gemini AI...',
    diagnosesHeading: 'التشخيصات والملاحظات السريرية',
    medicationsHeading: 'الأدوية الموصوفة والجرعات',
    labTestsHeading: 'نتائج التحاليل المخبرية',
    physicianNotesHeading: 'نصائح الطبيب والملاحظات',
    dosage: 'الجرعة',
    frequency: 'التكرار / المواعيد',
    duration: 'المدة',
    instructions: 'تعليمات الاستخدام وإرشادات السلامة',
    listenAudioBtn: 'استمع صوتياً',
    stopAudioBtn: 'إيقاف الصوت',
    openNihLookup: 'بحث كود ICD-10 في NIH',
    openFdaInfo: 'سلامة الأدوية من openFDA',
    disclaimerTitle: 'إخلاء المسؤولية الطبية والسلامة',
    disclaimerText: 'ميدي ميترا هو أداة ذكاء اصطناعي مساعدة. يرجى استشارة الطبيب المختص قبل اتخاذ أي قرار طبي.',
    switchLanguage: 'اللغة',
    allLanguages: 'جميع اللغات (150+)',
    indianLanguages: 'اللغات الهندية',
    globalLanguages: 'اللغات العالمية',
    searchLangPlaceholder: 'ابحث عن لغة (مثل العربية، Français، English)...',
    verifiedIcdCodes: 'كود ICD-10 الطبي المعتمد',
    dashboardNav: 'لوحة التحكم',
    medicalAiChatNav: 'الأسئلة والأجوبة الطبية الذكية',
    prescriptionAiNav: 'ذكاء الوصفات الطبية',
    labDiagnosticsNav: 'تشخيصات المختبر',
    liveRatesNav: 'أسعار الأدوية والسلامة',
    healthMapNav: 'خريطة المراكز الصحية',
    voiceAssistantNav: 'المساعد الصوتي الذكي',
    medicationScheduleNav: 'جدول مواعيد الأدوية',
    patientVaultNav: 'سجل المريض الطبي',
    qrMedicalIdNav: 'نظام الذكاء الاصطناعي ورمز QR',

    donationNav: 'مركز التبرع',
    medicalCopilotStatus: 'المساعد الطبي الذكي',
    readyStatus: 'جاهز',
    clinicalIntelligenceHub: 'مركز الذكاء السريري',
    spokenLanguage: 'اللغة المنطوقة',
    verifiedClinicalPortal: 'البوابة السريرية المعتمدة',
    welcomeBack: 'مرحباً بك مجدداً',
    welcomeSubtitle: 'مساعدك الصحي متعدد اللغات جاهز. قم برفع الوصفات أو التقارير الطبية:',
    uploadMedicalDocBtn: 'رفع مستند طبي',
    multimodalVisionCard: 'الرؤية المتعددة الوسائط',
    standardAnalytesCard: '15 تحليلاً مخبرياً معيارياً',
    languagesVoiceCard: 'دعم صوتي لأكثر من 150 لغة',
    emergencyIdCard: 'جاهز لبطاقة الطوارئ ورمز QR',
    quickDocScanner: 'ماسح المستندات الطبية السريع',
    openFullScanner: 'فتح الماسح الشامل ←',
    voiceAssistantBtn: 'المساعد الصوتي',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'تسجيل الخروج',
  },
  // --- TURKISH (Global) ---
  tr: {
    appTitle: 'MediMitra',
    appSubtitle: 'Yapay Zeka Klinik Veri Çıkarıcı & Sağlık Asistanı',
    heroTag: 'Altrix Labs Hackathon • Faz 1: Reçete ve Rapor Analizi',
    heroTitle: 'Tıbbi Belgelerden Klinik Verileri Çıkarın',
    heroDescription: 'Doktor reçetelerini veya laboratuvar raporlarını yükleyin (JPG, PNG, WEBP, PDF). MediMitra ilaçları, dozajları ve tanıları 150\'den fazla dilde analiz eder.',
    uploadBoxTitle: 'Reçete veya Laboratuvar Raporu Yükle',
    uploadBoxSubtitle: 'Dosyanızı buraya sürükleyin veya seçmek için tıklayın (Maks 20MB).',
    selectDocBtn: 'Tıbbi Belge Seç',
    processingTitle: 'Tıbbi Belge İşleniyor',
    analyzingStep: 'Gemini AI Vision ile analiz ediliyor...',
    diagnosesHeading: 'Tanılar ve Klinik Bulgular',
    medicationsHeading: 'Reçete Edilen İlaçlar ve Dozaj',
    labTestsHeading: 'Laboratuvar Biyobelirteçleri',
    physicianNotesHeading: 'Doktor Tavsiyeleri ve Notları',
    dosage: 'Doz',
    frequency: 'Kullanım Sıklığı',
    duration: 'Süre',
    instructions: 'Kullanım Talimatları ve Uyarılar',
    listenAudioBtn: 'Sesli Dinle',
    stopAudioBtn: 'Durdur',
    openNihLookup: 'NIH ICD-10 Kod Arama',
    openFdaInfo: 'openFDA İlaç Güvenliği',
    disclaimerTitle: 'Tıbbi Sorumluluk Reddi',
    disclaimerText: 'MediMitra yapay zeka destekli bir araçtır. Tıbbi kararlar almadan önce daima doktorunuza danışın.',
    switchLanguage: 'Dil',
    allLanguages: 'Tüm 150+ Dil',
    indianLanguages: 'Hint Dilleri',
    globalLanguages: 'Küresel Diller',
    searchLangPlaceholder: 'Dil ara (örn. Türkçe, English, Deutsch)...',
    verifiedIcdCodes: 'Doğrulanmış ICD-10 Kodu',
    dashboardNav: 'Kontrol Paneli',
    medicalAiChatNav: 'Tıbbi Yapay Zeka Soru-Cevap',
    prescriptionAiNav: 'Reçete Yapay Zekası',
    labDiagnosticsNav: 'Laboratuvar Tanıları',
    liveRatesNav: 'İlaç Fiyatları & Güvenlik',
    healthMapNav: 'Sağlık Merkezleri Haritası',
    voiceAssistantNav: 'Sesli Yapay Zeka Asistanı',
    medicationScheduleNav: 'İlaç Takvimi',
    patientVaultNav: 'Hasta Tıbbi Arşivi',
    qrMedicalIdNav: 'YZ + QR Kimlik',

    donationNav: 'Bağış Merkezi',
    medicalCopilotStatus: 'Medikal Yardımcı',
    readyStatus: 'HAZIR',
    clinicalIntelligenceHub: 'Klinik İstihbarat Merkezi',
    spokenLanguage: 'Konuşulan Dil',
    verifiedClinicalPortal: 'Doğrulanmış Klinik Portal',
    welcomeBack: 'Tekrar Hoş Geldiniz',
    welcomeSubtitle: 'Çok dilli sağlık asistanınız hazır. Reçete veya laboratuvar raporu yükleyin:',
    uploadMedicalDocBtn: 'Tıbbi Belge Yükle',
    multimodalVisionCard: 'Multimodal Görme',
    standardAnalytesCard: '15 Standart Analit',
    languagesVoiceCard: '150+ Dilde Ses Desteği',
    emergencyIdCard: 'ABDM / QR Hazır',
    quickDocScanner: 'Hızlı Tıbbi Belge Tarayıcı',
    openFullScanner: 'Tam Tarayıcıyı Aç →',
    voiceAssistantBtn: 'Sesli Asistan',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Çıkış Yap',
  },
  // --- INDONESIAN (Global) ---
  id: {
    appTitle: 'MediMitra',
    appSubtitle: 'Ekstraksi Klinis AI & Pendamping Kesehatan Pribadi',
    heroTag: 'Tantangan Altrix Labs • Fase 1: Analisis Dokumen Medis',
    heroTitle: 'Ekstrak Informasi Klinis dari Dokumen Medis',
    heroDescription: 'Unggah resep dokter atau laporan laboratorium (JPG, PNG, WEBP, PDF). MediMitra menganalisis obat, dosis, dan diagnosis dalam lebih dari 150 bahasa.',
    uploadBoxTitle: 'Unggah Resep atau Laporan Lab',
    uploadBoxSubtitle: 'Tarik dan lepas file di sini, atau klik untuk memilih (Maks 20MB).',
    selectDocBtn: 'Pilih Dokumen Medis',
    processingTitle: 'Memproses Dokumen Medis',
    analyzingStep: 'Menganalisis dengan Gemini AI Vision...',
    diagnosesHeading: 'Diagnosis & Temuan Klinis',
    medicationsHeading: 'Obat yang Diresepkan',
    labTestsHeading: 'Biomarker Laboratorium',
    physicianNotesHeading: 'Saran & Catatan Dokter',
    dosage: 'Dosis',
    frequency: 'Frekuensi Penggunaan',
    duration: 'Durasi',
    instructions: 'Petunjuk & Saran Keselamatan',
    listenAudioBtn: 'Dengarkan Suara',
    stopAudioBtn: 'Hentikan Audio',
    openNihLookup: 'Cari ICD-10 NIH',
    openFdaInfo: 'Keamanan Obat openFDA',
    disclaimerTitle: 'Penafian Medis',
    disclaimerText: 'MediMitra adalah alat bantu AI. Selalu konsultasikan dengan dokter sebelum membuat keputusan medis.',
    switchLanguage: 'Bahasa',
    allLanguages: 'Semua 150+ Bahasa',
    indianLanguages: 'Bahasa India',
    globalLanguages: 'Bahasa Global',
    searchLangPlaceholder: 'Cari bahasa (mis. Bahasa Indonesia, English)...',
    verifiedIcdCodes: 'Kode ICD-10 Terverifikasi',
    dashboardNav: 'Dasbor',
    medicalAiChatNav: 'Tanya Jawab AI Medis',
    prescriptionAiNav: 'AI Resep',
    labDiagnosticsNav: 'Diagnostik Lab',
    liveRatesNav: 'Harga & Keamanan Obat',
    healthMapNav: 'Peta Fasilitas Kesehatan',
    voiceAssistantNav: 'Asisten Suara AI',
    medicationScheduleNav: 'Jadwal Obat',
    patientVaultNav: 'Rekam Medis Pasien',
    qrMedicalIdNav: 'Sistem AI + QR',

    donationNav: 'Pusat Donasi',
    medicalCopilotStatus: 'Kopilot Medis',
    readyStatus: 'SIAP',
    clinicalIntelligenceHub: 'Pusat Inteligensi Klinis',
    spokenLanguage: 'Bahasa Lisan',
    verifiedClinicalPortal: 'Portal Klinis Terverifikasi',
    welcomeBack: 'Selamat datang kembali',
    welcomeSubtitle: 'Kopilot kesehatan multibahasa Anda siap. Unggah resep atau laporan laboratorium:',
    uploadMedicalDocBtn: 'Unggah Dokumen Medis',
    multimodalVisionCard: 'Visi Multimodal',
    standardAnalytesCard: '15 Analit Standar',
    languagesVoiceCard: 'Suara 150+ Bahasa',
    emergencyIdCard: 'ABDM / QR Siap',
    quickDocScanner: 'Pemindai Cepat Dokumen Medis',
    openFullScanner: 'Buka Pemindai Lengkap →',
    voiceAssistantBtn: 'Asisten Suara',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Keluar',
  },
  // --- VIETNAMESE (Global) ---
  vi: {
    appTitle: 'MediMitra',
    appSubtitle: 'Trợ lý Y tế & Trích xuất Tài liệu Lâm sàng AI',
    heroTag: 'Altrix Labs Hackathon • Giai đoạn 1: Phân tích Đơn thuốc & Xét nghiệm',
    heroTitle: 'Trích xuất Dữ liệu Lâm sàng từ Tài liệu Y tế',
    heroDescription: 'Tải lên đơn thuốc của bác sĩ hoặc kết quả xét nghiệm (JPG, PNG, WEBP, PDF). MediMitra phân tích thuốc, liều lượng và chẩn đoán với hỗ trợ hơn 150 ngôn ngữ.',
    uploadBoxTitle: 'Tải lên Đơn thuốc hoặc Báo cáo Xét nghiệm',
    uploadBoxSubtitle: 'Kéo và thả tệp vào đây, hoặc nhấp để duyệt (Tối đa 20MB).',
    selectDocBtn: 'Chọn Tài liệu Y tế',
    processingTitle: 'Đang xử lý Tài liệu Y tế',
    analyzingStep: 'Đang phân tích với Gemini AI Vision...',
    diagnosesHeading: 'Chẩn đoán & Phát hiện Lâm sàng',
    medicationsHeading: 'Thuốc được Kê đơn & Liều lượng',
    labTestsHeading: 'Chỉ số Xét nghiệm Sinh hóa',
    physicianNotesHeading: 'Lời khuyên & Ghi chú của Bác sĩ',
    dosage: 'Liều lượng',
    frequency: 'Tần suất Dùng',
    duration: 'Thời gian Điều trị',
    instructions: 'Hướng dẫn Sử dụng & Lưu ý',
    listenAudioBtn: 'Nghe Giọng đọc',
    stopAudioBtn: 'Dừng Âm thanh',
    openNihLookup: 'Tra cứu Mã ICD-10 NIH',
    openFdaInfo: 'Thông tin An toàn Thuốc openFDA',
    disclaimerTitle: 'Tuyên bố Miễn trừ Trách nhiệm Y tế',
    disclaimerText: 'MediMitra là công cụ hỗ trợ AI. Luôn tham khảo ý kiến bác sĩ trước khi đưa ra quyết định điều trị.',
    switchLanguage: 'Ngôn ngữ',
    allLanguages: 'Tất cả 150+ Ngôn ngữ',
    indianLanguages: 'Ngôn ngữ Ấn Độ',
    globalLanguages: 'Ngôn ngữ Toàn cầu',
    searchLangPlaceholder: 'Tìm kiếm ngôn ngữ (ví dụ: Tiếng Việt, English)...',
    verifiedIcdCodes: 'Mã Y tế ICD-10 Đã xác minh',
    dashboardNav: 'Bảng điều khiển',
    medicalAiChatNav: 'Hỏi Đáp Y Tế AI',
    prescriptionAiNav: 'AI Đơn thuốc',
    labDiagnosticsNav: 'Chẩn đoán Xét nghiệm',
    liveRatesNav: 'Giá & An toàn Thuốc',
    healthMapNav: 'Bản đồ Cơ sở Y tế',
    voiceAssistantNav: 'Trợ lý Giọng nói AI',
    medicationScheduleNav: 'Lịch Uống thuốc',
    patientVaultNav: 'Hồ sơ Y tế',
    qrMedicalIdNav: 'Hệ thống AI + QR',

    donationNav: 'Trung tâm Hiến tặng',
    medicalCopilotStatus: 'Trợ lý Y tế',
    readyStatus: 'SẴN SÀNG',
    clinicalIntelligenceHub: 'Trung tâm Trí tuệ Lâm sàng',
    spokenLanguage: 'Ngôn ngữ Giao tiếp',
    verifiedClinicalPortal: 'Cổng Lâm sàng Đã xác minh',
    welcomeBack: 'Chào mừng trở lại',
    welcomeSubtitle: 'Trợ lý y tế đa ngôn ngữ của bạn đã sẵn sàng. Tải lên đơn thuốc hoặc đọc ghi chú giọng nói:',
    uploadMedicalDocBtn: 'Tải lên Tài liệu Y tế',
    multimodalVisionCard: 'Thị giác Đa phương thức',
    standardAnalytesCard: '15 Chỉ số Tiêu chuẩn',
    languagesVoiceCard: 'Giọng đọc 150+ Ngôn ngữ',
    emergencyIdCard: 'Sẵn sàng ABDM / QR',
    quickDocScanner: 'Máy quét Tài liệu Y tế Nhanh',
    openFullScanner: 'Mở Máy quét Đầy đủ →',
    voiceAssistantBtn: 'Trợ lý Giọng nói',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Đăng xuất',
  },
  // --- DUTCH (Global) ---
  nl: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI Klinische Documentextractie & Gezondheidscopilot',
    heroTag: 'Altrix Labs Uitdaging • Fase 1: Recept- & Laboratoriumanalyse',
    heroTitle: 'Haal Klinische Gegevens uit Medische Documenten',
    heroDescription: 'Upload doktersrecepten of laboratoriumrapporten (JPG, PNG, WEBP, PDF). MediMitra analyseert medicijnen, doseringen en diagnoses in meer dan 150 talen.',
    uploadBoxTitle: 'Upload Recept of Laboratoriumrapport',
    uploadBoxSubtitle: 'Sleep uw bestand hierheen of klik om te bladeren (Max 20MB).',
    selectDocBtn: 'Selecteer Medisch Document',
    processingTitle: 'Medisch Document Verwerken',
    analyzingStep: 'Analyseren met Gemini AI Vision...',
    diagnosesHeading: 'Diagnoses & Klinische Bevindingen',
    medicationsHeading: 'Voorgeschreven Medicijnen & Dosering',
    labTestsHeading: 'Laboratorium Biomarkers',
    physicianNotesHeading: 'Advies & Opmerkingen van de Arts',
    dosage: 'Dosering',
    frequency: 'Frequentie',
    duration: 'Duur',
    instructions: 'Instructies & Veiligheidsadvies',
    listenAudioBtn: 'Beluister met Stem',
    stopAudioBtn: 'Stop Audio',
    openNihLookup: 'Zoek ICD-10 bij NIH',
    openFdaInfo: 'openFDA Medicatieveiligheid',
    disclaimerTitle: 'Medische Disclaimer',
    disclaimerText: 'MediMitra is een AI-ondersteuningstool. Raadpleeg altijd een arts voor medische beslissingen.',
    switchLanguage: 'Taal',
    allLanguages: 'Alle 150+ Talen',
    indianLanguages: 'Indiase Talen',
    globalLanguages: 'Wereldtalen',
    searchLangPlaceholder: 'Zoek taal (bijv. Nederlands, English, Deutsch)...',
    verifiedIcdCodes: 'Geverifieerde ICD-10 Code',
    dashboardNav: 'Dashboard',
    medicalAiChatNav: 'Medische AI Vraag & Antwoord',
    prescriptionAiNav: 'Recept AI',
    labDiagnosticsNav: 'Labdiagnostiek',
    liveRatesNav: 'Prijzen & Veiligheid',
    healthMapNav: 'Kaart Gezondheidscentra',
    voiceAssistantNav: 'Spraak AI-assistent',
    medicationScheduleNav: 'Medicatieschema',
    patientVaultNav: 'Patiëntendossier',
    qrMedicalIdNav: 'AI + QR-systeem',
    donationNav: 'Donatiecentrum',
    medicalCopilotStatus: 'Medische Copiloot',
    readyStatus: 'GEREED',
    clinicalIntelligenceHub: 'Klinische Intelligentie Hub',
    spokenLanguage: 'Gesproken Taal',
    verifiedClinicalPortal: 'Geverifieerd Klinisch Portaal',
    welcomeBack: 'Welkom terug',
    welcomeSubtitle: 'Uw meertalige gezondheidscopiloot staat klaar. Upload recepten of dicteer notities:',
    uploadMedicalDocBtn: 'Medisch Document Uploaden',
    multimodalVisionCard: 'Multimodale Visie',
    standardAnalytesCard: '15 Standaard Analyten',
    languagesVoiceCard: '150+ Talen Spraakondersteuning',
    emergencyIdCard: 'ABDM / QR Gereed',
    quickDocScanner: 'Snelle Medische Documentenscanner',
    openFullScanner: 'Open Volledige Scanner →',
    voiceAssistantBtn: 'Spraakassistent',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Afmelden',
  },
  // --- POLISH (Global) ---
  pl: {
    appTitle: 'MediMitra',
    appSubtitle: 'Ekstrakcja Dokumentów Medycznych przez AI & Asystent Zdrowia',
    heroTag: 'Wyzwanie Altrix Labs • Faza 1: Analiza Recept i Badań',
    heroTitle: 'Wyodrębnij Dane Kliniczne z Dokumentacji Medycznej',
    heroDescription: 'Prześlij recepty lekarskie lub wyniki badań (JPG, PNG, WEBP, PDF). MediMitra analizuje leki, dawkowanie i diagnozy w ponad 150 językach.',
    uploadBoxTitle: 'Prześlij Receptę lub Wyniki Badań',
    uploadBoxSubtitle: 'Przeciągnij i upuść plik tutaj lub kliknij, aby wybrać (Maks. 20 MB).',
    selectDocBtn: 'Wybierz Dokument Medyczny',
    processingTitle: 'Przetwarzanie Dokumentu Medycznego',
    analyzingStep: 'Analiza za pomocą Gemini AI Vision...',
    diagnosesHeading: 'Diagnozy i Wyniki Kliniczne',
    medicationsHeading: 'Przepisane Leki i Dawkowanie',
    labTestsHeading: 'Biomarkery Laboratoryjne',
    physicianNotesHeading: 'Zalecenia i Uwagi Lekarza',
    dosage: 'Dawka',
    frequency: 'Częstotliwość',
    duration: 'Czas Trwania',
    instructions: 'Instrukcje i Zasady Bezpieczeństwa',
    listenAudioBtn: 'Odsłuchaj Głosem',
    stopAudioBtn: 'Zatrzymaj',
    openNihLookup: 'Wyszukaj Kod ICD-10 NIH',
    openFdaInfo: 'Bezpieczeństwo Leków openFDA',
    disclaimerTitle: 'Zastrzeżenie Medyczne',
    disclaimerText: 'MediMitra to narzędzie wspomagające AI. Zawsze skonsultuj się z lekarzem przed podjęciem decyzji medycznych.',
    switchLanguage: 'Język',
    allLanguages: 'Wszystkie 150+ Języków',
    indianLanguages: 'Języki Indyjskie',
    globalLanguages: 'Języki Globalne',
    searchLangPlaceholder: 'Szukaj języka (np. Polski, English, Deutsch)...',
    verifiedIcdCodes: 'Zweryfikowany Kod ICD-10',
    dashboardNav: 'Pulpit',
    medicalAiChatNav: 'Medyczne pytania i odpowiedzi AI',
    prescriptionAiNav: 'Recepta AI',
    labDiagnosticsNav: 'Diagnostyka Laboratoryjna',
    liveRatesNav: 'Ceny i Bezpieczeństwo',
    healthMapNav: 'Mapa Ośrodków Zdrowia',
    voiceAssistantNav: 'Głosowy Asystent AI',
    medicationScheduleNav: 'Harmonogram Leków',
    patientVaultNav: 'Dokumentacja Pacjenta',
    qrMedicalIdNav: 'System AI + QR',
    donationNav: 'Centrum Dawców',
    medicalCopilotStatus: 'Medyczny Copilot',
    readyStatus: 'GOTOWY',
    clinicalIntelligenceHub: 'Centrum Inteligencji Klinicznej',
    spokenLanguage: 'Język Mówiony',
    verifiedClinicalPortal: 'Zweryfikowany Portal Kliniczny',
    welcomeBack: 'Witaj ponownie',
    welcomeSubtitle: 'Twój wielojęzyczny asystent zdrowotny jest gotowy. Prześlij recepty lub podyktuj notatki:',
    uploadMedicalDocBtn: 'Prześlij Dokument',
    multimodalVisionCard: 'Wizja Multimodalna',
    standardAnalytesCard: '15 Standardowych Analitów',
    languagesVoiceCard: '150+ Języków Głosowych',
    emergencyIdCard: 'Gotowy na ABDM / QR',
    quickDocScanner: 'Szybki Skaner Dokumentów',
    openFullScanner: 'Otwórz Pełny Skaner →',
    voiceAssistantBtn: 'Asystent Głosowy',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'Wyloguj',
  },
  // --- HINDI (Indian) ---
  hi: {
    appTitle: 'मेदीमित्र (MediMitra)',
    appSubtitle: 'एआई-संचालित चिकित्सीय दस्तावेज़ विश्लेषण एवं स्वास्थ्य साथी',
    heroTag: 'अल्ट्रिक्स लैब्स हैकाथॉन • चरण 1: पर्ची व लैब रिपोर्ट विश्लेषण',
    heroTitle: 'चिकित्सीय पर्चियों और रिपोर्टों से डेटा निकालें',
    heroDescription: 'डॉक्टर की पर्ची या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करें। मेदीमित्र दवाइयों, खुराक, बीमारी के नाम और जांच परिणामों का 150+ भाषाओं में विश्लेषण करता है।',
    uploadBoxTitle: 'डॉक्टर का पर्चा या लैब रिपोर्ट अपलोड करें',
    uploadBoxSubtitle: 'अपनी फाइल यहाँ खींचकर लाएँ या चुनने के लिए क्लिक करें (अधिकतम 20MB)।',
    selectDocBtn: 'दस्तावेज़ चुनें',
    processingTitle: 'दस्तावेज़ का विश्लेषण हो रहा है',
    analyzingStep: 'जेमिनी एआई विजन से डेटा निकाला जा रहा है...',
    diagnosesHeading: 'रोग निदान व चिकित्सीय लक्षण (Diagnoses)',
    medicationsHeading: 'निर्धारित दवाइयाँ एवं खुराक (Medications)',
    labTestsHeading: 'लैब रिपोर्ट एवं बायोमार्कर (Lab Biomarkers)',
    physicianNotesHeading: 'डॉक्टर की सलाह एवं निर्देश (Doctor Advice)',
    dosage: 'खुराक',
    frequency: 'लेने का समय/आवृत्ति',
    duration: 'अवधि',
    instructions: 'सेवन विधि व सावधानियाँ',
    listenAudioBtn: 'आवाज़ में सुनें',
    stopAudioBtn: 'आवाज़ बंद करें',
    openNihLookup: 'NIH ICD-10 कोड देखें',
    openFdaInfo: 'FDA दवा सुरक्षा जानकारी',
    disclaimerTitle: 'चिकित्सीय सुरक्षा व अस्वीकरण',
    disclaimerText: 'मेदीमित्र एक एआई सहायक प्रणाली है। किसी भी दवा के सेवन से पूर्व अपने पंजीकृत चिकित्सक से परामर्श अवश्य करें।',
    switchLanguage: 'भाषा चुनें',
    allLanguages: 'सभी 100+ भाषाएं',
    indianLanguages: 'भारतीय आधिकारिक व क्षेत्रीय भाषाएँ',
    globalLanguages: 'विश्व की प्रमुख भाषाएँ',
    searchLangPlaceholder: 'भाषा खोजें (जैसे हिन्दी, Tamil, తెలుగు, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 मेडिकल कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई प्रश्नोत्तर',
    prescriptionAiNav: 'प्रिस्क्रिप्शन एआई',
    labDiagnosticsNav: 'लैब डायग्नोस्टिक्स',
    liveRatesNav: 'दवा दरें व सुरक्षा',
    healthMapNav: 'स्वास्थ्य केंद्र मानचित्र',
    voiceAssistantNav: 'वॉइस एआई सहायक',
    medicationScheduleNav: 'दवा समय-सारणी',
    patientVaultNav: 'रोगी मेडिकल रिकॉर्ड',
    qrMedicalIdNav: 'एआई + क्यूआर आईडी',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'सक्रिय (READY)',
    clinicalIntelligenceHub: 'क्लीनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोली जाने वाली भाषा',
    verifiedClinicalPortal: 'सत्यापित क्लीनिकल पोर्टल',
    welcomeBack: 'पुनः स्वागत है',
    welcomeSubtitle: 'आपका बहुभाषी स्वास्थ्य साथी तैयार है। डॉक्टर की पर्ची, लैब रिपोर्ट अपलोड करें या बोलकर रिकॉर्ड करें:',
    uploadMedicalDocBtn: 'दस्तावेज़ अपलोड करें',
    multimodalVisionCard: 'मल्टीमॉडल विज़न एआई',
    standardAnalytesCard: '15 मानक बायोमार्कर',
    languagesVoiceCard: '150+ भाषा वॉइस सपोर्ट',
    emergencyIdCard: 'आयुष्मान भारत (ABDM) तैयार',
    quickDocScanner: 'त्वरित मेडिकल दस्तावेज़ स्कैनर',
    openFullScanner: 'संपूर्ण स्कैनर खोलें →',
    voiceAssistantBtn: 'वॉइस असिस्टेंट',
    nihIcd10Btn: 'NIH ICD-10 कोड',
    signOut: 'लॉग आउट',
  },
  // --- TAMIL (Indian) ---
  ta: {
    appTitle: 'மேதிமித்ரா (MediMitra)',
    appSubtitle: 'செயற்கை நுண்ணறிவு மருத்துவ அறிக்கை ஆய்வாளர்',
    heroTag: 'அல்ட்ரிக்ஸ் லேப்ஸ் ஹேக்கத்தான் • நிலை 1: மருத்துவ ஆவணங்கள் ஆய்வு',
    heroTitle: 'மருத்துவர் சீட்டு & ஆய்வக அறிக்கைகளிலிருந்து விவரங்களை பிரித்தெடுக்கவும்',
    heroDescription: 'மருத்துவர் மருந்துச் சீட்டு அல்லது ரத்த பரிசோதனை அறிக்கையை பதிவேற்றவும். மருந்துகள், அளவுகள், நோயறிதல் மற்றும் பாதுகாப்பு வழிகாட்டுதல்களை 150+ மொழிகளில் பெறலாம்.',
    uploadBoxTitle: 'மருந்துச் சீட்டு அல்லது பரிசோதனை அறிக்கையை பதிவேற்றவும்',
    uploadBoxSubtitle: 'உங்கள் கோப்பை இங்கே இழுத்து விடவும் அல்லது கிளிக் செய்து தேர்ந்தெடுக்கவும்.',
    selectDocBtn: 'ஆவணத்தைத் தேர்ந்தெடுக்கவும்',
    processingTitle: 'ஆவணம் ஆய்வு செய்யப்படுகிறது',
    analyzingStep: 'ஜெமினி ஏஐ மூலம் தரவுகள் பிரித்தெடுக்கப்படுகின்றன...',
    diagnosesHeading: 'நோயறிதல் & அறிகுறிகள் (Diagnoses)',
    medicationsHeading: 'பரிந்துரைக்கப்பட்ட மருந்துகள் (Medications)',
    labTestsHeading: 'ஆய்வக சோதனை முடிவுகள் (Lab Tests)',
    physicianNotesHeading: 'மருத்துவரின் ஆலோசனைகள் (Doctor Advice)',
    dosage: 'மருந்தின் அளவு',
    frequency: 'எடுத்துக்கொள்ளும் முறை',
    duration: 'நாட்கள் அளவு',
    instructions: 'பயன்பாட்டு வழிமுறைகள்',
    listenAudioBtn: 'குரல் வழியே கேட்கவும்',
    stopAudioBtn: 'நிறுத்து',
    openNihLookup: 'NIH ICD-10 குறியீடு பார்க்க',
    openFdaInfo: 'FDA மருந்து பாதுகாப்பு தகவல்',
    disclaimerTitle: 'மருத்துவ பாதுகாப்பு அறிவிப்பு',
    disclaimerText: 'மேதிமித்ரா ஒரு ஏஐ மருத்துவ தகவல் கருவி மட்டுமே. மருத்துவ முடிவுகளுக்கு எப்போதும் மருத்துவரை அணுகவும்.',
    switchLanguage: 'மொழி',
    allLanguages: '100+ மொழிகள்',
    indianLanguages: 'இந்திய மொழிகள்',
    globalLanguages: 'உலக மொழிகள்',
    searchLangPlaceholder: 'மொழியைத் தேடவும் (எ.கா. தமிழ், Hindi, English)...',
    verifiedIcdCodes: 'சரிபார்க்கப்பட்ட ICD-10 குறியீடு',
    dashboardNav: 'டாஷ்போர்டு',
    medicalAiChatNav: 'மருத்துவ AI கேள்வி-பதில்',
    prescriptionAiNav: 'மருந்துச் சீட்டு ஏஐ',
    labDiagnosticsNav: 'ஆய்வக சோதனைகள்',
    liveRatesNav: 'மருந்து விலைகள் & பாதுகாப்பு',
    healthMapNav: 'மருத்துவமனைகள் வரைபடம்',
    voiceAssistantNav: 'குரல் ஏஐ உதவியாளர்',
    medicationScheduleNav: 'மருந்து அட்டவணை',
    patientVaultNav: 'நோயாளி மருத்துவ பெட்டகம்',
    qrMedicalIdNav: 'ஏஐ + அவசர QR அட்டை',

    donationNav: 'தான மையம் (Donation Hub)',
    medicalCopilotStatus: 'மருத்துவ கோபைலட்',
    readyStatus: 'தயார் (READY)',
    clinicalIntelligenceHub: 'மருத்துவ நுண்ணறிவு மையம்',
    spokenLanguage: 'பேசும் மொழி',
    verifiedClinicalPortal: 'சரிபார்க்கப்பட்ட மருத்துவ போர்டல்',
    welcomeBack: 'மீண்டும் வருக',
    welcomeSubtitle: 'உங்கள் பன்மொழி மருத்துவ உதவியாளர் தயார். மருந்துச் சீட்டுகள், ஆய்வக அறிக்கைகளை பதிவேற்றவும் அல்லது குரல் வழியே பகிரவும்:',
    uploadMedicalDocBtn: 'ஆவணம் பதிவேற்றவும்',
    multimodalVisionCard: 'மல்டிமாடல் விஷன் ஏஐ',
    standardAnalytesCard: '15 நிலையான சோதனைகள்',
    languagesVoiceCard: '150+ மொழி குரல் ஆதரவு',
    emergencyIdCard: 'ABDM / அவசர QR தயார்',
    quickDocScanner: 'விரைவு மருத்துவ ஆவண ஸ்கேனர்',
    openFullScanner: 'முழு ஸ்கேனரை திறக்கவும் →',
    voiceAssistantBtn: 'குரல் உதவியாளர்',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'வெளியேறு',
  },
  // --- TELUGU (Indian) ---
  te: {
    appTitle: 'మేదిమిత్ర (MediMitra)',
    appSubtitle: 'ఏఐ ఆధారిత క్లినికల్ డాక్యుమెంట్ & హెల్త్ కోపైలట్',
    heroTag: 'ఆల్ట్రిక్స్ ల్యాబ్స్ హ్యాకథాన్ • వైద్య పత్రాల గుర్తింపు',
    heroTitle: 'మెడికల్ ప్రిస్క్రిప్షన్ల నుండి సులభంగా సమాచారాన్ని పొందండి',
    heroDescription: 'డాక్టర్ ప్రిస్క్రిప్షన్ లేదా ల్యాబ్ రిపోర్టులను అప్‌లోడ్ చేయండి. మందులు, మోతాదులు, వ్యాధి వివరాలను 150+ భాషల్లో సులభంగా అర్థం చేసుకోండి.',
    uploadBoxTitle: 'ప్రిస్క్రిప్షన్ లేదా ల్యాబ్ రిపోర్ట్ అప్‌లోడ్ చేయండి',
    uploadBoxSubtitle: 'మీ ఫైల్‌ను ఇక్కడ డ్రాగ్ చేయండి లేదా ఎంచుకోవడానికి క్లిక్ చేయండి.',
    selectDocBtn: 'డాక్యుమెంట్ ఎంచుకోండి',
    processingTitle: 'డాక్యుమెంట్ ప్రాసెస్ చేయబడుతోంది',
    analyzingStep: 'జెమిని ఏఐ విజన్ ద్వారా విశ్లేషణ జరుగుతోంది...',
    diagnosesHeading: 'వ్యాధి నిర్ధారణ (Diagnoses)',
    medicationsHeading: 'సూచించిన మందులు (Medications)',
    labTestsHeading: 'ల్యాబ్ టెస్ట్ ఫలితాలు (Lab Tests)',
    physicianNotesHeading: 'వైద్యుల సలహాలు (Doctor Advice)',
    dosage: 'మోతాదు',
    frequency: 'తీసుకోవలసిన సమయం',
    duration: 'వ్యవధి',
    instructions: 'సూచనలు & జాగ్రత్తలు',
    listenAudioBtn: 'వాయిస్‌లో వినండి',
    stopAudioBtn: 'ఆపు',
    openNihLookup: 'NIH ICD-10 కోడ్ చూడండి',
    openFdaInfo: 'FDA ఔషధ భద్రతా సమాచారం',
    disclaimerTitle: 'వైద్య భద్రతా నిరాకరణ',
    disclaimerText: 'మేదిమిత్ర అనేది సహాయక ఏఐ సాధనం. ఏదైనా మందు తీసుకునే ముందు వైద్యుడిని సంప్రదించండి.',
    switchLanguage: 'భాష',
    allLanguages: '150+ భాషలు',
    indianLanguages: 'భారతీయ భాషలు',
    globalLanguages: 'ప్రపంచ భాషలు',
    searchLangPlaceholder: 'భాషను శోధించండి (ఉదా. తెలుగు, Hindi, English)...',
    verifiedIcdCodes: 'ధృవీకరించబడిన ICD-10 కోడ్',
    dashboardNav: 'డాష్‌బోర్డ్',
    medicalAiChatNav: 'వైద్య AI ప్రశ్నోత్తరాలు',
    prescriptionAiNav: 'ప్రిస్క్రిప్షన్ ఏఐ',
    labDiagnosticsNav: 'ల్యాబ్ పరీక్షలు',
    liveRatesNav: 'మందుల ధరలు & భద్రత',
    healthMapNav: 'ఆరోగ్య కేంద్రాల మ్యాప్',
    voiceAssistantNav: 'వాయిస్ ఏఐ అసిస్టెంట్',
    medicationScheduleNav: 'మందుల షెడ్యూల్',
    patientVaultNav: 'వైద్య రికార్డుల వాల్ట్',
    qrMedicalIdNav: 'ఏఐ + క్యూఆర్ గుర్తింపు',

    donationNav: 'దాన కేంద్రం (Donation Hub)',
    medicalCopilotStatus: 'మెడికల్ కోపైలట్',
    readyStatus: 'సిద్ధంగా ఉంది',
    clinicalIntelligenceHub: 'క్లినికల్ ఇంటెలిజెన్స్ హబ్',
    spokenLanguage: 'మాట్లాడే భాష',
    verifiedClinicalPortal: 'ధృవీకరించబడిన క్లినికల్ పోర్టల్',
    welcomeBack: 'తిరిగి స్వాగతం',
    welcomeSubtitle: 'మీ బహుభాషా ఆరోగ్య కోపైలట్ సిద్ధంగా ఉంది. ప్రిస్క్రిప్షన్లు, ల్యాబ్ రిపోర్టులు అప్‌లోడ్ చేయండి:',
    uploadMedicalDocBtn: 'మెడికల్ డాక్యుమెంట్ అప్‌లోడ్',
    multimodalVisionCard: 'మల్టీమోడల్ విజన్',
    standardAnalytesCard: '15 ప్రమాణ పరీక్షలు',
    languagesVoiceCard: '150+ భాషల వాయిస్',
    emergencyIdCard: 'ABDM / క్యూఆర్ రెడీ',
    quickDocScanner: 'త్వరిత మెడికల్ డాక్యుమెంట్ స్కానర్',
    openFullScanner: 'పూర్తి స్కానర్ తెరవండి →',
    voiceAssistantBtn: 'వాయిస్ అసిస్టెంట్',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'లాగౌట్',
  },
  // --- BENGALI (Indian) ---
  bn: {
    appTitle: 'মেদিমিত্র (MediMitra)',
    appSubtitle: 'এআই-চালিত স্বাস্থ্য ডকুমেন্ট ও প্রেসক্রিপশন সহকারী',
    heroTag: 'আল্ট্রিক্স ল্যাবস হ্যাকাথন • প্রেসক্রিপশন ও ল্যাব রিপোর্ট বিশ্লেষণ',
    heroTitle: 'চিকিৎসা সংক্রান্ত নথি থেকে তথ্য বের করুন',
    heroDescription: 'প্রেসক্রিপশন বা ল্যাব রিপোর্ট আপলোড করুন। মেদিমিত্র ওষুধ, ডোজ, রোগ নির্ণয় এবং নির্দেশিকা ১৫০+ ভাষায় প্রদান করে।',
    uploadBoxTitle: 'প্রেসক্রিপশন বা ল্যাব রিপোর্ট আপলোড করুন',
    uploadBoxSubtitle: 'ফাইলটি এখানে টেনে আনুন বা নির্বাচন করতে ক্লিক করুন।',
    selectDocBtn: 'ডকুমেন্ট নির্বাচন করুন',
    processingTitle: 'ডকুমেন্ট বিশ্লেষণ করা হচ্ছে',
    analyzingStep: 'জেমিনি এআই দিয়ে তথ্য সংগ্রহ করা হচ্ছে...',
    diagnosesHeading: 'রোগ নির্ণয় ও লক্ষণ (Diagnoses)',
    medicationsHeading: 'প্রেসক্রাইব করা ওষুধসমূহ (Medications)',
    labTestsHeading: 'ল্যাব পরীক্ষার ফলাফল (Lab Tests)',
    physicianNotesHeading: 'চিকিৎসকের পরামর্শ (Doctor Advice)',
    dosage: 'ডোজ / মাত্রা',
    frequency: 'সেবনের সময়',
    duration: 'সময়কাল',
    instructions: 'সেবন নির্দেশিকা ও সতর্কতা',
    listenAudioBtn: 'ভয়েসে শুনুন',
    stopAudioBtn: 'থামান',
    openNihLookup: 'NIH ICD-10 কোড খুঁজুন',
    openFdaInfo: 'FDA ড্রাগ সুরক্ষা তথ্য',
    disclaimerTitle: 'চিকিৎসা বিষয়ক দাবিত্যাগ',
    disclaimerText: 'মেদিমিত্র একটি এআই সহকারী ব্যবস্থা। যেকোনো ওষুধ গ্রহণের পূর্বে চিকিৎসকের পরামর্শ নিন।',
    switchLanguage: 'ভাষা',
    allLanguages: '১৫০+ ভাষা',
    indianLanguages: 'ভারতীয় ভাষাসমূহ',
    globalLanguages: 'আন্তর্জাতিক ভাষাসমূহ',
    searchLangPlaceholder: 'ভাষা খুঁজুন (যেমন বাংলা, Hindi, English)...',
    verifiedIcdCodes: 'যাচাইকৃত ICD-10 কোড',
    dashboardNav: 'ড্যাশবোর্ড',
    medicalAiChatNav: 'মেডিকেল এআই প্রশ্নোত্তর',
    prescriptionAiNav: 'প্রেসক্রিপশন এআই',
    labDiagnosticsNav: 'ল্যাব বায়োমার্কার',
    liveRatesNav: 'ওষুধের দাম ও সুরক্ষা',
    healthMapNav: 'স্বাস্থ্য কেন্দ্রের মানচিত্র',
    voiceAssistantNav: 'ভয়েস এআই সহকারী',
    medicationScheduleNav: 'ওষুধের সময়সূচী',
    patientVaultNav: 'মেডিকেল রেকর্ড ভল্ট',
    qrMedicalIdNav: 'এআই + কিউআর আইডি',

    donationNav: 'দান কেন্দ্র (Donation Hub)',
    medicalCopilotStatus: 'মেডিকেল কোপাইলট',
    readyStatus: 'প্রস্তুত',
    clinicalIntelligenceHub: 'ক্লিনিক্যাল ইন্টেলিজেন্স হাব',
    spokenLanguage: 'কথ্য ভাষা',
    verifiedClinicalPortal: 'যাচাইকৃত ক্লিনিক্যাল পোর্টাল',
    welcomeBack: 'স্বাগতম',
    welcomeSubtitle: 'আপনার বহুভাষিক স্বাস্থ্য সহকারী প্রস্তুত। প্রেসক্রিপশন বা ল্যাব রিপোর্ট আপলোড করুন:',
    uploadMedicalDocBtn: 'নথি আপলোড করুন',
    multimodalVisionCard: 'মাল্টিমোডাল ভিশন',
    standardAnalytesCard: '১৫টি মানক পরীক্ষা',
    languagesVoiceCard: '১৫০+ ভাষা ভয়েস',
    emergencyIdCard: 'ABDM / কিউআর প্রস্তুত',
    quickDocScanner: 'দ্রুত মেডিকেল নথি স্ক্যানার',
    openFullScanner: 'সম্পূর্ণ স্ক্যানার খুলুন →',
    voiceAssistantBtn: 'ভয়েস সহকারী',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'লগআউট',
  },
  // --- MARATHI (Indian) ---
  mr: {
    appTitle: 'मेदीमित्र (MediMitra)',
    appSubtitle: 'एआय-सक्षम वैद्यकीय दस्तऐवज विश्लेषक व आरोग्य मार्गदर्शक',
    heroTag: 'अल्ट्रिक्स लॅब्स हॅकॅथॉन • टप्पा १: प्रिस्क्रिप्शन व लॅब रिपोर्ट विश्लेषण',
    heroTitle: 'वैद्यकीय कागदपत्रांमधून आरोग्य माहिती मिळवा',
    heroDescription: 'डॉक्टरांची चिठ्ठी किंवा लॅब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करा. मेदीमित्र औषधे, डोस आणि आजारांचे १५०+ भाषांमध्ये विश्लेषण करते.',
    uploadBoxTitle: 'प्रिस्क्रिप्शन किंवा लॅब रिपोर्ट अपलोड करा',
    uploadBoxSubtitle: 'तुमची फाइल येथे ड्रॅग करा किंवा निवडण्यासाठी क्लिक करा (कमाल 20MB).',
    selectDocBtn: 'वैद्यकीय दस्तऐवज निवडा',
    processingTitle: 'दस्तऐवजाचे विश्लेषण सुरू आहे',
    analyzingStep: 'जेमिनी एआय व्हिजनद्वारे माहिती मिळवत आहे...',
    diagnosesHeading: 'रोगनिदान व लक्षणे (Diagnoses)',
    medicationsHeading: 'दिलेली औषधे व डोस (Medications)',
    labTestsHeading: 'लॅब चाचणी निष्कर्ष (Lab Tests)',
    physicianNotesHeading: 'डॉक्टरांचा सल्ला व सूचना (Doctor Advice)',
    dosage: 'डोस / प्रमाण',
    frequency: 'घेण्याची वेळ/वारंवारता',
    duration: 'कालावधी',
    instructions: 'वापराच्या सूचना व काळजी',
    listenAudioBtn: 'आवाजात ऐका',
    stopAudioBtn: 'आवाज बंद करा',
    openNihLookup: 'NIH ICD-10 कोड शोधा',
    openFdaInfo: 'FDA औषध सुरक्षा माहिती',
    disclaimerTitle: 'वैद्यकीय सुरक्षा अस्वीकरण',
    disclaimerText: 'मेदीमित्र हे एआय सहाय्यक साधन आहे. वैद्यकीय निर्णयांसाठी नेहमी तज्ज्ञ डॉक्टरांचा सल्ला घ्या.',
    switchLanguage: 'भाषा',
    allLanguages: 'सर्व 150+ भाषा',
    indianLanguages: 'भारतीय भाषा',
    globalLanguages: 'जागतिक भाषा',
    searchLangPlaceholder: 'भाषा शोधा (उदा. मराठी, हिन्दी, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 कोड',
    dashboardNav: 'डॅशबोर्ड',
    medicalAiChatNav: 'वैद्यकीय एआई प्रश्नोत्तरे',
    prescriptionAiNav: 'प्रिस्क्रिप्शन एआई',
    labDiagnosticsNav: 'लॅब चाचण्या',
    liveRatesNav: 'औषध दर व सुरक्षा',
    healthMapNav: 'आरोग्य केंद्र नकाशा',
    voiceAssistantNav: 'व्हॉईस एआई सहाय्यक',
    medicationScheduleNav: 'औषध वेळापत्रक',
    patientVaultNav: 'वैद्यकीय दस्तऐवज',
    qrMedicalIdNav: 'एआई + क्यूआर कार्ड',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'वैद्यकीय कोपायलट',
    readyStatus: 'तयार',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजन्स हब',
    spokenLanguage: 'बोलण्याची भाषा',
    verifiedClinicalPortal: 'सत्यापित क्लिनिकल पोर्टल',
    welcomeBack: 'पुन्हा स्वागत आहे',
    welcomeSubtitle: 'तुमचा बहुभाषिक आरोग्य साथी तयार आहे. प्रिस्क्रिप्शन किंवा लॅब रिपोर्ट अपलोड करा:',
    uploadMedicalDocBtn: 'दस्तऐवज अपलोड करा',
    multimodalVisionCard: 'मल्टीमॉडल व्हिजन',
    standardAnalytesCard: '१५ मानक चाचण्या',
    languagesVoiceCard: '१५०+ भाषा व्हॉईस',
    emergencyIdCard: 'ABDM / क्यूआर सज्ज',
    quickDocScanner: 'जलद वैद्यकीय दस्तऐवज स्कॅनर',
    openFullScanner: 'पूर्ण स्कॅनर उघडा →',
    voiceAssistantBtn: 'व्हॉईस असिस्टंट',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },
  // --- GUJARATI (Indian) ---
  gu: {
    appTitle: 'મેદીમિત્ર (MediMitra)',
    appSubtitle: 'AI આધારિત ક્લિનિકલ દસ્તાવેજ વિશ્લેષક અને આરોગ્ય સાથી',
    heroTag: 'અલ્ટ્રિક્સ લેબ્સ હેકાથોન • તબક્કો ૧: પ્રિસ્ક્રિપ્શન વિશ્લેષણ',
    heroTitle: 'તબીબી દસ્તાવેજોમાંથી માહિતી મેળવો',
    heroDescription: 'ડોક્ટરનું પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ અપલોડ કરો. મેદીમિત્ર દવાઓ, માત્રા અને રોગનું ૧૫૦+ ભાષાઓમાં વિશ્લેષણ કરે છે.',
    uploadBoxTitle: 'પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ અપલોડ કરો',
    uploadBoxSubtitle: 'ફાઇલ અહીં ખેંચો અથવા પસંદ કરવા માટે ક્લિક કરો (મહત્તમ 20MB).',
    selectDocBtn: 'દસ્તાવેજ પસંદ કરો',
    processingTitle: 'દસ્તાવેજનું વિશ્લેષણ થઈ રહ્યું છે',
    analyzingStep: 'જેમિની AI દ્વારા માહિતી એકત્રિત થઈ રહી છે...',
    diagnosesHeading: 'રોગનિદાન અને લક્ષણો (Diagnoses)',
    medicationsHeading: 'લખેલી દવાઓ અને માત્રા (Medications)',
    labTestsHeading: 'લેબ પરીક્ષણ પરિણામો (Lab Tests)',
    physicianNotesHeading: 'ડોક્ટરની સલાહ અને સૂચનાઓ (Doctor Advice)',
    dosage: 'માત્રા (Dose)',
    frequency: 'લેવાનો સમય',
    duration: 'સમયગાળો',
    instructions: 'ઉપયોગની સૂચનાઓ',
    listenAudioBtn: 'અવાજમાં સાંભળો',
    stopAudioBtn: 'અવાજ બંધ કરો',
    openNihLookup: 'NIH ICD-10 કોડ શોધો',
    openFdaInfo: 'FDA દવા સુરક્ષા માહિતી',
    disclaimerTitle: 'તબીબી સુરક્ષા જાહેરાત',
    disclaimerText: 'મેદીમિત્ર એ AI સહાયક સાધન છે. તબીબી નિર્ણયો માટે હંમેશા ડોક્ટરની સલાહ લો.',
    switchLanguage: 'ભાષા',
    allLanguages: 'બધી ૧૫૦+ ભાષાઓ',
    indianLanguages: 'ભારતીય ભાષાઓ',
    globalLanguages: 'વૈશ્વિક ભાષાઓ',
    searchLangPlaceholder: 'ભાષા શોધો (દા.ત. ગુજરાતી, हिन्दी, English)...',
    verifiedIcdCodes: 'પ્રમાણિત ICD-10 કોડ',
    dashboardNav: 'ડેશબોર્ડ',
    medicalAiChatNav: 'તબીબી AI પ્રશ્નોત્તરી',
    prescriptionAiNav: 'પ્રિસ્ક્રિપ્શન AI',
    labDiagnosticsNav: 'લેબ નિદાન',
    liveRatesNav: 'દવા ભાવ અને સુરક્ષા',
    healthMapNav: 'આરોગ્ય કેન્દ્ર નકશો',
    voiceAssistantNav: 'વોઇસ AI સહાયક',
    medicationScheduleNav: 'દવા સમયપત્રક',
    patientVaultNav: 'દર્દી મેડિકલ રેકોર્ડ',
    qrMedicalIdNav: 'AI + QR સિસ્ટમ',

    donationNav: 'દાન કેન્દ્ર (Donation Hub)',
    medicalCopilotStatus: 'મેડિકલ કોપાયલોટ',
    readyStatus: 'તૈયાર',
    clinicalIntelligenceHub: 'ક્લિનિકલ ઇન્ટેલિજન્સ હબ',
    spokenLanguage: 'બોલવાની ભાષા',
    verifiedClinicalPortal: 'પ્રમાણિત ક્લિનિકલ પોર્ટલ',
    welcomeBack: 'પાછા સ્વાગત છે',
    welcomeSubtitle: 'તમારો બહુભાષી આરોગ્ય સાથી તૈયાર છે. પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ અપલોડ કરો:',
    uploadMedicalDocBtn: 'દસ્તાવેજ અપલોડ કરો',
    multimodalVisionCard: 'મલ્ટીમોડલ વિઝન',
    standardAnalytesCard: '૧૫ પ્રમાણિત પરીક્ષણો',
    languagesVoiceCard: '૧૫૦+ ભાષાઓમાં અવાજ',
    emergencyIdCard: 'ABDM / QR તૈયાર',
    quickDocScanner: 'ઝડપી મેડિકલ સ્કેનર',
    openFullScanner: 'સંપૂર્ણ સ્કેનર ખોલો →',
    voiceAssistantBtn: 'વોઇસ સહાયક',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'લૉગ આઉટ',
  },
  // --- KANNADA (Indian) ---
  kn: {
    appTitle: 'ಮೇದಿಮಿತ್ರ (MediMitra)',
    appSubtitle: 'ಎಐ ಚಾಲಿತ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳ ವಿಶ್ಲೇಷಕ & ಆರೋಗ್ಯ ಸಹಾಯಕ',
    heroTag: 'ಆಲ್ಟ್ರಿಕ್ಸ್ ಲ್ಯಾಬ್ಸ್ ಹ್ಯಾಕಥಾನ್ • ಹಂತ 1: ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವಿಶ್ಲೇಷಣೆ',
    heroTitle: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳಿಂದ ಸುಲಭವಾಗಿ ಮಾಹಿತಿ ಪಡೆಯಿರಿ',
    heroDescription: 'ವೈದ್ಯರ ಚೀಟಿ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಔಷಧಿಗಳು, ಪ್ರಮಾಣ ಮತ್ತು ರೋಗ ವಿವರಗಳನ್ನು 150+ ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
    uploadBoxTitle: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadBoxSubtitle: 'ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ.',
    selectDocBtn: 'ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    processingTitle: 'ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ',
    analyzingStep: 'ಜೆಮಿನಿ ಎಐ ಮೂಲಕ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    diagnosesHeading: 'ರೋಗನಿರ್ಣಯ ಮತ್ತು ಲಕ್ಷಣಗಳು (Diagnoses)',
    medicationsHeading: 'ಸೂಚಿಸಲಾದ ಔಷಧಿಗಳು (Medications)',
    labTestsHeading: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು (Lab Tests)',
    physicianNotesHeading: 'ವೈದ್ಯರ ಸಲಹೆಗಳು (Doctor Advice)',
    dosage: 'ಪ್ರಮಾಣ (Dosage)',
    frequency: 'ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ',
    duration: 'ಅವಧಿ',
    instructions: 'ಬಳಕೆಯ ಸೂಚನೆಗಳು',
    listenAudioBtn: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    stopAudioBtn: 'ನಿಲ್ಲಿಸಿ',
    openNihLookup: 'NIH ICD-10 ಕೋಡ್ ನೋಡಿ',
    openFdaInfo: 'FDA ಔಷಧಿ ಸುರಕ್ಷತೆ ಮಾಹಿತಿ',
    disclaimerTitle: 'ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ಸೂಚನೆ',
    disclaimerText: 'ಮೇದಿಮಿತ್ರ ಒಂದು ಎಐ ಸಹಾಯಕ ಸಾಧನವಾಗಿದೆ. ವೈದ್ಯಕೀಯ ನಿರ್ಧಾರಗಳಿಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    switchLanguage: 'ಭಾಷೆ',
    allLanguages: 'ಎಲ್ಲಾ 150+ ಭಾಷೆಗಳು',
    indianLanguages: 'ಭಾರತೀಯ ಭಾಷೆಗಳು',
    globalLanguages: 'ಜಾಗತಿಕ ಭಾಷೆಗಳು',
    searchLangPlaceholder: 'ಭಾಷೆಯನ್ನು ಹುಡುಕಿ (ಉದಾ. ಕನ್ನಡ, हिन्दी, English)...',
    verifiedIcdCodes: 'ದೃಢೀಕರಿಸಿದ ICD-10 ಕೋಡ್',
    dashboardNav: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    medicalAiChatNav: 'ವೈದ್ಯಕೀಯ AI ಪ್ರಶ್ನೋತ್ತರ',
    prescriptionAiNav: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಎಐ',
    labDiagnosticsNav: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು',
    liveRatesNav: 'ಔಷಧಿ ದರಗಳು & ಸುರಕ್ಷತೆ',
    healthMapNav: 'ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳ ನಕ್ಷೆ',
    voiceAssistantNav: 'ಧ್ವನಿ ಎಐ ಸಹಾಯಕ',
    medicationScheduleNav: 'ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ',
    patientVaultNav: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು',
    qrMedicalIdNav: 'ಎಐ + ಕ್ಯೂಆರ್ ಐಡಿ',

    donationNav: 'ದಾನ ಕೇಂದ್ರ (Donation Hub)',
    medicalCopilotStatus: 'ಮೆಡಿಕಲ್ ಕೋಪೈಲಟ್',
    readyStatus: 'ಸಿದ್ಧವಾಗಿದೆ',
    clinicalIntelligenceHub: 'ಕ್ಲಿನಿಕಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಹಬ್',
    spokenLanguage: 'ಮಾತನಾಡುವ ಭಾಷೆ',
    verifiedClinicalPortal: 'ದೃಢೀಕೃತ ಕ್ಲಿನಿಕಲ್ ಪೋರ್ಟಲ್',
    welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    welcomeSubtitle: 'ನಿಮ್ಮ ಬಹುಭಾಷಾ ಆರೋಗ್ಯ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ. ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ:',
    uploadMedicalDocBtn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    multimodalVisionCard: 'ಮಲ್ಟಿಮೋಡಲ್ ವಿಷನ್',
    standardAnalytesCard: '15 ಪ್ರಮಾಣಿತ ಪರೀಕ್ಷೆಗಳು',
    languagesVoiceCard: '150+ ಭಾಷೆಗಳ ಧ್ವನಿ',
    emergencyIdCard: 'ABDM / ಕ್ಯೂಆರ್ ಸಿದ್ಧ',
    quickDocScanner: 'ತ್ವರಿತ ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್',
    openFullScanner: 'ಪೂರ್ಣ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ →',
    voiceAssistantBtn: 'ಧ್ವನಿ ಸಹಾಯಕ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ಸೈನ್ ಔಟ್',
  },
  // --- MALAYALAM (Indian) ---
  ml: {
    appTitle: 'മേദിമിത്ര (MediMitra)',
    appSubtitle: 'എഐ അധിഷ്ഠിത ക്ലിനിക്കൽ റിപ്പോർട്ട് അനലൈസർ & ഹെൽത്ത് കോപൈലറ്റ്',
    heroTag: 'ആൾട്രിക്സ് ലാബ്സ് ഹാക്കത്തോൺ • ഘട്ടം 1: കുറിപ്പടി & ലാബ് പരിശോധന',
    heroTitle: 'മെഡിക്കൽ രേഖകളിൽ നിന്ന് വിവരങ്ങൾ എളുപ്പത്തിൽ വേർതിരിച്ചെടുക്കൂ',
    heroDescription: 'ഡോക്ടറുടെ കുറിപ്പടിയോ ലാബ് റിപ്പോർട്ടോ അപ്‌ലോഡ് ചെയ്യുക. മരുന്നുകൾ, അളവുകൾ, രോഗവിവരങ്ങൾ എന്നിവ 150+ ഭാഷകളിൽ ലഭ്യമാക്കുന്നു.',
    uploadBoxTitle: 'കുറിപ്പടിയോ ലാബ് റിപ്പോർട്ടോ അപ്‌ലോഡ് ചെയ്യുക',
    uploadBoxSubtitle: 'ഫയൽ ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക.',
    selectDocBtn: 'രേഖ തിരഞ്ഞെടുക്കുക',
    processingTitle: 'രേഖ വിശകലനം ചെയ്യുന്നു',
    analyzingStep: 'ജെമിനി എഐ വഴി വിവരങ്ങൾ പരിശോധിക്കുന്നു...',
    diagnosesHeading: 'രോഗനിർണയം (Diagnoses)',
    medicationsHeading: 'നിർദ്ദേശിച്ച മരുന്നുകൾ (Medications)',
    labTestsHeading: 'ലാബ് പരിശോധനാ ഫലങ്ങൾ (Lab Tests)',
    physicianNotesHeading: 'ഡോക്ടറുടെ നിർദ്ദേശങ്ങൾ (Doctor Advice)',
    dosage: 'മരുന്നിന്റെ അളവ്',
    frequency: 'കഴിക്കേണ്ട സമയം',
    duration: 'ദിവസങ്ങൾ',
    instructions: 'ഉപയോഗ നിർദ്ദേശങ്ങൾ',
    listenAudioBtn: 'ശബ്ദത്തിൽ കേൾക്കൂ',
    stopAudioBtn: 'നിർത്തൂ',
    openNihLookup: 'NIH ICD-10 കോഡ് കാണുക',
    openFdaInfo: 'FDA മരുന്ന് സുരക്ഷാ വിവരം',
    disclaimerTitle: 'മെഡിക്കൽ സുരക്ഷാ അറിയിപ്പ്',
    disclaimerText: 'മേദിമിത്ര ഒരു എഐ സഹായ സംവിധാനമാണ്. ചികിത്സാ തീരുമാനങ്ങൾക്ക് ഡോക്ടറുടെ ഉപദേശം തേടുക.',
    switchLanguage: 'ഭാഷ',
    allLanguages: 'എല്ലാ 150+ ഭാഷകളും',
    indianLanguages: 'ഇന്ത്യൻ ഭാഷകൾ',
    globalLanguages: 'ആഗോള ഭാഷകൾ',
    searchLangPlaceholder: 'ഭാഷ തിരയുക (ഉദാ. മലയാളം, Hindi, English)...',
    verifiedIcdCodes: 'പരിശോധിച്ച ICD-10 കോഡ്',
    dashboardNav: 'ഡാഷ്‌ബോർഡ്',
    medicalAiChatNav: 'മെഡിക്കൽ AI ചോദ്യോത്തരം',
    prescriptionAiNav: 'കുറിപ്പടി എഐ',
    labDiagnosticsNav: 'ലാബ് പരിശോധനകൾ',
    liveRatesNav: 'മരുന്ന് നിരക്കുകളും സുരക്ഷയും',
    healthMapNav: 'ആരോഗ്യ കേന്ദ്രങ്ങളുടെ ഭൂപടം',
    voiceAssistantNav: 'ശബ്ദ എഐ അസിസ്റ്റന്റ്',
    medicationScheduleNav: 'മരുന്ന് സമയക്രമം',
    patientVaultNav: 'മെഡിക്കൽ രേഖകൾ',
    qrMedicalIdNav: 'എഐ + ക്യുആർ ഐഡി',

    donationNav: 'ദാന കേന്ദ്രം (Donation Hub)',
    medicalCopilotStatus: 'മെഡിക്കൽ കോപൈಲറ്റ്',
    readyStatus: 'സജ്ജമാണ്',
    clinicalIntelligenceHub: 'ക്ലിനിക്കൽ ഇന്റലിജൻസ് ഹബ്',
    spokenLanguage: 'സംസാരിക്കുന്ന ഭാഷ',
    verifiedClinicalPortal: 'സ്ഥിരീകരിച്ച ക്ലിനിക്കൽ പോർട്ടൽ',
    welcomeBack: 'വീണ്ടും സ്വാഗതം',
    welcomeSubtitle: 'നിങ്ങളുടെ ബഹുഭാഷാ ആരോഗ്യ സഹായി തയ്യാറാണ്. കുറിപ്പടിയോ ലാബ് റിപ്പോർട്ടോ അപ്‌ലോഡ് ചെയ്യുക:',
    uploadMedicalDocBtn: 'രേഖ അപ്‌ലോഡ് ചെയ്യുക',
    multimodalVisionCard: 'മൾട്ടിമോഡൽ വിഷൻ',
    standardAnalytesCard: '15 മാനദണ്ഡ പരിശോധനകൾ',
    languagesVoiceCard: '150+ ഭാഷാ വോയ്‌സ്',
    emergencyIdCard: 'ABDM / ക്യുആർ റെഡി',
    quickDocScanner: 'ക്വിക്ക് മെഡിക്കൽ ഡോക്യുമെന്റ് സ്കാനർ',
    openFullScanner: 'പൂർണ്ണ സ്കാനർ തുറക്കുക →',
    voiceAssistantBtn: 'വോയ്‌സ് അസിസ്റ്റന്റ്',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'പുറത്തുകടക്കുക',
  },
  // --- PUNJABI (Indian) ---
  pa: {
    appTitle: 'ਮੇਦੀਮਿੱਤਰ (MediMitra)',
    appSubtitle: 'ਏਆਈ-ਅਧਾਰਿਤ ਮੈਡੀਕਲ ਪਰਚੀ ਤੇ ਰਿਪੋਰਟ ਵਿਸ਼ਲੇਸ਼ਕ',
    heroTag: 'ਅਲਟ੍ਰਿਕਸ ਲੈਬਜ਼ ਹੈਕਾਥਾਨ • ਪੜਾਅ 1: ਮੈਡੀਕਲ ਡੌਕੂਮੈਂਟ ਐਕਸਟ੍ਰੈਕਸ਼ਨ',
    heroTitle: 'ਮੈਡੀਕਲ ਪਰਚੀਆਂ ਤੋਂ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ',
    heroDescription: 'ਡਾਕਟਰ ਦੀ ਪਰਚੀ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ। ਮੇਦੀਮਿੱਤਰ ਦਵਾਈਆਂ, ਖੁਰਾਕ ਅਤੇ ਜਾਂਚ ਨਤੀਜਿਆਂ ਦਾ 150+ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਦਾ ਹੈ।',
    uploadBoxTitle: 'ਪਰਚੀ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ',
    uploadBoxSubtitle: 'ਫਾਈਲ ਇੱਥੇ ਖਿੱਚੋ ਜਾਂ ਚੁਣਨ ਲਈ ਕਲਿੱਕ ਕਰੋ (ਵੱਧ ਤੋਂ ਵੱਧ 20MB)।',
    selectDocBtn: 'ਡੌਕੂਮੈਂਟ ਚੁਣੋ',
    processingTitle: 'ਡੌਕੂਮੈਂਟ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ',
    analyzingStep: 'ਜੈਮਿਨੀ ਏਆਈ ਰਾਹੀਂ ਜਾਣਕਾਰੀ ਕੱਢੀ ਜਾ ਰਹੀ ਹੈ...',
    diagnosesHeading: 'ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ ਤੇ ਲੱਛਣ (Diagnoses)',
    medicationsHeading: 'ਤਜਵੀਜ਼ ਕੀਤੀਆਂ ਦਵਾਈਆਂ ਤੇ ਖੁਰਾਕ (Medications)',
    labTestsHeading: 'ਲੈਬ ਟੈਸਟ ਨਤੀਜੇ (Lab Tests)',
    physicianNotesHeading: 'ਡਾਕਟਰ ਦੀ ਸਲਾਹ (Doctor Advice)',
    dosage: 'ਖੁਰਾਕ (Dose)',
    frequency: 'ਲੈਣ ਦਾ ਸਮਾਂ',
    duration: 'ਮਿਆਦ',
    instructions: 'ਵਰਤੋਂ ਦੇ ਨਿਰਦੇਸ਼ ਤੇ ਸਾਵਧਾਨੀਆਂ',
    listenAudioBtn: 'ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ',
    stopAudioBtn: 'ਰੋਕੋ',
    openNihLookup: 'NIH ICD-10 ਕੋਡ ਦੇਖੋ',
    openFdaInfo: 'FDA ਦਵਾਈ ਸੁਰੱਖਿਆ ਜਾਣਕਾਰੀ',
    disclaimerTitle: 'ਮੈਡੀਕਲ ਸੁਰੱਖਿਆ ਬੇਦਾਅਵਾ',
    disclaimerText: 'ਮੇਦੀਮਿੱਤਰ ਇੱਕ ਏਆਈ ਸਹਾਇਕ ਸੰਦ ਹੈ। ਕਿਸੇ ਵੀ ਦਵਾਈ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਜ਼ਰੂਰ ਕਰੋ।',
    switchLanguage: 'ਭਾਸ਼ਾ',
    allLanguages: 'ਸਾਰੀਆਂ 150+ ਭਾਸ਼ਾਵਾਂ',
    indianLanguages: 'ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ',
    globalLanguages: 'ਵਿਸ਼ਵ ਭਾਸ਼ਾਵਾਂ',
    searchLangPlaceholder: 'ਭਾਸ਼ਾ ਖੋਜੋ (ਜਿਵੇਂ ਪੰਜਾਬੀ, हिन्दी, English)...',
    verifiedIcdCodes: 'ਪ੍ਰਮਾਣਿਤ ICD-10 ਕੋਡ',
    dashboardNav: 'ਡੈਸ਼ਬੋਰਡ',
    medicalAiChatNav: 'ਮੈਡੀਕਲ AI ਸਵਾਲ-ਜਵਾਬ',
    prescriptionAiNav: 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਏਆਈ',
    labDiagnosticsNav: 'ਲੈਬ ਟੈਸਟ',
    liveRatesNav: 'ਦਵਾਈ ਦਰਾਂ ਤੇ ਸੁਰੱਖਿਆ',
    healthMapNav: 'ਸਿਹਤ ਕੇਂਦਰ ਨਕਸ਼ਾ',
    voiceAssistantNav: 'ਵੌਇਸ ਏਆਈ ਸਹਾਇਕ',
    medicationScheduleNav: 'ਦਵਾਈ ਸਮਾਂ-ਸਾਰਣੀ',
    patientVaultNav: 'ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਵਾਲਟ',
    qrMedicalIdNav: 'ਏਆਈ + ਕਿਊਆਰ ਆਈਡੀ',

    donationNav: 'ਦਾਨ ਕੇਂਦਰ (Donation Hub)',
    medicalCopilotStatus: 'ਮੈਡੀਕਲ ਕੋਪਾਇਲਟ',
    readyStatus: 'ਤਿਆਰ',
    clinicalIntelligenceHub: 'ਕਲੀਨਿਕਲ ਇੰਟੈਲੀਜੈਂਸ ਹੱਬ',
    spokenLanguage: 'ਬੋਲੀ ਜਾਣ ਵਾਲੀ ਭਾਸ਼ਾ',
    verifiedClinicalPortal: 'ਪ੍ਰਮਾਣਿਤ ਕਲੀਨਿਕਲ ਪੋਰਟਲ',
    welcomeBack: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    welcomeSubtitle: 'ਤੁਹਾਡਾ ਬਹੁਭਾਸ਼ਾਈ ਸਿਹਤ ਸਾਥੀ ਤਿਆਰ ਹੈ। ਡਾਕਟਰ ਦੀ ਪਰਚੀ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ:',
    uploadMedicalDocBtn: 'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ',
    multimodalVisionCard: 'ਮਲਟੀਮੋਡਲ ਵਿਜ਼ਨ',
    standardAnalytesCard: '15 ਮਿਆਰੀ ਟੈਸਟ',
    languagesVoiceCard: '150+ ਭਾਸ਼ਾਵਾਂ ਦੀ ਆਵਾਜ਼',
    emergencyIdCard: 'ABDM / ਕਿਊਆਰ ਤਿਆਰ',
    quickDocScanner: 'ਤੁਰੰਤ ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼ ਸਕੈਨਰ',
    openFullScanner: 'ਪੂਰਾ ਸਕੈਨਰ ਖੋਲ੍ਹੋ →',
    voiceAssistantBtn: 'ਵੌਇਸ ਅਸਿਸਟੈਂਟ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ਸਾਈਨ ਆਊਟ',
  },
  // --- URDU (Indian/Global - RTL) ---
  ur: {
    appTitle: 'میدی مترا (MediMitra)',
    appSubtitle: 'مصنوعی ذہانت پر مبنی طبی نسخہ و ہیلتھ کوپائلٹ',
    heroTag: 'الٹرکس لیبز ہیکاتھون • مرحلہ 1: میڈیکل دستاویزات کا تجزیہ',
    heroTitle: 'ڈاکٹر کے نسخوں اور ٹیسٹ رپورٹوں سے طبی معلومات حاصل کریں',
    heroDescription: 'ڈاکٹر کا نسخہ یا لیب رپورٹ اپ لوڈ کریں۔ میدی مترا ادویات، خوراک اور تشخیص کا 150 سے زائد زبانوں میں ترجمہ کرتا ہے۔',
    uploadBoxTitle: 'ڈاکٹر کا نسخہ یا لیب رپورٹ اپ لوڈ کریں',
    uploadBoxSubtitle: 'فائل یہاں ڈریگ کریں یا منتخب کرنے کے لیے کلک کریں۔',
    selectDocBtn: 'دستاویز منتخب کریں',
    processingTitle: 'دستاویز کا تجزیہ جاری ہے',
    analyzingStep: 'جیمنی اے آئی ویژن کے ذریعے ڈیٹا حاصل کیا جا رہا ہے...',
    diagnosesHeading: 'تشخیص اور علامات (Diagnoses)',
    medicationsHeading: 'تجویز کردہ ادویات اور خوراک (Medications)',
    labTestsHeading: 'لیبارٹری ٹیسٹ کے نتائج (Lab Tests)',
    physicianNotesHeading: 'ڈاکٹر کی ہدایات و مشورے (Doctor Advice)',
    dosage: 'خوراک کی مقدار',
    frequency: 'لینے کا وقت',
    duration: 'مدت',
    instructions: 'طریقہ استعمال اور احتیاطی تدابیر',
    listenAudioBtn: 'آواز میں سنیں',
    stopAudioBtn: 'آواز روکیں',
    openNihLookup: 'NIH ICD-10 کوڈ دیکھیں',
    openFdaInfo: 'FDA دوا کی حفاظت کی معلومات',
    disclaimerTitle: 'طبی انتباہ و دستبرداری',
    disclaimerText: 'میدی مترا ایک معاون اے آئی ٹول ہے۔ ادویات کے استعمال سے قبل اپنے ڈاکٹر سے مشورہ ضرور کریں۔',
    switchLanguage: 'زبان',
    allLanguages: 'تمام 150+ زبانیں',
    indianLanguages: 'ہندوستانی زبانیں',
    globalLanguages: 'عالمی زبانیں',
    searchLangPlaceholder: 'زبان تلاش کریں (جیسے اردو، हिन्दी، English)...',
    verifiedIcdCodes: 'تصدیق شدہ ICD-10 کوڈ',
    dashboardNav: 'ڈیش بورڈ',
    medicalAiChatNav: 'طبی مصنوعی ذہانت سوال و جواب',
    prescriptionAiNav: 'نسخہ اے آئی',
    labDiagnosticsNav: 'لیب تشخیص',
    liveRatesNav: 'ادویات کی قیمتیں و حفاظت',
    healthMapNav: 'ہیلتھ سینٹرز کا نقشہ',
    voiceAssistantNav: 'صوتی اے آئی اسسٹنٹ',
    medicationScheduleNav: 'ادویات کا ٹائم ٹیبل',
    patientVaultNav: 'مریض کا میڈیکل والٹ',
    qrMedicalIdNav: 'اے آئی + کیو آر آئی ڈی',

    donationNav: 'عطیہ مرکز (Donation Hub)',
    medicalCopilotStatus: 'میڈیکل کوپائلٹ',
    readyStatus: 'تیار ہے',
    clinicalIntelligenceHub: 'کلینیکل انٹیلی جنس ہب',
    spokenLanguage: 'بولی جانے والی زبان',
    verifiedClinicalPortal: 'تصدیق شدہ کلینیکل پورٹل',
    welcomeBack: 'خوش آمدید',
    welcomeSubtitle: 'آپ کا کثیر لسانی ہیلتھ کوپائلٹ تیار ہے۔ نسخہ یا لیب رپورٹ اپ لوڈ کریں:',
    uploadMedicalDocBtn: 'میڈیکل دستاویز اپ لوڈ کریں',
    multimodalVisionCard: 'ملٹی موڈل ویژن',
    standardAnalytesCard: '15 معیاری بائیو مارکر',
    languagesVoiceCard: '150+ زبانوں میں صوتی مدد',
    emergencyIdCard: 'ہنگامی کیو آر کارڈ',
    quickDocScanner: 'فوری میڈیکل اسکینر',
    openFullScanner: 'مکمل اسکینر کھولیں ←',
    voiceAssistantBtn: 'صوتی اسسٹنٹ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'لاگ آؤٹ',
  },

  // --- ODIA (Indian) ---
  or: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-ଚାଳିତ କ୍ଲିନିକାଲ୍ ଡକ୍ୟୁମେଣ୍ଟ୍ ଏକ୍ସଟ୍ରାକ୍ସନ୍ ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ସହଯୋଗୀ',
    heroTag: 'Altrix Labs ହ୍ୟାକାଥନ୍ • ପର୍ଯ୍ୟାୟ ୧: ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ଲ୍ୟାବ୍ ରିପୋର୍ଟ ବିଶ୍ଳେଷଣ',
    heroTitle: 'ଚିକିତ୍ସା ଡକ୍ୟୁମେଣ୍ଟରୁ କ୍ଲିନିକାଲ୍ ତଥ୍ୟ ସଠିକ୍ ଭାବରେ ପ୍ରାପ୍ତ କରନ୍ତୁ',
    heroDescription: 'ଡାକ୍ତରୀ ପ୍ରେସକ୍ରିପସନ୍ କିମ୍ବା ଲ୍ୟାବ୍ ରିପୋର୍ଟ (JPG, PNG, WEBP, PDF) ଅପଲୋଡ୍ କରନ୍ତୁ। ଔଷଧ, ପରୀକ୍ଷା ଫଳାଫଳ ଏବଂ ନିର୍ଣ୍ଣୟ ତଥ୍ୟ ୧୫୦+ ଭାଷାରେ ଅନୁବାଦ ସହିତ ପ୍ରାପ୍ତ କରନ୍ତୁ।',
    uploadBoxTitle: 'ପ୍ରେସକ୍ରିପସନ୍ କିମ୍ବା ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ',
    uploadBoxSubtitle: 'ଫାଇଲ୍ ଡ୍ରାଗ୍-ଡ୍ରପ୍ କରନ୍ତୁ କିମ୍ବା ବ୍ରାଉଜ୍ କରି ଚୟନ କରନ୍ତୁ (ସର୍ବାଧିକ ୨୦MB)।',
    selectDocBtn: 'ଡକ୍ୟୁମେଣ୍ଟ୍ ଚୟନ କରନ୍ତୁ',
    processingTitle: 'ଚିକିତ୍ସା ଡକ୍ୟୁମେଣ୍ଟ୍ ପ୍ରକ୍ରିୟାକରଣ ଚାଲିଛି',
    analyzingStep: 'Gemini AI ଭିଜନ୍ ସହିତ ବିଶ୍ଳେଷଣ କରାଯାଉଛି...',
    diagnosesHeading: 'ନିର୍ଣ୍ଣୟ ଏବଂ କ୍ଲିନିକାଲ୍ ନିରୀକ୍ଷଣ',
    medicationsHeading: 'ପରାମର୍ଶିତ ଔଷଧ ଏବଂ ମାତ୍ରା',
    labTestsHeading: 'ଲ୍ୟାବୋରେଟୋରୀ ବାୟୋମାର୍କର ପରୀକ୍ଷା',
    physicianNotesHeading: 'ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ଏବଂ ମନ୍ତବ୍ୟ',
    dosage: 'ମାତ୍ରା (ଡୋଜ୍)',
    frequency: 'ବ୍ୟବହାର ଆବୃତ୍ତି',
    duration: 'ଅବଧି (ଦିନ)',
    instructions: 'ବ୍ୟବହାର ନିର୍ଦ୍ଦେଶାବଳୀ ଓ ସୁରକ୍ଷା',
    listenAudioBtn: 'ଭଏସରେ ଶୁଣନ୍ତୁ',
    stopAudioBtn: 'ଅଡିଓ ବନ୍ଦ କରନ୍ତୁ',
    openNihLookup: 'NIH ICD-10 ଅନୁସନ୍ଧାନ',
    openFdaInfo: 'openFDA ଔଷଧ ସୁରକ୍ଷା',
    disclaimerTitle: 'ଚିକିତ୍ସା ସୁରକ୍ଷା ଏବଂ ସତର୍କତା',
    disclaimerText: 'ମେଡିମିତ୍ରା ଏକ AI ସହାୟକ ଉପକରଣ। କୌଣସି ଡାକ୍ତରୀ ନିଷ୍ପତ୍ତି ନେବା ପୂର୍ବରୁ ସର୍ବଦା ଯୋଗ୍ୟ ଡାକ୍ତରଙ୍କ ସହିତ ପରାମର୍ଶ କରନ୍ତୁ।',
    switchLanguage: 'ଭାଷା',
    allLanguages: 'ସମସ୍ତ ୧୫୦+ ଭାଷା',
    indianLanguages: 'ଭାରତୀୟ ଭାଷାଗୁଡ଼ିକ',
    globalLanguages: 'ବିଶ୍ୱସ୍ତରୀୟ ଭାଷାଗୁଡ଼ିକ',
    searchLangPlaceholder: 'ଭାଷା ଖୋଜନ୍ତୁ (ଯଥା: ଓଡ଼ିଆ, অসমীয়া, संस्कृत, हिन्दी, English)...',
    verifiedIcdCodes: 'ଯାଞ୍ଚ ହୋଇଥିବା ICD-10 କୋଡ୍',
    dashboardNav: 'ଡ୍ୟାସବୋର୍ଡ',
    medicalAiChatNav: 'ଚିକିତ୍ସା AI ପ୍ରଶ୍ନୋତ୍ତର',
    prescriptionAiNav: 'ପ୍ରେସକ୍ରିପସନ୍ AI',
    labDiagnosticsNav: 'ଲ୍ୟାବ୍ ଡାଇଗ୍ନୋଷ୍ଟିକ୍ସ',
    liveRatesNav: 'ମୂଲ୍ୟ ଓ ସୁରକ୍ଷା',
    healthMapNav: 'ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ମାନଚିତ୍ର',
    voiceAssistantNav: 'ଭଏସ୍ AI ସହାୟକ',
    medicationScheduleNav: 'ଔଷଧ ସମୟସାରଣୀ',
    patientVaultNav: 'ରୋଗୀ ରେକର୍ଡ ଭଲ୍ଟ',
    qrMedicalIdNav: 'AI + QR ଆଇଡି',

    donationNav: 'ଦାନ କେନ୍ଦ୍ର (Donation Hub)',
    medicalCopilotStatus: 'ମେଡିକାଲ୍ କୋପାଇଲଟ୍',
    readyStatus: 'ପ୍ରସ୍ତୁତ',
    clinicalIntelligenceHub: 'କ୍ଲିନିକାଲ୍ ଇଣ୍ଟେଲିଜେନ୍ସ ହବ୍',
    spokenLanguage: 'କଥିତ ଭାଷା',
    verifiedClinicalPortal: 'ଯାଞ୍ଚ ହୋଇଥିବା ପୋର୍ଟାଲ୍',
    welcomeBack: 'ସ୍ୱାଗତ',
    welcomeSubtitle: 'ଆପଣଙ୍କ ବହୁଭାଷୀ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ ପ୍ରସ୍ତୁତ ଅଛି:',
    uploadMedicalDocBtn: 'ଡକ୍ୟୁମେଣ୍ଟ୍ ଅପଲୋଡ୍ କରନ୍ତୁ',
    multimodalVisionCard: 'ମଲ୍ଟିମୋଡାଲ୍ ଭିଜନ୍',
    standardAnalytesCard: '୧୫ ମାନକ ବାୟୋମାର୍କର',
    languagesVoiceCard: '୧୫୦+ ଭାଷା ଭଏସ୍ ସମର୍ଥନ',
    emergencyIdCard: 'ଜରୁରୀକାଳୀନ QR ଆଇଡି',
    quickDocScanner: 'ଦ୍ରୁତ ଡକ୍ୟୁମେଣ୍ଟ୍ ସ୍କାନର୍',
    openFullScanner: 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କାନର୍ ଖୋଲନ୍ତୁ →',
    voiceAssistantBtn: 'ଭଏସ୍ ସହାୟକ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ଲଗ୍ ଆଉଟ୍',
  },

  // --- ASSAMESE (Indian) ---
  as: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-চালিত ক্লিনিকেল নিষ্কাশন আৰু স্বাস্থ্য সহায়ক',
    heroTag: 'Altrix Labs হেকথন • পৰ্যায় ১: প্ৰেছক্ৰিপচন আৰু পৰীক্ষাগাৰ ৰিপৰ্ট বিশ্লেষণ',
    heroTitle: 'চিকিৎসা নথিপত্ৰৰ পৰা ক্লিনিকেল তথ্য আহৰণ কৰক',
    heroDescription: 'চিকিৎসকৰ প্ৰেছক্ৰিপচন বা লেব ৰিপৰ্ট (JPG, PNG, WEBP, PDF) আপলোড কৰক। ঔষধ, ফলাফল আৰু নিদান ১৫০+ ভাষাত অনুবাদ সহ লাভ কৰক।',
    uploadBoxTitle: 'প্ৰেছক্ৰিপচন বা লেব ৰিপৰ্ট আপলোড কৰক',
    uploadBoxSubtitle: 'নথিখন ইয়াত ড্ৰেগ কৰক বা বাছনি কৰক (সৰ্বাধিক ২০MB)।',
    selectDocBtn: 'চিকিৎসা নথি বাছনি কৰক',
    processingTitle: 'নথি প্ৰক্ৰিয়াকৰণ চলি আছে',
    analyzingStep: 'Gemini AI ভিজনৰ সৈতে বিশ্লেষণ কৰা হৈছে...',
    diagnosesHeading: 'নিদান আৰু ক্লিনিকেল ফলাফল',
    medicationsHeading: 'নিৰ্ধাৰিত ঔষধ আৰু মাত্ৰা',
    labTestsHeading: 'পৰীক্ষাগাৰ বায়’মাৰ্কাৰ পৰীক্ষা',
    physicianNotesHeading: 'চিকিৎসকৰ পৰামৰ্শ আৰু মন্তব্য',
    dosage: 'মাত্ৰা (ডোজ)',
    frequency: 'ব্যৱহাৰৰ সঘনতা',
    duration: 'সময়সীমা (দিন)',
    instructions: 'ব্যৱহাৰ বিধি আৰু সুৰক্ষা',
    listenAudioBtn: 'ভইচত শুনক',
    stopAudioBtn: 'অডিঅ’ বন্ধ কৰক',
    openNihLookup: 'NIH ICD-10 অনুসন্ধান',
    openFdaInfo: 'openFDA ঔষধ সুৰক্ষা',
    disclaimerTitle: 'চিকিৎসা সুৰক্ষা সতৰ্কতা',
    disclaimerText: 'MediMitra এটা AI সহায়ক সঁজুলি। চিকিৎসা সিদ্ধান্তৰ বাবে সদায় চিকিৎসকৰ পৰামৰ্শ লওক।',
    switchLanguage: 'ভাষা',
    allLanguages: 'সকলো ১৫০+ ভাষা',
    indianLanguages: 'ভাৰতীয় ভাষাসমূহ',
    globalLanguages: 'আন্তঃৰাষ্ট্ৰীয় ভাষাসমূহ',
    searchLangPlaceholder: 'ভাষা সন্ধান কৰক (যেনে: অসমীয়া, ଓଡ଼ିଆ, हिन्दी, English)...',
    verifiedIcdCodes: 'প্ৰমাণিত ICD-10 কোড',
    dashboardNav: 'ডেশ্বব’ৰ্ড',
    medicalAiChatNav: 'চিকিৎসা এআই প্ৰশ্নোত্তৰ',
    prescriptionAiNav: 'প্ৰেছক্ৰিপচন AI',
    labDiagnosticsNav: 'লেব ডায়াগনষ্টিকছ',
    liveRatesNav: 'মূল্য আৰু সুৰক্ষা',
    healthMapNav: 'স্বাস্থ্য কেন্দ্ৰৰ মানচিত্ৰ',
    voiceAssistantNav: 'ভইচ AI সহায়ক',
    medicationScheduleNav: 'ঔষধৰ সময়সূচী',
    patientVaultNav: 'ৰোগী তথ্য ভঁৰাল',
    qrMedicalIdNav: 'AI + QR ব্যৱস্থা',

    donationNav: 'দান কেন্দ্ৰ (Donation Hub)',
    medicalCopilotStatus: 'মেডিকেল ক’পাইলট',
    readyStatus: 'প্ৰস্তুত',
    clinicalIntelligenceHub: 'ক্লিনিকেল ইন্টেলিজেন্স হাব',
    spokenLanguage: 'কথিত ভাষা',
    verifiedClinicalPortal: 'প্ৰমাণিত প’ৰ্টেল',
    welcomeBack: 'স্বাগতম',
    welcomeSubtitle: 'আপোনাৰ বহুভাষিক স্বাস্থ্য সহায়ক প্ৰস্তুত:',
    uploadMedicalDocBtn: 'নথি আপলোড কৰক',
    multimodalVisionCard: 'মাল্টিমডেল ভিজন',
    standardAnalytesCard: '১৫টা মানক বায়’মাৰ্কাৰ',
    languagesVoiceCard: '১৫০+ ভাষাৰ ভইচ সমৰ্থন',
    emergencyIdCard: 'জৰুৰীকালীন QR কাৰ্ড',
    quickDocScanner: 'দ্ৰুত স্কেনাৰ',
    openFullScanner: 'সম্পূৰ্ণ স্কেনাৰ খোলক →',
    voiceAssistantBtn: 'ভইচ সহায়ক',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'লগ আউট',
  },

  // --- SANSKRIT (Indian) ---
  sa: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-सञ्चालितं नैदानिक-निष्कर्षणं स्वास्थ्य-सहयोगी च',
    heroTag: 'Altrix Labs Hackathon • चरणम् १: औषधपत्र-प्रयोगशाला-विश्लेषणम्',
    heroTitle: 'चिकित्सा-दस्तावेजेभ्यः नैदानिक-सूचनाः प्राप्नुवन्तु',
    heroDescription: 'चिकित्सकस्य औषधपत्रं प्रयोगशाला-विवरणं वा (JPG, PNG, WEBP, PDF) आरोपयन्तु। १५०+ भाषासु औषधानि, परीक्षणफलानि च प्राप्नुवन्तु।',
    uploadBoxTitle: 'औषधपत्रं प्रयोगशाला-पत्रं वा आरोपयन्तु',
    uploadBoxSubtitle: 'अत्र सञ्चिकां निक्षिपन्तु वा अन्वेषणं कुर्वन्तु (अधिकतमं २०MB)।',
    selectDocBtn: 'दस्तावेजं चिनोतु',
    processingTitle: 'दस्तावेज-प्रक्रिया प्रचलति',
    analyzingStep: 'Gemini AI विज़न-माध्यमेन विश्लेषणं क्रियते...',
    diagnosesHeading: 'रोगाणां निदानं निष्कर्षाः च',
    medicationsHeading: 'निर्दिष्टानि औषधानि मात्रा च',
    labTestsHeading: 'प्रयोगशाला-बायोमार्कर्स-परीक्षणानि',
    physicianNotesHeading: 'वैद्यकीय-परामर्शाः टिप्पण्यः च',
    dosage: 'मात्रा (डोज़)',
    frequency: 'सेवन-वारम्बारता',
    duration: 'अवधिः (दिनानि)',
    instructions: 'निर्देशाः सुरक्षा च',
    listenAudioBtn: 'श्राव्य-माध्यमेन शृण्वन्तु',
    stopAudioBtn: 'श्राव्यं स्थगयतु',
    openNihLookup: 'NIH ICD-10 अन्वेषणम्',
    openFdaInfo: 'openFDA औषध-सुरक्षा',
    disclaimerTitle: 'चिकित्सा-सुरक्षा-सूचना',
    disclaimerText: 'MediMitra एकः सहायकः AI-उपकरणः अस्ति। चिकित्सा-निर्णयाय सर्वदा योग्यं चिकित्सकं परामृशन्तु।',
    switchLanguage: 'भाषा',
    allLanguages: 'सर्वाः १५०+ भाषाः',
    indianLanguages: 'भारतीय-भाषाः',
    globalLanguages: 'वैश्विक-भाषाः',
    searchLangPlaceholder: 'भाषां अन्विषन्तु (यथा: संस्कृतम्, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणीकृतः ICD-10 सङ्केतः',
    dashboardNav: 'नियन्त्रणपट्टम्',
    medicalAiChatNav: 'चिकित्सा एआई प्रश्नोत्तरी',
    prescriptionAiNav: 'औषधपत्र-एआई',
    labDiagnosticsNav: 'प्रयोगशाला-निदानम्',
    liveRatesNav: 'मूल्यानि सुरक्षा च',
    healthMapNav: 'स्वास्थ्यकेन्द्राणां मानचित्रे',
    voiceAssistantNav: 'ध्वनि-एआई-सहायकः',
    medicationScheduleNav: 'औषध-समयसारिणी',
    patientVaultNav: 'रोगी-दस्तावेज-कोशः',
    qrMedicalIdNav: 'एआई + क्यूआर तन्त्रम्',

    donationNav: 'दान केन्द्रम् (Donation Hub)',
    medicalCopilotStatus: 'चिकित्सा-सहयोगी',
    readyStatus: 'सज्जम्',
    clinicalIntelligenceHub: 'नैदानिक-बुद्धि-केन्द्रम्',
    spokenLanguage: 'सम्भाषण-भाषा',
    verifiedClinicalPortal: 'सत्यापितः पोर्टलः',
    welcomeBack: 'पुनरागमने स्वागतम्',
    welcomeSubtitle: 'भवतः बहुभाषीयः स्वास्थ्य-सहयोगी सज्जः अस्ति:',
    uploadMedicalDocBtn: 'दस्तावेजं आरोपयतु',
    multimodalVisionCard: 'मल्टीमॉडल-विज़न',
    standardAnalytesCard: '१५ मानक-बायोमार्कर्स',
    languagesVoiceCard: '१५०+ भाषासु ध्वनि-समर्थनम्',
    emergencyIdCard: 'आपत्कालीन-क्यूआर-पत्रम्',
    quickDocScanner: 'त्वरित-स्कैनर',
    openFullScanner: 'पूर्ण-स्कैनर उद्घाटयतु →',
    voiceAssistantBtn: 'ध्वनि-सहायकः',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'निर्गमनम् (Sign Out)',
  },

  // --- NEPALI (Indian/Global) ---
  ne: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-सञ्चालित क्लिनिकल निकासी र स्वास्थ्य सहयात्री',
    heroTag: 'Altrix Labs Hackathon • चरण १: प्रेस्क्रिप्सन र ल्याब रिपोर्ट विश्लेषण',
    heroTitle: 'चिकित्सा कागजातबाट क्लिनिकल जानकारी प्राप्त गर्नुहोस्',
    heroDescription: 'डाक्टरको प्रेस्क्रिप्सन वा ल्याब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड गर्नुहोस्। औषधि, परीक्षण परिणाम र निदान १५०+ भाषामा अनुवादसहित प्राप्त गर्नुहोस्।',
    uploadBoxTitle: 'प्रेस्क्रिप्सन वा ल्याब रिपोर्ट अपलोड गर्नुहोस्',
    uploadBoxSubtitle: 'यहाँ फाइल तान्नुहोस् वा ब्राउज गर्न क्लिक गर्नुहोस् (अधिकतम २०MB)।',
    selectDocBtn: 'चिकित्सा कागजात छान्नुहोस्',
    processingTitle: 'कागजात प्रशोधन हुँदैछ',
    analyzingStep: 'Gemini AI भिजनबाट विश्लेषण गरिँदैछ...',
    diagnosesHeading: 'निदान र क्लिनिकल निष्कर्ष',
    medicationsHeading: 'सिफारिस गरिएका औषधि र मात्रा',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर परीक्षण',
    physicianNotesHeading: 'डाक्टरको सल्लाह र टिप्पणी',
    dosage: 'मात्रा (डोज)',
    frequency: 'सेवन आवृत्ति',
    duration: 'अवधि (दिन)',
    instructions: 'निर्देशन र सुरक्षा सल्लाह',
    listenAudioBtn: 'आवाजमा सुन्नुहोस्',
    stopAudioBtn: 'अडियो रोक्नुहोस्',
    openNihLookup: 'NIH ICD-10 खोजी',
    openFdaInfo: 'openFDA औषधि सुरक्षा',
    disclaimerTitle: 'चिकित्सा सुरक्षा चेतावनी',
    disclaimerText: 'MediMitra एक एआई सहायक उपकरण हो। कुनै पनि चिकित्सा निर्णय लिनु अघि सधैं योग्य चिकित्सकसँग परामर्श गर्नुहोस्।',
    switchLanguage: 'भाषा',
    allLanguages: 'सबै १५०+ भाषाहरू',
    indianLanguages: 'भारतीय भाषाहरू',
    globalLanguages: 'विश्वव्यापी भाषाहरू',
    searchLangPlaceholder: 'भाषा खोज्नुहोस् (जस्तै: नेपाली, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणित ICD-10 कोड',
    dashboardNav: 'ड्यासबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई प्रश्नोत्तर',
    prescriptionAiNav: 'प्रेस्क्रिप्सन AI',
    labDiagnosticsNav: 'ल्याब डायग्नोस्टिक्स',
    liveRatesNav: 'दर र सुरक्षा',
    healthMapNav: 'स्वास्थ्य केन्द्र नक्सा',
    voiceAssistantNav: 'भ्वाइस AI सहायक',
    medicationScheduleNav: 'औषधि तालिका',
    patientVaultNav: 'बिरामी भल्ट',
    qrMedicalIdNav: 'AI + QR प्रणाली',

    donationNav: 'दान केन्द्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपाइलट',
    readyStatus: 'तयार छ',
    clinicalIntelligenceHub: 'क्लिनिकल इन्टेलिजेन्स हब',
    spokenLanguage: 'बोलिने भाषा',
    verifiedClinicalPortal: 'प्रमाणित पोर्टल',
    welcomeBack: 'स्वागत छ',
    welcomeSubtitle: 'तपाईंको बहुभाषिक स्वास्थ्य सहयात्री तयार छ:',
    uploadMedicalDocBtn: 'कागजात अपलोड गर्नुहोस्',
    multimodalVisionCard: 'मल्टिमोडल भिजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषामा भ्वाइस समर्थन',
    emergencyIdCard: 'आपतकालीन QR कार्ड',
    quickDocScanner: 'द्रुत कागजात स्क्यानर',
    openFullScanner: 'पूरा स्क्यानर खोल्नुहोस् →',
    voiceAssistantBtn: 'भ्वाइस सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- KASHMIRI (Indian - RTL) ---
  ks: {
    appTitle: 'MediMitra',
    appSubtitle: 'اے آئی سٔتؠ طبی معلومات کڈنہٕ تہٕ صحت رفیق',
    heroTag: 'Altrix Labs ہیکاتھان • مرحلہٕ ۱: نسخہٕ تہٕ لیب رپورٹ تجزیہٕ',
    heroTitle: 'طبی دستاویزات منٛزٕ کٔڑیو کٕلینکل معلومات',
    heroDescription: 'ڈاکٹر سُنٛد نسخہٕ یا لیب رپورٹ اپ لوڈ کٔریو۔ دوایہِ، ٹیسٹ رپورٹ تہٕ تشخیص ۱۵۰+ زبانن منٛز ترجُمہٕ سٔتؠ حٲصل کٔریو۔',
    uploadBoxTitle: 'نسخہٕ یا لیب رپورٹ اپ لوڈ کٔریو',
    uploadBoxSubtitle: 'فائل کٔریو ییٚتہِ ڈراپ یا سلیکٹ (زیٛادٕ کھوتہٕ زیٛادٕ ۲۰MB)۔',
    selectDocBtn: 'طبی دستاویز چُنو',
    processingTitle: 'دستاویزس پؠٹھ کٲم چَھ چلان',
    analyzingStep: 'Gemini AI ویژن سٔتؠ تجزیہٕ چُھ گژھان...',
    diagnosesHeading: 'تشخیص تہٕ کلینکل ریمارکس',
    medicationsHeading: 'تَجویٖز کٔرمٕژ دوایہِ تہٕ مقدار',
    labTestsHeading: 'لیبارٹری ٹیسٹ رپورٹ',
    physicianNotesHeading: 'ڈاکٹر سُنٛد مشورٕ تہٕ نصیحت',
    dosage: 'مقدار (ڈوز)',
    frequency: 'کھؠنہٕ چہِ تعداد',
    duration: 'مدت (دوہ)',
    instructions: 'استعمالُک طریقہٕ تہٕ حفاظت',
    listenAudioBtn: 'آوازِ منٛز بوزیو',
    stopAudioBtn: 'آواز بنٛد کٔریو',
    openNihLookup: 'NIH ICD-10 تلاش',
    openFdaInfo: 'openFDA دوا حفاظتی معلومات',
    disclaimerTitle: 'طبی انتباہ و دستبرداری',
    disclaimerText: 'MediMitra چُھ اکھ AI مددگار۔ دوا لۆنہٕ برٛونٛہہ ڈاکٹرس سٟتؠ مشورٕ کٔریو۔',
    switchLanguage: 'زبان',
    allLanguages: 'سٲری ۱۵۰+ زبانیں',
    indianLanguages: 'ہندوستانی زبانیں',
    globalLanguages: 'عالمی زبانیں',
    searchLangPlaceholder: 'زبان کٔریو تلاش (مثال: کٲشُر، اردو، English)...',
    verifiedIcdCodes: 'تصدیق شدہ ICD-10 کوڈ',
    dashboardNav: 'ڈیش بورڈ',
    medicalAiChatNav: 'طبی اے آئی سوال و جواب',
    prescriptionAiNav: 'نسخہٕ AI',
    labDiagnosticsNav: 'لیب تشخیص',
    liveRatesNav: 'قیمتیں و حفاظت',
    healthMapNav: 'ہسپتالن ہُنٛد نقشہٕ',
    voiceAssistantNav: 'وائس AI اسسٹنٹ',
    medicationScheduleNav: 'دوایہِ ہُنٛد ٹائم ٹیبل',
    patientVaultNav: 'مریضُک میڈیکل والٹ',
    qrMedicalIdNav: 'AI + QR سسٹم',

    donationNav: 'عطیہ مرکز (Donation Hub)',
    medicalCopilotStatus: 'میڈیکل کوپائلٹ',
    readyStatus: 'تیار چُھ',
    clinicalIntelligenceHub: 'کلینکل انٹیلی جنس ہب',
    spokenLanguage: 'بولی جانے والی زبان',
    verifiedClinicalPortal: 'تصدیق شدہ پورٹل',
    welcomeBack: 'خوش آمدید',
    welcomeSubtitle: 'تُہنٛد کثیر لسانی ہیلتھ کوپائلٹ چُھ تیار:',
    uploadMedicalDocBtn: 'دستاویز اپ لوڈ کٔریو',
    multimodalVisionCard: 'ملٹی موڈل ویژن',
    standardAnalytesCard: '۱۵ معیاری بایومارکر',
    languagesVoiceCard: '۱۵۰+ زبانن منٛز صوتی مدد',
    emergencyIdCard: 'ہنگامی QR کارڈ',
    quickDocScanner: 'فوری اسکینر',
    openFullScanner: 'مکمل اسکینر کھولیو ←',
    voiceAssistantBtn: 'صوتی اسسٹنٹ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'لاگ آؤٹ',
  },

  // --- KONKANI (Indian) ---
  kok: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआय-आधारित क्लिनिकल माहिती निष्कर्षण आनी भलायकी सांगाती',
    heroTag: 'Altrix Labs हॅकथॉन • टप्पा १: प्रिस्क्रिप्शन आनी लॅब अहवाल विश्लेषण',
    heroTitle: 'वैद्यकीय दस्तावेजांतल्यान क्लिनिकल म्हायती मेळयात',
    heroDescription: 'दोतोराचें प्रिस्क्रिप्शन वा लॅब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करात. वखदां, तपासणी अहवाल आनी निदान १५०+ भासांनी अणकारा सयत मेळयात.',
    uploadBoxTitle: 'प्रिस्क्रिप्शन वा लॅब अहवाल अपलोड करात',
    uploadBoxSubtitle: 'फायल हांगा ओडून घालात वा ब्राउझ करात (कमाल २०MB).',
    selectDocBtn: 'वैद्यकीय दस्तावेज निवडा',
    processingTitle: 'दस्तावेज प्रक्रिया चालू आसा',
    analyzingStep: 'Gemini AI विजन वरवीं विश्लेषण चालू आसा...',
    diagnosesHeading: 'निदान आनी क्लिनिकल निरीक्षण',
    medicationsHeading: 'सुचयिल्लीं वखदां आनी प्रमाण',
    labTestsHeading: 'लॅबोरेटरी बायोमार्कर तपासणी',
    physicianNotesHeading: 'दोतोराचो सल्लो आनी शेरो',
    dosage: 'प्रमाण (डोस)',
    frequency: 'घेवपाची वारंवारता',
    duration: 'कालावधी (दीस)',
    instructions: 'घेवपाचे नेम आनी सुरक्षा',
    listenAudioBtn: 'आवाजांत आयकात',
    stopAudioBtn: 'आवाज बंद करात',
    openNihLookup: 'NIH ICD-10 सोद',
    openFdaInfo: 'openFDA वखद सुरक्षा',
    disclaimerTitle: 'वैद्यकीय सुरक्षा शिटकावणी',
    disclaimerText: 'MediMitra हें एक एआय सांगाती साधन आसा. कसलोय निर्णय घेवचे पयलीं जाणत्या दोतोराचो सल्लो घेयात.',
    switchLanguage: 'भास',
    allLanguages: 'सगळ्यो १५०+ भासो',
    indianLanguages: 'भारतीय भासो',
    globalLanguages: 'जागतिक भासो',
    searchLangPlaceholder: 'भास सोदात (देखीक: कोंकणी, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणीत ICD-10 कोड',
    dashboardNav: 'डॅशबोर्ड',
    medicalAiChatNav: 'वैद्यकीय AI प्रश्नोत्तर',
    prescriptionAiNav: 'प्रिस्क्रिप्शन AI',
    labDiagnosticsNav: 'लॅब डायग्नोस्टिक्स',
    liveRatesNav: 'दर आनी सुरक्षा',
    healthMapNav: 'भलायकी केंद्र नकासो',
    voiceAssistantNav: 'व्हॉईस AI सांगाती',
    medicationScheduleNav: 'वखदांचें वेळापत्रक',
    patientVaultNav: 'दुयेंती दस्तावेज व्हॉल्ट',
    qrMedicalIdNav: 'AI + QR यंत्रणा',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'वैद्यकीय कोपायलट',
    readyStatus: 'तयार आसा',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजन्स हब',
    spokenLanguage: 'उलोवपाची भास',
    verifiedClinicalPortal: 'प्रमाणीत पोर्टल',
    welcomeBack: 'येवकार',
    welcomeSubtitle: 'तुमचो बहुभाषिक भलायकी सांगाती तयार आसा:',
    uploadMedicalDocBtn: 'दस्तावेज अपलोड करात',
    multimodalVisionCard: 'मल्टीमॉडल व्हिजन',
    standardAnalytesCard: '१५ प्रमाण बायोमार्कर्स',
    languagesVoiceCard: '१५०+ भासांचो व्हॉईस सपोर्ट',
    emergencyIdCard: 'आपत्कालीन QR कार्ड',
    quickDocScanner: 'तात्काळ स्कॅनर',
    openFullScanner: 'पुराय स्कॅनर उघडा →',
    voiceAssistantBtn: 'व्हॉईस सांगाती',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'भायर सरा (Sign Out)',
  },

  // --- MAITHILI (Indian) ---
  mai: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण आ स्वास्थ्य सहयोगी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: नुस्खा आ लैब रिपोर्ट विश्लेषण',
    heroTitle: 'चिकित्सा दस्तावेज सँ क्लिनिकल जानकारी प्राप्त करू',
    heroDescription: 'डाक्टरक प्रेस्क्रिप्शन वा लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करू। दवाई, जाँच परिणाम आ निदान १५०+ भाषा मे अनुवादक संग प्राप्त करू।',
    uploadBoxTitle: 'प्रेस्क्रिप्शन वा लैब रिपोर्ट अपलोड करू',
    uploadBoxSubtitle: 'फाइल एतय ड्रैग करू वा चुनू (अधिकतम २०MB)।',
    selectDocBtn: 'चिकित्सा दस्तावेज चुनू',
    processingTitle: 'दस्तावेज प्रोसेस भ रहल अछि',
    analyzingStep: 'Gemini AI विजन सँ विश्लेषण भ रहल अछि...',
    diagnosesHeading: 'निदान आ क्लिनिकल निष्कर्ष',
    medicationsHeading: 'बताओल गेल दवाई आ मात्रा',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जाँच',
    physicianNotesHeading: 'डाक्टरक सलाह आ टिप्पणी',
    dosage: 'मात्रा (डोज)',
    frequency: 'लेबाक आवृत्ति',
    duration: 'अवधि (दिन)',
    instructions: 'निर्देश आ सुरक्षा सलाह',
    listenAudioBtn: 'आवाज मे सुनू',
    stopAudioBtn: 'आवाज बंद करू',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'चिकित्सा सुरक्षा चेतावनी',
    disclaimerText: 'MediMitra एक एआई सहायक उपकरण अछि। कोनो निर्णय लेबा सँ पहिने डाक्टर सँ सलाह जरूर लिअ।',
    switchLanguage: 'भाषा',
    allLanguages: 'सब १५०+ भाषा',
    indianLanguages: 'भारतीय भाषा सभ',
    globalLanguages: 'वैश्विक भाषा सभ',
    searchLangPlaceholder: 'भाषा खोजू (जहिना: मैथिली, हिन्दी, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई प्रश्नोत्तर',
    prescriptionAiNav: 'प्रेस्क्रिप्शन AI',
    labDiagnosticsNav: 'लैब डायग्नोस्टिक्स',
    liveRatesNav: 'दर आ सुरक्षा',
    healthMapNav: 'स्वास्थ्य केंद्र नक्शा',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'रोगी रिकॉर्ड वॉल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तयार अछि',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बाजल जायबला भाषा',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'स्वागत अछि',
    welcomeSubtitle: 'अहाँक बहुभाषी स्वास्थ्य सहयोगी तयार अछि:',
    uploadMedicalDocBtn: 'दस्तावेज अपलोड करू',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषा मे आवाज सहायता',
    emergencyIdCard: 'आपातकालीन QR कार्ड',
    quickDocScanner: 'तुरंत स्कैनर',
    openFullScanner: 'पूरा स्कैनर खोलू →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- SANTALI (Indian) ---
  sat: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-ᱪᱟᱞᱟᱣᱟᱱ ᱪᱤᱠᱤᱛᱥᱟ ᱞᱟᱦᱟᱱᱛᱤ ᱟᱨ ᱦᱚᱲᱢᱚ ᱜᱚᱲᱚᱭᱤᱡ',
    heroTag: 'Altrix Labs Hackathon • ᱦᱟᱹᱴᱤᱧ ᱑: ᱨᱟᱱ ᱯᱟᱨᱪᱟ ᱟᱨ ᱞᱮᱵᱽ ᱨᱤᱯᱚᱴ ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ',
    heroTitle: 'ᱪᱤᱠᱤᱛᱥᱟ ᱠᱟᱜᱚᱡᱽ ᱠᱷᱚᱱ ᱥᱟᱹᱨᱤ ᱠᱟᱛᱷᱟ ᱧᱟᱢ ᱢᱮ',
    heroDescription: 'ᱰᱟᱠᱛᱚᱨᱟᱜ ᱨᱟᱱ ᱯᱟᱨᱪᱟ ᱥᱮ ᱞᱮᱵᱽ ᱨᱤᱯᱚᱴ (JPG, PNG, WEBP, PDF) ᱟᱯᱞᱳᱰ ᱢᱮ᱾ ᱨᱟᱱ, ᱴᱮᱥᱴ ᱨᱮᱡᱟᱞᱴ ᱟᱨ ᱨᱩᱣᱟᱹ ᱧᱩᱛᱩᱢ ᱑᱕᱐+ ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟ ᱧᱟᱢ ᱢᱮ᱾',
    uploadBoxTitle: 'ᱨᱟᱱ ᱯᱟᱨᱪᱟ ᱥᱮ ᱞᱮᱵᱽ ᱨᱤᱯᱚᱴ ᱟᱯᱞᱳᱰ ᱢᱮ',
    uploadBoxSubtitle: 'ᱯᱷᱟᱭᱤᱞ ᱱᱚᱸᱰᱮ ᱚᱨ ᱟᱹᱜᱩᱭ ᱢᱮ ᱥᱮ ᱵᱟᱪᱷᱟᱣ ᱢᱮ (ᱡᱟᱹᱥᱛᱤ ᱒᱐MB)᱾',
    selectDocBtn: 'ᱠᱟᱜᱚᱡᱽ ᱵᱟᱪᱷᱟᱣ ᱢᱮ',
    processingTitle: 'ᱠᱟᱜᱚᱡᱽ ᱯᱟᱨᱥᱟᱞ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ',
    analyzingStep: 'Gemini AI ᱧᱮᱞ ᱛᱮ ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ...',
    diagnosesHeading: 'ᱨᱩᱣᱟᱹ ᱪᱤᱱᱦᱟᱹᱯ ᱟᱨ ᱚᱨᱡᱚ',
    medicationsHeading: 'ᱮᱢ ᱟᱠᱟᱱ ᱨᱟᱱ ᱟᱨ ᱢᱟᱯ',
    labTestsHeading: 'ᱞᱮᱵᱽ ᱵᱟᱭᱳᱢᱟᱨᱠᱟᱨ ᱴᱮᱥᱴ',
    physicianNotesHeading: 'ᱰᱟᱠᱛᱚᱨᱟᱜ ᱥᱚᱞᱦᱟ ᱟᱨ ᱠᱟᱛᱷᱟ',
    dosage: 'ᱨᱟᱱ ᱢᱟᱯ (ᱰᱳᱡᱽ)',
    frequency: 'ᱡᱚᱢ ᱚᱠᱛᱚ',
    duration: 'ᱫᱤᱱ ᱞᱮᱠᱷᱟ',
    instructions: 'ᱵᱮᱵᱷᱟᱨ ᱱᱤᱭᱚᱢ ᱟᱨ ᱥᱩᱨᱚᱠᱷᱟ',
    listenAudioBtn: 'ᱟᱲᱟᱝ ᱛᱮ ᱟᱧᱡᱚᱢ ᱢᱮ',
    stopAudioBtn: 'ᱟᱲᱟᱝ ᱛᱷᱩᱠᱟᱹᱢ ᱢᱮ',
    openNihLookup: 'NIH ICD-10 ᱥᱮᱸᱫᱽᱨᱟ',
    openFdaInfo: 'openFDA ᱨᱟᱱ ᱥᱩᱨᱚᱠᱷᱟ',
    disclaimerTitle: 'ᱪᱤᱠᱤᱛᱥᱟ ᱦᱩᱥᱤᱭᱟᱹᱨ ᱠᱟᱛᱷᱟ',
    disclaimerText: 'MediMitra ᱫᱚ ᱢᱤᱫ AI ᱜᱚᱲᱚ ᱥᱟᱯᱟᱵ ᱠᱟᱱᱟ᱾ ᱪᱤᱠᱤᱛᱥᱟ ᱞᱟᱹᱜᱤᱫ ᱰᱟᱠᱛᱚᱨ ᱥᱟᱶ ᱠᱩᱞᱤ ᱵᱤᱫᱟᱹᱭ ᱦᱟᱛᱟᱣ ᱢᱮ᱾',
    switchLanguage: 'ᱯᱟᱹᱨᱥᱤ',
    allLanguages: 'ᱡᱚᱛᱚ ᱑᱕᱐+ ᱯᱟᱹᱨᱥᱤ',
    indianLanguages: 'ᱵᱷᱟᱨᱚᱛ ᱨᱮᱱᱟᱜ ᱯᱟᱹᱨᱥᱤ',
    globalLanguages: 'ᱫᱷᱟᱹᱨᱛᱤ ᱨᱮᱱᱟᱜ ᱯᱟᱹᱨᱥᱤ',
    searchLangPlaceholder: 'ᱯᱟᱹᱨᱥᱤ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ (ᱡᱮᱞᱮᱠᱟ: ᱥᱟᱱᱛᱟᱲᱤ, हिन्दी, English)...',
    verifiedIcdCodes: 'ᱯᱚᱨᱢᱟᱬ ᱟᱠᱟᱱ ICD-10 ᱠᱳᱰ',
    dashboardNav: 'ᱰᱮᱥᱵᱳᱨᱰ',
    medicalAiChatNav: 'ᱪᱤᱠᱤᱛᱥᱟ AI ᱠᱩᱠᱞᱤ-ᱛᱮᱞᱟ',
    prescriptionAiNav: 'ᱨᱟᱱ ᱯᱟᱨᱪᱟ AI',
    labDiagnosticsNav: 'ᱞᱮᱵᱽ ᱰᱟᱭᱜᱽᱱᱳᱥᱴᱤᱠᱥ',
    liveRatesNav: 'ᱫᱟᱢ ᱟᱨ ᱥᱩᱨᱚᱠᱷᱟ',
    healthMapNav: 'ᱦᱟᱥᱯᱟᱛᱟᱞ ᱱᱚᱠᱥᱟ',
    voiceAssistantNav: 'ᱟᱲᱟᱝ AI ᱜᱚᱲᱚᱭᱤᱡ',
    medicationScheduleNav: 'ᱨᱟᱱ ᱚᱠᱛᱚ ᱛᱟᱹᱞᱠᱟᱹ',
    patientVaultNav: 'ᱨᱩᱜᱤ ᱠᱟᱜᱚᱡᱽ ᱵᱷᱳᱞᱴ',
    qrMedicalIdNav: 'AI + QR ᱥᱤᱥᱴᱚᱢ',

    donationNav: 'ᱫᱟᱱ ᱛᱟᱞᱢᱟ (Donation Hub)',
    medicalCopilotStatus: 'ᱢᱮᱰᱤᱠᱟᱞ ᱜᱚᱲᱚᱭᱤᱡ',
    readyStatus: 'ᱥᱟᱯᱲᱟᱣ ᱢᱮᱱᱟᱜ-ᱟ',
    clinicalIntelligenceHub: 'ᱠᱞᱤᱱᱤᱠᱟᱞ ᱦᱟᱵᱽ',
    spokenLanguage: 'ᱨᱚᱲ ᱯᱟᱹᱨᱥᱤ',
    verifiedClinicalPortal: 'ᱯᱚᱨᱢᱟᱬ ᱯᱳᱨᱴᱟᱞ',
    welcomeBack: 'ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ',
    welcomeSubtitle: 'ᱟᱢᱟᱜ ᱟᱭᱢᱟ ᱯᱟᱹᱨᱥᱤ ᱦᱚᱲᱢᱚ ᱜᱚᱲᱚᱭᱤᱡ ᱥᱟᱯᱲᱟᱣ ᱢᱮᱱᱟᱜ-ᱟ:',
    uploadMedicalDocBtn: 'ᱠᱟᱜᱚᱡᱽ ᱟᱯᱞᱳᱰ ᱢᱮ',
    multimodalVisionCard: 'ᱢᱟᱞᱴᱤᱢᱳᱰᱟᱞ ᱧᱮᱞ',
    standardAnalytesCard: '᱑᱕ ᱴᱮᱥᱴ ᱵᱟᱭᱳᱢᱟᱨᱠᱟᱨ',
    languagesVoiceCard: '᱑᱕᱐+ ᱯᱟᱹᱨᱥᱤ ᱟᱲᱟᱝ ᱜᱚᱲᱚ',
    emergencyIdCard: 'ᱟᱯᱟᱛᱠᱟᱞᱤᱱ QR ᱠᱟᱨᱰ',
    quickDocScanner: 'ᱞᱚᱜᱚᱱ ᱥᱠᱮᱱᱟᱨ',
    openFullScanner: 'ᱯᱩᱨᱟᱹ ᱥᱠᱮᱱᱟᱨ ᱡᱷᱤᱡ ᱢᱮ →',
    voiceAssistantBtn: 'ᱟᱲᱟᱝ ᱜᱚᱲᱚᱭᱤᱡ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠ (Sign Out)',
  },

  // --- SINDHI (Indian/Global - RTL) ---
  sd: {
    appTitle: 'MediMitra',
    appSubtitle: 'اي آئي سان هلندڙ ڪلينيڪل معلومات ۽ صحت ساٿي',
    heroTag: 'Altrix Labs هيڪاٿون • مرحلو ۱: نسخي ۽ ليب رپورٽ جو تجزيو',
    heroTitle: 'طبي دستاويزن مان ڪلينيڪل معلومات حاصل ڪريو',
    heroDescription: 'ڊاڪٽر جو نسخو يا ليب رپورٽ (JPG, PNG, WEBP, PDF) اپلوڊ ڪريو. دوائون، ٽيسٽ جا نتيجا ۽ بيماري جي تشخيص ۱۵۰+ ٻولين ۾ ترجمي سان حاصل ڪريو.',
    uploadBoxTitle: 'نسخو يا ليب رپورٽ اپلوڊ ڪريو',
    uploadBoxSubtitle: 'فائل هتي رکو يا چونڊيو (وڌ ۾ وڌ ۲۰MB).',
    selectDocBtn: 'طبي دستاويز چونڊيو',
    processingTitle: 'دستاويز تي ڪم جاري آهي',
    analyzingStep: 'Gemini AI ويزن سان تجزيو ڪيو پيو وڃي...',
    diagnosesHeading: 'تشخيص ۽ ڪلينيڪل نتيجا',
    medicationsHeading: 'تجويز ڪيل دوائون ۽ مقدار',
    labTestsHeading: 'ليبارٽري بايو مارڪر ٽيسٽ',
    physicianNotesHeading: 'ڊاڪٽر جا مشورا ۽ هدايتون',
    dosage: 'مقدار (ڊوز)',
    frequency: 'واپرائڻ جو وقت',
    duration: 'مدت (ڏينهن)',
    instructions: 'استعمال جون هدايتون ۽ حفاظت',
    listenAudioBtn: 'آواز ۾ ٻڌو',
    stopAudioBtn: 'آواز بند ڪريو',
    openNihLookup: 'NIH ICD-10 ڳولا',
    openFdaInfo: 'openFDA دوا جي حفاظت',
    disclaimerTitle: 'طبي حفاظت جو چتاءُ',
    disclaimerText: 'MediMitra هڪ AI مددگار اوزار آهي. طبي فيصلي کان اڳ پنهنجي ڊاڪٽر سان ضرور صلاح ڪريو.',
    switchLanguage: 'ٻولي',
    allLanguages: 'سڀ ۱۵۰+ ٻوليون',
    indianLanguages: 'هندستاني ٻوليون',
    globalLanguages: 'عالمي ٻوليون',
    searchLangPlaceholder: 'ٻولي ڳوليو (مثال: سنڌي، اردو، English)...',
    verifiedIcdCodes: 'تصديق ٿيل ICD-10 ڪوڊ',
    dashboardNav: 'ڊيش بورڊ',
    medicalAiChatNav: 'طبي مصنوعي ذهانت سوال ۽ جواب',
    prescriptionAiNav: 'نسخو AI',
    labDiagnosticsNav: 'ليب تشخيص',
    liveRatesNav: 'قيمتون ۽ حفاظت',
    healthMapNav: 'صحت مرڪزن جو نقشو',
    voiceAssistantNav: 'وائس AI اسسٽنٽ',
    medicationScheduleNav: 'دوائن جو ٽائيم ٽيبل',
    patientVaultNav: 'مريض جو ميڊيڪل والٽ',
    qrMedicalIdNav: 'AI + QR سسٽم',

    donationNav: 'عطيو مرڪز (Donation Hub)',
    medicalCopilotStatus: 'ميڊيڪل ڪوپائلٽ',
    readyStatus: 'تيار آهي',
    clinicalIntelligenceHub: 'ڪلينيڪل انٽيليجنس حب',
    spokenLanguage: 'ڳالهائجندڙ ٻولي',
    verifiedClinicalPortal: 'تصديق ٿيل پورٽل',
    welcomeBack: 'ڀلي ڪري آيا',
    welcomeSubtitle: 'توهان جو گھڻ-ٻوليائي صحت ساٿي تيار آهي:',
    uploadMedicalDocBtn: 'دستاويز اپلوڊ ڪريو',
    multimodalVisionCard: 'ملٽي ماڊل ويزن',
    standardAnalytesCard: '۱۵ معياري بايو مارڪر',
    languagesVoiceCard: '۱۵۰+ ٻولين ۾ آواز سپورٽ',
    emergencyIdCard: 'ايمرجنسي QR ڪارڊ',
    quickDocScanner: 'تيز اسڪينر',
    openFullScanner: 'مڪمل اسڪينر کوليو ←',
    voiceAssistantBtn: 'وائس اسسٽنٽ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'لاگ آئوٽ',
  },

  // --- DOGRI (Indian) ---
  doi: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण ते सेहत साथी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: नुस्खा ते लैब रिपोर्ट विश्लेषण',
    heroTitle: 'डाक्टरी कागजातें थमां क्लिनिकल जानकारी हासल करो',
    heroDescription: 'डाक्टर दा नुस्खा या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करो। दवाइयां, जांच नतीजे ते रोग निदान १५०+ बोलियां च अनुवाद कन्नै हासल करो।',
    uploadBoxTitle: 'नुस्खा या लैब रिपोर्ट अपलोड करो',
    uploadBoxSubtitle: 'फाइल इत्थै ड्रैग करो या चुनो (बड्डी थमां बड्डी २०MB)।',
    selectDocBtn: 'कागजात चुनो',
    processingTitle: 'कागजात दा विश्लेषण होई रेहा ऐ',
    analyzingStep: 'Gemini AI विजन कन्नै विश्लेषण होई रेहा ऐ...',
    diagnosesHeading: 'रोग निदान ते क्लिनिकल नतीजे',
    medicationsHeading: 'दस्सियां दवाइयां ते खुराक',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर दी सलाह ते नोट',
    dosage: 'खुराक (डोज)',
    frequency: 'लैने दी वारंबारता',
    duration: 'दिनें दी गिनती',
    instructions: 'लैने दे नियम ते सुरक्षा',
    listenAudioBtn: 'आवाज च सुणो',
    stopAudioBtn: 'आवाज बंद करो',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेताउनी',
    disclaimerText: 'MediMitra इक एआई सहायक औजार ऐ। कोई डाक्टरी फैसला लैने थमां पैहले डाक्टर कन्नै सलाह जरूर करो।',
    switchLanguage: 'बोली',
    allLanguages: 'सारियां १५०+ बोलियां',
    indianLanguages: 'भारतीय बोलियां',
    globalLanguages: 'दुनिया दियां बोलियां',
    searchLangPlaceholder: 'बोली खोजो (जिच्छन: डोगरी, हिन्दी, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'नुस्खा AI',
    labDiagnosticsNav: 'लैब डायग्नोस्टिक्स',
    liveRatesNav: 'दर ते सुरक्षा',
    healthMapNav: 'सेहत केंद्र नक्शा',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तयार ऐ',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोली जाने आह्ली बोली',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'स्वागत ऐ',
    welcomeSubtitle: 'तुंदा बहुभाषी सेहत साथी तयार ऐ:',
    uploadMedicalDocBtn: 'कागजात अपलोड करो',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ बोलियां च आवाज सहायता',
    emergencyIdCard: 'एमरजेंसी QR कार्ड',
    quickDocScanner: 'फुर्तीला स्कैनर',
    openFullScanner: 'पूरा स्कैनर खोल्लो →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- BODO (Indian) ---
  brx: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-जों सालायजानाय क्लिनिकिय खारि आरो साबसिन साहा खालामग्रा',
    heroTag: 'Altrix Labs Hackathon • बाहागो १: दाक्थोरनि बिलाइ आरो लेब रिपर्ट बिजिरनाय',
    heroTitle: 'दाक्थोरनि बिलाइनिफ्राय क्लिनिकिय खारि मोन',
    heroDescription: 'दाक्थोरनि बिलाइ एबा लेब रिपर्ट (JPG, PNG, WEBP, PDF) आपलोड खालाम। मुलि, आनजादनि फिथाय आरो बेमार १५०+ रावआव सोलायनायजों मोन।',
    uploadBoxTitle: 'दाक्थोरनि बिलाइ एबा लेब रिपर्ट आपलोड खालाम',
    uploadBoxSubtitle: 'फाइलखौ बेयाव बोना दोन एबा सायख (बांसिनै २०MB)।',
    selectDocBtn: 'बिलाइ सायख',
    processingTitle: 'बिलाइखौ बिजिरबाय थानाय जादों',
    analyzingStep: 'Gemini AI नुथायजों बिजिरगासिनो दं...',
    diagnosesHeading: 'बेमार हमनाय आरो क्लिनिकिय खारि',
    medicationsHeading: 'होनाय मुलि आरो बिबां',
    labTestsHeading: 'लेबोरेटरी बायोमार्कर आनजाद',
    physicianNotesHeading: 'दाक्थोरनि सुबुरुन आरो बाथ्रा',
    dosage: 'बिबां (डोज)',
    frequency: 'जानायनि सम',
    duration: 'साननि अनजिमा',
    instructions: 'बाहायनाय खान्थि आरो रैखाथि',
    listenAudioBtn: 'खोन्दोबआव खोनासंस',
    stopAudioBtn: 'खोन्दोब बन्द खालाम',
    openNihLookup: 'NIH ICD-10 नागिरनाय',
    openFdaInfo: 'openFDA मुलि रैखाथि',
    disclaimerTitle: 'दाक्थोर रैखाथि सांग्रांथि',
    disclaimerText: 'MediMitra खौ AI हेफाजाब खालामग्रा हिसाबै बाहाय। जेबो थांखि लानो सिगां दाक्थोरजों रायज्लाय।',
    switchLanguage: 'राव',
    allLanguages: 'गासै १५०+ रावफोर',
    indianLanguages: 'भारतनि रावफोर',
    globalLanguages: 'बुहुमनि रावफोर',
    searchLangPlaceholder: 'राव नागिर (जेरै: बर’, हिन्दी, English)...',
    verifiedIcdCodes: 'फोरमानजानाय ICD-10 कोड',
    dashboardNav: 'डेशबर्ड',
    medicalAiChatNav: 'राहा एआई सोंलु-फिननाय',
    prescriptionAiNav: 'दाक्थोर बिलाइ AI',
    labDiagnosticsNav: 'लेब आनजाद',
    liveRatesNav: 'दाम आरो रैखाथि',
    healthMapNav: 'साहा देहासालि मानसि',
    voiceAssistantNav: 'राव AI हेफाजाबग्रा',
    medicationScheduleNav: 'मुलि जानाय फारिलाइ',
    patientVaultNav: 'रगियारी खारि बाक्सु',
    qrMedicalIdNav: 'AI + QR राहा',

    donationNav: 'दान मिरु (Donation Hub)',
    medicalCopilotStatus: 'दाक्थोर हेफाजाबग्रा',
    readyStatus: 'साजायखानाय दं',
    clinicalIntelligenceHub: 'क्लिनिकिय गियान केन्द्र',
    spokenLanguage: 'रायज्लायनाय राव',
    verifiedClinicalPortal: 'फोरमानजानाय पोर्टल',
    welcomeBack: 'बरायबाय',
    welcomeSubtitle: 'नोंथांनि गोबां रावनि साहा हेफाजाबग्रा साजायखानाय दं:',
    uploadMedicalDocBtn: 'बिलाइ आपलोड खालाम',
    multimodalVisionCard: 'गोबां रोखोम नुथाय',
    standardAnalytesCard: '१५ मान बायोमार्कर',
    languagesVoiceCard: '१५०+ रावआव खोन्दोब हेफाजाब',
    emergencyIdCard: 'गोनांथार QR कार्ड',
    quickDocScanner: 'थाब स्क्यानर',
    openFullScanner: 'गासै स्क्यानर खुलि →',
    voiceAssistantBtn: 'राव हेफाजाबग्रा',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ओंखारलां (Sign Out)',
  },

  // --- MANIPURI / MEITEI (Indian) ---
  mni: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-না চলাইবা ক্লিনিকেল চে-চাং খন্দোকপা অমসুং হকশেলগী তেংবাংলোই',
    heroTag: 'Altrix Labs হেক্বাথন • তাঙ্কক ১: প্রেস্ক্রিপসন অমসুং লেব রির্পোট নৈনবা',
    heroTitle: 'মেডিকেল চে-চাংদগী ক্লিনিকেল ৱাফমশিং অচুম্বা ফংবীয়ু',
    heroDescription: 'দোক্তরগী প্রেস্ক্রিপসন নত্রগা লেব রির্পোট (JPG, PNG, WEBP, PDF) অপলোদ তৌবীয়ু। হিদাক-লাংথক, তেস্ত রিছল্ত ১৫০+ লোলদা হন্দোকপগা লোয়ননা ফংবীয়ু।',
    uploadBoxTitle: 'প্রেস্ক্রিপসন নত্রগা লেব রির্পোট অপলোদ তৌবীয়ু',
    uploadBoxSubtitle: 'ফাইল মফমসিদা চিংশিল্লকউ নত্রগা খনগৎলু (খ্বাইদগী য়াম্বদা ২০MB)।',
    selectDocBtn: 'চে-চাং খনগৎলু',
    processingTitle: 'চে-চাং নৈনরি',
    analyzingStep: 'Gemini AI বিজনগা লোয়ননা নৈনরি...',
    diagnosesHeading: 'অনাবা খঙদোকপা অমসুং রিফোর্ত',
    medicationsHeading: 'পীবিরবা হিদাক-লাংথক অমসুং চাং',
    labTestsHeading: 'লেবোরেতরি বায়োমার্কার তেস্তশিং',
    physicianNotesHeading: 'দোক্তরগী পাউতাক অমসুং শৈথাবা',
    dosage: 'হিদাক্কী চাং (ডোজ)',
    frequency: 'চাবগী মশিং',
    duration: 'নুমিতকী চাং',
    instructions: 'চাবগী নিয়ম অমসুং ঙাক-শেন',
    listenAudioBtn: 'খোন্থোক্তা তারসি',
    stopAudioBtn: 'অডিও লেপহন্নু',
    openNihLookup: 'NIH ICD-10 থিবীয়ু',
    openFdaInfo: 'openFDA হিদাক ঙাক-শেন',
    disclaimerTitle: 'মেডিকেল ঙাক-শেনগী চেকশিন-ৱাফম',
    disclaimerText: 'MediMitra অসি AI তেংবাং খুতলাই অমনি। হকশেলগী ৱারেপ লৌদ্রিঙৈদা দোক্তরদা তান্নবীয়ু।',
    switchLanguage: 'লোল',
    allLanguages: 'লোল ১৫০+ পুম্নমক',
    indianLanguages: 'ভারতকী লোলশিং',
    globalLanguages: 'মালেমগী লোলশিং',
    searchLangPlaceholder: 'লোল থিবীয়ু (মীতৈলোন, हिन्दी, English)...',
    verifiedIcdCodes: 'লেপ্নরবা ICD-10 কোদ',
    dashboardNav: 'দেশবোর্দ',
    medicalAiChatNav: 'ꯃꯦꯗꯤꯀꯦꯜ ꯑꯦꯑꯥꯏ ꯋꯥꯍꯪ-ꯄꯥꯎꯈꯨꯝ',
    prescriptionAiNav: 'প্রেস্ক্রিপসন AI',
    labDiagnosticsNav: 'লেব দাইগনোস্তিকস',
    liveRatesNav: 'মমল অমসুং ঙাক-শেন',
    healthMapNav: 'হকশেল কেন্দ্র মফম',
    voiceAssistantNav: 'খোন্থোক AI তেংবাংলোই',
    medicationScheduleNav: 'হিদাক চাবগী মতম',
    patientVaultNav: 'অনাবগী চে-চাং ভো爾ত',
    qrMedicalIdNav: 'AI + QR সিস্তেম',

    donationNav: 'দান কেন্দ্র (Donation Hub)',
    medicalCopilotStatus: 'মেডিকেল কোপাইলত',
    readyStatus: 'শেম-শাদুনা লৈরে',
    clinicalIntelligenceHub: 'ক্লিনিকেল কেন্দ্র',
    spokenLanguage: 'ঙাংলিবা লোল',
    verifiedClinicalPortal: 'লেপ্নরবা পোর্তেল',
    welcomeBack: 'তরাম্না ওকচরি',
    welcomeSubtitle: 'নহাক্কী তোঙান-তোঙানবা লোলগী হকশেল তেংবাংলোই শেম-শারে:',
    uploadMedicalDocBtn: 'চে-চাং অপলোদ তৌবীয়ু',
    multimodalVisionCard: 'মফম কয়াদা উবা',
    standardAnalytesCard: '১৫ তেন্দর্দ বায়োমার্কার',
    languagesVoiceCard: 'লোল ১৫০+ দা খোন্থোক তেংবাং',
    emergencyIdCard: 'খুদোক-থীদোক QR কার্দ',
    quickDocScanner: 'য়াংনা স্কেন তৌবা',
    openFullScanner: 'স্কেনর অপুনবা হাংদোকউ →',
    voiceAssistantBtn: 'খোন্থোক তেংবাংলোই',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'থোক্লসি (Sign Out)',
  },

  // --- BHOJPURI (Indian) ---
  bho: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण आ स्वास्थ्य सहेली',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: पर्ची आ लैब रिपोर्ट जांच',
    heroTitle: 'डाक्टरी कागजात से क्लिनिकल जानकारी निकालीं',
    heroDescription: 'डाक्टर के परची भा लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करीं। दवाई, जांच के नतीजा आ रोग निदान १५०+ भाषा में अनुवाद के साथ पाईं।',
    uploadBoxTitle: 'परची भा लैब रिपोर्ट अपलोड करीं',
    uploadBoxSubtitle: 'फाइल हिंवा खींचीं भा चुनीं (अधिकतम २०MB)।',
    selectDocBtn: 'कागजात चुनीं',
    processingTitle: 'कागजात पर काम चल रहल बा',
    analyzingStep: 'Gemini AI विजन से जांच हो रहल बा...',
    diagnosesHeading: 'रोग के पहचान आ निष्कर्ष',
    medicationsHeading: 'बतावल दवाई आ मात्रा',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर के सलाह आ टिप्पणी',
    dosage: 'मात्रा (खुराक)',
    frequency: 'लेवे के समय',
    duration: 'दिनन के संख्या',
    instructions: 'लेवे के नियम आ सावधानी',
    listenAudioBtn: 'आवाज में सुनीं',
    stopAudioBtn: 'आवाज बंद करीं',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेतावनी',
    disclaimerText: 'MediMitra एगो एआई सहायक बा। कवनो डाक्टरी फैसला लेवे से पहिले डाक्टर से सलाह जरूर लीं।',
    switchLanguage: 'भाषा',
    allLanguages: 'कुल १५०+ भाषा',
    indianLanguages: 'भारतीय भाषा कुल',
    globalLanguages: 'दुनिया के भाषा कुल',
    searchLangPlaceholder: 'भाषा खोजीं (जैसे: भोजपुरी, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'परची AI',
    labDiagnosticsNav: 'लैब जांच',
    liveRatesNav: 'दाम आ सुरक्षा',
    healthMapNav: 'अस्पताल के नक्शा',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तैयार बा',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोले वाला भाषा',
    verifiedClinicalPortal: 'प्रमाणित पोर्टल',
    welcomeBack: 'स्वागत बा',
    welcomeSubtitle: 'रउआ के बहुभाषी स्वास्थ्य साथी तैयार बा:',
    uploadMedicalDocBtn: 'कागजात अपलोड करीं',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषा में आवाज सहायता',
    emergencyIdCard: 'इमरजेंसी QR कार्ड',
    quickDocScanner: 'झटपट स्कैनर',
    openFullScanner: 'पूरा स्कैनर खोलीं →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- RAJASTHANI (Indian) ---
  raj: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण अर स्वास्थ्य साथी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: परची अर लैब रिपोर्ट विश्लेषण',
    heroTitle: 'डाक्टरी कागजात सूं क्लिनिकल जानकारी प्राप्त करो',
    heroDescription: 'डाक्टर री परची या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करो। दवाईयां, जांच नतीजा अर रोग निदान १५०+ भाषावां में अनुवाद साथै पाओ।',
    uploadBoxTitle: 'परची या लैब रिपोर्ट अपलोड करो',
    uploadBoxSubtitle: 'फाइल अठै ड्रैग करो या चुणो (अधिकतम २०MB)।',
    selectDocBtn: 'कागजात चुणो',
    processingTitle: 'कागजात रो विश्लेषण हो रह्यो है',
    analyzingStep: 'Gemini AI विजन सूं विश्लेषण हो रह्यो है...',
    diagnosesHeading: 'रोग निदान अर क्लिनिकल निष्कर्ष',
    medicationsHeading: 'बताई दवाईयां अर खुराक',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर री सलाह अर टिप्पणी',
    dosage: 'खुराक (डोज)',
    frequency: 'लेवण री बारंबारता',
    duration: 'दिनां री संख्या',
    instructions: 'लेवण रा नियम अर सुरक्षा',
    listenAudioBtn: 'आवाज में सुणो',
    stopAudioBtn: 'आवाज बंद करो',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेतावनी',
    disclaimerText: 'MediMitra एक एआई सहायक औजार है। कोई डाक्टरी फैसला लेवण सूं पैली डाक्टर सूं सलाह जरूर करो।',
    switchLanguage: 'भाषा',
    allLanguages: 'सगळी १५०+ भाषावां',
    indianLanguages: 'भारतीय भाषावां',
    globalLanguages: 'दुनिया री भाषावां',
    searchLangPlaceholder: 'भाषा खोजो (जिंयां: राजस्थानी, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'परची AI',
    labDiagnosticsNav: 'लैब जांच',
    liveRatesNav: 'भाव अर सुरक्षा',
    healthMapNav: 'अस्पताल रो नक्शो',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तैयार है',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोलीजण वाळी भाषा',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'घणो स्वागत है',
    welcomeSubtitle: 'थांरो बहुभाषी स्वास्थ्य साथी तैयार है:',
    uploadMedicalDocBtn: 'कागजात अपलोड करो',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषावां में आवाज सहायता',
    emergencyIdCard: 'एमरजेंसी QR कार्ड',
    quickDocScanner: 'झटपट स्कैनर',
    openFullScanner: 'पूरो स्कैनर खोलो →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- MARWARI (Indian) ---
  mwr: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण अर निरोगी साथी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: परची अर लैब जांच',
    heroTitle: 'डाक्टरी कागजात सूं क्लिनिकल जानकारी निकालो',
    heroDescription: 'डाक्टर री परची या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करो। दवाई, जांच अर रोग निदान १५०+ भाषावां में अनुवाद साथै पाओ।',
    uploadBoxTitle: 'परची या लैब रिपोर्ट अपलोड करो',
    uploadBoxSubtitle: 'फाइल अठै लावो या चुणो (अधिकतम २०MB)।',
    selectDocBtn: 'कागजात चुणो',
    processingTitle: 'कागजात रो विश्लेषण हो रह्यो है',
    analyzingStep: 'Gemini AI विजन सूं जांच चालै...',
    diagnosesHeading: 'रोग री ओळखाण अर नतीजा',
    medicationsHeading: 'बतायोड़ी दवाईयां अर खुराक',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर री सलाह अर सीख',
    dosage: 'खुराक (डोज)',
    frequency: 'लेवण रो टेम',
    duration: 'दिनां री गिनती',
    instructions: 'लेवण रा नियम अर सावधानी',
    listenAudioBtn: 'आवाज में सुणो',
    stopAudioBtn: 'आवाज बंद करो',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेतावणी',
    disclaimerText: 'MediMitra एक एआई सहायक है। कोई फैसला लेवण सूं पैली डाक्टर सूं सलाह जरूर करो।',
    switchLanguage: 'भाषा',
    allLanguages: 'सगळी १५०+ भाषावां',
    indianLanguages: 'भारतीय भाषावां',
    globalLanguages: 'दुनिया री भाषावां',
    searchLangPlaceholder: 'भाषा खोजो (जिंयां: मारवाड़ी, हिन्दी, English)...',
    verifiedIcdCodes: 'प्रमाणित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'परची AI',
    labDiagnosticsNav: 'लैब जांच',
    liveRatesNav: 'भाव अर सुरक्षा',
    healthMapNav: 'अस्पताल रो नक्शो',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तैयार है',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोलीजण वाळी भाषा',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'घणो स्वागत है',
    welcomeSubtitle: 'थांरो बहुभाषी स्वास्थ्य साथी तैयार है:',
    uploadMedicalDocBtn: 'कागजात अपलोड करो',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषावां में आवाज सहायता',
    emergencyIdCard: 'एमरजेंसी QR कार्ड',
    quickDocScanner: 'झटपट स्कैनर',
    openFullScanner: 'पूरो स्कैनर खोलो →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- HARYANVI (Indian) ---
  bgc: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-संचालित डाक्टरी पर्ची विश्लेषण अर सेहत साथी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: पर्ची अर लैब रिपोर्ट विश्लेषण',
    heroTitle: 'डाक्टरी कागजात तै क्लिनिकल जानकारी काढ़ो',
    heroDescription: 'डाक्टर की पर्ची या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करो। दवाई, जांच के नतीजे अर रोग निदान १५०+ भाषावां में अनुवाद पावैं।',
    uploadBoxTitle: 'पर्ची या लैब रिपोर्ट अपलोड करो',
    uploadBoxSubtitle: 'फाइल अड़ै ड्रैग करो या चुणो (घणे तै घणा २०MB)।',
    selectDocBtn: 'कागजात चुणो',
    processingTitle: 'कागजात पै काम चाल रह्या सै',
    analyzingStep: 'Gemini AI विजन तै विश्लेषण हो रह्या सै...',
    diagnosesHeading: 'बीमारी की पहचान अर नतीजे',
    medicationsHeading: 'बताई दवाईयां अर खुराक',
    labTestsHeading: 'लैब बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर की सलाह अर टिप्पणी',
    dosage: 'खुराक (डोज)',
    frequency: 'लेण का टेम',
    duration: 'दिनां की गिनती',
    instructions: 'लेण के नियम अर सावधानी',
    listenAudioBtn: 'आवाज में सुणो',
    stopAudioBtn: 'आवाज बंद करो',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेतावनी',
    disclaimerText: 'MediMitra एक AI सहायक सै। कोई डाक्टरी फैसला लेण तै पैहलां डाक्टर तै सलाह जरूर करो।',
    switchLanguage: 'बोली',
    allLanguages: 'सारी १५०+ बोलियां',
    indianLanguages: 'भारतीय बोलियां',
    globalLanguages: 'दुनिया की बोलियां',
    searchLangPlaceholder: 'बोली खोजो (जिस्सा: हरियाणवी, हिन्दी, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'पर्ची AI',
    labDiagnosticsNav: 'लैब जांच',
    liveRatesNav: 'भाव अर सुरक्षा',
    healthMapNav: 'अस्पताल का नक्शा',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तैयार सै',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'बोली जाण आळी बोली',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'जी आयां नूं / स्वागत सै',
    welcomeSubtitle: 'थारा बहुभाषी सेहत साथी तैयार सै:',
    uploadMedicalDocBtn: 'कागजात अपलोड करो',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ बोलियां में आवाज सहायता',
    emergencyIdCard: 'एमरजेंसी QR कार्ड',
    quickDocScanner: 'झटपट स्कैनर',
    openFullScanner: 'पूरा स्कैनर खोलो →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- CHHATTISGARHI (Indian) ---
  hne: {
    appTitle: 'MediMitra',
    appSubtitle: 'एआई-संचालित क्लिनिकल निष्कर्षण अउ स्वास्थ्य संगवारी',
    heroTag: 'Altrix Labs हैकाथॉन • चरण १: परची अउ लैब रिपोर्ट जांच',
    heroTitle: 'डाक्टरी कागजात ले क्लिनिकल जानकारी निकालव',
    heroDescription: 'डाक्टर के परची या लैब रिपोर्ट (JPG, PNG, WEBP, PDF) अपलोड करव। दवाई, जांच के नतीजा अउ रोग निदान १५०+ भाषा म अनुवाद के संग पावव।',
    uploadBoxTitle: 'परची या लैब रिपोर्ट अपलोड करव',
    uploadBoxSubtitle: 'फाइल इहां लाघव या चुनव (अधिकतम २०MB)।',
    selectDocBtn: 'कागजात चुनव',
    processingTitle: 'कागजात म काम चलत हे',
    analyzingStep: 'Gemini AI विजन ले विश्लेषण होवत हे...',
    diagnosesHeading: 'रोग के पहचान अउ निष्कर्ष',
    medicationsHeading: 'बताए दवाई अउ खुराक',
    labTestsHeading: 'प्रयोगशाला बायोमार्कर जांच',
    physicianNotesHeading: 'डाक्टर के सलाह अउ टिप्पणी',
    dosage: 'खुराक (डोज)',
    frequency: 'लेए के बेरा',
    duration: 'दिन के गिनती',
    instructions: 'लेए के नियम अउ सावधानी',
    listenAudioBtn: 'आवाज म सुनव',
    stopAudioBtn: 'आवाज बंद करव',
    openNihLookup: 'NIH ICD-10 खोज',
    openFdaInfo: 'openFDA दवाई सुरक्षा',
    disclaimerTitle: 'डाक्टरी सुरक्षा चेताउनी',
    disclaimerText: 'MediMitra एक एआई सहायक औजार आय। कोनो डाक्टरी फैसला लेए के पहिली डाक्टर ले सलाह जरूर लेवव।',
    switchLanguage: 'भाषा',
    allLanguages: 'जम्मो १५०+ भाषा',
    indianLanguages: 'भारतीय भाषा मन',
    globalLanguages: 'दुनिया के भाषा मन',
    searchLangPlaceholder: 'भाषा खोजव (जइसन: छत्तीसगढ़ी, हिन्दी, English)...',
    verifiedIcdCodes: 'सत्यापित ICD-10 कोड',
    dashboardNav: 'डैशबोर्ड',
    medicalAiChatNav: 'चिकित्सा एआई सवाल-जवाब',
    prescriptionAiNav: 'परची AI',
    labDiagnosticsNav: 'लैब जांच',
    liveRatesNav: 'दर अउ सुरक्षा',
    healthMapNav: 'अस्पताल के नक्शा',
    voiceAssistantNav: 'आवाज AI सहायक',
    medicationScheduleNav: 'दवाई समयसारिणी',
    patientVaultNav: 'मरीज रिकार्ड वाल्ट',
    qrMedicalIdNav: 'AI + QR सिस्टम',

    donationNav: 'दान केंद्र (Donation Hub)',
    medicalCopilotStatus: 'मेडिकल कोपायलट',
    readyStatus: 'तैयार हे',
    clinicalIntelligenceHub: 'क्लिनिकल इंटेलिजेंस हब',
    spokenLanguage: 'गोठियाए के भाषा',
    verifiedClinicalPortal: 'सत्यापित पोर्टल',
    welcomeBack: 'स्वागत हे',
    welcomeSubtitle: 'तुंहर बहुभाषी स्वास्थ्य संगवारी तैयार हे:',
    uploadMedicalDocBtn: 'कागजात अपलोड करव',
    multimodalVisionCard: 'मल्टीमॉडल विजन',
    standardAnalytesCard: '१५ मानक बायोमार्कर',
    languagesVoiceCard: '१५०+ भाषा म आवाज सहायता',
    emergencyIdCard: 'इमरजेंसी QR कार्ड',
    quickDocScanner: 'झटपट स्कैनर',
    openFullScanner: 'पूरा स्कैनर खोलव →',
    voiceAssistantBtn: 'आवाज सहायक',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'साइन आउट',
  },

  // --- TULU (Indian) ---
  tcy: {
    appTitle: 'MediMitra',
    appSubtitle: 'AI-ಚಾಲಿತ ಕ್ಲಿನಿಕಲ್ ಮಾಹಿತಿ ಬೊಕ್ಕ ಆರೋಗ್ಯ ಸಂಗಾತಿ',
    heroTag: 'Altrix Labs ಹ್ಯಾಕಥಾನ್ • ಹಂತ ೧: ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಬೊಕ್ಕ ಲ್ಯಾಬ್ ರಿಪೋರ್ಟ್',
    heroTitle: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಲೆಡ್ದ್ ಕ್ಲಿನಿಕಲ್ ಮಾಹಿತಿ ಪಡೆಯಿಲೆ',
    heroDescription: 'ಡಾಕ್ಟರೆನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅತ್ತ್ಂಡ ಲ್ಯಾಬ್ ರಿಪೋರ್ಟ್ (JPG, PNG, WEBP, PDF) ಅಪ್‌ಲೋಡ್ ಮಲ್ಪುಲೆ. ಮರ್ದ್, ತಪಾಸಣೆ ಬೊಕ್ಕ ರೋಗ ನಿರ್ಣಯ ೧೫೦+ ಭಾಷೆಲೆಡ್ ಅನುವಾದೊಡು ಪಡೆಯಿಲೆ.',
    uploadBoxTitle: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅತ್ತ್ಂಡ ಲ್ಯಾಬ್ ರಿಪೋರ್ಟ್ ಅಪ್‌ಲೋಡ್ ಮಲ್ಪುಲೆ',
    uploadBoxSubtitle: 'ಫೈಲ್ ಮುಲ್ಪ ಪಾಡ್ಲೆ ಅತ್ತ್ಂಡ ಆರಿಸಿರಿ (ಗರಿಷ್ಠ ೨೦MB).',
    selectDocBtn: 'ದಾಖಲೆ ಆರಿಸಿರಿ',
    processingTitle: 'ದಾಖಲೆ ಪರಿಶೀಲನೆ ಆವೊಂದುಂಡು',
    analyzingStep: 'Gemini AI ವಿಜನ್ ಒಟ್ಟುಗು ವಿಶ್ಲೇಷಣೆ ಆವೊಂದುಂಡು...',
    diagnosesHeading: 'ರೋಗ ನಿರ್ಣಯ ಬೊಕ್ಕ ಫಲಿತಾಂಶ',
    medicationsHeading: 'ಕೊರ್ತಿನ ಮರ್ದ್ ಬೊಕ್ಕ ಪ್ರಮಾಣ',
    labTestsHeading: 'ಪ್ರಯೋಗಾಲಯ ಬಯೋಮಾರ್ಕರ್ ತಪಾಸಣೆ',
    physicianNotesHeading: 'ಡಾಕ್ಟರೆನ ಸಲಹೆ ಬೊಕ್ಕ ಟಿಪ್ಪಣಿ',
    dosage: 'ಪ್ರಮಾಣ (ಡೋಸ್)',
    frequency: 'ದಿನೊಕ್ಕು ಏತ್ ಸರ್ತಿ',
    duration: 'ದಿನೊಕುಲೆನ ಲೆಕ್ಕ',
    instructions: 'ಸೇವನೆ ಮಲ್ಪುನ ಕ್ರಮ ಬೊಕ್ಕ ಜಾಗ್ರತೆ',
    listenAudioBtn: 'ಸ್ವರೊಟು ಕೇನ್ಲೆ',
    stopAudioBtn: 'ಆಡಿಯೋ ಉಂತಾಲೆ',
    openNihLookup: 'NIH ICD-10 ನಾಡ್ಲೆ',
    openFdaInfo: 'openFDA ಮರ್ದ್ ಸುರಕ್ಷತೆ',
    disclaimerTitle: 'ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ',
    disclaimerText: 'MediMitra ಒಂಜಿ AI ಸಹಾಯಕ ಸೌಲಭ್ಯ. ವೈದ್ಯಕೀಯ ನಿರ್ಧಾರ ಮಲ್ಪುನ ದುಂಬು ಡಾಕ್ಟರೆಡ ಪಾತೆರ್ಲೆ.',
    switchLanguage: 'ಭಾಷೆ',
    allLanguages: 'ಮಾತಾ ೧೫೦+ ಭಾಷೆಲು',
    indianLanguages: 'ಭಾರತೀಯ ಭಾಷೆಲು',
    globalLanguages: 'ಜಾಗತಿಕ ಭಾಷೆಲು',
    searchLangPlaceholder: 'ಭಾಷೆ ನಾಡ್ಲೆ (ಉದಾ: ತುಳು, ಕನ್ನಡ, हिन्दी, English)...',
    verifiedIcdCodes: 'ದೃಢೀಕೃತ ICD-10 ಕೋಡ್',
    dashboardNav: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    medicalAiChatNav: 'ವೈದ್ಯಕೀಯ AI ಪ್ರಶ್ನೋತ್ತರ',
    prescriptionAiNav: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ AI',
    labDiagnosticsNav: 'ಲ್ಯಾಬ್ ತಪಾಸಣೆ',
    liveRatesNav: 'ದರ ಬೊಕ್ಕ ಸುರಕ್ಷತೆ',
    healthMapNav: 'ಆರೋಗ್ಯ ಕೇಂದ್ರ ನಕ್ಷೆ',
    voiceAssistantNav: 'ಧ್ವನಿ AI ಸಹಾಯಕ',
    medicationScheduleNav: 'ಮರ್ದ್ ಸಮಯಪಟ್ಟಿ',
    patientVaultNav: 'ರೋಗಿ ದಾಖಲೆ ವಾಲ್ಟ್',
    qrMedicalIdNav: 'AI + QR ವ್ಯವಸ್ಥೆ',

    donationNav: 'ದಾನ ಕೇಂದ್ರ (Donation Hub)',
    medicalCopilotStatus: 'ವೈದ್ಯಕೀಯ ಕೊಪೈಲಟ್',
    readyStatus: 'ಸಿದ್ಧ ಉಂಡು',
    clinicalIntelligenceHub: 'ಕ್ಲಿನಿಕಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಕೇಂದ್ರ',
    spokenLanguage: 'ಪಾತೆರುನ ಭಾಷೆ',
    verifiedClinicalPortal: 'ದೃಢೀಕೃತ ಪೋರ್ಟಲ್',
    welcomeBack: 'ಸ್ವಾಗತ',
    welcomeSubtitle: 'ಈರೆನ ಬಹುಭಾಷಾ ಆರೋಗ್ಯ ಸಂಗಾತಿ ಸಿದ್ಧ ಉಂಡು:',
    uploadMedicalDocBtn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಲ್ಪುಲೆ',
    multimodalVisionCard: 'ಮಲ್ಟಿಮೋಡಲ್ ವಿಜನ್',
    standardAnalytesCard: '೧೫ ಬಯೋಮಾರ್ಕರ್ ತಪಾಸಣೆ',
    languagesVoiceCard: '೧೫೦+ ಭಾಷೆಲೆಡ್ ಧ್ವನಿ ಸೌಲಭ್ಯ',
    emergencyIdCard: 'ತುರ್ತು QR ಕಾರ್ಡ್',
    quickDocScanner: 'ಬೇಗ ಸ್ಕ್ಯಾನರ್',
    openFullScanner: 'ಪೂರ್ತಿ ಸ್ಕ್ಯಾನರ್ ದೆಪ್ಪುಲೆ →',
    voiceAssistantBtn: 'ಧ್ವನಿ ಸಹಾಯಕ',
    nihIcd10Btn: 'NIH ICD-10',
    signOut: 'ಪಿದಯಿ ಬಲೆ (Sign Out)',
  },

};

// Common typo, phonetic & alternative spelling aliases mapping directly to standard language codes
export const LANGUAGE_ALIASES: Record<string, string> = {
  // Odia aliases & misspellings
  osia: 'or',
  odiya: 'or',
  oriya: 'or',
  ori: 'or',
  ory: 'or',
  od: 'or',

  // Assamese aliases & misspellings
  assanmine: 'as',
  assamine: 'as',
  asamese: 'as',
  asamiya: 'as',
  asom: 'as',
  asm: 'as',

  // Sanskrit aliases & misspellings
  sanskrite: 'sa',
  sanskriti: 'sa',
  sanskrit: 'sa',
  samskrit: 'sa',
  san: 'sa',

  // Nepali aliases & misspellings
  nepali: 'ne',
  nepal: 'ne',
  nep: 'ne',

  // Kashmiri aliases & misspellings
  kashmini: 'ks',
  kashmir: 'ks',
  kashmira: 'ks',
  kashmiri: 'ks',
  kashur: 'ks',
  kas: 'ks',

  // Konkani aliases & misspellings
  konkani: 'kok',
  kokani: 'kok',
  conkani: 'kok',
  gom: 'kok',

  // Maithili aliases & misspellings
  maithili: 'mai',
  maithli: 'mai',
  mithila: 'mai',
  mai: 'mai',

  // Santali aliases & misspellings
  santali: 'sat',
  santhali: 'sat',
  santal: 'sat',
  sat: 'sat',

  // Sindhi aliases & misspellings
  sindhi: 'sd',
  sindhy: 'sd',
  sindi: 'sd',
  snd: 'sd',

  // Dogri
  dogri: 'doi',
  dgo: 'doi',
  doi: 'doi',

  // Bodo
  bodo: 'brx',
  brx: 'brx',
  boro: 'brx',

  // Manipuri / Meitei
  manipuri: 'mni',
  mni: 'mni',
  meitei: 'mni',
  meetei: 'mni',

  // Regional dialects
  bhojpuri: 'bho',
  bho: 'bho',
  rajasthani: 'raj',
  raj: 'raj',
  marwari: 'mwr',
  mwr: 'mwr',
  haryanvi: 'bgc',
  bgc: 'bgc',
  chhattisgarhi: 'hne',
  hne: 'hne',
  tulu: 'tcy',
  tcy: 'tcy',

  // Scheduled & Major
  hindi: 'hi', hin: 'hi',
  tamil: 'ta', tam: 'ta',
  telugu: 'te', tel: 'te',
  kannada: 'kn', kan: 'kn',
  malayalam: 'ml', mal: 'ml',
  bengali: 'bn', ben: 'bn', bangla: 'bn',
  marathi: 'mr', mar: 'mr',
  gujarati: 'gu', guj: 'gu',
  punjabi: 'pa', pan: 'pa',
  urdu: 'ur', urd: 'ur',
  english: 'en', eng: 'en',
  spanish: 'es', spa: 'es',
  french: 'fr', fra: 'fr',
  german: 'de', deu: 'de',
  arabic: 'ar', ara: 'ar',
  chinese: 'zh', zho: 'zh',
  japanese: 'ja', jpn: 'ja',
  russian: 'ru', rus: 'ru',
  portuguese: 'pt', por: 'pt',
};

// Fallback voice chain so speech synthesis never fails silently if regional voice is uninstalled
export const LOCALE_FALLBACK_CHAIN: Record<string, string[]> = {
  or: ['or-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  ori: ['or-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  as: ['as-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  asm: ['as-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  sa: ['sa-IN', 'hi-IN', 'en-IN'],
  san: ['sa-IN', 'hi-IN', 'en-IN'],
  ne: ['ne-NP', 'ne-IN', 'hi-IN', 'en-IN'],
  nep: ['ne-NP', 'ne-IN', 'hi-IN', 'en-IN'],
  ks: ['ks-IN', 'ur-IN', 'hi-IN', 'en-IN'],
  kas: ['ks-IN', 'ur-IN', 'hi-IN', 'en-IN'],
  kok: ['kok-IN', 'mr-IN', 'hi-IN', 'en-IN'],
  mai: ['mai-IN', 'hi-IN', 'en-IN'],
  sat: ['sat-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  sd: ['sd-IN', 'ur-IN', 'hi-IN', 'en-IN'],
  snd: ['sd-IN', 'ur-IN', 'hi-IN', 'en-IN'],
  doi: ['doi-IN', 'pa-IN', 'hi-IN', 'en-IN'],
  brx: ['brx-IN', 'as-IN', 'hi-IN', 'en-IN'],
  mni: ['mni-IN', 'bn-IN', 'hi-IN', 'en-IN'],
  bho: ['bho-IN', 'hi-IN', 'en-IN'],
  raj: ['hi-IN', 'en-IN'],
  mwr: ['hi-IN', 'en-IN'],
  bgc: ['hi-IN', 'en-IN'],
  hne: ['hi-IN', 'en-IN'],
  tcy: ['kn-IN', 'en-IN'],
  hi: ['hi-IN', 'en-IN'],
  ta: ['ta-IN', 'en-IN'],
  te: ['te-IN', 'en-IN'],
  kn: ['kn-IN', 'en-IN'],
  ml: ['ml-IN', 'en-IN'],
  bn: ['bn-IN', 'en-IN'],
  mr: ['mr-IN', 'hi-IN', 'en-IN'],
  gu: ['gu-IN', 'hi-IN', 'en-IN'],
  pa: ['pa-IN', 'hi-IN', 'en-IN'],
  ur: ['ur-IN', 'ur-PK', 'hi-IN', 'en-IN'],
};

// Auto-expand ISO-639-3 aliases for 3-letter codes
export const ISO3_ALIASES: Record<string, string> = {
  ori: 'or', ory: 'or',
  asm: 'as',
  san: 'sa',
  nep: 'ne',
  kas: 'ks',
  snd: 'sd',
  hin: 'hi',
  tam: 'ta',
  tel: 'te',
  ben: 'bn',
  mar: 'mr',
  guj: 'gu',
  kan: 'kn',
  mal: 'ml',
  pan: 'pa',
  urd: 'ur',
  spa: 'es',
  fra: 'fr',
  deu: 'de',
  ara: 'ar',
  zho: 'zh',
  jpn: 'ja',
  rus: 'ru',
  por: 'pt',
  ita: 'it',
  kor: 'ko',
  tur: 'tr',
  ind: 'id',
  vie: 'vi',
  nld: 'nl',
  pol: 'pl',
  fas: 'fa',
  ukr: 'uk',
  tha: 'th',
  tgl: 'tl',
  swa: 'sw',
  heb: 'he',
  ell: 'el',
  swe: 'sv',
  ces: 'cs',
  hun: 'hu',
  ron: 'ro',
  msa: 'ms',
  mya: 'my',
  pus: 'ps',
  dan: 'da',
  fin: 'fi',
  nor: 'no',
  dgo: 'doi',
  gom: 'kok',
};

for (const [iso3, iso1] of Object.entries(ISO3_ALIASES)) {
  if (TRANSLATIONS[iso1] && !TRANSLATIONS[iso3]) {
    TRANSLATIONS[iso3] = TRANSLATIONS[iso1];
  }
}

export function resolveLanguageCode(codeOrQuery: string): string {
  if (!codeOrQuery) return 'en';
  const clean = codeOrQuery.toLowerCase().trim();
  if (LANGUAGE_ALIASES[clean]) return LANGUAGE_ALIASES[clean];
  if (ISO3_ALIASES[clean]) return ISO3_ALIASES[clean];
  const found = CURATED_LANGUAGES.find(
    (l) =>
      l.code.toLowerCase() === clean ||
      l.isoCode3.toLowerCase() === clean ||
      l.name.toLowerCase() === clean ||
      l.nativeName.toLowerCase() === clean ||
      (l.aliases && l.aliases.some((a) => a.toLowerCase() === clean))
  );
  return found ? found.code : clean;
}

/**
 * Gets the active UI translation based on the selected language code with English fallback
 */
export function getUiTranslations(langCode: string): UiTranslations {
  const base = TRANSLATIONS['en'] as UiTranslations;
  if (!langCode) return base;

  const clean = langCode.toLowerCase().trim();
  const canonical = LANGUAGE_ALIASES[clean] || clean;

  const target =
    TRANSLATIONS[clean] ||
    TRANSLATIONS[canonical] ||
    (ISO3_ALIASES[clean] && TRANSLATIONS[ISO3_ALIASES[clean]]) ||
    {};

  return { ...base, ...target };
}

/**
 * Localized patient-friendly explanation helper for medication frequencies & instructions
 * Supports all 22 Indian Scheduled languages + Regional Dialects and Global Languages.
 */
export function getLocalizedMedicationAdvice(instructions: string, languageCode: string): string {
  if (!instructions) return '';
  const clean = (languageCode || 'en').toLowerCase().trim();
  const lang = LANGUAGE_ALIASES[clean] || clean;

  // --- ODIA ---
  if (lang === 'or' || lang === 'ori') {
    return instructions
      .replace(/twice daily/gi, 'ଦିନକୁ ଦୁଇଥର')
      .replace(/once daily/gi, 'ଦିନକୁ ଥରେ')
      .replace(/three times daily|thrice daily/gi, 'ଦିନକୁ ତିନିଥର')
      .replace(/after meals|after food/gi, 'ଖାଇବା ପରେ')
      .replace(/before meals|before food/gi, 'ଖାଇବା ପୂର୍ବରୁ')
      .replace(/at bedtime|at night/gi, 'ରାତିରେ ଶୋଇବା ପୂର୍ବରୁ')
      .replace(/with water/gi, 'ପାଣି ସହିତ')
      .replace(/take orally/gi, 'ପାଟିରେ ନିଅନ୍ତୁ');
  }

  // --- ASSAMESE ---
  if (lang === 'as' || lang === 'asm') {
    return instructions
      .replace(/twice daily/gi, 'দিনে দুবাৰ')
      .replace(/once daily/gi, 'দিনে এবাৰ')
      .replace(/three times daily|thrice daily/gi, 'দিনে তিনিবাৰ')
      .replace(/after meals|after food/gi, 'খাদ্য খোৱাৰ পিছত')
      .replace(/before meals|before food/gi, 'খাদ্য খোৱাৰ আগত')
      .replace(/at bedtime|at night/gi, 'ৰাতি শোৱাৰ আগত')
      .replace(/with water/gi, 'পানীৰে খাব')
      .replace(/take orally/gi, 'মুখৰে গ্ৰহণ কৰক');
  }

  // --- SANSKRIT ---
  if (lang === 'sa' || lang === 'san') {
    return instructions
      .replace(/twice daily/gi, 'दिने द्विवारम्')
      .replace(/once daily/gi, 'दिने एकवारम्')
      .replace(/three times daily|thrice daily/gi, 'दिने त्रिवारम्')
      .replace(/after meals|after food/gi, 'भोजनानन्तरम्')
      .replace(/before meals|before food/gi, 'भोजनात् पूर्वम्')
      .replace(/at bedtime|at night/gi, 'रात्रौ शयनात् पूर्वम्')
      .replace(/with water/gi, 'जलेन सह')
      .replace(/take orally/gi, 'मुखेन गृह्णातु');
  }

  // --- NEPALI ---
  if (lang === 'ne' || lang === 'nep') {
    return instructions
      .replace(/twice daily/gi, 'दिनमा दुई पटक')
      .replace(/once daily/gi, 'दिनमा एक पटक')
      .replace(/three times daily|thrice daily/gi, 'दिनमा तीन पटक')
      .replace(/after meals|after food/gi, 'खाना खाएपछि')
      .replace(/before meals|before food/gi, 'खाना खानु अघि')
      .replace(/at bedtime|at night/gi, 'सुत्नु अघि')
      .replace(/with water/gi, 'पानीसँग लिनुहोस्')
      .replace(/take orally/gi, 'मुखबाट लिनुहोस्');
  }

  // --- KASHMIRI ---
  if (lang === 'ks' || lang === 'kas') {
    return instructions
      .replace(/twice daily/gi, 'دوہس منٛز دۄیہِ لَٹہِ')
      .replace(/once daily/gi, 'دوہس منٛز اکہِ لَٹہِ')
      .replace(/three times daily|thrice daily/gi, 'دوہس منٛز ترٛیہِ لَٹہِ')
      .replace(/after meals|after food/gi, 'کھؠنہٕ پتہٕ')
      .replace(/before meals|before food/gi, 'کھؠنہٕ برٛونٛہہ')
      .replace(/at bedtime|at night/gi, 'سونے برٛونٛہہ')
      .replace(/with water/gi, 'آبس سٟتؠ');
  }

  // --- KONKANI ---
  if (lang === 'kok' || lang === 'gom') {
    return instructions
      .replace(/twice daily/gi, 'दिसांत दोन फावटीं')
      .replace(/once daily/gi, 'दिसांत एक फावट')
      .replace(/three times daily|thrice daily/gi, 'दिसांत तीन फावटीं')
      .replace(/after meals|after food/gi, 'जेवणा उपरांत')
      .replace(/before meals|before food/gi, 'जेवणा आदीं')
      .replace(/at bedtime|at night/gi, 'न्हिदचे पयलीं')
      .replace(/with water/gi, 'उदका वांगडा घेयात')
      .replace(/take orally/gi, 'तोंडांतल्यान घेयात');
  }

  // --- MAITHILI ---
  if (lang === 'mai') {
    return instructions
      .replace(/twice daily/gi, 'दिन मे दू बेर')
      .replace(/once daily/gi, 'दिन मे एक बेर')
      .replace(/three times daily|thrice daily/gi, 'दिन मे तीन बेर')
      .replace(/after meals|after food/gi, 'भोजनक बाद')
      .replace(/before meals|before food/gi, 'भोजन सँ पहिने')
      .replace(/at bedtime|at night/gi, 'सुतै सँ पहिने')
      .replace(/with water/gi, 'पानीक संग ली');
  }

  // --- SANTALI ---
  if (lang === 'sat') {
    return instructions
      .replace(/twice daily/gi, 'ᱫᱤᱱᱟᱹᱢ ᱵᱟᱨ ᱫᱷᱟᱣ')
      .replace(/once daily/gi, 'ᱫᱤᱱᱟᱹᱢ ᱢᱤᱫ ᱫᱷᱟᱣ')
      .replace(/three times daily|thrice daily/gi, 'ᱫᱤᱱᱟᱹᱢ ᱯᱮ ᱫᱷᱟᱣ')
      .replace(/after meals|after food/gi, 'ᱫᱟᱠᱟ ᱡᱚᱢ ᱛᱟᱭᱚᱢ')
      .replace(/before meals|before food/gi, 'ᱫᱟᱠᱟ ᱡᱚᱢ ᱢᱟᱲᱟᱝ')
      .replace(/at bedtime|at night/gi, 'ᱜᱤᱛᱤᱡ ᱢᱟᱲᱟᱝ')
      .replace(/with water/gi, 'ᱫᱟᱜ ᱥᱟᱶ ᱡᱚᱢ ᱢᱮ');
  }

  // --- SINDHI ---
  if (lang === 'sd' || lang === 'snd') {
    return instructions
      .replace(/twice daily/gi, 'ڏينهن ۾ ٻه دفعا')
      .replace(/once daily/gi, 'ڏينهن ۾ هڪ دفعو')
      .replace(/three times daily|thrice daily/gi, 'ڏينهن ۾ ٽي دفعا')
      .replace(/after meals|after food/gi, 'ماني کان پوءِ')
      .replace(/before meals|before food/gi, 'ماني کان اڳ')
      .replace(/at bedtime|at night/gi, 'سمهڻ کان اڳ')
      .replace(/with water/gi, 'پاڻي سان وٺو');
  }

  // --- DOGRI ---
  if (lang === 'doi' || lang === 'dgo') {
    return instructions
      .replace(/twice daily/gi, 'दिने च दो बारी')
      .replace(/once daily/gi, 'दिने च इक बारी')
      .replace(/after meals|after food/gi, 'रोटी खाधा परंत')
      .replace(/before meals|before food/gi, 'रोटी खाने थमां पैहले')
      .replace(/at bedtime|at night/gi, 'सौने थमां पैहले')
      .replace(/with water/gi, 'पाणी कन्नै लैओ');
  }

  // --- BODO ---
  if (lang === 'brx') {
    return instructions
      .replace(/twice daily/gi, 'सानाव नैखेप')
      .replace(/once daily/gi, 'सानाव सेखेप')
      .replace(/after meals|after food/gi, 'ओंखाम जानायनि उनाव')
      .replace(/before meals|before food/gi, 'ओंखाम जानायनि सिगां')
      .replace(/at bedtime|at night/gi, 'उन्दुनायनि सिगां')
      .replace(/with water/gi, 'दैजों जा');
  }

  // --- MANIPURI ---
  if (lang === 'mni') {
    return instructions
      .replace(/twice daily/gi, 'নুমিৎতা অনিৰক')
      .replace(/once daily/gi, 'নুমিৎতা অমুক')
      .replace(/after meals|after food/gi, 'চাক চাবা মতুংদা')
      .replace(/before meals|before food/gi, 'চাক চাদ্রিঙৈদা')
      .replace(/at bedtime|at night/gi, 'তুম্বা চত্ৰিঙৈদা')
      .replace(/with water/gi, 'ঈশিংগা লোয়ননা চাবীয়ু');
  }

  // --- BHOJPURI ---
  if (lang === 'bho') {
    return instructions
      .replace(/twice daily/gi, 'दिन में दू बेर')
      .replace(/once daily/gi, 'दिन में एक बेर')
      .replace(/three times daily|thrice daily/gi, 'दिन में तीन बेर')
      .replace(/after meals|after food/gi, 'खाना खइला के बाद')
      .replace(/before meals|before food/gi, 'खाना खाये से पहिले')
      .replace(/at bedtime|at night/gi, 'सुते से पहिले')
      .replace(/with water/gi, 'पानी के साथ लीं');
  }

  // --- RAJASTHANI / MARWARI ---
  if (lang === 'raj' || lang === 'mwr') {
    return instructions
      .replace(/twice daily/gi, 'दिन में दो बार')
      .replace(/once daily/gi, 'दिन में एक बार')
      .replace(/after meals|after food/gi, 'जीमण पछै')
      .replace(/before meals|before food/gi, 'जीमण सूं पैली')
      .replace(/at bedtime|at night/gi, 'सोवण सूं पैली')
      .replace(/with water/gi, 'पाणी साथै लेवो');
  }

  // --- HARYANVI ---
  if (lang === 'bgc') {
    return instructions
      .replace(/twice daily/gi, 'दिन में दो बार')
      .replace(/once daily/gi, 'दिन में एक बार')
      .replace(/after meals|after food/gi, 'रोटी खाण के पाच्छै')
      .replace(/before meals|before food/gi, 'रोटी खाण तै पैहलां')
      .replace(/at bedtime|at night/gi, 'सोण तै पैहलां')
      .replace(/with water/gi, 'पाणी गेल्यां लेओ');
  }

  // --- CHHATTISGARHI ---
  if (lang === 'hne') {
    return instructions
      .replace(/twice daily/gi, 'दिन म दू बेर')
      .replace(/once daily/gi, 'दिन म एक बेर')
      .replace(/after meals|after food/gi, 'जेवन करे के बाद')
      .replace(/before meals|before food/gi, 'जेवन करे के पहिली')
      .replace(/at bedtime|at night/gi, 'सुते के पहिली')
      .replace(/with water/gi, 'पानी के संग लेवव');
  }

  // --- TULU ---
  if (lang === 'tcy') {
    return instructions
      .replace(/twice daily/gi, 'ದಿನೊಕ್ಕು ರಡ್ಡ್ ಸರ್ತಿ')
      .replace(/once daily/gi, 'ದಿನೊಕ್ಕು ಒಂಜಿ ಸರ್ತಿ')
      .replace(/after meals|after food/gi, 'ವನಸ್ ಮಲ್ತಿ ಬೊಕ್ಕ')
      .replace(/before meals|before food/gi, 'ವನಸ್‌ದ ದುಂಬು')
      .replace(/at bedtime|at night/gi, 'ಜೆಪ್ಪುನೆರ್ದ್ ದುಂಬು')
      .replace(/with water/gi, 'ನೀರ್‌ದ ಒಟ್ಟುಗು ದೆತೊಣಿಲೆ');
  }

  // --- HINDI ---
  if (lang === 'hi') {
    return instructions
      .replace(/twice daily/gi, 'दिन में दो बार')
      .replace(/once daily/gi, 'दिन में एक बार')
      .replace(/three times daily|thrice daily/gi, 'दिन में तीन बार')
      .replace(/after meals|after food/gi, 'खाना खाने के बाद')
      .replace(/before meals|before food/gi, 'खाना खाने से पहले')
      .replace(/at bedtime|at night/gi, 'रात को सोने से पहले')
      .replace(/with water/gi, 'पानी के साथ लें')
      .replace(/take orally/gi, 'मुंह से लें');
  }

  // --- TAMIL ---
  if (lang === 'ta') {
    return instructions
      .replace(/twice daily/gi, 'ஒரு நாளைக்கு இரண்டு முறை')
      .replace(/once daily/gi, 'ஒரு நாளைக்கு ஒரு முறை')
      .replace(/three times daily|thrice daily/gi, 'ஒரு நாளைக்கு மூன்று முறை')
      .replace(/after meals|after food/gi, 'உணவுக்குப் பிறகு')
      .replace(/before meals|before food/gi, 'உணவுக்கு முன்')
      .replace(/at bedtime|at night/gi, 'இரவு தூங்கும் முன்')
      .replace(/with water/gi, 'நீருடன் உட்கொள்ளவும்');
  }

  // --- TELUGU ---
  if (lang === 'te') {
    return instructions
      .replace(/twice daily/gi, 'రోజుకు రెండు సార్లు')
      .replace(/once daily/gi, 'రోజుకు ఒకసారి')
      .replace(/three times daily|thrice daily/gi, 'రోజుకు మూడు సార్లు')
      .replace(/after meals|after food/gi, 'భోజనం తర్వాత')
      .replace(/before meals|before food/gi, 'భోజనానికి ముందు')
      .replace(/at bedtime|at night/gi, 'రాత్రి నిద్రపోయే ముందు')
      .replace(/with water/gi, 'నీటితో తీసుకోండి');
  }

  // --- BENGALI ---
  if (lang === 'bn') {
    return instructions
      .replace(/twice daily/gi, 'দিনে দুইবার')
      .replace(/once daily/gi, 'দিনে একবার')
      .replace(/three times daily|thrice daily/gi, 'দিনে তিনবার')
      .replace(/after meals|after food/gi, 'খাবারের পর')
      .replace(/before meals|before food/gi, 'খাবারের আগে')
      .replace(/at bedtime|at night/gi, 'রাতে ঘুমানোর আগে')
      .replace(/with water/gi, 'পানির সাথে খাবেন');
  }

  // --- MARATHI ---
  if (lang === 'mr') {
    return instructions
      .replace(/twice daily/gi, 'दिवसातून दोनदा')
      .replace(/once daily/gi, 'दिवसातून एकदा')
      .replace(/three times daily|thrice daily/gi, 'दिवसातून तीनदा')
      .replace(/after meals|after food/gi, 'जेवणानंतर')
      .replace(/before meals|before food/gi, 'जेवणापूर्वी')
      .replace(/at bedtime|at night/gi, 'झोपण्यापूर्वी')
      .replace(/with water/gi, 'पाण्यासोबत घ्यावे');
  }

  // --- GUJARATI ---
  if (lang === 'gu') {
    return instructions
      .replace(/twice daily/gi, 'દિવસમાં બે વાર')
      .replace(/once daily/gi, 'દિવસમાં એક વાર')
      .replace(/after meals|after food/gi, 'જમ્યા પછી')
      .replace(/before meals|before food/gi, 'જમ્યા પહેલાં')
      .replace(/at bedtime|at night/gi, 'રાત્રે સૂતા પહેલાં')
      .replace(/with water/gi, 'પાણી સાથે લેવું');
  }

  // --- KANNADA ---
  if (lang === 'kn') {
    return instructions
      .replace(/twice daily/gi, 'ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ')
      .replace(/once daily/gi, 'ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ')
      .replace(/after meals|after food/gi, 'ಊಟದ ನಂತರ')
      .replace(/before meals|before food/gi, 'ಊಟದ ಮೊದಲು')
      .replace(/at bedtime|at night/gi, 'ಮಲಗುವ ಮುನ್ನ')
      .replace(/with water/gi, 'ನೀರಿನೊಂದಿಗೆ ಸೇವಿಸಿ');
  }

  // --- MALAYALAM ---
  if (lang === 'ml') {
    return instructions
      .replace(/twice daily/gi, 'ദിവസത്തിൽ രണ്ട് തവണ')
      .replace(/once daily/gi, 'ദിവസത്തിൽ ഒരു തവണ')
      .replace(/after meals|after food/gi, 'ഭക്ഷണത്തിന് ശേഷം')
      .replace(/before meals|before food/gi, 'ഭക്ഷണത്തിന് മുൻപ്')
      .replace(/at bedtime|at night/gi, 'രാത്രി ഉറങ്ങുന്നതിന് മുൻപ്')
      .replace(/with water/gi, 'വെള്ളത്തോടൊപ്പം കഴിക്കുക');
  }

  // --- PUNJABI ---
  if (lang === 'pa') {
    return instructions
      .replace(/twice daily/gi, 'ਦਿਨ ਵਿੱਚ ਦੋ ਵਾਰ')
      .replace(/once daily/gi, 'ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ')
      .replace(/after meals|after food/gi, 'ਰੋਟੀ ਖਾਣ ਤੋਂ ਬਾਅਦ')
      .replace(/before meals|before food/gi, 'ਰੋਟੀ ਖਾਣ ਤੋਂ ਪਹਿਲਾਂ')
      .replace(/at bedtime|at night/gi, 'ਸੌਣ ਤੋਂ ਪਹਿਲਾਂ')
      .replace(/with water/gi, 'ਪਾਣੀ ਨਾਲ ਲਵੋ');
  }

  // --- URDU ---
  if (lang === 'ur') {
    return instructions
      .replace(/twice daily/gi, 'دن میں دو بار')
      .replace(/once daily/gi, 'دن میں ایک بار')
      .replace(/after meals|after food/gi, 'کھانے کے بعد')
      .replace(/before meals|before food/gi, 'کھانے سے پہلے')
      .replace(/at bedtime|at night/gi, 'سونے سے پہلے')
      .replace(/with water/gi, 'پانی کے ساتھ لیں');
  }

  // --- FRENCH ---
  if (lang === 'fr') {
    return instructions
      .replace(/twice daily/gi, 'deux fois par jour')
      .replace(/once daily/gi, 'une fois par jour')
      .replace(/three times daily|thrice daily/gi, 'trois fois par jour')
      .replace(/after meals|after food/gi, 'après les repas')
      .replace(/before meals|before food/gi, 'avant les repas')
      .replace(/at bedtime|at night/gi, 'au coucher / le soir')
      .replace(/with water/gi, 'avec un verre d\'eau')
      .replace(/take orally/gi, 'prendre par voie orale');
  }

  // --- GERMAN ---
  if (lang === 'de') {
    return instructions
      .replace(/twice daily/gi, 'zweimal täglich')
      .replace(/once daily/gi, 'einmal täglich')
      .replace(/three times daily|thrice daily/gi, 'dreimal täglich')
      .replace(/after meals|after food/gi, 'nach den Mahlzeiten')
      .replace(/before meals|before food/gi, 'vor den Mahlzeiten')
      .replace(/at bedtime|at night/gi, 'vor dem Schlafengehen')
      .replace(/with water/gi, 'mit reichlich Wasser einnehmen')
      .replace(/take orally/gi, 'oral einnehmen');
  }

  // --- SPANISH ---
  if (lang === 'es') {
    return instructions
      .replace(/twice daily/gi, 'dos veces al día')
      .replace(/once daily/gi, 'una vez al día')
      .replace(/three times daily|thrice daily/gi, 'tres veces al día')
      .replace(/after meals|after food/gi, 'después de las comidas')
      .replace(/before meals|before food/gi, 'antes de las comidas')
      .replace(/at bedtime|at night/gi, 'al acostarse / por la noche')
      .replace(/with water/gi, 'tomar con agua')
      .replace(/take orally/gi, 'tomar por vía oral');
  }

  // --- ARABIC ---
  if (lang === 'ar') {
    return instructions
      .replace(/twice daily/gi, 'مرتين يومياً')
      .replace(/once daily/gi, 'مرة واحدة يومياً')
      .replace(/three times daily|thrice daily/gi, 'ثلاث مرات يومياً')
      .replace(/after meals|after food/gi, 'بعد الوجبات')
      .replace(/before meals|before food/gi, 'قبل الوجبات')
      .replace(/at bedtime|at night/gi, 'قبل النوم')
      .replace(/with water/gi, 'مع كمية كافية من الماء');
  }

  return instructions;
}

/**
 * Verifies that numbers and units (e.g. 650 mg, 5 days, 120/80) from source transcript appear unchanged in the translation.
 */
export function verifyDosageNumbersPreserved(
  sourceText: string,
  translatedText: string
): { preserved: boolean; missing: string[] } {
  if (!sourceText || !translatedText) {
    return { preserved: true, missing: [] };
  }

  const regex = /\b(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|days|day|hrs|hours|times)?|\d+\/\d+)\b/gi;
  const sourceMatches = Array.from(sourceText.matchAll(regex)).map((m) => m[0].trim());

  const missing: string[] = [];
  const transLower = translatedText.toLowerCase();

  for (const item of sourceMatches) {
    const itemLower = item.toLowerCase();
    if (/\d/.test(itemLower) && !transLower.includes(itemLower)) {
      const digits = item.match(/\d+/)?.[0];
      if (digits && !transLower.includes(digits)) {
        if (!missing.includes(item)) missing.push(item);
      }
    }
  }

  return {
    preserved: missing.length === 0,
    missing,
  };
}

/**
 * Speech synthesis audio narrator helper.
 * - Cleans markdown symbols without removing meaningful dosage numbers or parentheses (e.g. '650 mg').
 * - Does NOT fall back to another language voice with a wrong accent.
 * - Calls onUnavailable() if no matching voice exists for this language.
 */
export function speakMedicalText(
  text: string,
  langCode: string,
  onEnd?: () => void,
  onUnavailable?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    if (onUnavailable) onUnavailable();
    else if (onEnd) onEnd();
    return () => {};
  }

  try {
    window.speechSynthesis.cancel(); // Stop any previous speech
    
    // Clean clinical text from Markdown symbols only; keep parentheses and medical dosages intact!
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return () => {};
    }

    const rawCode = (langCode || 'en').toLowerCase().trim();
    const canonical = LANGUAGE_ALIASES[rawCode] || rawCode;
    const primaryLocale = BCP47_LOCALE_MAP[canonical] || BCP47_LOCALE_MAP[rawCode] || 'en-US';
    const langPrefix = primaryLocale.split('-')[0].toLowerCase();

    const nameKeywords = getVoiceMatchingKeywords(canonical);

    const proceedWithVoices = (voices: SpeechSynthesisVoice[]): (() => void) => {
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (voices && voices.length > 0) {
        matchedVoice = voices.find((v) => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          const vName = v.name.toLowerCase();
          // Never match English voice for non-English language
          if (canonical !== 'en' && vLang.startsWith('en')) return false;
          if (vLang === primaryLocale.toLowerCase()) return true;
          if (vLang === langPrefix || vLang.startsWith(langPrefix + '-')) return true;
          if (nameKeywords.some((kw) => vName.includes(kw) || vLang.includes(kw))) return true;
          return false;
        });
      }

      // Safety: If no voice exists for the language, do NOT fall back to another language's voice
      if (!matchedVoice) {
        if (langPrefix === 'en' && voices && voices.length > 0) {
          matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        }
      }

      if (!matchedVoice) {
        console.warn(`No voice available on this device for ${langCode} (${primaryLocale})`);
        if (onUnavailable) onUnavailable();
        else if (onEnd) onEnd();
        return () => {};
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || primaryLocale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      if (onEnd) {
        utterance.onend = () => {
          onEnd();
        };
        utterance.onerror = (e) => {
          console.warn('Speech synthesis note:', e);
          onEnd();
        };
      }

      // Chrome resume quirk fix
      window.speechSynthesis.resume();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);

      return () => {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };
    };

    const initialVoices = window.speechSynthesis.getVoices();
    if (!initialVoices || initialVoices.length === 0) {
      let isCancelled = false;
      ensureVoicesLoaded().then((loadedVoices) => {
        if (isCancelled) return;
        proceedWithVoices(loadedVoices);
      });
      return () => {
        isCancelled = true;
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };
    } else {
      return proceedWithVoices(initialVoices);
    }
  } catch (err) {
    console.warn('Speech synthesis execution error:', err);
    if (onUnavailable) onUnavailable();
    else if (onEnd) onEnd();
    return () => {};
  }
}

/**
 * Result structure for safe medicine instruction presentation.
 * Per Safety Rules: original text is ALWAYS preserved alongside translated text.
 */
export interface FormattedInstructionResult {
  translated: string;
  original: string;
  isAiTranslated: boolean;
  notice: string;
}

/**
 * Standard medical frequency tokens dictionary
 */
export const MEDICAL_FREQUENCY_MAP: Record<string, Record<string, string>> = {
  hi: {
    OD: 'दिन में एक बार',
    BD: 'दिन में दो बार',
    TDS: 'दिन में तीन बार',
    QDS: 'दिन में चार बार',
    SOS: 'आवश्यकता पड़ने पर',
    HS: 'रात को सोते समय',
    STAT: 'तुरंत',
    PRN: 'जरूरत के अनुसार',
  },
  ta: {
    OD: 'ஒரு நாளைக்கு ஒரு முறை',
    BD: 'ஒரு நாளைக்கு இரண்டு முறை',
    TDS: 'ஒரு நாளைக்கு மூன்று முறை',
    QDS: 'ஒரு நாளைக்கு நான்கு முறை',
    SOS: 'தேவைப்படும் போது',
    HS: 'இரவு தூங்கும் முன்',
    STAT: 'உடனடியாக',
    PRN: 'தேவைக்கேற்ப',
  },
  te: {
    OD: 'రోజుకు ఒకసారి',
    BD: 'రోజుకు రెండు సార్లు',
    TDS: 'రోజుకు మూడు సార్లు',
    QDS: 'రోజుకు నాలుగు సార్లు',
    SOS: 'అవసరమైనప్పుడు',
    HS: 'పడుకునే ముందు',
    STAT: 'వెంటనే',
    PRN: 'అవసరానికి తగినట్లు',
  },
  bn: {
    OD: 'দিনে একবার',
    BD: 'দিনে দুইবার',
    TDS: 'দিনে তিনবার',
    QDS: 'দিনে চারবার',
    SOS: 'প্রয়োজনে',
    HS: 'ঘুমানোর আগে',
    STAT: 'অবিলম্বে',
    PRN: 'প্রয়োজনমতো',
  },
  mr: {
    OD: 'दिवसातून एकदा',
    BD: 'दिवसातून दोनदा',
    TDS: 'दिवसातून तीनदा',
    QDS: 'दिवसातून चारदा',
    SOS: 'गरज असेल तेव्हा',
    HS: 'झोपण्यापूर्वी',
    STAT: 'त्वरित',
    PRN: 'गरजेनुसार',
  },
  gu: {
    OD: 'દિવસમાં એક વાર',
    BD: 'દિવસમાં બે વાર',
    TDS: 'દિવસમાં ત્રણ વાર',
    QDS: 'દિવસમાં ચાર વાર',
    SOS: 'જરૂર પડે ત્યારે',
    HS: 'સૂતા પહેલાં',
    STAT: 'તરત જ',
    PRN: 'જરૂરિયાત મુજબ',
  },
  es: {
    OD: 'una vez al día',
    BD: 'dos veces al día',
    TDS: 'tres veces al día',
    QDS: 'cuatro veces al día',
    SOS: 'según sea necesario',
    HS: 'al acostarse',
    STAT: 'inmediatamente',
    PRN: 'si es necesario',
  },
  fr: {
    OD: 'une fois par jour',
    BD: 'deux fois par jour',
    TDS: 'trois fois par jour',
    QDS: 'quatre fois par jour',
    SOS: 'au besoin',
    HS: 'au coucher',
    STAT: 'immédiatement',
    PRN: 'selon besoin',
  },
  ar: {
    OD: 'مرة واحدة يومياً',
    BD: 'مرتين يومياً',
    TDS: 'ثلاث مرات يومياً',
    QDS: 'أربع مرات يومياً',
    SOS: 'عند الحاجة',
    HS: 'قبل النوم',
    STAT: 'فوراً',
    PRN: 'حسب الحاجة',
  },
};

/**
 * Formats structured medicine instructions with bilingual display and safety notice.
 */
export function formatStructuredInstructions(
  frequency: string,
  instructions: string,
  langCode: string
): FormattedInstructionResult {
  const original = instructions || frequency || '';
  const cleanLang = (langCode || 'en').toLowerCase().trim();
  const canonical = LANGUAGE_ALIASES[cleanLang] || cleanLang;

  if (canonical === 'en') {
    return {
      translated: original,
      original: original,
      isAiTranslated: false,
      notice: 'Original clinical instruction.',
    };
  }

  // 1. Check frequency abbreviation
  const freqUpper = (frequency || '').toUpperCase().trim();
  const localizedFreq = MEDICAL_FREQUENCY_MAP[canonical]?.[freqUpper];

  // 2. Localize food/timing instructions
  const localizedAdvice = getLocalizedMedicationAdvice(original, canonical);

  let combined = localizedAdvice;
  if (localizedFreq && !combined.includes(localizedFreq)) {
    combined = `${localizedFreq} — ${combined}`;
  }

  const isTranslated = combined !== original;

  return {
    translated: isTranslated ? combined : original,
    original: original,
    isAiTranslated: isTranslated,
    notice: 'AI translated (beta). Always confirm medical instructions with your doctor.',
  };
}

/**
 * Async API translation calling the backend /api/translate or /translate endpoint with Gemini & SQLite cache.
 */
export async function translateInstructionOnline(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<FormattedInstructionResult> {
  const original = (text || '').trim();
  const hasNonAscii = /[^\u0000-\u007F]/.test(original);
  const isSourceEnglish = !sourceLang || sourceLang.toLowerCase() === 'en';

  // If empty, or already pure ASCII English going to English
  if (!original || (targetLang === 'en' && !hasNonAscii && isSourceEnglish)) {
    return {
      translated: original,
      original: original,
      isAiTranslated: false,
      notice: 'Original text.',
    };
  }

  // If source and target are identical
  if (sourceLang && sourceLang.toLowerCase() === targetLang.toLowerCase()) {
    return {
      translated: original,
      original: original,
      isAiTranslated: false,
      notice: 'Original text.',
    };
  }

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
  const endpoints = ['/api/translate', `${API_BASE_URL}/translate`, `${API_BASE_URL}/api/translate`];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: original,
          target_language: targetLang,
          source_language: sourceLang || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translated_text) {
          return {
            translated: data.translated_text,
            original: data.original_text || original,
            isAiTranslated: true,
            notice: data.notice || 'AI translated (beta). Always confirm medical instructions with your doctor.',
          };
        }
      }
    } catch (err) {
      // Continue to next endpoint fallback
    }
  }

  // Fallback to local regex rule-based advice
  const localTrans = getLocalizedMedicationAdvice(original, targetLang);
  return {
    translated: localTrans,
    original: original,
    isAiTranslated: localTrans !== original,
    notice: 'AI translated (beta). Always confirm medical instructions with your doctor.',
  };
}

/**
 * Ensures browser speech voices are loaded before voice matching.
 * Solves asynchronous voice loading on Chrome and Safari without hanging.
 */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const current = window.speechSynthesis.getVoices();
  if (current && current.length > 0) {
    return Promise.resolve(current);
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    }, 500);

    window.speechSynthesis.onvoiceschanged = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(window.speechSynthesis.getVoices() || []);
      }
    };
  });
}

/**
 * Checks whether the browser currently has a native or synthesized voice for the given language.
 * Strictly verifies that a voice in the matching language actually exists.
 * Does NOT fall back to English or another language's voice.
 */
export function hasVoiceForLanguage(langCode: string, voices?: SpeechSynthesisVoice[]): boolean {
  return isSpeechOutputAvailable(langCode, voices);
}

/**
 * At startup or voice change, detects real-time voice capabilities for all curated languages.
 */
export async function detectDeviceVoiceCapabilities(): Promise<Record<string, DeviceVoiceStatus>> {
  const voices = await ensureVoicesLoaded();
  const map: Record<string, DeviceVoiceStatus> = {};
  for (const lang of CURATED_LANGUAGES) {
    map[lang.code] = getDeviceVoiceStatus(lang.code, voices);
  }
  return map;
}

export { speakText, type VoicePlaybackState } from './safeTranscribeAudio';
