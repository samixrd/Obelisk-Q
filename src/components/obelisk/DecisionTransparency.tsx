import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStability } from "./StabilityContext";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function DecisionTransparency() {
  const { score, adaptive, lastFetched, components } = useStability();
  const [countdown, setCountdown] = useState(10);

  // Countdown timer logic
  useEffect(() => {
    const update = () => {
      if (!lastFetched) return;
      const elapsed = Math.floor((Date.now() - lastFetched) / 1000);
      const remaining = Math.max(0, 10 - (elapsed % 10));
      setCountdown(remaining);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastFetched]);

  // Component contributions (weighted)
  // Yield: 40%, Volatility: 35%, Liquidity: 25%
  const yieldCont = (components.yield_score * 0.4).toFixed(1);
  const volCont = (components.volatility_score * 0.35).toFixed(1);
  const liqCont = (components.liquidity_score * 0.25).toFixed(1);

  const statusOk = score >= adaptive.confidenceThreshold;

  return (
    <motion.div {...fadeUp} className="col-span-12 glass-card rounded-3xl p-6 md:p-10 space-y-12 mb-12 transition-all hover:bg-white/80">
      {/* Section Title */}
      <div>
        <p
          className="text-[10px] uppercase text-muted-foreground mb-2 font-bold"
          style={{ letterSpacing: "0.28em", fontFamily: "'Inter', sans-serif" }}
        >
          AI Decision Transparency
        </p>
        <h2
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
        >
          Why the agent acted
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Decision & Breakdown */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          {/* 1. LAST DECISION CARD */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60 font-bold" style={{ letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>
              Last Decision
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">Action Taken</p>
                <p className="text-sm font-semibold text-foreground">
                  {statusOk ? "Hold — score within safe range" : "Rebalance — risk threshold exceeded"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">Timestamp</p>
                <p className="text-sm font-semibold text-foreground">
                  2 minutes ago
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">Confidence Score</p>
                <p className="text-sm font-bold text-foreground">{score}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">Market Regime</p>
                <p className="text-sm font-semibold text-foreground">{adaptive.modeLabel}</p>
              </div>
            </div>
          </div>

          {/* 2. SCORE BREAKDOWN */}
          <div className="space-y-6">
            <p className="text-[11px] uppercase text-muted-foreground/60 font-bold" style={{ letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>
              Score Breakdown
            </p>
            <div className="space-y-8">
              <ScoreBar 
                label="Yield Differential" 
                weight="40%" 
                score={components.yield_score} 
                contribution={yieldCont} 
                note="USDY yield spread vs mETH is moderate" 
              />
              <ScoreBar 
                label="Volatility Penalty" 
                weight="35%" 
                score={components.volatility_score} 
                contribution={volCont} 
                note="72h volatility is low — market is calm" 
              />
              <ScoreBar 
                label="Liquidity Depth" 
                weight="25%" 
                score={components.liquidity_score} 
                contribution={liqCont} 
                note="On-chain liquidity depth is adequate" 
              />
              <div className="flex justify-between items-center pt-4 border-t border-foreground/5">
                <span className="text-sm font-bold text-foreground">Total:</span>
                <span className="text-xl font-bold text-foreground">73.5 / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Countdown */}
        <div className="col-span-12 lg:col-span-5 space-y-12">
          {/* 3. THRESHOLD STATUS */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60 font-bold" style={{ letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>
              Threshold Status
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium">
                  Current threshold: {adaptive.confidenceThreshold}% ({adaptive.modeLabel} mode)
                </span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold ${statusOk ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {statusOk ? "Allocation approved" : "Rebalance recommended"}
                </span>
              </div>
              <div className="relative h-2 bg-foreground/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 rounded-full ${statusOk ? "bg-emerald-500/40" : "bg-amber-500/40"}`}
                />
                <div 
                  className="absolute inset-y-0 border-l border-foreground/20 z-10" 
                  style={{ left: `${adaptive.confidenceThreshold}%` }} 
                />
              </div>
            </div>
          </div>

          {/* 4. CIRCUIT BREAKER STATUS */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60 font-bold" style={{ letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>
              Safeguards
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-bold text-foreground">Circuit breaker: Armed</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                Will trigger if score drops 5+ points in 60 minutes
              </p>
              <p className="text-[11px] text-muted-foreground/40 pt-2 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                Last check: 14 seconds ago
              </p>
            </div>
          </div>

          {/* 5. NEXT SCAN */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60 font-bold" style={{ letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>
              Engine Status
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5">
              <p className="text-sm text-muted-foreground mb-1 font-medium">Next analysis in:</p>
              <p className="text-2xl font-bold text-foreground">
                {countdown} <span className="text-xs text-muted-foreground/50 font-medium">seconds</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, weight, score, contribution, note }: { label: string; weight: string; score: number; contribution: string; note: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase text-muted-foreground/50 block mb-1 font-bold" style={{ letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>{weight} weight</span>
          <span className="text-sm font-bold text-foreground">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block mb-1 font-bold">Score: {score}/100</span>
          <span className="text-[10px] text-foreground/60 font-bold">→ contribution: {contribution} pts</span>
        </div>
      </div>
      <div className="relative h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-foreground/20 rounded-full"
        />
      </div>
      <p className="text-[10px] text-muted-foreground font-medium italic">"{note}"</p>
    </div>
  );
}

