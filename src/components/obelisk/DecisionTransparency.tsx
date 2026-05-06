import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStability } from "./StabilityContext";
import { MagneticText } from "./MagneticText";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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
    <motion.div {...fadeUp} className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 space-y-16 mb-12 transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
      {/* ── Section Title ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p
          className="text-[10px] uppercase text-muted-foreground/40 mb-3 font-bold tracking-[0.28em]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <MagneticText disabled text="AI Decision Transparency" />
        </p>
        <h2
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}
        >
          <MagneticText disabled text="Supervisory logic" />
          <MagneticText text="by Obelisk Q" />
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-12 md:gap-20">
        {/* ── Left Column: Decision & Breakdown ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-7 space-y-16">
          {/* 1. LAST DECISION CARD */}
          <div className="space-y-6">
            <p className="text-[11px] uppercase text-muted-foreground/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Last Decision
            </p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <p className="text-[11px] text-muted-foreground/40 mb-2 font-medium">Action Taken</p>
                <p className="text-[15px] font-bold text-foreground leading-snug">
                  {statusOk ? "Hold — score within safe range" : "Rebalance — risk threshold exceeded"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/40 mb-2 font-medium">Timestamp</p>
                <p className="text-[15px] font-bold text-foreground">
                  2 minutes ago
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/40 mb-2 font-medium">Confidence Score</p>
                <div className="text-xl font-bold text-foreground">
                   <MagneticText disabled text={String(score)} />
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/40 mb-2 font-medium">Market Regime</p>
                <p className="text-[15px] font-bold text-foreground">{adaptive.modeLabel}</p>
              </div>
            </div>
          </div>

          {/* 2. SCORE BREAKDOWN */}
          <div className="space-y-8">
            <p className="text-[11px] uppercase text-muted-foreground/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Score Breakdown
            </p>
            <div className="space-y-10">
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
              <div className="flex justify-between items-center pt-8 border-t border-black/[0.04]">
                <span className="text-sm font-bold text-black/40 uppercase tracking-widest">Total:</span>
                <div className="text-2xl font-bold text-black flex items-baseline gap-2">
                   <MagneticText disabled text="73.5" />
                   <span className="text-sm text-black/20">/ 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Status & Countdown ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5 space-y-16">

import { RegimeMatrix } from "./RegimeMatrix";

          {/* 4. HMM REGIME MATRIX */}
          <RegimeMatrix />


          {/* 5. SUPERVISORY CONFIGURATION */}
          <div className="space-y-6">
            <p className="text-[11px] uppercase text-muted-foreground/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Framework Status
            </p>
            <div className="p-8 rounded-[32px] bg-black/[0.02] border border-black/[0.04] space-y-6">
              <div>
                <p className="text-[11px] text-muted-foreground/40 mb-3 font-bold uppercase tracking-wider">Antigravity Latency:</p>
                <div className="text-3xl font-bold text-black flex items-baseline gap-2">
                  <MagneticText disabled text="412" />
                  <span className="text-xs text-black/20 font-bold uppercase tracking-widest">ms</span>
                </div>
              </div>
              <div className="pt-6 border-t border-black/5">
                <p className="text-[11px] text-muted-foreground/40 mb-3 font-bold uppercase tracking-wider">Persistence Layer:</p>
                <span className="text-[13px] font-bold text-black uppercase tracking-widest">Cloud Vector Storage (0% Local Disk)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, weight, score, contribution, note }: { label: string; weight: string; score: number; contribution: string; note: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase text-muted-foreground/30 block mb-1.5 font-bold tracking-[0.1em]">{weight} weight</span>
          <span className="text-sm font-bold text-black">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground/40 block mb-1 font-bold">Score: {score}/100</span>
          <span className="text-[11px] text-black font-bold">
             +<MagneticText disabled text={contribution} /> pts
          </span>
        </div>
      </div>
      <div className="relative h-1.5 w-full bg-black/[0.04] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 bg-black/20 rounded-full"
        />
      </div>
      <p className="text-[11px] text-muted-foreground/40 font-medium italic leading-relaxed">"{note}"</p>
    </div>
  );
}


