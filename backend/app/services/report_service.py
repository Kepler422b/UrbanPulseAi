import uuid
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from bson import ObjectId

from app.core.database import DatabaseManager
from app.schemas.report import (
    ReportCreateRequest,
    PublicReportResponse,
    AdminReportResponse,
    PriorityFactors,
    StatusHistoryItem,
    InternalNoteItem,
    IssueStatus,
)
from app.services.priority_service import calculate_priority_score

def generate_public_report_id() -> str:
    # Generates format UP-2026-XXXX
    short_hash = uuid.uuid4().hex[:5].upper()
    year = datetime.now(timezone.utc).year
    return f"UP-{year}-{short_hash}"

def count_similar_recent_reports(category: str, locality: str) -> int:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    # Count unresolved reports of same category in locality
    return reports_col.count_documents({
        "category": category,
        "locality": locality,
        "status": {"$in": ["reported", "in_progress"]}
    })

def create_report(
    req: ReportCreateRequest,
    user_id: Optional[str] = None,
    reporter_name: Optional[str] = "Citizen Reporter",
) -> Dict[str, Any]:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    now = datetime.now(timezone.utc)

    # Duplicate check: same category, same locality, similar title within past 10 minutes
    ten_mins_ago = now.timestamp() - 600
    recent_dups = reports_col.find({
        "category": req.category.value,
        "locality": req.locality,
        "title": {"$regex": re.escape(req.title[:15]), "$options": "i"}
    })
    for dup in recent_dups:
        c_at = dup.get("created_at")
        if isinstance(c_at, datetime) and c_at.timestamp() > ten_mins_ago:
            raise ValueError(f"A very similar report ({dup.get('public_report_id')}) was submitted moments ago. Please avoid duplicates.")

    # Calculate initial priority
    similar_count = count_similar_recent_reports(req.category.value, req.locality)
    priority_factors = calculate_priority_score(
        severity=req.severity.value,
        created_at=now,
        similar_recent_count=similar_count,
        locality_name=req.locality,
        is_resolved=False,
    )

    public_id = generate_public_report_id()

    doc = {
        "public_report_id": public_id,
        "user_id": user_id,
        "reporter_name": reporter_name,
        "category": req.category.value,
        "title": req.title,
        "description": req.description,
        "locality": req.locality,
        "approximate_address": req.approximate_address,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "severity": req.severity.value,
        "priority_score": priority_factors.total_score,
        "priority_level": priority_factors.priority_level,
        "priority_factors": priority_factors.model_dump(),
        "status": IssueStatus.REPORTED.value,
        "assigned_to": None,
        "image_url": req.image_url,
        "resolution_notes": None,
        "duplicate_of": None,
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
    }

    result = reports_col.insert_one(doc)
    doc["id"] = str(result.inserted_id)

    # Log initial status in history
    db.status_history.insert_one({
        "report_id": public_id,
        "old_status": None,
        "new_status": IssueStatus.REPORTED.value,
        "changed_by_name": reporter_name or "Citizen Reporter",
        "timestamp": now,
        "reason": "Initial report submitted by citizen",
    })

    return doc

def get_report_by_public_id(public_id: str) -> Optional[Dict[str, Any]]:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    doc = reports_col.find_one({"public_report_id": public_id})
    if not doc:
        return None
    doc["id"] = str(doc.get("_id"))
    return doc

def get_reports_by_user(user_id: str) -> List[Dict[str, Any]]:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    docs = list(reports_col.find({"user_id": user_id}).sort("created_at", -1))
    for d in docs:
        d["id"] = str(d.get("_id"))
    return docs

def get_public_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    locality: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
) -> Tuple[List[PublicReportResponse], int]:
    db = DatabaseManager.get_db()
    query: Dict[str, Any] = {}

    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if locality:
        query["locality"] = {"$regex": re.escape(locality), "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": re.escape(search), "$options": "i"}},
            {"description": {"$regex": re.escape(search), "$options": "i"}},
            {"locality": {"$regex": re.escape(search), "$options": "i"}},
            {"public_report_id": {"$regex": re.escape(search), "$options": "i"}},
        ]

    total = db.reports.count_documents(query)
    cursor = db.reports.find(query).sort("created_at", -1).skip(skip).limit(limit)

    items = []
    for d in cursor:
        items.append(
            PublicReportResponse(
                id=str(d.get("_id")),
                public_report_id=d.get("public_report_id"),
                category=d.get("category"),
                title=d.get("title"),
                description=d.get("description"),
                locality=d.get("locality"),
                approximate_address=d.get("approximate_address"),
                latitude=d.get("latitude"),
                longitude=d.get("longitude"),
                severity=d.get("severity"),
                priority_score=d.get("priority_score", 50.0),
                priority_level=d.get("priority_level", "medium"),
                status=d.get("status"),
                image_url=d.get("image_url"),
                created_at=d.get("created_at"),
                updated_at=d.get("updated_at"),
                resolved_at=d.get("resolved_at"),
            )
        )
    return items, total

