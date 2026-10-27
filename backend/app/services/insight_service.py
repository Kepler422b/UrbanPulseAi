from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from app.core.database import DatabaseManager
from app.schemas.insight import OperationalInsight

CATEGORY_LABELS = {
    "potholes_damaged_roads": "Potholes & Damaged Roads",
    "garbage_overflow": "Garbage Overflow & Waste",
    "broken_streetlights": "Broken Streetlights",
    "water_drainage_leakage": "Water & Drainage Leakage",
}

def analyze_patterns_and_generate_insights() -> List[OperationalInsight]:
    """
    Executes real statistical aggregation and rule-based operational pattern detection
    over reports currently stored in the database.
    """
    db = DatabaseManager.get_db()
    reports_col = db.reports
    
    now = datetime.now(timezone.utc)
    fourteen_days_ago = now - timedelta(days=14)
    seven_days_ago = now - timedelta(days=7)
    
    all_reports = list(reports_col.find())
    insights: List[OperationalInsight] = []
    
    if not all_reports:
        return []

    # Helper mapping for display
    def cat_label(cat: str) -> str:
        return CATEGORY_LABELS.get(cat, cat.replace("_", " ").title())

    # --- Rule 1: Garbage Overflow Hotspots (>= 3 reports in same locality within 14 days) ---
    garbage_by_locality: Dict[str, List[Dict[str, Any]]] = {}
    for r in all_reports:
        if r.get("category") == "garbage_overflow":
            loc = r.get("locality", "General")
            garbage_by_locality.setdefault(loc, []).append(r)
            
    for loc, items in garbage_by_locality.items():
        if len(items) >= 3:
            unresolved = [item for item in items if item.get("status") in ("reported", "in_progress")]
            report_ids = [item.get("public_report_id", str(item.get("_id"))) for item in items]
            
            evidence = "high" if len(items) >= 5 else "medium"
            insights.append(
                OperationalInsight(
                    insight_id=f"INS-GARBAGE-{loc.upper()[:6]}",
                    insight_type="hotspot",
                    category="garbage_overflow",
                    category_label=cat_label("garbage_overflow"),
                    locality=loc,
                    observation_period="Past 14 Days",
                    supporting_count=len(items),
                    explanation=(
                        f"Detected {len(items)} garbage overflow submissions ({len(unresolved)} currently active) "
                        f"in {loc}. Cluster indicates recurring collection misses or undersized community bins."
                    ),
                    recommendation=(
                        f"Audit sanitation beat schedule in {loc}. Deploy a secondary compactor sweep at peak morning hours "
                        f"and evaluate installing an additional 1.1m³ community bin."
                    ),
                    evidence_level=evidence,
                    report_ids=report_ids,
                    generated_at=now,
                    is_demo_analysis=True,
                )
            )

    # --- Rule 2: Repeated Potholes & Road Damage Clusters (>= 2 reports in same locality) ---
    potholes_by_locality: Dict[str, List[Dict[str, Any]]] = {}
    for r in all_reports:
        if r.get("category") == "potholes_damaged_roads":
            loc = r.get("locality", "General")
            potholes_by_locality.setdefault(loc, []).append(r)
            
    for loc, items in potholes_by_locality.items():
        if len(items) >= 2:
            report_ids = [item.get("public_report_id", str(item.get("_id"))) for item in items]
            insights.append(
                OperationalInsight(
                    insight_id=f"INS-ROAD-{loc.upper()[:6]}",
                    insight_type="recurring_issue",
                    category="potholes_damaged_roads",
                    category_label=cat_label("potholes_damaged_roads"),
                    locality=loc,
                    observation_period="Past 14 Days",
                    supporting_count=len(items),
                    explanation=(
                        f"Identified {len(items)} road depression/pothole reports concentrated along {loc}. "
                        f"Repetitive surface failure in the same sector frequently points to sub-base water logging or heavy axle loads."
                    ),
                    recommendation=(
                        f"Issue a combined road-maintenance work order for {loc} using hot/cold mix asphalt patching. "
                        f"Inspect roadside stormwater storm drains for overflow onto road surface."
                    ),
                    evidence_level="high" if len(items) >= 3 else "medium",
                    report_ids=report_ids,
                    generated_at=now,
                    is_demo_analysis=True,
                )
            )

    # --- Rule 3: Prolonged Unresolved Streetlights (> 72 hours open) ---
    streetlight_reports = [
        r for r in all_reports 
        if r.get("category") == "broken_streetlights" and r.get("status") in ("reported", "in_progress")
    ]
    delayed_streetlights: Dict[str, List[Dict[str, Any]]] = {}
    for r in streetlight_reports:
        c_at = r.get("created_at")
        if isinstance(c_at, datetime):
            if c_at.tzinfo is None:
                c_at = c_at.replace(tzinfo=timezone.utc)
            hours_open = (now - c_at).total_seconds() / 3600.0
            if hours_open >= 72.0:
                loc = r.get("locality", "General")
                delayed_streetlights.setdefault(loc, []).append(r)
                
    for loc, items in delayed_streetlights.items():
        report_ids = [item.get("public_report_id", str(item.get("_id"))) for item in items]
        insights.append(
            OperationalInsight(
                insight_id=f"INS-LIGHT-DELAY-{loc.upper()[:6]}",
                insight_type="prolonged_unresolved",
                category="broken_streetlights",
                category_label=cat_label("broken_streetlights"),
                locality=loc,
                observation_period="Over 72 Hours Unresolved",
                supporting_count=len(items),
                explanation=(
                    f"{len(items)} streetlight failure(s) in {loc} have remained unresolved for over 72 hours. "
                    f"Pedestrian night visibility and corridor safety risk is heightened."
                ),
                recommendation=(
                    f"Escalate to the Electrical Maintenance Wing. Dispatch an electrical lineman team to verify "
                    f"feeder pillar fuse continuity and switchbox timers in {loc}."
                ),
                evidence_level="high",
                report_ids=report_ids,
                generated_at=now,
                is_demo_analysis=True,
            )
        )

    # --- Rule 4: Potential Duplicate Reports Detection ---
    # Reports of same category, same locality submitted within 48h
    duplicates_found: List[Dict[str, Any]] = []
    seen_pairs = set()
    for i in range(len(all_reports)):
        for j in range(i + 1, len(all_reports)):
            r1 = all_reports[i]
            r2 = all_reports[j]
            if r1.get("category") == r2.get("category") and r1.get("locality") == r2.get("locality"):
                t1 = r1.get("created_at")
                t2 = r2.get("created_at")
                if isinstance(t1, datetime) and isinstance(t2, datetime):
                    if abs((t1 - t2).total_seconds()) <= 172800:  # 48 hours
                        pair_key = tuple(sorted([r1.get("public_report_id", ""), r2.get("public_report_id", "")]))
                        if pair_key not in seen_pairs:
                            seen_pairs.add(pair_key)
                            duplicates_found.append({"r1": r1, "r2": r2, "locality": r1.get("locality")})

    if duplicates_found:
        dup_sample = duplicates_found[0]
        r1, r2 = dup_sample["r1"], dup_sample["r2"]
        loc = dup_sample["locality"]
        ids = [r1.get("public_report_id", ""), r2.get("public_report_id", "")]
        insights.append(
            OperationalInsight(
                insight_id=f"INS-DUP-{loc.upper()[:6]}",
                insight_type="potential_duplicate",
                category=r1.get("category", "general"),
                category_label=cat_label(r1.get("category", "general")),
                locality=loc,
                observation_period="Within 48h Window",
                supporting_count=len(duplicates_found) * 2,
                explanation=(
                    f"Detected similar submissions for {cat_label(r1.get('category'))} in {loc} filed within 48 hours "
                    f"({r1.get('public_report_id')} & {r2.get('public_report_id')}). Likely multiple citizens reporting the same event."
                ),
                recommendation=(
                    f"Review reports in {loc} for cross-referencing. Mark verified duplicates to unify field team assignment "
                    f"and avoid dispatching redundant repair personnel."
                ),
                evidence_level="medium",
                report_ids=ids,
                generated_at=now,
                is_demo_analysis=True,
            )
        )

    # Persist generated insights into database
    try:
        insights_col = db.insights
        insights_col.delete_many({})
        for ins in insights:
            insights_col.insert_one(ins.model_dump())
    except Exception:
        pass

    return insights

def get_latest_insights() -> List[OperationalInsight]:
    db = DatabaseManager.get_db()
    insights_col = db.insights
    stored = list(insights_col.find())
    if stored:
        results = []
        for s in stored:
            s.pop("_id", None)
            results.append(OperationalInsight(**s))
        return results
    # If none stored yet, run analysis once
    return analyze_patterns_and_generate_insights()
