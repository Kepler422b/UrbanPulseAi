from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class IssueCategory(str, Enum):
    POTHOLES = "potholes_damaged_roads"
    GARBAGE = "garbage_overflow"
    STREETLIGHTS = "broken_streetlights"
    WATER_LEAKAGE = "water_drainage_leakage"  # Extensible

class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueStatus(str, Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DUPLICATE = "duplicate"

class PriorityFactors(BaseModel):
    severity_score: float
    recurrence_score: float
    waiting_time_score: float
    total_score: float
    priority_level: str
    explanation: str

class ReportCreateRequest(BaseModel):
    category: IssueCategory
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10, max_length=2000)
    locality: str = Field(..., min_length=2, max_length=100)
    approximate_address: str = Field(..., min_length=3, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: IssueSeverity = IssueSeverity.MEDIUM
    image_url: Optional[str] = None

class StatusHistoryItem(BaseModel):
    report_id: str
    old_status: Optional[str] = None
    new_status: str
    changed_by_name: str
    timestamp: datetime
    reason: Optional[str] = None

class InternalNoteItem(BaseModel):
    id: str
    report_id: str
    admin_name: str
    note: str
    created_at: datetime

class StatusUpdateRequest(BaseModel):
    status: IssueStatus
    reason: Optional[str] = "Status update by operations staff"

class AssignRequest(BaseModel):
    assigned_to: str = Field(..., min_length=2, max_length=100)
    note: Optional[str] = None

class AddNoteRequest(BaseModel):
    note: str = Field(..., min_length=2, max_length=1000)

class ResolveRequest(BaseModel):
    resolution_notes: str = Field(..., min_length=5, max_length=2000)

class MarkDuplicateRequest(BaseModel):
    original_report_id: str
    reason: str = Field(..., min_length=3, max_length=500)

class PriorityOverrideRequest(BaseModel):
    override_score: float = Field(..., ge=0, le=100)
    override_level: IssueSeverity
    reason: str = Field(..., min_length=5, max_length=500)

class PublicReportResponse(BaseModel):
    id: str
    public_report_id: str
    category: str
    title: str
    description: str
    locality: str
    approximate_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str
    priority_score: float
    priority_level: str
    status: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

class AdminReportResponse(PublicReportResponse):
    user_id: Optional[str] = None
    reporter_name: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    priority_factors: Optional[PriorityFactors] = None
    internal_notes_count: int = 0
    duplicate_of: Optional[str] = None
