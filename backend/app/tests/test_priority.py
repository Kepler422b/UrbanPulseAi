from datetime import datetime, timezone, timedelta
from app.services.priority_service import calculate_priority_score

def test_priority_score_bounds():
    now = datetime.now(timezone.utc)
    # Critical severity + high recurrence + long wait
    prio_high = calculate_priority_score(
        severity="critical",
        created_at=now - timedelta(days=10),
        similar_recent_count=8,
        locality_name="Silver Park",
        is_resolved=False,
    )
    assert prio_high.total_score >= 80.0
    assert prio_high.priority_level == "critical"
    assert prio_high.severity_score == 100.0
    assert prio_high.recurrence_score == 100.0
    assert prio_high.waiting_time_score == 100.0

def test_priority_score_low():
    now = datetime.now(timezone.utc)
    # Low severity + no recurrence + just reported
    prio_low = calculate_priority_score(
        severity="low",
        created_at=now,
        similar_recent_count=0,
        locality_name="Jesal Park",
        is_resolved=False,
    )
    assert prio_low.total_score < 35.0
    assert prio_low.priority_level == "low"
    assert prio_low.severity_score == 25.0
    assert prio_low.recurrence_score == 15.0

def test_resolved_issue_zeroes_waiting_score():
    now = datetime.now(timezone.utc)
    prio = calculate_priority_score(
        severity="medium",
        created_at=now - timedelta(days=5),
        similar_recent_count=2,
        locality_name="Bhayandar West",
        is_resolved=True,
    )
    assert prio.waiting_time_score == 0.0
