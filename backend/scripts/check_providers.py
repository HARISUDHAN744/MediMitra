"""
Provider Health & Telemetry Verification Script
Probes each registered medical and geospatial API provider, measuring
connectivity, latency, and telemetry metrics.
"""

import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.integrations.http_client import get_provider_health
from app.integrations.openfda import fetch_drug_label
from app.integrations.rxnav import get_rxcui_by_name
from app.integrations.pubchem import fetch_compound_properties
from app.integrations.chembl import fetch_drug_mechanism
from app.integrations.nominatim import reverse_geocode
from app.integrations.osrm import get_driving_route


def main():
    print("=" * 65)
    print("      MEDIMITRA API PROVIDER CONNECTIVITY & HEALTH CHECK")
    print("=" * 65)

    print("\n1. Testing openFDA Drug Label Provider...")
    try:
        fda_res = fetch_drug_label("Metformin")
        print(f"   openFDA status: {'SUCCESS' if fda_res.get('found') else 'OFFLINE/CACHED'}")
    except Exception as e:
        print(f"   openFDA check error: {e}")

    print("\n2. Testing NLM RxNav RxCUI Normalization Provider...")
    try:
        rxcui = get_rxcui_by_name("Atorvastatin")
        print(f"   RxNav status: {'SUCCESS (RxCUI: ' + str(rxcui) + ')' if rxcui else 'OFFLINE/FALLBACK'}")
    except Exception as e:
        print(f"   RxNav check error: {e}")

    print("\n3. Testing PubChem Chemical Structure Provider...")
    try:
        pc_res = fetch_compound_properties("Paracetamol")
        print(f"   PubChem status: {'SUCCESS' if pc_res.get('found') else 'OFFLINE/FALLBACK'}")
    except Exception as e:
        print(f"   PubChem check error: {e}")

    print("\n4. Testing ChEMBL Bioactivity & Mechanism Provider...")
    try:
        chembl_res = fetch_drug_mechanism("Amlodipine")
        print(f"   ChEMBL status: {'SUCCESS' if chembl_res.get('found') else 'OFFLINE/FALLBACK'}")
    except Exception as e:
        print(f"   ChEMBL check error: {e}")

    print("\n5. Testing Nominatim Geocoding Provider (1 req/sec enforced)...")
    try:
        nom_res = reverse_geocode(11.44, 78.23)
        print(f"   Nominatim status: {'SUCCESS' if nom_res.get('found') else 'OFFLINE/FALLBACK'}")
    except Exception as e:
        print(f"   Nominatim check error: {e}")

    print("\n6. Testing OSRM Driving Distance & Route Engine...")
    try:
        osrm_res = get_driving_route(11.44, 78.23, 11.48, 78.27)
        print(f"   OSRM status: {'SUCCESS' if osrm_res.get('found') else 'OFFLINE/FALLBACK'}")
    except Exception as e:
        print(f"   OSRM check error: {e}")

    print("\n" + "=" * 65)
    print("PROVIDER TELEMETRY SUMMARY:")
    print("=" * 65)
    health = get_provider_health()
    for provider, stats in health.items():
        print(f"  {provider.upper():<14} | Calls: {stats.get('calls_count', 0):<3} | Status: {stats.get('status', 'ok')} | Last Status: {stats.get('last_status_code', 200)} | Latency: {stats.get('avg_latency_ms', 100)}ms")
    print("=" * 65)


if __name__ == "__main__":
    main()
