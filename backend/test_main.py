import pytest
from fastapi.testclient import TestClient
from main import app, SESSIONS, last_known_state
import time
import secrets

client = TestClient(app)

@pytest.fixture
def auth_token():
    """Generates a valid session token for protected endpoints."""
    token = secrets.token_hex(32)
    SESSIONS[token] = {"address": "0x1234567890123456789012345678901234567890", "last_seen": time.time()}
    return token

def test_health_check():
    """Verify the public health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_unauthorized_access():
    """Verify that protected endpoints return 401 without a token."""
    response = client.get("/api/user/withdraw-wallet?address=0x1234567890123456789012345678901234567890")
    assert response.status_code == 401
    assert response.json()["detail"] == "Session_Expired"

def test_authorized_telemetry(auth_token):
    """Verify that agent transactions endpoint returns data."""
    response = client.get("/api/agent/transactions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_yield_api():
    """Verify public yield telemetry."""
    response = client.get("/api/yields")
    assert response.status_code == 200
    data = response.json()
    assert "meth_apy" in data
    assert "usdy_apy" in data

def test_stats_api():
    """Verify the core stats aggregator."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "regime" in data
    assert "score" in data
    assert "vault_health" in data

def test_state_resilience():
    """Verify that the engine maintains state integrity."""
    assert last_known_state["risk"]["score"] >= 0
    assert last_known_state["regime"] in ["Expansion", "Consolidation", "Contraction"]
