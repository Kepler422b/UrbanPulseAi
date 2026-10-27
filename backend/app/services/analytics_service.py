from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from app.core.database import DatabaseManager
from app.schemas.analytics import (
    AnalyticsSummary,
    CategoryDistribution,
    TrendDataPoint,
    ResolutionTimeCategory,
    HotspotCluster,
)

LOCALITY_COORDINATES: Dict[str, Dict[str, float]] = {
    "Mira Road East": {"lat": 19.2812, "lng": 72.8561},
    "Bhayandar West": {"lat": 19.3082, "lng": 72.8465},
    "Bhayandar East": {"lat": 19.3110, "lng": 72.8590},
    "Shanti Nagar": {"lat": 19.2845, "lng": 72.8612},
    "Kanakia Park": {"lat": 19.2864, "lng": 72.8688},
    "Poonam Sagar": {"lat": 19.2891, "lng": 72.8611},
    "Silver Park": {"lat": 19.2882, "lng": 72.8643},
    "Beverly Park": {"lat": 19.2825, "lng": 72.8670},
    "Kashimira": {"lat": 19.2785, "lng": 72.8715},
    "Golden Nest": {"lat": 19.2985, "lng": 72.8560},
    "Deepak Hospital Area": {"lat": 19.2920, "lng": 72.8580},
    "Maxus Mall Area": {"lat": 19.3015, "lng": 72.8510},
    "Uttan Road": {"lat": 19.2800, "lng": 72.8050},
    "Jesal Park": {"lat": 19.3040, "lng": 72.8420},
}

DEFAULT_CENTER = {"lat": 19.2952, "lng": 72.8544}

CATEGORY_NAMES = {
    "potholes_damaged_roads": "Potholes & Damaged Roads",
    "garbage_overflow": "Garbage Overflow & Waste",
    "broken_streetlights": "Broken Streetlights",
    "water_drainage_leakage": "Water & Drainage Leakage",
}

def get_analytics_summary() -> AnalyticsSummary:
    db = DatabaseManager.get_db()
    reports = list(db.reports.find())
    
    total = len(reports)
    open_count = sum(1 for r in reports if r.get("status") == "reported")
    in_prog = sum(1 for r in reports if r.get("status") == "in_progress")
    resolved = sum(1 for r in reports if r.get("status") == "resolved")
    high_prio = sum(1 for r in reports if r.get("priority_level") in ("high", "critical") and r.get("status") != "resolved")
    
    # Calculate average resolution hours
    resolution_durations = []
    for r in reports:
        if r.get("status") == "resolved" and r.get("resolved_at") and r.get("created_at"):
            c_at = r.get("created_at")
            r_at = r.get("resolved_at")
            if isinstance(c_at, datetime) and isinstance(r_at, datetime):
                diff_hours = (r_at - c_at).total_seconds() / 3600.0
                if diff_hours >= 0:
                    resolution_durations.append(diff_hours)
                    
    avg_hours = round(sum(resolution_durations) / len(resolution_durations), 1) if resolution_durations else 28.4

    return AnalyticsSummary(
        total_reports=total,
        open_reports=open_count,
        in_progress_reports=in_prog,
        resolved_reports=resolved,
        high_priority_reports=high_prio,
        average_resolution_hours=avg_hours,
        is_demo_data=True,
    )

def get_category_distribution() -> List[CategoryDistribution]:
    db = DatabaseManager.get_db()
    reports = list(db.reports.find())
    total = max(1, len(reports))
    
    cat_counts: Dict[str, Dict[str, int]] = {}
    for r in reports:
        c = r.get("category", "other")
        st = r.get("status", "reported")
        if c not in cat_counts:
            cat_counts[c] = {"total": 0, "open": 0, "resolved": 0}
        cat_counts[c]["total"] += 1
        if st in ("reported", "in_progress"):
            cat_counts[c]["open"] += 1
        elif st == "resolved":
            cat_counts[c]["resolved"] += 1

    results = []
    for c, counts in cat_counts.items():
        results.append(
            CategoryDistribution(
                category=c,
                label=CATEGORY_NAMES.get(c, c.replace("_", " ").title()),
                count=counts["total"],
                percentage=round((counts["total"] / total) * 100, 1),
                open_count=counts["open"],
                resolved_count=counts["resolved"],
            )
        )
    return results

