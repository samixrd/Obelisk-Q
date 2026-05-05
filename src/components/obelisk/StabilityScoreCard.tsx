// StabilityScoreCard — the enriched stability card with mobile fixes
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useStability } from "./StabilityContext";

const ENGINE_WEIGHTS = [
  {
    label: "Yield Differential",
    pct: 40,
    description: "The spread between current yield and 30-day baseline.",
  },
  {
    label: "Volatility Penalty",
    pct: 35,
    description: "Realised volatility measured over a 14-day window.",
  },
  {
    label: "Liquidity Depth",
    pct: 25,
    description: "On-chain order-book depth and redemption capacity.",
  },
];

function InfoIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" style={{ transition: "opacity 0.3s ease" }}>
      <circle cx="8" cy="8" r="6.5" stroke={open ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)"} strokeWidth="0.9" />
      <path d="M8 7v4M8 5.5v.5" stroke={open ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)"} strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function AdaptiveThresholdIndicator() {
  const { adaptive, score } = useStability();
  const isHighVol = adaptive.volatility === "high";

  const currentThreshold = isHighVol
    ? Math.round(72 + ((74 - Math.min(score, 74)) / 74) * 8)
    : Math.round(65 + ((100 - Math.max(score, 75)) / 25) * 7);

  const accentColor   = isHighVol ? "hsl(30 100% 40%)"  : "hsl(104 100% 35%)";
  const barGradient   = isHighVol
    ? "linear-gradient(90deg, hsl(30 100% 40% / 0.2), hsl(30 100% 40%))"
    : "linear-gradient(90deg, hsl(104 100% 35% / 0.2), hsl(104 100% 35%))";

  return (
    <motion.div layout className="mt-5 pt-5 border-t border-foreground/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] uppercase text-muted-foreground" style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
          Threshold
        </span>
        <AnimatePresence mode="wait">
          <motion.span key={currentThreshold} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-xl leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em", color: accentColor }}>
            {currentThreshold}<span className="text-[11px] ml-0.5 opacity-60">%</span>
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative h-1 w-full bg-foreground/5 rounded-full mb-4 overflow-hidden">
        <motion.div className="absolute top-0 left-0 h-full" animate={{ width: `${currentThreshold}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} style={{ background: barGradient }} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase text-muted-foreground" style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
          Regime
        </span>
        <span className="text-[9px] text-muted-foreground/30">·</span>
        <AnimatePresence mode="wait">
          <motion.span key={adaptive.marketRegime} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[9px] uppercase font-medium" style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace", color: accentColor }}>
            {adaptive.marketRegime}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EngineLogicPanel() {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
      <div className="mt-5 pt-5 space-y-4 border-t border-foreground/5">
        <p className="text-[9px] uppercase text-muted-foreground" style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}>
          Composition
        </p>
        {ENGINE_WEIGHTS.map((w, i) => (
          <motion.div key={w.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-foreground/70 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{w.label}</span>
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.pct}%</span>
            </div>
            <div className="relative h-0.5 w-full bg-foreground/5 mb-2">
              <motion.div className="absolute top-0 left-0 h-full bg-foreground/20" initial={{ width: 0 }} animate={{ width: `${w.pct}%` }} transition={{ delay: 0.15 + i * 0.07, duration: 0.9 }} />
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function StabilityScoreCard() {
  const { score } = useStability();
  const [engineOpen, setEngineOpen] = useState(false);

  return (
    <div className="col-span-12 glass-card rounded-3xl p-8 md:p-10 min-h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.28em" }}>Stability Score</p>
          <motion.button onClick={() => setEngineOpen((v) => !v)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-[9px] uppercase text-muted-foreground/50 hover:text-foreground transition-colors" style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}>
            <InfoIcon open={engineOpen} />
            <span>Engine</span>
          </motion.button>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-6xl md:text-7xl text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>{score}</span>
          <span className="text-2xl md:text-3xl text-muted-foreground mb-2 md:mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>/ 100</span>
        </div>

        <p className="text-sm text-muted-foreground mt-5 leading-relaxed">Your portfolio is within optimal risk parameters. No intervention required.</p>

        <AnimatePresence>{engineOpen && <EngineLogicPanel />}</AnimatePresence>
        <AdaptiveThresholdIndicator />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 mt-8 md:mt-6 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} className="h-6 w-px md:w-[2px] rounded-full"
            animate={{ backgroundColor: i < Math.round(score / 5) ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.06)" }}
            transition={{ duration: 0.5, delay: i * 0.02 }} />
        ))}
      </div>
    </div>
  );
}
