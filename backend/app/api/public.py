from typing import Optional, List
from fastapi import APIRouter, Query
from app.schemas.report import PublicReportResponse
from app.services.report_service import get_public_reports

router = APIRouter(prefix="/public", tags=["Public"])

@router.get("/reports")
def list_public_reports(
    category: Optional[str] = Query(None, description="Filter by issue category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    locality: Optional[str] = Query(None, description="Filter by locality"),
    search: Optional[str] = Query(None, description="Keyword search in title or address"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    skip = (page - 1) * limit
    items, total = get_public_reports(
        category=category,
        status=status,
        locality=locality,
        search=search,
        limit=limit,
        skip=skip,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total + limit - 1) // limit),
    }
