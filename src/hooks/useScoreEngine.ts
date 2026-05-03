/**
 * useScoreEngine.ts
 *
 * React hook that polls the FastAPI scoring engine and returns live results.
 * Falls back to the last good value if the request fails, so the UI never
 * goes blank during a brief network hiccup.
 *
 * usage:
 *   const { score, regime, threshold, shouldRebalance, loading, error } =
 *     useScoreEngine({ yieldSpread: 2.4, volatility72h: 1.4, dexLiquidity: 5_200_000 })
 */

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_SCORING_API_URL ?? "http://localhost:8000";
const POLL_INTERVAL_MS = 10_000; // refresh every 10 seconds

// ---------------------------------------------------------------------------
// Types — mirror the FastAPI ScoreResponse model
// ---------------------------------------------------------------------------

export interface ScoreComponents {
  yield_score:      number;
  volatility_score: number;
  liquidity_score:  number;
}

export interface EngineResult {
  confidence_score:      number;
  confidence_threshold:  number;
  should_rebalance:      boolean;
  volatility_regime:     "stable" | "high_volatility";
  components:            ScoreComponents;
  computed_at:           number;   // unix timestamp
}

export interface ScoreEngineState extends EngineResult {
  loading:      boolean;
  error:        string | null;
  lastFetched:  number | null;   // ms since epoch
}

export interface ScoreEngineInputs {
  yieldSpread:   number;
  volatility72h: number;
  dexLiquidity:  number;
  /** override the poll interval in ms (default 10 000) */
  pollInterval?: number;
  /** set false to pause polling — useful when tab is not in view */
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Default / fallback state shown before the first successful fetch
// ---------------------------------------------------------------------------

const INITIAL_STATE: ScoreEngineState = {
  confidence_score:     72,
  confidence_threshold: 65,
  should_rebalance:     false,
  volatility_regime:    "stable",
  components: {
    yield_score:      78,
    volatility_score: 68,
    liquidity_score:  70,
  },
  computed_at:  Date.now() / 1000,
  loading:      true,
  error:        null,
  lastFetched:  null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useScoreEngine({
  yieldSpread,
  volatility72h,
  dexLiquidity,
  pollInterval = POLL_INTERVAL_MS,
  enabled = true,
}: ScoreEngineInputs): ScoreEngineState {
  const [state, setState] = useState<ScoreEngineState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const fetchScore = useCallback(async () => {
    // cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yield_spread:   yieldSpread,
          volatility_72h: volatility72h,
          dex_liquidity:  dexLiquidity,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }

      const data: EngineResult = await res.json();
      setState({
        ...data,
        loading:     false,
        error:       null,
        lastFetched: Date.now(),
      });
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return; // intentional cancel
      setState((prev) => ({
        ...prev,
        loading: false,
        error:   (err as Error).message ?? "Scoring engine unavailable.",
      }));
    }
  }, [yieldSpread, volatility72h, dexLiquidity]);

  // Initial fetch + polling
  useEffect(() => {
    if (!enabled) return;

    // fire immediately
    fetchScore();

    const id = setInterval(fetchScore, pollInterval);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [fetchScore, pollInterval, enabled]);

  return state;
}
