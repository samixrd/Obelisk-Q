import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStability } from "./StabilityContext";
import { MagneticText } from "./MagneticText";
import { RegimeMatrix } from "./RegimeMatrix";

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
    <motion.div {...fadeUp} className="col-span-12 border border-slate-200 bg-white rounded-sm p-8 md:p-12 space-y-16 mb-12 transition-all shadow-sm">
      {/* ── Section Title ────────────────────────────────────────────────── */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <p
          className="text-[10px] uppercase text-zinc-500 font-mono mb-3 tracking-[0.2em]"
        >
          <MagneticText disabled text="AI Decision Transparency" />
        </p>
        <h2
          className="text-2xl md:text-3xl font-light text-zinc-900 font-mono uppercase tracking-tighter"
        >
          <MagneticText disabled text="Supervisory logic " />
          <span className="font-semibold"><MagneticText text="by Obelisk Q" /></span>
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-12 md:gap-20">
        {/* ── Left Column: Decision & Breakdown ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-7 space-y-16">
          {/* 1. LAST DECISION CARD */}
          <div className="space-y-6">
            <p className="text-[10px] uppercase text-zinc-500 font-mono tracking-[0.2em]">
              Last Decision
            </p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 p-6 border border-slate-200 bg-[#fafafa]">
              <div>
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-1.5">Action Taken</p>
                <p className="text-sm font-bold text-zinc-900 font-mono leading-snug">
                  {statusOk ? `HOLD (Score ${score} ≥ ${adaptive.confidenceThreshold})` : `SYNC (Score ${score} < ${adaptive.confidenceThreshold})`}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-1.5">Timestamp</p>
                <p className="text-sm font-bold text-zinc-900 font-mono">
                  2 minutes ago
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-1.5">Confidence Score</p>
                <div className="text-2xl font-light text-zinc-900 font-mono tabular-nums tracking-tighter">
                   <MagneticText disabled text={String(score)} />
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-1.5">Market Regime</p>
                <p className="text-sm font-bold text-zinc-900 font-mono">{adaptive.modeLabel}</p>
              </div>
            </div>
          </div>

          {/* 2. SCORE BREAKDOWN */}
          <div className="space-y-8">
            <p className="text-[10px] uppercase text-zinc-500 font-mono tracking-[0.2em]">
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
              <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <span className="text-[9px] uppercase text-zinc-500 font-mono tracking-widest">Total Composite:</span>
                <div className="text-3xl font-light text-zinc-900 font-mono flex items-baseline gap-1 tabular-nums">
                   <MagneticText disabled text={String(score)} />
                   <span className="text-sm text-zinc-400 font-medium">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Status & Countdown ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5 space-y-16">



          {/* 4. HMM REGIME MATRIX */}
          <RegimeMatrix />


          {/* 5. SUPERVISORY CONFIGURATION */}
          <div className="space-y-6">
            <p className="text-[10px] uppercase text-zinc-500 font-mono tracking-[0.2em]">
              Framework Status
            </p>
            <div className="p-6 border border-slate-200 bg-[#fafafa] space-y-6">
              <div>
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-2">Antigravity Latency:</p>
                <div className="text-3xl font-light text-zinc-900 font-mono flex items-baseline gap-2 tabular-nums tracking-tighter">
                  <MagneticText disabled text="412" />
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">ms</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200">
                <p className="text-[9px] uppercase text-zinc-400 font-mono tracking-widest mb-2">Persistence Layer:</p>
                <span className="text-xs font-medium text-zinc-900 font-mono uppercase tracking-wider">Cloud Vector Storage (0% Local)</span>
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
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[9px] uppercase text-zinc-400 font-mono mb-1 tracking-widest block">{weight} weight</span>
          <span className="text-sm font-medium text-zinc-900 font-mono tracking-tight">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase text-zinc-400 font-mono mb-1 tracking-widest block">Score: {score}/100</span>
          <span className="text-sm text-emerald-600 font-mono font-medium tabular-nums">
             +<MagneticText disabled text={contribution} /> pts
          </span>
        </div>
      </div>
      <div className="flex h-[4px] w-full gap-[2px]">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: i < (score / 2.5) ? 1 : 0.08 }}
            transition={{ duration: 0.5, delay: i * 0.01 }}
            className="h-full flex-1 bg-zinc-800"
          />
        ))}
      </div>
      <p className="text-[10px] text-zinc-500 font-mono italic leading-relaxed mt-2">{note}</p>
    </div>
  );
}


