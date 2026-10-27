import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.report import (
    ReportCreateRequest,
    PublicReportResponse,
    AdminReportResponse,
    StatusHistoryItem,
    InternalNoteItem,
)
from app.services.report_service import (
    create_report,
    get_report_by_public_id,
    get_reports_by_user,
    get_report_history,
    get_internal_notes,
)
from app.core.security import get_current_user_token, get_optional_user_token
from app.core.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5MB

@router.post("/upload-image")
async def upload_report_image(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPEG, PNG, WEBP.",
        )

    # Read and check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    # Generate secure random filename
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    safe_name = f"{uuid.uuid4().hex}{ext}"

    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{safe_name}"
    return {"image_url": image_url, "filename": safe_name}

@router.post("", status_code=status.HTTP_201_CREATED)
def submit_report(
    req: ReportCreateRequest,
    token_data: Optional[dict] = Depends(get_optional_user_token),
):
    user_id = token_data.get("sub") if token_data else None
    reporter_name = token_data.get("name") if token_data else "Citizen Reporter"

    try:
        report = create_report(req, user_id=user_id, reporter_name=reporter_name)
        return {
            "message": "Report submitted successfully.",
            "public_report_id": report["public_report_id"],
            "report": report,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/my", response_model=List[PublicReportResponse])
def get_my_reports(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    reports = get_reports_by_user(user_id)
    return [
        PublicReportResponse(
            id=str(r.get("_id", r.get("id"))),
            public_report_id=r.get("public_report_id"),
            category=r.get("category"),
            title=r.get("title"),
            description=r.get("description"),
            locality=r.get("locality"),
            approximate_address=r.get("approximate_address"),
            latitude=r.get("latitude"),
            longitude=r.get("longitude"),
            severity=r.get("severity"),
            priority_score=r.get("priority_score", 50.0),
            priority_level=r.get("priority_level", "medium"),
            status=r.get("status"),
            image_url=r.get("image_url"),
            created_at=r.get("created_at"),
            updated_at=r.get("updated_at"),
            resolved_at=r.get("resolved_at"),
        )
        for r in reports
    ]

@router.get("/{report_id}")
def get_report_details(
    report_id: str,
    token_data: Optional[dict] = Depends(get_optional_user_token),
):
    report = get_report_by_public_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with identifier '{report_id}' was not found.",
        )

    # Privacy filter: hide reporter user_id and email if viewer is not an admin
    is_admin = token_data and token_data.get("role") == "admin"
    is_author = token_data and token_data.get("sub") == report.get("user_id")

    res = dict(report)
    if "_id" in res:
        res["id"] = str(res.pop("_id"))

    if not is_admin:
        res.pop("internal_notes", None)
        if not is_author:
            res.pop("user_id", None)
            res.pop("reporter_name", None)

    return res

@router.get("/{report_id}/history", response_model=List[StatusHistoryItem])
def get_report_status_history(report_id: str):
    history = get_report_history(report_id)
    return history

@router.get("/{report_id}/notes", response_model=List[InternalNoteItem])
def get_report_notes(
    report_id: str,
    token_data: dict = Depends(get_current_user_token),
):
    if token_data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to internal notes is restricted to administrators.",
        )
    return get_internal_notes(report_id)
