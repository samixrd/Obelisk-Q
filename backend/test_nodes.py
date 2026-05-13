import pytest
from main import regime_detection_node, risk_assessment_node, scoring_engine_node, last_known_state
import asyncio

@pytest.mark.asyncio
async def test_regime_detection_node_fallback():
    """Verify that the regime detection node returns a valid state even on failure."""
    # Mock state
    state = {"data": {}, "messages": []}
    result = await regime_detection_node(state)
    
    assert "data" in result
    assert "regime" in result["data"]
    assert result["data"]["regime"] in ["Expansion", "Contraction", "Consolidation"]

@pytest.mark.asyncio
async def test_risk_assessment_logic():
    """Verify that risk assessment correctly calculates the risk score based on volatility."""
    state = {
        "data": {
            "volatility": 3.0, # High vol
            "regime": "Contraction"
        },
        "messages": []
    }
    result = await risk_assessment_node(state)
    score = result["data"]["risk_score"]
    # High vol + Contraction should result in lower risk score (higher risk)
    assert score < 50

@pytest.mark.asyncio
async def test_scoring_engine_ema():
    """Verify that the Q-Score engine correctly applies EMA smoothing."""
    state = {
        "data": {
            "risk_score": 80.0,
            "deterministic_score": 85.0,
            "consensus_score": 82.0
        },
        "messages": []
    }
    # First run
    result1 = await scoring_engine_node(state)
    score1 = result1["data"]["q_score"]
    
    # Second run with different values
    state["data"]["risk_score"] = 60.0
    result2 = await scoring_engine_node(state)
    score2 = result2["data"]["q_score"]
    
    # EMA should prevent the score from dropping too fast (EMA of 82 and 60 with alpha 0.1)
    assert score2 > 60.0 
    assert score2 < 82.0
