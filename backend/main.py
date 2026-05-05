import asyncio
import json
import random
import time
import sqlite3
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Obelisk Q Advanced AI Engine")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Database Setup ───────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect("obelisk_q.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs 
                 (timestamp TEXT, action TEXT, score INTEGER, message TEXT, regime TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS metrics 
                 (timestamp TEXT, score INTEGER, yield_diff REAL, vol REAL, liq REAL)''')
    conn.commit()
    conn.close()

init_db()

# ─── Global State ─────────────────────────────────────────────────────────────

class AgentState:
    def __init__(self):
        self.current_score = 92
        self.regime = "Stable"
        self.last_action = "HOLD"
        self.score_history = [] # List of (timestamp, score)
        self.circuit_breaker_armed = False
        self.next_analysis_in = 10
        self.active_connections: List[WebSocket] = []

state = AgentState()

# ─── AI Engine Logic ──────────────────────────────────────────────────────────

def calculate_weighted_q_score(yield_diff: float, vol: float, liq: float) -> int:
    """
    Weighted formula:
    Yield Diff (40%) + Volatility Penalty (35%) + Liquidity Depth (25%)
    """
    # Normalize inputs (0-100 scales)
    y_score = min(100, max(0, yield_diff * 20)) # Assuming 5% diff is 100
    v_score = max(0, 100 - (vol * 20))           # Assuming 5.0 sigma is 0
    l_score = min(100, max(0, liq / 50000))      # Assuming 5M is 100
    
    final_score = (y_score * 0.40) + (v_score * 0.35) + (l_score * 0.25)
    return int(final_score)

def check_circuit_breaker(new_score: int) -> bool:
    """Trigger if score drops 5 points in 60 minutes."""
    now = time.time()
    state.score_history.append((now, new_score))
    
    # Keep only 60m history
    state.score_history = [s for s in state.score_history if s[0] > now - 3600]
    
    if len(state.score_history) > 1:
        old_score = state.score_history[0][1]
        if old_score - new_score >= 5:
            return True
    return False

async def engine_cycle():
    """Runs every 10 seconds."""
    while True:
        # 1. Countdown update (every 1s)
        for i in range(10, 0, -1):
            state.next_analysis_in = i
            await broadcast({"type": "countdown", "value": i})
            await asyncio.sleep(1)

        # 2. Perform Analysis
        yield_diff = 2.4 + random.uniform(-0.5, 0.5)
        vol = 1.2 + random.uniform(-0.8, 0.8)
        liq = 4200000 + random.randint(-500000, 500000)
        
        new_score = calculate_weighted_q_score(yield_diff, vol, liq)
        
        # Regime detection
        if vol > 2.5: state.regime = "Volatile"
        elif new_score > 80: state.regime = "Trending"
        else: state.regime = "Stable"
        
        # Rule Engine Decision
        decision = "HOLD"
        message = "Market conditions stable. Maintaining current allocation."
        
        if new_score >= 80:
            decision = "REBALANCE"
            message = f"Bullish signal detected (Score {new_score}). Increasing mETH exposure."
        elif new_score < 60:
            decision = "PROTECT"
            message = f"Risk threshold exceeded (Score {new_score}). Rotating to USDY reserves."
            
        # Circuit Breaker check
        if check_circuit_breaker(new_score):
            state.circuit_breaker_armed = True
            decision = "PAUSE"
            message = "CIRCUIT BREAKER TRIGGERED: Rapid stability degradation detected."

        # 3. Persistence
        conn = sqlite3.connect("obelisk_q.db")
        c = conn.cursor()
        now_str = datetime.now().isoformat()
        c.execute("INSERT INTO logs VALUES (?, ?, ?, ?, ?)", (now_str, decision, new_score, message, state.regime))
        c.execute("INSERT INTO metrics VALUES (?, ?, ?, ?, ?)", (now_str, new_score, yield_diff, vol, liq))
        conn.commit()
        conn.close()

        # 4. Broadcast Update
        state.current_score = new_score
        payload = {
            "type": "update",
            "score": new_score,
            "regime": state.regime,
            "decision": decision,
            "message": message,
            "yields": {
                "usdy": round(4.8 + random.uniform(-0.1, 0.1), 2),
                "meth": round(3.4 + random.uniform(-0.2, 0.2), 2)
            },
            "prices": {
                "usdy": 1.00,
                "meth": round(3450.20 + random.uniform(-10, 10), 2)
            }
        }
        await broadcast(payload)

# ─── WebSocket Management ────────────────────────────────────────────────────

async def broadcast(message: dict):
    if not state.active_connections: return
    dead_connections = []
    msg_json = json.dumps(message)
    for connection in state.active_connections:
        try:
            await connection.send_text(msg_json)
        except:
            dead_connections.append(connection)
    
    for dead in dead_connections:
        state.active_connections.remove(dead)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    state.active_connections.append(websocket)
    try:
        # Send initial state
        await websocket.send_text(json.dumps({
            "type": "init",
            "score": state.current_score,
            "regime": state.regime
        }))
        while True:
            await websocket.receive_text() # Keep alive
    except WebSocketDisconnect:
        state.active_connections.remove(websocket)

# ─── REST Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/status")
async def get_status():
    return {
        "score": state.current_score,
        "regime": state.regime,
        "circuit_breaker": state.circuit_breaker_armed,
        "next_analysis": state.next_analysis_in
    }

@app.get("/api/logs")
async def get_logs(limit: int = 20):
    conn = sqlite3.connect("obelisk_q.db")
    c = conn.cursor()
    c.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"timestamp": r[0], "action": r[1], "score": r[2], "message": r[3], "regime": r[4]} for r in rows]

# ─── Lifecycle ────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(engine_cycle())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
