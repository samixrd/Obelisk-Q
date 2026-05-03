# Obelisk Q — Scoring Engine (Phase 2)

Python FastAPI microservice that powers the live confidence score
in the React dashboard.

## quick start

```bash
cd engine
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Then open: http://localhost:8000/docs — interactive Swagger UI.

## endpoints

| method | path               | description                              |
|--------|--------------------|------------------------------------------|
| GET    | /health            | liveness probe                           |
| GET    | /api/score         | compute score from query params          |
| POST   | /api/score         | compute score from JSON body (preferred) |
| GET    | /api/score/stream  | server-sent events — live push every Ns  |

## example POST request

```bash
curl -X POST http://localhost:8000/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "yield_spread":   2.8,
    "volatility_72h": 1.4,
    "dex_liquidity":  5200000
  }'
```

## example response

```json
{
  "confidence_score":     75.18,
  "confidence_threshold": 65.0,
  "should_rebalance":     false,
  "volatility_regime":    "stable",
  "components": {
    "yield_score":      56.0,
    "volatility_score": 86.0,
    "liquidity_score":  83.79
  },
  "computed_at": 1714900000.12
}
```

## connecting to the React dashboard

1. Copy `.env.example` to `.env.local` in the frontend folder.
2. Set `VITE_SCORING_API_URL=http://localhost:8000`.
3. Start both servers — the Vite proxy forwards `/api/*` to FastAPI.

## production deployment

Deploy the engine to Railway, Render, or Fly.io. Then update
`VITE_SCORING_API_URL` in the frontend environment to the live URL.
