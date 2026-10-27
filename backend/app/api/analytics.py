from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.analytics import (
    AnalyticsSummary,
    CategoryDistribution,
    TrendDataPoint,
    ResolutionTimeCategory,
    HotspotCluster,
)
from app.services.analytics_service import (
    get_analytics_summary,
    get_category_distribution,
    get_trend_data,
    get_resolution_times,
    get_hotspot_clusters,
)
from app.core.security import get_optional_user_token

router = APIRouter(prefix="/admin/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def fetch_analytics_summary():
    return get_analytics_summary()

@router.get("/trends", response_model=List[TrendDataPoint])
def fetch_trends(days: int = Query(14, ge=7, le=60)):
    return get_trend_data(days=days)

@router.get("/categories", response_model=List[CategoryDistribution])
def fetch_categories():
    return get_category_distribution()

@router.get("/hotspots", response_model=List[HotspotCluster])
def fetch_hotspots():
    return get_hotspot_clusters()

@router.get("/resolution-times", response_model=List[ResolutionTimeCategory])
def fetch_resolution_times():
    return get_resolution_times()
