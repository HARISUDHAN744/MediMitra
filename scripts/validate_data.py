"""Data validation script for MediMitra /data JSON assets.
Validates schemas, HTTPS protocol enforcement, required fields (source, lastVerified),
and duplicate detection.
"""

import json
import os
import re
import sys
from pathlib import Path

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HTTPS_PATTERN = re.compile(r"^https://[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=]+$")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def check_date(date_str: str, context: str) -> list[str]:
    errors = []
    if not isinstance(date_str, str) or not DATE_PATTERN.match(date_str):
        errors.append(f"{context}: invalid date '{date_str}', expected format YYYY-MM-DD")
    return errors

def check_url(url_str: str, context: str) -> list[str]:
    errors = []
    if not isinstance(url_str, str) or not HTTPS_PATTERN.match(url_str):
        errors.append(f"{context}: invalid URL '{url_str}', must start with https:// and be valid")
    return errors

def validate_donation_orgs(file_path: Path) -> list[str]:
    errors = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        return [f"{file_path.name}: Expected root to be a list"]
    
    seen_ids = set()
    allowed_types = {"Government", "NGO", "Hospital network"}

    for idx, item in enumerate(data):
        ctx = f"donation_orgs[{idx}] (id={item.get('id', 'unknown')})"
        for req in ["id", "name", "country", "type", "description", "website", "domain", "source", "lastVerified"]:
            if req not in item or not item[req]:
                errors.append(f"{ctx}: Missing required field '{req}'")
        
        item_id = item.get("id")
        if item_id:
            if item_id in seen_ids:
                errors.append(f"{ctx}: Duplicate ID '{item_id}'")
            seen_ids.add(item_id)
        
        if item.get("type") and item["type"] not in allowed_types:
            errors.append(f"{ctx}: Type '{item['type']}' not in {allowed_types}")

        if item.get("website"):
            errors.extend(check_url(item["website"], ctx))

        if item.get("lastVerified"):
            errors.extend(check_date(item["lastVerified"], ctx))

    return errors

def validate_transplant_centres(file_path: Path) -> list[str]:
    errors = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        return [f"{file_path.name}: Expected root to be a list"]

    seen_ids = set()
    for idx, item in enumerate(data):
        ctx = f"transplant_centres[{idx}] (id={item.get('id', 'unknown')})"
        for req in ["id", "name", "city", "state", "country", "lat", "lng", "organsHandled", "type", "source", "lastVerified"]:
            if req not in item:
                errors.append(f"{ctx}: Missing required field '{req}'")
        
        item_id = item.get("id")
        if item_id:
            if item_id in seen_ids:
                errors.append(f"{ctx}: Duplicate ID '{item_id}'")
            seen_ids.add(item_id)

        lat = item.get("lat")
        lng = item.get("lng")
        if not isinstance(lat, (int, float)) or not (-90 <= lat <= 90):
            errors.append(f"{ctx}: Invalid latitude {lat}")
        if not isinstance(lng, (int, float)) or not (-180 <= lng <= 180):
            errors.append(f"{ctx}: Invalid longitude {lng}")

        if not isinstance(item.get("organsHandled"), list) or len(item.get("organsHandled", [])) == 0:
            errors.append(f"{ctx}: organsHandled must be a non-empty list")

        if item.get("lastVerified"):
            errors.extend(check_date(item["lastVerified"], ctx))

    return errors

def validate_ambulance_directory(file_path: Path) -> list[str]:
    errors = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        return [f"{file_path.name}: Expected root to be a dictionary"]

    for sec in ["nationalOfficial", "regionalAndPrivate", "airAmbulance"]:
        if sec not in data or not isinstance(data[sec], list):
            errors.append(f"ambulance_directory: Missing or invalid section '{sec}'")

    seen_ids = set()
    for sec in ["nationalOfficial", "regionalAndPrivate", "airAmbulance"]:
        for idx, item in enumerate(data.get(sec, [])):
            ctx = f"ambulance_directory.{sec}[{idx}] (id={item.get('id', 'unknown')})"
            item_id = item.get("id")
            if item_id:
                if item_id in seen_ids:
                    errors.append(f"{ctx}: Duplicate ID '{item_id}'")
                seen_ids.add(item_id)

            if "website" in item and item["website"]:
                errors.extend(check_url(item["website"], ctx))

            if "lastVerified" in item and item["lastVerified"]:
                errors.extend(check_date(item["lastVerified"], ctx))

            if "source" not in item or not item["source"]:
                errors.append(f"{ctx}: Missing 'source' attribution")

    return errors

def validate_country_resources(file_path: Path) -> list[str]:
    errors = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        return [f"{file_path.name}: Expected root to be a dictionary"]

    for country_code, res in data.items():
        ctx = f"country_resources.{country_code}"
        if "country" not in res or "iso2" not in res:
            errors.append(f"{ctx}: Missing country or iso2")
        
        # Check all child resources with URLs
        for key, val in res.items():
            if isinstance(val, dict):
                if "url" in val:
                    errors.extend(check_url(val["url"], f"{ctx}.{key}"))
                if "lastVerified" in val:
                    errors.extend(check_date(val["lastVerified"], f"{ctx}.{key}"))
                if "source" in val and not val["source"]:
                    errors.append(f"{ctx}.{key}: Empty source")

    return errors

def main():
    print(f"Scanning /data in {DATA_DIR}...")
    if not DATA_DIR.exists():
        print(f"ERROR: Data directory '{DATA_DIR}' does not exist.")
        sys.exit(1)

    all_errors = []

    validators = {
        "donation_orgs.json": validate_donation_orgs,
        "transplant_centres.json": validate_transplant_centres,
        "ambulance_directory.json": validate_ambulance_directory,
        "country_resources.json": validate_country_resources,
    }

    for fname, validator in validators.items():
        fpath = DATA_DIR / fname
        if not fpath.exists():
            all_errors.append(f"Missing file: {fname}")
            continue
        try:
            errs = validator(fpath)
            all_errors.extend(errs)
            print(f"Checked {fname}: {len(errs)} issue(s) found.")
        except Exception as e:
            all_errors.append(f"Exception validating {fname}: {str(e)}")

    if all_errors:
        print("\n[FAIL] DATA VALIDATION FAILED WITH ERRORS:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n[PASS] ALL DATA FILES PASSED VALIDATION!")
        sys.exit(0)

if __name__ == "__main__":
    main()
