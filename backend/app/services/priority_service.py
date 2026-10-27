from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from app.schemas.report import PriorityFactors, IssueSeverity

SEVERITY_WEIGHT = 0.40
RECURRENCE_WEIGHT = 0.35
WAITING_TIME_WEIGHT = 0.25

SEVERITY_SCORES = {
    IssueSeverity.LOW.value: 25.0,
    IssueSeverity.MEDIUM.value: 50.0,
    IssueSeverity.HIGH.value: 75.0,
    IssueSeverity.CRITICAL.value: 100.0,
}

def calculate_priority_score(
    severity: str,
    created_at: datetime,
    similar_recent_count: int = 0,
    locality_name: str = "locality",
    is_resolved: bool = False,
) -> PriorityFactors:
    # 1. Severity factor
    sev_key = severity.lower()
    severity_score = SEVERITY_SCORES.get(sev_key, 50.0)

    # 2. Recurrence factor (based on similar category issues in same locality within window)
    if similar_recent_count <= 0:
        recurrence_score = 15.0
    elif similar_recent_count == 1:
        recurrence_score = 30.0
    elif similar_recent_count in (2, 3):
        recurrence_score = 60.0
    elif 4 <= similar_recent_count <= 6:
        recurrence_score = 85.0
    else:
        recurrence_score = 100.0

    # 3. Waiting time factor
    if is_resolved:
        waiting_score = 0.0
        elapsed_hours = 0.0
    else:
        now = datetime.now(timezone.utc)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        elapsed_hours = max(0.0, (now - created_at).total_seconds() / 3600.0)
        # Cap at 168 hours (7 days) = 100 score
        waiting_score = min(100.0, (elapsed_hours / 168.0) * 100.0)

    # Calculate weighted total
    total_score = (
        (SEVERITY_WEIGHT * severity_score)
        + (RECURRENCE_WEIGHT * recurrence_score)
        + (WAITING_TIME_WEIGHT * waiting_score)
    )
    total_score = round(max(0.0, min(100.0, total_score)), 1)

    # Determine priority tier
    if total_score >= 80.0:
        priority_level = "critical"
    elif total_score >= 60.0:
        priority_level = "high"
    elif total_score >= 35.0:
        priority_level = "medium"
    else:
        priority_level = "low"

    explanation = (
        f"Score {total_score} ({priority_level.capitalize()}) derived from: "
        f"Severity [{severity_score:.0f} × 40%], "
        f"Locality Recurrence [{recurrence_score:.0f} × 35% with {similar_recent_count} recent pattern(s) in {locality_name}], "
        f"Waiting Time [{waiting_score:.0f} × 25% ({elapsed_hours:.1f}h open)]."
    )

    return PriorityFactors(
        severity_score=round(severity_score, 1),
        recurrence_score=round(recurrence_score, 1),
        waiting_time_score=round(waiting_score, 1),
        total_score=total_score,
        priority_level=priority_level,
        explanation=explanation,
    )
