"""
obelisk_scoring_engine.py
Obelisk Q — AI Confidence Scoring Engine (Phase 1)

Computes a composite confidence score from three market signals and determines
whether the agent should trigger a portfolio rebalance.

Weights:
    yield_component       40%
    volatility_component  35%
    liquidity_component   25%

Adaptive threshold:
    volatility_72h <= 3%  → confidence_threshold = 65
    volatility_72h >  3%  → confidence_threshold = 85  (risk-averse regime)
"""

from __future__ import annotations
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WEIGHT_YIELD      = 0.40
WEIGHT_VOLATILITY = 0.35
WEIGHT_LIQUIDITY  = 0.25

THRESHOLD_STABLE    = 65.0   # standard market conditions
THRESHOLD_HIGH_VOL  = 85.0   # elevated volatility regime
VOLATILITY_BREAKPOINT = 3.0  # percentage — regime switch trigger

# Reference anchors used for normalisation (tune per live market data)
YIELD_SPREAD_MAX   = 5.0     # basis points or %; above this scores 100 on yield
VOLATILITY_MAX     = 10.0    # %; at this level the volatility score is 0
LIQUIDITY_MIN      = 100_000      # USD — below this scores 0 on liquidity
LIQUIDITY_OPTIMAL  = 10_000_000  # USD — at or above this scores 100


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class ScoreComponents:
    """Breakdown of each weighted sub-score before aggregation."""
    yield_score:      float  # 0–100 raw score for yield differential
    volatility_score: float  # 0–100 raw score for volatility (inverted)
    liquidity_score:  float  # 0–100 raw score for dex liquidity depth


@dataclass
class ScoringResult:
    """Final output returned by calculate_confidence_score."""
    confidence_score:      float          # 0–100 composite score
    confidence_threshold:  float          # adaptive threshold (65 or 85)
    should_rebalance:      bool           # True when score < threshold
    volatility_regime:     str            # 'stable' or 'high_volatility'
    components:            ScoreComponents
    metadata:              dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _normalise(value: float, low: float, high: float) -> float:
    """
    Linearly clamp and scale `value` to the [0, 100] range.
    Returns 0.0 when value <= low, 100.0 when value >= high.
    """
    if high == low:
        return 0.0
    clamped = max(low, min(high, value))
    return round((clamped - low) / (high - low) * 100.0, 4)


def _score_yield(yield_spread: float) -> float:
    """
    Higher yield spread is better — normalise upward.
    yield_spread of 0 → score 0; at YIELD_SPREAD_MAX or above → score 100.
    """
    return _normalise(yield_spread, low=0.0, high=YIELD_SPREAD_MAX)


def _score_volatility(volatility_72h: float) -> float:
    """
    Lower volatility is better — invert the normalisation.
    volatility_72h of 0 → score 100; at VOLATILITY_MAX or above → score 0.
    """
    raw = _normalise(volatility_72h, low=0.0, high=VOLATILITY_MAX)
    return round(100.0 - raw, 4)


def _score_liquidity(dex_liquidity: float) -> float:
    """
    Higher liquidity depth is better.
    Below LIQUIDITY_MIN → score 0; at LIQUIDITY_OPTIMAL or above → score 100.
    """
    return _normalise(dex_liquidity, low=LIQUIDITY_MIN, high=LIQUIDITY_OPTIMAL)


# ---------------------------------------------------------------------------
# Core scoring function
# ---------------------------------------------------------------------------

