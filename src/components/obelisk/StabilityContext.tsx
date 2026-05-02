// Shared stability + market-regime state.
// volatility: 'low'  → Mode: Stable         → Confidence Threshold: 65%
// volatility: 'high' → Mode: High Volatility → Confidence Threshold: 80%
// Score ≥ 75 auto-derives 'low'; score < 75 auto-derives 'high'.
// setVolatility() allows manual override for the demo toggle in QScoreBar.
import { createContext, useContext, useState, useMemo, ReactNode } from "react";

export type VolatilityRegime = "low" | "high";
export type MarketRegime = "Trending" | "Sideways";

export interface AdaptiveThreshold {
  volatility: VolatilityRegime;
  confidenceThreshold: number;   // 65 or 85
  modeLabel: string;             // "Stable" or "Risk-Averse"
  thresholdLabel: string;        // "Mode: Stable (Threshold: 65%)" etc.
  marketRegime: MarketRegime;
}

interface StabilityState {
  score: number;
  setScore: (n: number) => void;
  volatility: VolatilityRegime;
  setVolatility: (v: VolatilityRegime) => void;
  adaptive: AdaptiveThreshold;
}

const Ctx = createContext<StabilityState | null>(null);

export function StabilityProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(98);
  // Derive volatility automatically from score — score < 75 implies elevated volatility.
  // The setter allows manual override (e.g. demo toggle).
  const [volatilityOverride, setVolatilityOverride] = useState<VolatilityRegime | null>(null);

  const volatility: VolatilityRegime =
    volatilityOverride ?? (score >= 75 ? "low" : "high");

  const adaptive = useMemo<AdaptiveThreshold>(() => {
    if (volatility === "high") {
      return {
        volatility: "high",
        confidenceThreshold: 80,
        modeLabel: "High Volatility",
        thresholdLabel: "Mode: High Volatility (Threshold: 80%)",
        marketRegime: "Sideways",
      };
    }
    return {
      volatility: "low",
      confidenceThreshold: 65,
      modeLabel: "Stable",
      thresholdLabel: "Mode: Stable (Threshold: 65%)",
      marketRegime: "Trending",
    };
  }, [volatility]);

  return (
    <Ctx.Provider
      value={{
        score,
        setScore,
        volatility,
        setVolatility: (v) => setVolatilityOverride(v),
        adaptive,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStability() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStability must be used within StabilityProvider");
  return v;
}
