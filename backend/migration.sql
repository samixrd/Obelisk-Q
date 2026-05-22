-- SQL Migration Script for ANTIGRAVITY PROTOCOL

-- 1. Create table for RPC Failover Audit Trail
CREATE TABLE IF NOT EXISTS rpc_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    rpc_url TEXT,
    status TEXT,
    latency_ms REAL,
    error TEXT
);

-- 2. Create table for Cycle Execution Lock (Deduplication)
CREATE TABLE IF NOT EXISTS cycle_execution_lock (
    cycle INTEGER PRIMARY KEY,
    node_id TEXT,
    start_time TEXT,
    end_time TEXT,
    status TEXT
);

-- 3. Create table for Regime Decision Audit Trail
CREATE TABLE IF NOT EXISTS regime_decisions (
    cycle INTEGER PRIMARY KEY,
    timestamp TEXT,
    regime TEXT,
    volatility REAL,
    fear_greed INTEGER,
    mnt_change REAL,
    btc_price TEXT,
    macro_sentiment TEXT,
    ai_reasoning TEXT,
    deterministic_suggestion TEXT,
    consensus_final TEXT,
    q_score REAL,
    circuit_breaker_active INTEGER,
    action TEXT,
    tx_hash TEXT
);

-- 4. Create table for Node Heartbeats (Fallback when Redis is down)
CREATE TABLE IF NOT EXISTS heartbeats (
    node_id TEXT PRIMARY KEY,
    role TEXT,
    last_pulse DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
);
