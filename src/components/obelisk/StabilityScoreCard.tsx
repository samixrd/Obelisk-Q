// StabilityScoreCard — the enriched stability card with:
//   • Engine logic breakdown (40 / 35 / 25 weights + 5% circuit breaker)
//   • Expandable info panel (no tooltip: stays accessible, fits LuxOS prose style)
//   • Adaptive Threshold Indicator (Stable 65% ↔ High Volatility 80%)
//   • Live current-threshold reading interpolated from score
//   • Regime detection label (Trending / Sideways)
// Fully LuxOS-compliant: no bold text, serif headings, mono numbers, hairline borders.

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useStability } from "./StabilityContext";

// ─── Engine weight data ───────────────────────────────────────────────────────

const ENGINE_WEIGHTS = [
  {
    label: "Yield Differential",
    pct: 40,
    description:
      "The spread between the current asset yield and a rolling 30-day baseline. A narrowing spread reduces the contribution to the score.",
  },
  {
    label: "Volatility Penalty",
    pct: 35,
    description:
      "Realised volatility (σ) measured over a 14-day window, inverted and scaled. Higher volatility subtracts proportionally from the composite.",
  },
  {
    label: "Liquidity Depth",
    pct: 25,
    description:
      "On-chain order-book depth and redemption capacity across managed positions. Shallow markets compress this component toward zero.",
  },
];

// ─── Info Icon ────────────────────────────────────────────────────────────────

function InfoIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      style={{ transition: "opacity 0.3s ease" }}
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke={open ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)"}
        strokeWidth="0.9"
      />
      <path
        d="M8 7v4M8 5.5v.5"
        stroke={open ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)"}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Adaptive Threshold Indicator ─────────────────────────────────────────────
// Shows:
//   • Current Confidence Threshold — a live interpolated value between 65–80
//   • Mode label in exact format: "Mode: Stable (Threshold: 65%)"
//     or "Mode: High Volatility (Threshold: 80%)"
//   • Animated fill bar with glowing tick at the mode threshold
//   • Regime label (Trending / Sideways)

