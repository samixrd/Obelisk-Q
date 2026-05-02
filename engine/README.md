# Obelisk Q — Scoring Engine

Python scoring engine that powers the confidence score displayed in the React dashboard.

## quick start

```bash
cd engine
python obelisk_scoring_engine.py   # runs smoke tests
```

## function signature

```python
from obelisk_scoring_engine import calculate_confidence_score

result = calculate_confidence_score(
    yield_spread   = 2.8,   # USDY vs mETH yield differential (%)
    volatility_72h = 1.4,   # 72-hour realised volatility (%)
    dex_liquidity  = 5_200_000,  # on-chain liquidity depth (USD)
)
```

## returned keys

| key                  | type  | description                                   |
|----------------------|-------|-----------------------------------------------|
| confidence_score     | float | composite 0-100 score                         |
| confidence_threshold | float | adaptive threshold — 65 (stable) / 85 (high vol) |
| should_rebalance     | bool  | True when score < threshold                   |
| volatility_regime    | str   | 'stable' or 'high_volatility'                 |
| components           | dict  | individual sub-scores before weighting        |
| metadata             | dict  | echoed inputs + weights for audit logging     |

## connecting to the React dashboard

Run as a FastAPI microservice (see Phase 2) and call from the
frontend via `fetch('/api/score')` inside a React `useEffect` hook.