def get_admin_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    locality: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "newest",
    limit: int = 50,
    skip: int = 0,
) -> Tuple[List[AdminReportResponse], int]:
    db = DatabaseManager.get_db()
    query: Dict[str, Any] = {}

    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if locality:
        query["locality"] = {"$regex": re.escape(locality), "$options": "i"}
    if severity:
        query["severity"] = severity
    if search:
        query["$or"] = [
            {"title": {"$regex": re.escape(search), "$options": "i"}},
            {"locality": {"$regex": re.escape(search), "$options": "i"}},
            {"public_report_id": {"$regex": re.escape(search), "$options": "i"}},
            {"assigned_to": {"$regex": re.escape(search), "$options": "i"}},
        ]

    sort_field = "created_at"
    sort_dir = -1
    if sort_by == "priority":
        sort_field = "priority_score"
        sort_dir = -1
    elif sort_by == "oldest":
        sort_field = "created_at"
        sort_dir = 1

    total = db.reports.count_documents(query)
    cursor = db.reports.find(query).sort(sort_field, sort_dir).skip(skip).limit(limit)

    items = []
    for d in cursor:
        pub_id = d.get("public_report_id")
        notes_count = db.internal_notes.count_documents({"report_id": pub_id})
        
        factors_dict = d.get("priority_factors")
        factors = PriorityFactors(**factors_dict) if factors_dict else None

        items.append(
            AdminReportResponse(
                id=str(d.get("_id")),
                public_report_id=pub_id,
                user_id=d.get("user_id"),
                reporter_name=d.get("reporter_name"),
                category=d.get("category"),
                title=d.get("title"),
                description=d.get("description"),
                locality=d.get("locality"),
                approximate_address=d.get("approximate_address"),
                latitude=d.get("latitude"),
                longitude=d.get("longitude"),
                severity=d.get("severity"),
                priority_score=d.get("priority_score", 50.0),
                priority_level=d.get("priority_level", "medium"),
                priority_factors=factors,
                status=d.get("status"),
                assigned_to=d.get("assigned_to"),
                resolution_notes=d.get("resolution_notes"),
                duplicate_of=d.get("duplicate_of"),
                internal_notes_count=notes_count,
                image_url=d.get("image_url"),
                created_at=d.get("created_at"),
                updated_at=d.get("updated_at"),
                resolved_at=d.get("resolved_at"),
            )
        )
    return items, total

def update_report_status(
    public_id: str,
    new_status: str,
    changed_by_name: str,
    reason: Optional[str] = None,
    resolution_notes: Optional[str] = None,
) -> bool:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    
    current = reports_col.find_one({"public_report_id": public_id})
    if not current:
        return False
        
    old_status = current.get("status")
    now = datetime.now(timezone.utc)
    
    update_data: Dict[str, Any] = {
        "status": new_status,
        "updated_at": now,
    }
    if new_status == IssueStatus.RESOLVED.value:
        update_data["resolved_at"] = now
        if resolution_notes:
            update_data["resolution_notes"] = resolution_notes
            
    reports_col.update_one({"public_report_id": public_id}, {"$set": update_data})
    
    # Insert history log
    db.status_history.insert_one({
        "report_id": public_id,
        "old_status": old_status,
        "new_status": new_status,
        "changed_by_name": changed_by_name,
        "timestamp": now,
        "reason": reason or f"Status changed from {old_status} to {new_status}",
    })
    return True

def assign_report(public_id: str, assigned_to: str, admin_name: str, note: Optional[str] = None) -> bool:
    db = DatabaseManager.get_db()
    reports_col = db.reports
    
    current = reports_col.find_one({"public_report_id": public_id})
    if not current:
        return False
        
    now = datetime.now(timezone.utc)
    reports_col.update_one(
        {"public_report_id": public_id},
        {"$set": {"assigned_to": assigned_to, "updated_at": now, "status": IssueStatus.IN_PROGRESS.value}}
    )
    
    db.status_history.insert_one({
        "report_id": public_id,
        "old_status": current.get("status"),
        "new_status": IssueStatus.IN_PROGRESS.value,
        "changed_by_name": admin_name,
        "timestamp": now,
        "reason": f"Assigned to {assigned_to}. {note or ''}".strip(),
    })
    return True

def add_internal_note(public_id: str, admin_name: str, note_text: str) -> InternalNoteItem:
    db = DatabaseManager.get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "report_id": public_id,
        "admin_name": admin_name,
        "note": note_text,
        "created_at": now,
    }
    res = db.internal_notes.insert_one(doc)
    return InternalNoteItem(
        id=str(res.inserted_id),
        report_id=public_id,
        admin_name=admin_name,
        note=note_text,
        created_at=now,
    )

def get_report_history(public_id: str) -> List[StatusHistoryItem]:
    db = DatabaseManager.get_db()
    cursor = db.status_history.find({"report_id": public_id}).sort("timestamp", 1)
    results = []
    for c in cursor:
        results.append(
            StatusHistoryItem(
                report_id=c.get("report_id"),
                old_status=c.get("old_status"),
                new_status=c.get("new_status"),
                changed_by_name=c.get("changed_by_name", "System"),
                timestamp=c.get("timestamp"),
                reason=c.get("reason"),
            )
        )
    return results

def get_internal_notes(public_id: str) -> List[InternalNoteItem]:
    db = DatabaseManager.get_db()
    cursor = db.internal_notes.find({"report_id": public_id}).sort("created_at", -1)
    results = []
    for c in cursor:
        results.append(
            InternalNoteItem(
                id=str(c.get("_id")),
                report_id=c.get("report_id"),
                admin_name=c.get("admin_name"),
                note=c.get("note"),
                created_at=c.get("created_at"),
            )
        )
    return results

def mark_report_as_duplicate(public_id: str, original_id: str, admin_name: str, reason: str) -> bool:
    db = DatabaseManager.get_db()
    now = datetime.now(timezone.utc)
    res = db.reports.update_one(
        {"public_report_id": public_id},
        {"$set": {
            "status": IssueStatus.DUPLICATE.value,
            "duplicate_of": original_id,
            "updated_at": now,
        }}
    )
    if res.matched_count == 0:
        return False
        
    db.status_history.insert_one({
        "report_id": public_id,
        "old_status": "reported",
        "new_status": IssueStatus.DUPLICATE.value,
        "changed_by_name": admin_name,
        "timestamp": now,
        "reason": f"Marked duplicate of {original_id}. Rationale: {reason}",
    })
    return True
