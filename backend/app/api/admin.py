import csv
import io
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse

from app.schemas.report import (
    AdminReportResponse,
    StatusUpdateRequest,
    AssignRequest,
    AddNoteRequest,
    ResolveRequest,
    MarkDuplicateRequest,
)
from app.services.report_service import (
    get_admin_reports,
    update_report_status,
    assign_report,
    add_internal_note,
    mark_report_as_duplicate,
)
from app.core.security import get_current_user_token
from app.core.config import settings
from app.core.database import DatabaseManager

router = APIRouter(prefix="/admin", tags=["Administration"])

def verify_admin_role(token_data: dict = Depends(get_current_user_token)):
    if token_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privileges required for this operation.",
        )
    return token_data

@router.get("/reports")
def list_admin_reports(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("newest", pattern="^(newest|priority|oldest)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    admin_user: dict = Depends(verify_admin_role),
):
    skip = (page - 1) * limit
    items, total = get_admin_reports(
        category=category,
        status=status,
        locality=locality,
        severity=severity,
        search=search,
        sort_by=sort_by,
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

@router.patch("/reports/{report_id}/status")
def change_status(
    report_id: str,
    req: StatusUpdateRequest,
    admin_user: dict = Depends(verify_admin_role),
):
    admin_name = admin_user.get("name", "Operations Admin")
    success = update_report_status(
        public_id=report_id,
        new_status=req.status.value,
        changed_by_name=admin_name,
        reason=req.reason,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"message": f"Status updated to {req.status.value}.", "report_id": report_id}

@router.patch("/reports/{report_id}/assign")
def assign_team(
    report_id: str,
    req: AssignRequest,
    admin_user: dict = Depends(verify_admin_role),
):
    admin_name = admin_user.get("name", "Operations Admin")
    success = assign_report(
        public_id=report_id,
        assigned_to=req.assigned_to,
        admin_name=admin_name,
        note=req.note,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"message": f"Assigned to {req.assigned_to}.", "report_id": report_id}

@router.post("/reports/{report_id}/notes")
def add_note(
    report_id: str,
    req: AddNoteRequest,
    admin_user: dict = Depends(verify_admin_role),
):
    admin_name = admin_user.get("name", "Operations Admin")
    note = add_internal_note(public_id=report_id, admin_name=admin_name, note_text=req.note)
    return {"message": "Internal note recorded.", "note": note}

@router.post("/reports/{report_id}/resolve")
def resolve_issue(
    report_id: str,
    req: ResolveRequest,
    admin_user: dict = Depends(verify_admin_role),
):
    admin_name = admin_user.get("name", "Operations Admin")
    success = update_report_status(
        public_id=report_id,
        new_status="resolved",
        changed_by_name=admin_name,
        reason="Resolved by administrative team",
        resolution_notes=req.resolution_notes,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"message": "Issue marked as resolved.", "report_id": report_id}

@router.post("/reports/{report_id}/mark-duplicate")
def mark_duplicate(
    report_id: str,
    req: MarkDuplicateRequest,
    admin_user: dict = Depends(verify_admin_role),
):
    admin_name = admin_user.get("name", "Operations Admin")
    success = mark_report_as_duplicate(
        public_id=report_id,
        original_id=req.original_report_id,
        admin_name=admin_name,
        reason=req.reason,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"message": f"Marked as duplicate of {req.original_report_id}.", "report_id": report_id}

@router.get("/export/reports.csv")
def export_reports_csv(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    admin_user: dict = Depends(verify_admin_role),
):
    items, _ = get_admin_reports(
        category=category,
        status=status,
        locality=locality,
        limit=2000,
        skip=0,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Public Report ID",
        "Category",
        "Title",
        "Locality",
        "Approximate Address",
        "Severity",
        "Priority Score",
        "Priority Level",
        "Status",
        "Assigned To",
        "Reporter Name",
        "Created At (UTC)",
        "Resolved At (UTC)",
    ])

    for it in items:
        writer.writerow([
            it.public_report_id,
            it.category,
            it.title,
            it.locality,
            it.approximate_address,
            it.severity,
            it.priority_score,
            it.priority_level,
            it.status,
            it.assigned_to or "Unassigned",
            it.reporter_name or "Anonymous",
            it.created_at.isoformat() if it.created_at else "",
            it.resolved_at.isoformat() if it.resolved_at else "",
        ])

    output.seek(0)
    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="urbanpulse_reports.csv"'},
    )
    return response

@router.post("/demo/reset")
def reset_demo_data(admin_user: dict = Depends(verify_admin_role)):
    from scripts.seed_demo import seed_database
    seed_database()
    return {"message": "Demo database successfully re-seeded with realistic Mira-Bhayandar records."}
