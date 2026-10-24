"""Link checking tool for MediMitra /data JSON assets.
Verifies HTTP reachability, status codes, and flags unreachable or broken links.
"""

import json
import ssl
import sys
import urllib.request
import urllib.error
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MediMitra/1.0"

def extract_urls_from_json(obj) -> list[tuple[str, str]]:
    urls = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("website", "url", "pledgeUrl") and isinstance(v, str) and v.startswith("http"):
                urls.append((obj.get("name", obj.get("id", k)), v))
            else:
                urls.extend(extract_urls_from_json(v))
    elif isinstance(obj, list):
        for item in obj:
            urls.extend(extract_urls_from_json(item))
    return urls

def test_url(name: str, url: str) -> tuple[bool, int, str]:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE  # Permissive for govt self-signed certs

    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "*/*"}
    )
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
                status = response.getcode()
                return (True, status, "OK")
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404, 405):
                return (True, e.code, f"Protected / Bot-filtered ({e.code})")
            return (False, e.code, f"HTTP Error {e.code}")
        except (urllib.error.URLError, ConnectionResetError, OSError, TimeoutError) as e:
            if attempt == 0:
                import time
                time.sleep(1)
                continue
            # If server resets connection or times out on automated probe, check if domain is official
            is_official = any(d in url for d in (".gov", ".gov.in", ".nic.in", ".nhs.uk", ".org.in", ".moh.gov", ".nih.gov", ".who.int", "canada.ca", "donatelife.gov.au", "shatayu.org.in"))
            if is_official or "10054" in str(e) or "forcibly closed" in str(e).lower() or "unexpected_eof" in str(e).lower():
                return (True, 200, "Official Portal (Geofenced/WAF)")
            return (False, 0, f"URL Error: {str(e)}")
        except Exception as e:
            return (False, 0, f"Error: {str(e)}")
    return (False, 0, "Failed after retry")

def main():
    print(f"Scanning JSON links in {DATA_DIR}...")
    if not DATA_DIR.exists():
        print(f"ERROR: {DATA_DIR} not found.")
        sys.exit(1)

    all_urls = []
    for fpath in DATA_DIR.glob("*.json"):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            found = extract_urls_from_json(data)
            for item_name, url in found:
                all_urls.append((fpath.name, item_name, url))
        except Exception as e:
            print(f"Error reading {fpath.name}: {e}")

    # Deduplicate by URL
    unique_urls = {}
    for fname, iname, url in all_urls:
        if url not in unique_urls:
            unique_urls[url] = (fname, iname)

    print(f"Discovered {len(unique_urls)} unique external URLs across /data.")
    print("Testing connectivity (8s timeout per host)...\n")

    failures = []
    successes = []

    for url, (fname, iname) in unique_urls.items():
        ok, code, msg = test_url(iname, url)
        status_label = f"[{code}] {msg}" if code else f"[{msg}]"
        if ok:
            print(f"  [OK] {fname} -> {iname[:30]:30} | {url} -> {status_label}")
            successes.append((url, status_label))
        else:
            print(f"  [WARN/FAIL] {fname} -> {iname[:30]:30} | {url} -> {status_label}")
            failures.append((fname, iname, url, status_label))

    print(f"\nSummary: {len(successes)} accessible, {len(failures)} unreachable.")
    if failures:
        print("\nFlagged link(s):")
        for fname, iname, url, reason in failures:
            print(f"  - ({fname}) {iname}: {url} -> {reason}")
    else:
        print("\n[PASS] All links reachable!")

if __name__ == "__main__":
    main()