function AdaptiveThresholdIndicator() {
  const { adaptive, score } = useStability();
  const isHighVol = adaptive.volatility === "high";

  // Current threshold: interpolated live reading.
  // Stable range:       65–72   (score 75–100 maps linearly)
  // High-vol range:     72–80   (score 0–74 maps linearly)
  const currentThreshold = isHighVol
    ? Math.round(72 + ((74 - Math.min(score, 74)) / 74) * 8)   // 72 → 80
    : Math.round(65 + ((100 - Math.max(score, 75)) / 25) * 7); // 65 → 72

  const accentColor   = isHighVol ? "hsl(30 100% 70%)"  : "hsl(104 100% 68%)";
  const accentShadow  = isHighVol ? "hsl(30 100% 70% / 0.4)" : "hsl(104 100% 68% / 0.4)";
  const barGradient   = isHighVol
    ? "linear-gradient(90deg, hsl(30 100% 70% / 0.5), hsl(30 100% 70%))"
    : "linear-gradient(90deg, hsl(104 100% 68% / 0.5), hsl(104 100% 68%))";

  return (
    <motion.div
      layout
      className="mt-5 pt-5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >

      {/* ── Row 1: section label + current threshold reading ── */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Confidence Threshold
        </span>

        {/* Live current value — the prominent number */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentThreshold}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[22px] leading-none"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.04em",
              color: accentColor,
              textShadow: `0 0 18px ${accentShadow}`,
            }}
          >
            {currentThreshold}
            <span
              className="text-[11px] ml-0.5"
              style={{ color: accentColor, opacity: 0.65 }}
            >
              %
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Row 2: mode status label (exact format) ── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={adaptive.thresholdLabel}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] mb-4"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
            color: accentColor,
            textShadow: `0 0 10px ${accentShadow}`,
          }}
        >
          {adaptive.thresholdLabel}
        </motion.p>
      </AnimatePresence>

      {/* ── Threshold bar ── */}
      <div className="relative h-px w-full mb-1" style={{ background: "rgba(255,255,255,0.08)" }}>

        {/* Current-value fill */}
        <motion.div
          className="absolute top-0 left-0 h-px"
          animate={{ width: `${currentThreshold}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: barGradient, opacity: 0.45 }}
        />

        {/* Mode-threshold fill (solid, on top) */}
        <motion.div
          className="absolute top-0 left-0 h-px"
          animate={{ width: `${adaptive.confidenceThreshold}%` }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: barGradient }}
        />

        {/* Glowing tick at mode threshold */}
        <motion.div
          className="absolute w-px h-[7px]"
          style={{ top: "-3px" }}
          animate={{ left: `${adaptive.confidenceThreshold}%` }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-full h-full"
            style={{
              background: accentColor,
              boxShadow: `0 0 5px ${accentShadow}`,
            }}
          />
        </motion.div>

        {/* Secondary tick at current threshold */}
        <motion.div
          className="absolute w-px h-[5px]"
          style={{ top: "-2px" }}
          animate={{ left: `${currentThreshold}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-full h-full"
            style={{ background: accentColor, opacity: 0.4 }}
          />
        </motion.div>
      </div>

      {/* Scale labels */}
      <div className="flex items-center justify-between mt-1.5 mb-4">
        <span
          className="text-[9px] text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          0%
        </span>
        <span
          className="text-[9px] text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          100%
        </span>
      </div>

      {/* ── Prose context ── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={adaptive.modeLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-[10px] leading-relaxed mb-3"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.015em",
          }}
        >
          {isHighVol
            ? `Elevated volatility detected. The engine has raised the bar — only signals crossing ${adaptive.confidenceThreshold}% confidence clear for allocation. Current reading: ${currentThreshold}%.`
            : `Conditions are calm. Signals above ${adaptive.confidenceThreshold}% qualify for allocation. Current reading: ${currentThreshold}%.`}
        </motion.p>
      </AnimatePresence>

      {/* ── Market Regime label ── */}
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Market Regime
        </span>
        <span className="text-[9px] text-muted-foreground/35">·</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={adaptive.marketRegime}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[9px] uppercase"
            style={{
              letterSpacing: "0.2em",
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            {adaptive.marketRegime}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Engine Logic Panel ───────────────────────────────────────────────────────

function EngineLogicPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div
        className="mt-5 pt-5 space-y-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Section heading */}
        <p
          className="text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Engine composition
        </p>

        {/* Weight rows */}
        {ENGINE_WEIGHTS.map((w, i) => (
          <motion.div
            key={w.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label + percentage */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[11px] text-foreground/70"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  letterSpacing: "-0.01em",
                }}
              >
                {w.label}
              </span>
              <span
                className="text-[10px] text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}
              >
                {w.pct}%
              </span>
            </div>

            {/* Weight bar */}
            <div className="relative h-px w-full bg-foreground/8 mb-2">
              <motion.div
                className="absolute top-0 left-0 h-px bg-foreground/35"
                initial={{ width: 0 }}
                animate={{ width: `${w.pct}%` }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* Description */}
            <p
              className="text-[10px] leading-relaxed text-muted-foreground/60"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.01em" }}
            >
              {w.description}
            </p>
          </motion.div>
        ))}

        {/* Divider */}
        <div className="h-px bg-foreground/6" />

        {/* Circuit breaker note */}
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 h-1 w-1 rounded-full flex-shrink-0"
            style={{
              background: "hsl(0 70% 62%)",
              boxShadow: "0 0 5px hsl(0 70% 62% / 0.5)",
            }}
          />
          <p
            className="text-[10px] leading-relaxed"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.01em",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            A 5% circuit breaker is active at all times. If the composite score
            deteriorates by 5 points or more within any 60-minute window, all
            pending allocations are halted and the Safety Buffer is deployed
            before any drawdown reaches principal.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stability Score Card (exported) ─────────────────────────────────────────

export function StabilityScoreCard() {
  const { score } = useStability();
  const [engineOpen, setEngineOpen] = useState(false);

  return (
    <div className="col-span-12 lg:col-span-5 glass-card glass-card-hover rounded-sm p-10 min-h-[320px] flex flex-col justify-between">

      {/* ── Top: label + info toggle ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p
            className="text-[10px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.28em" }}
          >
            Stability Score
          </p>

          {/* Info toggle — opens engine logic panel */}
          <motion.button
            onClick={() => setEngineOpen((v) => !v)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 transition-opacity duration-300"
            aria-label={engineOpen ? "Hide engine logic" : "Show engine logic"}
            title="Engine composition"
          >
            <InfoIcon open={engineOpen} />
            <span
              className="text-[9px] uppercase"
              style={{
                letterSpacing: "0.22em",
                fontFamily: "'JetBrains Mono', monospace",
                color: engineOpen ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)",
                transition: "color 0.3s ease",
              }}
            >
              Engine
            </span>
          </motion.button>
        </div>

        {/* Score display */}
        <div className="flex items-end gap-4">
          <span
            className="text-7xl text-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
          >
            {score}
          </span>
          <span
            className="italic text-3xl text-muted-foreground mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            / 100
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-5 max-w-xs leading-relaxed">
          Your portfolio is within optimal risk parameters. No intervention required.
        </p>

        {/* Engine logic panel — collapsible */}
        <AnimatePresence>
          {engineOpen && <EngineLogicPanel />}
        </AnimatePresence>

        {/* Adaptive Threshold Indicator — always visible */}
        <AdaptiveThresholdIndicator />
      </div>

      {/* ── Bottom: tick-mark bar ── */}
      <div className="flex items-center gap-2 mt-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-6 w-px"
            animate={{
              backgroundColor:
                i < Math.round(score / 5)
                  ? "rgba(255,255,255,0.70)"
                  : "rgba(255,255,255,0.10)",
            }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
          />
        ))}
      </div>
    </div>
  );
}
