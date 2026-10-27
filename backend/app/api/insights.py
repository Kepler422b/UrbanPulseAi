from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.insight import InsightAnalysisResponse
from app.services.insight_service import (
    get_latest_insights,
    analyze_patterns_and_generate_insights,
)
from app.api.admin import verify_admin_role

router = APIRouter(prefix="/admin/insights", tags=["AI Operational Insights"])

@router.get("", response_model=InsightAnalysisResponse)
def get_insights(admin_user: dict = Depends(verify_admin_role)):
    insights = get_latest_insights()
    return InsightAnalysisResponse(
        insights=insights,
        total_insights=len(insights),
        generated_at=datetime.now(timezone.utc),
        analysis_notice="Calculated using explainable rule-based pattern analysis across Mira-Bhayandar records.",
    )

@router.post("/analyze", response_model=InsightAnalysisResponse)
def run_live_pattern_analysis(admin_user: dict = Depends(verify_admin_role)):
    insights = analyze_patterns_and_generate_insights()
    return InsightAnalysisResponse(
        insights=insights,
        total_insights=len(insights),
        generated_at=datetime.now(timezone.utc),
        analysis_notice="Fresh pattern detection pipeline executed across all current database records.",
    )
