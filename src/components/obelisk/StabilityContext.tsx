/**
 * StabilityContext — works with or without the FastAPI engine.
 * If the engine is offline, falls back to static demo values silently.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

export type VolatilityRegime = "low" | "high";
export type MarketRegime     = "Trending" | "Sideways";

export interface AdaptiveThreshold {
  volatility:          VolatilityRegime;
  confidenceThreshold: number;
  modeLabel:           string;
  thresholdLabel:      string;
  marketRegime:        MarketRegime;
}

interface StabilityState {
  score:         number;
  setScore:      (n: number) => void;
  volatility:    VolatilityRegime;
  setVolatility: (v: VolatilityRegime) => void;
  adaptive:      AdaptiveThreshold;
  engineLoading: boolean;
  engineError:   string | null;
  lastFetched:   number | null;
  components: {
    yield_score:      number;
    volatility_score: number;
    liquidity_score:  number;
  };
}

const Ctx = createContext<StabilityState | null>(null);

const API_BASE = (import.meta as Record<string, Record<string,string>>).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";

export function StabilityProvider({ children }: { children: ReactNode }) {
  const [scoreOverride,      setScoreOverride]      = useState<number | null>(null);
  const [volatilityOverride, setVolatilityOverride] = useState<VolatilityRegime | null>(null);
  const [engineScore,        setEngineScore]        = useState<number>(98);
  const [engineThreshold,    setEngineThreshold]    = useState<number>(65);
  const [engineRegime,       setEngineRegime]       = useState<"stable"|"high_volatility">("stable");
  const [components,         setComponents]         = useState({ yield_score: 94, volatility_score: 86, liquidity_score: 84 });
  const [engineLoading,      setEngineLoading]      = useState(false);
  const [engineError,        setEngineError]        = useState<string | null>(null);
  const [lastFetched,        setLastFetched]        = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Poll the engine every 10s — silently no-ops if offline
  useEffect(() => {
    const fetchScore = async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setEngineLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yield_spread: 2.8, volatility_72h: 1.4, dex_liquidity: 5200000 }),
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEngineScore(data.confidence_score);
        setEngineThreshold(data.confidence_threshold);
        setEngineRegime(data.volatility_regime);
        setComponents(data.components);
        setEngineError(null);
        setLastFetched(Date.now());
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setEngineError("Simulated");
        }
      } finally {
        setEngineLoading(false);
      }
    };

    fetchScore();
    const id = setInterval(fetchScore, 10_000);
    return () => { clearInterval(id); abortRef.current?.abort(); };
  }, []);

  const score = scoreOverride ?? engineScore;
  const volatility: VolatilityRegime =
    volatilityOverride ?? (engineRegime === "high_volatility" ? "high" : "low");

  const adaptive = useMemo<AdaptiveThreshold>(() => {
    const threshold = engineThreshold;
    if (volatility === "high") {
      return {
        volatility: "high",
        confidenceThreshold: threshold,
        modeLabel: "High Volatility",
        thresholdLabel: `Mode: High Volatility (Threshold: ${threshold}%)`,
        marketRegime: "Sideways",
      };
    }
    return {
      volatility: "low",
      confidenceThreshold: threshold,
      modeLabel: "Stable",
      thresholdLabel: `Mode: Stable (Threshold: ${threshold}%)`,
      marketRegime: "Trending",
    };
  }, [volatility, engineThreshold]);

  return (
    <Ctx.Provider value={{
      score,
      setScore:      (n) => setScoreOverride(n),
      volatility,
      setVolatility: (v) => setVolatilityOverride(v),
      adaptive,
      engineLoading,
      engineError,
      lastFetched,
      components,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStability() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStability must be used within StabilityProvider");
  return v;
}
