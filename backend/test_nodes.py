import pytest
from main import regime_detection_node, risk_assessment_node, q_score_engine_node, last_known_state
import asyncio

@pytest.mark.anyio
async def test_regime_detection_node_fallback():
    """Verify that the regime detection node returns a valid state even on failure."""
    # Mock state
    state = {"data": {}, "messages": []}
    result = await regime_detection_node(state)
    
    assert "data" in result
    assert "yields" in result["data"]
    assert "vol" in result["data"]

@pytest.mark.anyio
async def test_risk_assessment_logic():
    """Verify that risk assessment correctly calculates the risk score based on volatility."""
    state = {
        "data": {
            "vol": 3.0, # High vol
            "regime": "Contraction"
        },
        "messages": []
    }
    result = await risk_assessment_node(state)
    score = result["data"]["risk"]["score"]
    # High vol should result in lower risk score (higher risk)
    assert score < 50

@pytest.mark.anyio
async def test_scoring_engine_ema():
    """Verify that the Q-Score engine correctly applies EMA smoothing."""
    state = {
        "data": {
            "vol": 1.5,
            "yields": {"usdy": 5.0, "meth": 3.5},
            "risk": {"score": 80}
        },
        "messages": [],
        "sensitivity": 0.5
    }
    # First run
    result1 = await q_score_engine_node(state)
    score1 = result1["data"]["risk"]["score"]
    
    # Second run with different values
    state["data"]["vol"] = 3.5
    result2 = await q_score_engine_node(state)
    score2 = result2["data"]["risk"]["score"]
    
    # EMA should prevent the score from dropping too fast
    assert score2 > 20.0 
    assert score2 < 80.0
