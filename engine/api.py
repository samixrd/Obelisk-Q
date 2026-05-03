"""
api.py — Obelisk Q Scoring Engine · FastAPI microservice

Exposes the Phase 1 scoring engine over HTTP so the React dashboard
can fetch live confidence scores without any Python in the browser.

endpoints:
    GET  /health             liveness probe
    GET  /api/score          compute score from query params
    POST /api/score          compute score from JSON body
    GET  /api/score/stream   server-sent events — pushes a new score every N seconds

run:
    uvicorn api:app --reload --port 8000

cors:
    Configured to accept requests from the Vite dev server (localhost:5173)
    and any Vercel / production domain set in ALLOWED_ORIGINS env var.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from obelisk_scoring_engine import calculate_confidence_score


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Obelisk Q — Scoring Engine API",
    version="1.0.0",
    description="AI confidence scoring for autonomous yield allocation on Mantle Network.",
)

# CORS — allow Vite dev server + any domain in ALLOWED_ORIGINS env var
_extra = os.getenv("ALLOWED_ORIGINS", "").split(",")
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite default
    "http://localhost:4173",   # Vite preview
    "http://localhost:3000",
    *[o.strip() for o in _extra if o.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ScoreRequest(BaseModel):
    """Body schema for POST /api/score"""
    yield_spread: float = Field(
        ...,
        ge=0,
        le=20,
        description="USDY vs mETH yield differential in percentage points (e.g. 2.4).",
        examples=[2.4],
    )
    volatility_72h: float = Field(
        ...,
        ge=0,
        le=100,
        description="Realised 72-hour portfolio volatility as a percentage (e.g. 1.4).",
        examples=[1.4],
    )
    dex_liquidity: float = Field(
        ...,
        ge=0,
        description="Combined on-chain liquidity depth in USD (e.g. 5200000).",
        examples=[5_200_000],
    )

    @field_validator("yield_spread", "volatility_72h", "dex_liquidity")
    @classmethod
    def must_be_finite(cls, v: float) -> float:
        import math
        if not math.isfinite(v):
            raise ValueError("value must be a finite number")
        return v


class ScoreResponse(BaseModel):
    """Normalised response — mirrors the dict returned by the engine."""
    confidence_score:      float
    confidence_threshold:  float
    should_rebalance:      bool
    volatility_regime:     str
    components:            dict
    metadata:              dict
    computed_at:           float   # unix timestamp


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _run_engine(
    yield_spread: float,
    volatility_72h: float,
    dex_liquidity: float,
) -> ScoreResponse:
    """Thin wrapper: call engine, attach timestamp, validate output."""
    result = calculate_confidence_score(
        yield_spread=yield_spread,
        volatility_72h=volatility_72h,
        dex_liquidity=dex_liquidity,
    )
    result["computed_at"] = time.time()
    return ScoreResponse(**result)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["ops"])
def health():
    """Liveness probe — used by Docker / k8s health checks."""
    return {"status": "ok", "service": "obelisk-q-scoring-engine", "version": "1.0.0"}


@app.get(
    "/api/score",
    response_model=ScoreResponse,
    tags=["scoring"],
    summary="Compute confidence score (GET)",
)
def score_get(
    yield_spread:   float = Query(..., ge=0,   le=20,  description="Yield differential %"),
    volatility_72h: float = Query(..., ge=0,   le=100, description="72h volatility %"),
    dex_liquidity:  float = Query(..., ge=0,           description="DEX liquidity USD"),
):
    """
    Compute the Obelisk Q confidence score from query string parameters.
    Useful for quick tests and browser-based fetch calls.
    """
    try:
        return _run_engine(yield_spread, volatility_72h, dex_liquidity)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post(
    "/api/score",
    response_model=ScoreResponse,
    tags=["scoring"],
    summary="Compute confidence score (POST)",
)
def score_post(body: ScoreRequest):
    """
    Compute the Obelisk Q confidence score from a JSON request body.
    Preferred endpoint for the React dashboard.
    """
    try:
        return _run_engine(
            yield_spread=body.yield_spread,
            volatility_72h=body.volatility_72h,
            dex_liquidity=body.dex_liquidity,
        )
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get(
    "/api/score/stream",
    tags=["scoring"],
    summary="Live score stream (SSE)",
)
async def score_stream(
    yield_spread:   float = Query(...),
    volatility_72h: float = Query(...),
    dex_liquidity:  float = Query(...),
    interval:       float = Query(default=5.0, ge=1.0, le=60.0,
                                  description="Push interval in seconds"),
):
    """
    Server-sent events stream. The engine recomputes and pushes a new score
    every `interval` seconds. The React dashboard listens via EventSource.

    In production, replace the static params with live Mantle RPC + DEX calls
    inside the generator so each tick reflects actual on-chain state.
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        while True:
            try:
                result = _run_engine(yield_spread, volatility_72h, dex_liquidity)
                payload = json.dumps(result.model_dump())
                yield f"data: {payload}\n\n"
            except Exception as exc:
                yield f"event: error\ndata: {str(exc)}\n\n"
            await asyncio.sleep(interval)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable Nginx buffering
        },
    )


# ---------------------------------------------------------------------------
# Dev entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
