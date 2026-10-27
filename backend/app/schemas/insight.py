from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OperationalInsight(BaseModel):
    insight_id: str
    insight_type: str  # "hotspot", "recurring_issue", "prolonged_unresolved", "volume_surge", "potential_duplicate"
    category: str
    category_label: str
    locality: str
    observation_period: str
    supporting_count: int
    explanation: str
    recommendation: str
    evidence_level: str  # "high", "medium", "emerging"
    report_ids: List[str]
    generated_at: datetime
    is_demo_analysis: bool = True

class InsightAnalysisResponse(BaseModel):
    insights: List[OperationalInsight]
    total_insights: int
    generated_at: datetime
    analysis_notice: str
