from pydantic import BaseModel
from typing import List, Optional

class AnalyticsSummary(BaseModel):
    total_reports: int
    open_reports: int
    in_progress_reports: int
    resolved_reports: int
    high_priority_reports: int
    average_resolution_hours: float
    is_demo_data: bool = False

class CategoryDistribution(BaseModel):
    category: str
    label: str
    count: int
    percentage: float
    open_count: int
    resolved_count: int

class TrendDataPoint(BaseModel):
    date: str
    reported: int
    resolved: int

class ResolutionTimeCategory(BaseModel):
    category: str
    label: str
    avg_hours: float
    resolved_count: int

class HotspotCluster(BaseModel):
    locality: str
    latitude: float
    longitude: float
    total_issues: int
    potholes_count: int
    garbage_count: int
    streetlights_count: int
    unresolved_count: int
    risk_level: str  # "high", "medium", "standard"
