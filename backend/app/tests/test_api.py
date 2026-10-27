import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "UrbanPulse AI" in data["service"]

def test_public_reports_endpoint(client):
    response = client.get("/api/public/reports")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_citizen_registration_and_login(client):
    email = f"testuser_{pytest.__version__}@example.com"
    reg_payload = {
        "name": "Test Citizen",
        "email": email,
        "password": "Password123!",
    }
    # Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["role"] == "citizen"

    # Login
    login_res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Verify /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

def test_admin_demo_login_and_analytics(client):
    # Login as seeded demo admin
    res = client.post("/api/auth/login", json={
        "email": "admin@urbanpulse.ai",
        "password": "AdminPassword123!",
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "admin"

    # Fetch admin analytics summary
    sum_res = client.get("/api/admin/analytics/summary")
    assert sum_res.status_code == 200
    summary = sum_res.json()
    assert summary["total_reports"] >= 10

    # Fetch AI insights
    ins_res = client.get("/api/admin/insights", headers={"Authorization": f"Bearer {token}"})
    assert ins_res.status_code == 200
    insights_data = ins_res.json()
    assert len(insights_data["insights"]) > 0

def test_unauthorized_admin_access_rejected(client):
    # Attempt admin action without token
    res = client.patch("/api/admin/reports/UP-2026-SP001/status", json={"status": "in_progress"})
    assert res.status_code == 401

    # Attempt with citizen token
    reg_res = client.post("/api/auth/register", json={
        "name": "Regular User",
        "email": "regular@example.com",
        "password": "Password123!",
    })
    token = reg_res.json()["access_token"]
    res2 = client.patch(
        "/api/admin/reports/UP-2026-SP001/status",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res2.status_code == 403