def calculate_confidence_score(
    yield_spread:   float,
    volatility_72h: float,
    dex_liquidity:  float,
) -> dict:
    """
    Calculate the Obelisk Q composite confidence score.

    Parameters
    ----------
    yield_spread : float
        Differential between USDY and mETH annualised yields (percentage points).
        Example: 2.4 means USDY yields 2.4 pp more than mETH.

    volatility_72h : float
        Realised volatility over the past 72 hours expressed as a percentage.
        Example: 4.1 means the portfolio moved ±4.1% in the 72-hour window.

    dex_liquidity : float
        Combined on-chain order-book and pool depth in USD across managed assets.
        Example: 3_500_000 means $3.5M in accessible liquidity.

    Returns
    -------
    dict with keys:
        confidence_score     float   — composite score from 0 to 100
        confidence_threshold float   — adaptive threshold (65 or 85)
        should_rebalance     bool    — True when the score falls below threshold
        volatility_regime    str     — 'stable' or 'high_volatility'
        components           dict    — individual sub-scores before weighting
        metadata             dict    — inputs echoed back for audit / logging
    """

    # -- 1. Compute raw sub-scores (each 0–100) ------------------------------
    y_score = _score_yield(yield_spread)
    v_score = _score_volatility(volatility_72h)
    l_score = _score_liquidity(dex_liquidity)

    components = ScoreComponents(
        yield_score=y_score,
        volatility_score=v_score,
        liquidity_score=l_score,
    )

    # -- 2. Weighted composite -----------------------------------------------
    composite = (
        y_score * WEIGHT_YIELD
        + v_score * WEIGHT_VOLATILITY
        + l_score * WEIGHT_LIQUIDITY
    )
    composite = round(composite, 2)

    # -- 3. Adaptive threshold: regime detection -----------------------------
    #    If 72-hour volatility breaches the 3% breakpoint the engine
    #    switches to risk-averse mode and demands a higher confidence
    #    bar before permitting allocation.
    if volatility_72h > VOLATILITY_BREAKPOINT:
        threshold = THRESHOLD_HIGH_VOL
        regime    = "high_volatility"
    else:
        threshold = THRESHOLD_STABLE
        regime    = "stable"

    # -- 4. Rebalance signal -------------------------------------------------
    should_rebalance = composite < threshold

    # -- 5. Assemble result --------------------------------------------------
    result = ScoringResult(
        confidence_score=composite,
        confidence_threshold=threshold,
        should_rebalance=should_rebalance,
        volatility_regime=regime,
        components=components,
        metadata={
            "inputs": {
                "yield_spread":   yield_spread,
                "volatility_72h": volatility_72h,
                "dex_liquidity":  dex_liquidity,
            },
            "weights": {
                "yield":      WEIGHT_YIELD,
                "volatility": WEIGHT_VOLATILITY,
                "liquidity":  WEIGHT_LIQUIDITY,
            },
        },
    )

    # Return as plain dictionary for easy serialisation / API use
    return {
        "confidence_score":     result.confidence_score,
        "confidence_threshold": result.confidence_threshold,
        "should_rebalance":     result.should_rebalance,
        "volatility_regime":    result.volatility_regime,
        "components": {
            "yield_score":      result.components.yield_score,
            "volatility_score": result.components.volatility_score,
            "liquidity_score":  result.components.liquidity_score,
        },
        "metadata": result.metadata,
    }


# ---------------------------------------------------------------------------
# Quick smoke-test (runs when executed directly)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    test_cases = [
        {
            "label":        "healthy market — expect no rebalance",
            "yield_spread":   2.8,
            "volatility_72h": 1.4,
            "dex_liquidity":  5_200_000,
        },
        {
            "label":        "high volatility — threshold jumps to 85, rebalance likely",
            "yield_spread":   1.2,
            "volatility_72h": 4.7,
            "dex_liquidity":  800_000,
        },
        {
            "label":        "thin liquidity, low yield — borderline",
            "yield_spread":   0.5,
            "volatility_72h": 2.9,
            "dex_liquidity":  250_000,
        },
        {
            "label":        "optimal conditions — high conviction",
            "yield_spread":   5.0,
            "volatility_72h": 0.3,
            "dex_liquidity":  12_000_000,
        },
    ]

    for case in test_cases:
        label = case.pop("label")
        result = calculate_confidence_score(**case)
        print(f"\n--- {label} ---")
        print(json.dumps(result, indent=2))