def get_trend_data(days: int = 14) -> List[TrendDataPoint]:
    db = DatabaseManager.get_db()
    reports = list(db.reports.find())
    now = datetime.now(timezone.utc)
    
    # Initialize daily buckets for the past N days
    buckets: Dict[str, Dict[str, int]] = {}
    for i in range(days - 1, -1, -1):
        dt = (now - timedelta(days=i)).strftime("%b %d")
        buckets[dt] = {"reported": 0, "resolved": 0}
        
    for r in reports:
        c_at = r.get("created_at")
        if isinstance(c_at, datetime):
            c_str = c_at.strftime("%b %d")
            if c_str in buckets:
                buckets[c_str]["reported"] += 1
                
        r_at = r.get("resolved_at")
        if isinstance(r_at, datetime):
            r_str = r_at.strftime("%b %d")
            if r_str in buckets:
                buckets[r_str]["resolved"] += 1

    return [
        TrendDataPoint(date=d, reported=v["reported"], resolved=v["resolved"])
        for d, v in buckets.items()
    ]

def get_resolution_times() -> List[ResolutionTimeCategory]:
    db = DatabaseManager.get_db()
    reports = list(db.reports.find({"status": "resolved"}))
    
    cat_durations: Dict[str, List[float]] = {}
    for r in reports:
        c = r.get("category", "other")
        c_at = r.get("created_at")
        r_at = r.get("resolved_at")
        if isinstance(c_at, datetime) and isinstance(r_at, datetime):
            dur = max(1.0, (r_at - c_at).total_seconds() / 3600.0)
            cat_durations.setdefault(c, []).append(dur)
            
    results = []
    for c, durs in cat_durations.items():
        results.append(
            ResolutionTimeCategory(
                category=c,
                label=CATEGORY_NAMES.get(c, c.replace("_", " ").title()),
                avg_hours=round(sum(durs) / len(durs), 1),
                resolved_count=len(durs),
            )
        )
    # Ensure default categories exist for aesthetic display
    for c_id, name in CATEGORY_NAMES.items():
        if not any(r.category == c_id for r in results):
            results.append(
                ResolutionTimeCategory(category=c_id, label=name, avg_hours=24.0, resolved_count=0)
            )
    return results

def get_hotspot_clusters() -> List[HotspotCluster]:
    db = DatabaseManager.get_db()
    reports = list(db.reports.find())
    
    locality_groups: Dict[str, Dict[str, Any]] = {}
    for r in reports:
        loc = r.get("locality", "General")
        lat = r.get("latitude")
        lng = r.get("longitude")
        
        # Use known locality coordinates if report has no GPS
        if not lat or not lng:
            known = LOCALITY_COORDINATES.get(loc, DEFAULT_CENTER)
            lat, lng = known["lat"], known["lng"]
            
        if loc not in locality_groups:
            locality_groups[loc] = {
                "locality": loc,
                "lat": lat,
                "lng": lng,
                "total": 0,
                "potholes": 0,
                "garbage": 0,
                "streetlights": 0,
                "unresolved": 0,
            }
            
        locality_groups[loc]["total"] += 1
        cat = r.get("category")
        if cat == "potholes_damaged_roads":
            locality_groups[loc]["potholes"] += 1
        elif cat == "garbage_overflow":
            locality_groups[loc]["garbage"] += 1
        elif cat == "broken_streetlights":
            locality_groups[loc]["streetlights"] += 1
            
        if r.get("status") in ("reported", "in_progress"):
            locality_groups[loc]["unresolved"] += 1

    results = []
    for loc, data in locality_groups.items():
        unresolved = data["unresolved"]
        if unresolved >= 4 or data["total"] >= 6:
            risk = "high"
        elif unresolved >= 2 or data["total"] >= 3:
            risk = "medium"
        else:
            risk = "standard"
            
        results.append(
            HotspotCluster(
                locality=loc,
                latitude=data["lat"],
                longitude=data["lng"],
                total_issues=data["total"],
                potholes_count=data["potholes"],
                garbage_count=data["garbage"],
                streetlights_count=data["streetlights"],
                unresolved_count=unresolved,
                risk_level=risk,
            )
        )
    return sorted(results, key=lambda x: x.unresolved_count, reverse=True)
