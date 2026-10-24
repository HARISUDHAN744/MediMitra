"""Script to inject donationNav translation across all languages in languageService.ts"""

import re
from pathlib import Path

FILE_PATH = Path("frontend/src/services/languageService.ts")

DONATION_LABELS = {
    "en": "Donation Hub",
    "hi": "दान केंद्र (Donation Hub)",
    "ta": "தான மையம் (Donation Hub)",
    "te": "దాన కేంద్రం (Donation Hub)",
    "bn": "দান কেন্দ্র (Donation Hub)",
    "mr": "दान केंद्र (Donation Hub)",
    "gu": "દાન કેન્દ્ર (Donation Hub)",
    "kn": "ದಾನ ಕೇಂದ್ರ (Donation Hub)",
    "ml": "ദാന കേന്ദ്രം (Donation Hub)",
    "pa": "ਦਾਨ ਕੇਂਦਰ (Donation Hub)",
    "or": "ଦାନ କେନ୍ଦ୍ର (Donation Hub)",
    "as": "দান কেন্দ্ৰ (Donation Hub)",
    "ur": "عطیہ مرکز (Donation Hub)",
    "sa": "दान केन्द्रम् (Donation Hub)",
    "ne": "दान केन्द्र (Donation Hub)",
    "kok": "दान केंद्र (Donation Hub)",
    "mai": "दान केंद्र (Donation Hub)",
    "sat": "ᱫᱟᱱ ᱛᱟᱞᱢᱟ (Donation Hub)",
    "ks": "عطیہ مرکز (Donation Hub)",
    "sd": "عطيو مرڪز (Donation Hub)",
    "doi": "दान केंद्र (Donation Hub)",
    "brx": "दान मिरु (Donation Hub)",
    "mni": "দান কেন্দ্র (Donation Hub)",
    "bho": "दान केंद्र (Donation Hub)",
    "raj": "दान केंद्र (Donation Hub)",
    "mwr": "दान केंद्र (Donation Hub)",
    "bgc": "दान केंद्र (Donation Hub)",
    "hne": "दान केंद्र (Donation Hub)",
    "tcy": "ದಾನ ಕೇಂದ್ರ (Donation Hub)",
    "es": "Centro de Donaciones",
    "fr": "Centre de Dons",
    "de": "Spendezentrum",
    "ar": "مركز التبرع",
    "zh": "捐献中心",
    "ja": "ドネーションハブ",
    "ru": "Центр донорства",
    "pt": "Centro de Doação",
    "it": "Centro Donazioni",
    "ko": "기증 허브",
    "id": "Pusat Donasi",
    "tr": "Bağış Merkezi",
    "ms": "Pusat Derma",
    "th": "ศูนย์รับบริจาค",
    "vi": "Trung tâm Hiến tặng"
}

def main():
    content = FILE_PATH.read_text(encoding="utf-8")

    # 1. Add to interface if not present
    if "donationNav: string;" not in content:
        content = content.replace(
            "qrMedicalIdNav: string;",
            "qrMedicalIdNav: string;\n  donationNav: string;"
        )
        print("Added donationNav to UiTranslations interface.")

    # 2. Add donationNav in each language dictionary block
    # Pattern to find: code: { ... qrMedicalIdNav: '...',
    for lang, label in DONATION_LABELS.items():
        # Match `lang: {` block
        lang_pattern = rf"(^\s*{lang}\s*:\s*\{{[\s\S]*?qrMedicalIdNav\s*:\s*['\"][^'\"]*['\"][^\n]*\n)"
        m = re.search(lang_pattern, content, re.MULTILINE)
        if m:
            matched_text = m.group(1)
            if "donationNav" not in matched_text:
                # Find indentation of qrMedicalIdNav
                indent_match = re.search(r"(\s*)qrMedicalIdNav", matched_text)
                indent = indent_match.group(1) if indent_match else "    "
                replacement = matched_text.rstrip("\r\n") + f"\n{indent}donationNav: '{label}',\n"
                content = content.replace(matched_text, replacement, 1)
                print(f"Updated translation for {lang}")
        else:
            print(f"Warning: could not locate block for language '{lang}'")

    FILE_PATH.write_text(content, encoding="utf-8")
    print("Completed updating languageService.ts.")

if __name__ == "__main__":
    main()
