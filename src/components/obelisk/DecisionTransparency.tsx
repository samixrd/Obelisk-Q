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
    <motion.div {...fadeUp} className="col-span-12 glass-card rounded-2xl p-6 md:p-10 space-y-12 mb-12">
      {/* Section Title */}
      <div>
        <p
          className="text-[10px] uppercase text-muted-foreground mb-2"
          style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          AI Decision Transparency
        </p>
        <h2
          className="text-2xl font-semibold text-foreground"
        >
          Why the agent acted
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Decision & Breakdown */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          {/* 1. LAST DECISION CARD */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60" style={{ letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" }}>
              Last Decision
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Action Taken</p>
                <p className="text-sm font-medium text-foreground">
                  {statusOk ? "Hold — score within safe range" : "Rebalance — risk threshold exceeded"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm font-mono-num text-foreground">
                  {lastFetched ? `${Math.floor((Date.now() - lastFetched) / 60000)}m ago` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Confidence Score</p>
                <p className="text-sm font-mono-num text-foreground">{score}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Market Regime</p>
                <p className="text-sm font-medium text-foreground">{adaptive.modeLabel}</p>
              </div>
            </div>
          </div>

          {/* 2. SCORE BREAKDOWN */}
          <div className="space-y-6">
            <p className="text-[11px] uppercase text-muted-foreground/60" style={{ letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" }}>
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
                <span className="text-sm font-semibold text-foreground">Total System Confidence</span>
                <span className="text-xl font-mono-num text-foreground">{score.toFixed(1)} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Countdown */}
        <div className="col-span-12 lg:col-span-5 space-y-12">
          {/* 3. THRESHOLD STATUS */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60" style={{ letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" }}>
              Threshold Status
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Current threshold: {adaptive.confidenceThreshold}% ({adaptive.modeLabel} mode)
                </span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${statusOk ? "text-neon border-neon/20 bg-neon/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {statusOk ? "Allocation approved" : "Rebalance recommended"}
                </span>
              </div>
              <div className="relative h-2 bg-foreground/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 rounded-full ${statusOk ? "bg-neon/40" : "bg-amber-500/40"}`}
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
            <p className="text-[11px] uppercase text-muted-foreground/60" style={{ letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" }}>
              Safeguards
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_hsl(var(--neon))]" />
                <span className="text-sm font-medium text-foreground">Circuit breaker: Armed</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Will trigger if score drops 5+ points in 60 minutes
              </p>
            </div>
          </div>

          {/* 5. NEXT SCAN */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/60" style={{ letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" }}>
              Engine Status
            </p>
            <div className="p-6 rounded-2xl bg-foreground/[0.015] border border-foreground/5">
              <p className="text-sm text-muted-foreground mb-1">Next analysis in:</p>
              <p className="text-3xl font-mono-num text-foreground">
                {countdown} <span className="text-xs text-muted-foreground/50">s</span>
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
          <span className="text-[10px] uppercase text-muted-foreground/50 block mb-1" style={{ letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>{weight} weight</span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block mb-1 font-mono-num">{score}/100</span>
          <span className="text-[10px] text-foreground/60 font-mono-num">+{contribution} pts</span>
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
      <p className="text-[10px] text-muted-foreground">"{note}"</p>
    </div>
  );
}
