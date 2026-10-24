"""
Medicines Router
Exposes REST endpoints for the Medicine Knowledge Base, Jan Aushadhi generic substitution,
prescription interaction checks, duplicate active ingredient detection, PDF reports,
and external API provider health checks.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.medicines.schemas import (
    MedicineSummary,
    MedicineDetail,
    SubstituteResponse,
    InteractionCheckRequest,
    InteractionCheckResponse,
    DuplicateCheckResponse,
    ProviderHealthResponse,
)
from app.medicines.search_service import search_medicines, get_medicine_detail
from app.medicines.substitute_service import find_substitutes
from app.medicines.interaction_service import check_drug_interactions
from app.medicines.duplicate_service import check_duplicate_ingredients
from app.medicines.report_service import generate_medicine_pdf
from app.integrations.http_client import get_provider_health

router = APIRouter(tags=["Medicines"])


@router.get("/medicines/search", response_model=List[MedicineSummary])
def api_search_medicines(
    q: Optional[str] = Query(None, description="Search keyword for brand or generic active ingredient"),
    rx_filter: Optional[str] = Query(None, description="Filter by 'RX' or 'OTC'"),
    nlem_only: bool = Query(False, description="Filter for National List of Essential Medicines ceiling prices"),
    jan_aushadhi_only: bool = Query(False, description="Filter medicines with Jan Aushadhi equivalents"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """
    Search medicines database by brand name or active ingredient.
    """
    return search_medicines(
        db=db,
        query=q,
        rx_filter=rx_filter,
        nlem_only=nlem_only,
        jan_aushadhi_only=jan_aushadhi_only,
        limit=limit,
    )


@router.get("/medicines/{medicine_id}", response_model=MedicineDetail)
def api_get_medicine_detail(
    medicine_id: str,
    db: Session = Depends(get_db),
):
    """
    Get full details for a medicine, including attributed label disclosures,
    pricing date, and generic substitution opportunities.
    """
    detail = get_medicine_detail(db, medicine_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return detail


@router.get("/medicines/{medicine_id}/substitutes", response_model=SubstituteResponse)
def api_get_substitutes(
    medicine_id: str,
    db: Session = Depends(get_db),
):
    """
    Find exact chemical equivalents and PMBJP Jan Aushadhi generic substitutes
    with rupee and percentage savings calculations.
    """
    subs = find_substitutes(db, medicine_id)
    if not subs:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return subs


@router.post("/medicines/interactions", response_model=InteractionCheckResponse)
def api_check_interactions(
    payload: InteractionCheckRequest,
    db: Session = Depends(get_db),
):
    """
    Cross-check selected medications for known drug interactions reported in official labels.
    Quotes exact text from official drug labels without prescribing or clinical advice.
    """
    return check_drug_interactions(
        db=db,
        medicine_ids=payload.medicine_ids,
        medicine_names=payload.medicine_names,
    )


@router.get("/medicines/duplicates", response_model=DuplicateCheckResponse)
def api_check_duplicates_get(
    names: List[str] = Query(..., description="List of medicine brand names to cross-check for duplicate active substances"),
    db: Session = Depends(get_db),
):
    """
    Detects if multiple medications share the same therapeutic active ingredient.
    """
    return check_duplicate_ingredients(db=db, medicine_names=names)


@router.post("/medicines/duplicates", response_model=DuplicateCheckResponse)
def api_check_duplicates_post(
    payload: InteractionCheckRequest,
    db: Session = Depends(get_db),
):
    """
    Detect duplicate active ingredients by ID or name list.
    """
    return check_duplicate_ingredients(
        db=db,
        medicine_ids=payload.medicine_ids,
        medicine_names=payload.medicine_names,
    )


@router.get("/medicines/{medicine_id}/report")
def api_download_medicine_pdf(
    medicine_id: str,
    db: Session = Depends(get_db),
):
    """
    Generate and download a comprehensive PDF report for a medicine,
    including pricing as of date, generic alternatives, and mandatory medical disclaimers.
    """
    detail = get_medicine_detail(db, medicine_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Medicine not found")

    subs = find_substitutes(db, medicine_id)
    if not subs:
        raise HTTPException(status_code=404, detail="Substitutes could not be evaluated")

    pdf_bytes = generate_medicine_pdf(detail, subs)
    filename = f"Medicine_Brief_{detail.brand_name.replace(' ', '_')}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/health/providers", response_model=ProviderHealthResponse)
def api_get_providers_health():
    """
    Get live health, request counters, failure rates, and latency for external providers.
    """
    health_data = get_provider_health()
    overall_status = "healthy"
    for p_info in health_data.values():
        if p_info.get("failure_count", 0) > 10:
            overall_status = "degraded"

    return ProviderHealthResponse(
        status=overall_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        providers=health_data,
    )
