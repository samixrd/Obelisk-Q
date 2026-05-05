from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import math
from datetime import datetime, timedelta

app = FastAPI(title="Obelisk Q AI Engine")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Models ──────────────────────────────────────────────────────────────

class ScoreRequest(BaseModel):
    yield_spread: float
    volatility_72h: float
    dex_liquidity: float

class ScoreResponse(BaseModel):
    confidence_score: int
    confidence_threshold: int
    volatility_regime: str
    market_regime: str
    components: dict

# ─── AI Logic (Simulated for this demo, but structured for real models) ──────

def calculate_q_score(spread: float, vol: float, liq: float) -> int:
    """
    In a real scenario, this would load a PyTorch/TensorFlow model.
    Logic: High spread + Low Vol + High Liq = High Score.
    """
    base = 85
    penalty = (vol * 5) - (liq / 1000000) + (spread * 2)
    score = int(base - penalty + random.randint(-2, 2))
    return max(0, min(100, score))

def detect_regime(vol: float) -> str:
    return "high_volatility" if vol > 2.5 else "stable"

# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.post("/api/score", response_model=ScoreResponse)
async def get_score(req: ScoreRequest):
    score = calculate_q_score(req.yield_spread, req.volatility_72h, req.dex_liquidity)
    regime = detect_regime(req.volatility_72h)
    
    return {
        "confidence_score": score,
        "confidence_threshold": 65 if regime == "stable" else 80,
        "volatility_regime": regime,
        "market_regime": "Trending" if score > 75 else "Sideways",
        "components": {
            "yield_score": random.randint(70, 95),
            "volatility_score": random.randint(80, 98),
            "liquidity_score": random.randint(75, 90)
        }
    }

@app.get("/api/yields")
async def get_live_yields():
    # Real logic would fetch from Pyth/Chainlink or protocol APIs
    return {
        "usdy": {
            "apy": round(4.8 + random.uniform(-0.1, 0.1), 2),
            "price": 1.00,
            "change_24h": 0.01
        },
        "meth": {
            "apy": round(3.4 + random.uniform(-0.2, 0.2), 2),
            "price": 3450.20 + random.uniform(-10, 10),
            "change_24h": 1.2
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/performance")
async def get_performance_metrics():
    return {
        "ytd_return": 14.82,
        "sharpe_ratio": 2.41,
        "max_drawdown": -1.84,
        "win_rate": 86,
        "monthly_returns": [
            {"month": "Jan", "value": 4.2},
            {"month": "Feb", "value": 3.8},
            {"month": "Mar", "value": 5.1},
            {"month": "Apr", "value": 1.72}
        ]
    }

@app.get("/api/agent/logs")
async def get_agent_logs():
    actions = ["rebalance", "scan", "hold", "warn"]
    messages = [
        "Optimal allocation detected: Increasing mETH weight by 2.4%",
        "Stability scan passed: All safety parameters within 1.5 sigma",
        "Market regime shifted to Trending: Adjusting confidence threshold",
        "Minor liquidity fluctuation detected in USDY pool: Monitoring",
        "Circuit breaker armed: Drawdown threshold set at -3.5%"
    ]
    
    logs = []
    now = datetime.now()
    for i in range(10):
        logs.append({
            "timestamp": (now - timedelta(minutes=i*5)).isoformat(),
            "action": random.choice(actions),
            "message": random.choice(messages),
            "score": random.randint(85, 99)
        })
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
