import pytest
from fastapi.testclient import TestClient
from main import app, DB_PATH
import sqlite3
import os

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Ensure a clean database for testing."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
    # Run minimal migrations
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agent_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tx_hash TEXT UNIQUE,
            action TEXT,
            score REAL,
            regime TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT,
            vault_address TEXT,
            cycle INTEGER
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS heartbeats (
            node_id TEXT PRIMARY KEY,
            role TEXT,
            last_pulse DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    assert b"q_score_value" in response.content

def test_get_agent_transactions():
    # Insert mock data
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO agent_transactions (tx_hash, action, score, regime, status, cycle) VALUES (?, ?, ?, ?, ?, ?)",
                 ("0x123", "BUY", 85.0, "Expansion", "confirmed", 1))
    conn.commit()
    conn.close()

    response = client.get("/api/agent/transactions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["tx_hash"] == "0x123"

def test_invalid_endpoint():
    response = client.get("/invalid")
    assert response.status_code == 404
