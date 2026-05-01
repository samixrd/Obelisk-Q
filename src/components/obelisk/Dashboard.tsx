import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Obelisk3D } from "./Obelisk3D";
import { OptimizationDial } from "./OptimizationDial";
import { StabilityGraph } from "./StabilityGraph";
import { ManagedAssets } from "./ManagedAssets";
import { SafeguardsView } from "./SafeguardsView";
import { StabilityScoreCard } from "./StabilityScoreCard";
import { IconArrowUpRight, IconArrowDownRight, IconArrowRight } from "./LineIcons";
import { useStability } from "./StabilityContext";

export type DashboardTab = "overview" | "performance" | "safeguards";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

interface DashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

export function Dashboard({ activeTab: externalTab, onTabChange }: DashboardProps) {
  const [internalTab, setInternalTab] = useState<DashboardTab>("overview");
  const tab = externalTab ?? internalTab;
  const { score } = useStability();

  const setTab = (t: DashboardTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  const glowIntensity =
    score >= 90
      ? "drop-shadow(0 0 32px hsl(104 100% 68% / 0.45))"
      : score >= 70
      ? "drop-shadow(0 0 16px hsl(104 100% 68% / 0.22))"
      : undefined;

  return (
    <main className="relative min-h-screen pb-20">

      {/* ── Hero Obelisk — sits below fixed header (header ≈ 72px) ── */}
      <section
        className="relative flex flex-col items-center justify-center"
        style={{ minHeight: "100svh", paddingTop: "96px" }}
      >
        <div className="absolute inset-0 vignette" />

        <div style={{ filter: glowIntensity, transition: "filter 2s ease" }}>
          <Obelisk3D />
        </div>

        {/* "Steady, precise" — clear of header at all scroll positions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="relative text-center pointer-events-none"
          style={{ zIndex: 10, marginTop: "24px" }}
        >
          <p
            className="text-[10px] uppercase text-muted-foreground mb-3"
            style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Salam · Agent Active · Stability {score}
          </p>
          <h2
            className="text-5xl md:text-6xl text-foreground"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: "-0.04em",
              fontWeight: 400,
            }}
          >
            Steady, <span className="italic" style={{ fontWeight: 300 }}>precise</span>.
          </h2>
        </motion.div>

        {/* ERC-8004 badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1.0 }}
          className="absolute top-28 right-6 z-20 hidden lg:flex items-center gap-2 px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{
              background: "hsl(104 100% 68%)",
              boxShadow: "0 0 5px hsl(104 100% 68% / 0.7)",
              animation: "pulse-neon 3.2s ease-in-out infinite",
            }}
          />
          <span
            className="text-[8px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.3em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ERC-8004 · Q-Agent
          </span>
        </motion.div>

        {/* ── Activate Investment — perfectly centred, metallic matte, hover glow ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
          style={{ marginTop: "40px", zIndex: 20 }}
        >
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group relative inline-flex items-center gap-3 pl-6 pr-3 py-2.5"
            style={{
              background:
                "linear-gradient(135deg, hsl(40 14% 86%) 0%, hsl(35 10% 70%) 40%, hsl(30 8% 52%) 70%, hsl(35 11% 76%) 100%)",
              border: "0.5px solid rgba(255,255,255,0.16)",
              boxShadow: "0 4px 24px -8px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.28)",
              transition: "box-shadow 0.5s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 32px rgba(255,255,255,0.10), 0 0 80px rgba(200,220,255,0.06), 0 4px 24px -8px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.28)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 24px -8px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.28)";
            }}
          >
            {/* Hover shimmer sweep */}
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              }}
            />
            <span
              className="relative text-[10px] uppercase text-black/75"
              style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Activate Investment
            </span>
            <span className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/10">
              <IconArrowRight size={11} className="text-black/65" />
            </span>
          </motion.button>

          <p
            className="text-[9px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Allocate idle capital
          </p>
        </motion.div>
      </section>

      {/* Q-Score Bar */}
      <div className="mx-auto max-w-[1400px] px-8 md:px-14 mt-8">
        <QScoreBar />
      </div>

      {/* Tab switcher */}
      <div className="mx-auto max-w-[1400px] px-8 md:px-14 mt-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-10">
            {(["overview", "performance", "safeguards"] as DashboardTab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className="relative group py-2">
                <span
                  className={`text-2xl md:text-3xl capitalize transition-colors duration-500 ${
                    tab === t
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  }`}
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {t === "overview" && "Overview"}
                  {t === "performance" && (
                    <>Perform<span className="italic">ance</span></>
                  )}
                  {t === "safeguards" && (
                    <>Safe<span className="italic">guards</span></>
                  )}
                </span>
                {tab === t && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute -bottom-[25px] left-0 right-0 h-px bg-foreground"
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}
          </div>
          <p
            className="hidden md:block text-[10px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.28em" }}
          >
            Last sync · 2s ago
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-8 md:px-14 mt-12">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" {...fadeUp} className="grid grid-cols-12 gap-6">

              <div className="col-span-12 lg:col-span-7 glass-card glass-card-hover rounded-sm p-10 min-h-[320px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[10px] uppercase text-muted-foreground mb-6"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      Balance
                    </p>
                    <p
                      className="text-6xl md:text-7xl text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                    >
                      $428,150<span className="text-muted-foreground">.24</span>
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-neon"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <IconArrowUpRight size={12} />
                    +2.41%
                  </span>
                </div>
                <div>
                  <div className="hairline mb-6" />
                  <div className="grid grid-cols-3 gap-8">
                    <Stat label="24h Yield" value="$1,032.18" />
                    <Stat label="Allocated" value="92.4%" />
                    <Stat label="In Reserve" value="$32,520" />
                  </div>
                </div>
              </div>

              <StabilityScoreCard />

              <div className="col-span-12 lg:col-span-8 glass-card glass-card-hover rounded-sm p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p
                      className="text-[10px] uppercase text-muted-foreground mb-2"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      System Health
                    </p>
                    <p
                      className="text-2xl text-foreground"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Stability · 30 days
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-6 text-[10px] uppercase text-muted-foreground"
                    style={{ letterSpacing: "0.25em" }}
                  >
                    <span>1D</span>
                    <span>7D</span>
                    <span className="text-foreground">30D</span>
                    <span>1Y</span>
                  </div>
                </div>
                <StabilityGraph seed={1} height={160} />
              </div>

              <div className="col-span-12 lg:col-span-4 glass-card glass-card-hover rounded-sm p-10 flex items-center justify-center">
                <OptimizationDial />
              </div>

              <div className="col-span-12 glass-card rounded-sm p-10">
                <div className="flex items-center justify-between mb-8">
                  <p
                    className="text-2xl text-foreground"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
                  >
                    Positions
                  </p>
                  <button
                    className="text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors"
                    style={{ letterSpacing: "0.28em" }}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-0">
                  {positions.map((p, i) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-12 items-center py-5 border-t border-border/50 hover:bg-foreground/[0.02] transition-colors duration-500"
                    >
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-metal/30 border border-border-strong/60 flex items-center justify-center">
                          <span
                            className="italic text-xs text-foreground/80"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                          >
                            {p.symbol}
                          </span>
                        </div>
                        <span
                          className="text-lg text-foreground"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <div
                        className="col-span-3 text-sm text-muted-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {p.strategy}
                      </div>
                      <div
                        className="col-span-2 text-sm text-foreground text-right"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {p.balance}
                      </div>
                      <div
                        className={`col-span-2 text-sm text-right flex items-center justify-end gap-1 ${
                          p.up ? "text-foreground/80" : "text-muted-foreground"
                        }`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {p.up ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                        {p.change}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <ManagedAssets />
            </motion.div>
          )}

          {tab === "performance" && (
            <motion.div key="performance" {...fadeUp} className="grid grid-cols-12 gap-6">
              <div className="col-span-12 glass-card rounded-sm p-10">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <p
                      className="text-[10px] uppercase text-muted-foreground mb-3"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      Cumulative Return · YTD
                    </p>
                    <p
                      className="text-7xl text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                    >
                      +14.82<span className="text-muted-foreground">%</span>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p
                      className="text-[10px] uppercase text-muted-foreground"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      Sharpe
                    </p>
                    <p
                      className="text-2xl text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      2.41
                    </p>
                  </div>
                </div>
                <StabilityGraph seed={3} height={220} />
              </div>

              {perfStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="col-span-12 md:col-span-6 lg:col-span-3 glass-card glass-card-hover rounded-sm p-8"
                >
                  <p
                    className="text-[10px] uppercase text-muted-foreground mb-5"
                    style={{ letterSpacing: "0.28em" }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-4xl text-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className={`mt-3 text-xs ${s.up ? "text-foreground/70" : "text-muted-foreground"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {s.delta}
                  </p>
                </motion.div>
              ))}

              <div className="col-span-12 glass-card rounded-sm p-10">
                <p
                  className="text-2xl text-foreground mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
                >
                  Monthly Returns
                </p>
                <div className="grid grid-cols-12 gap-3 items-end h-48">
                  {months.map((m, i) => (
                    <div key={m.label} className="flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${m.value}%` }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full ${
                          m.value > 0
                            ? "bg-gradient-to-t from-foreground/5 to-foreground/40"
                            : "bg-muted"
                        }`}
                        style={{ minHeight: "2px" }}
                      />
                      <span
                        className="text-[10px] uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.25em" }}
                      >
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "safeguards" && (
            <motion.div key="safeguards">
              <SafeguardsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative mx-auto max-w-[1400px] px-8 md:px-14 mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-6 flex items-end justify-center overflow-hidden select-none"
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: "-0.04em",
              fontSize: "clamp(80px, 12vw, 180px)",
              fontStyle: "italic",
              lineHeight: 1,
              background:
                "linear-gradient(180deg, hsl(0 0% 100% / 0.04) 0%, hsl(0 0% 100% / 0) 80%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Mantle
          </span>
        </div>
        <div className="hairline mb-6" />
        <div
          className="relative flex items-center justify-between text-[10px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.28em" }}
        >
          <span>Obelisk Q</span>
          <span
            className="italic text-sm normal-case text-muted-foreground/80"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "normal" }}
          >
            A quiet intelligence.
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            Powered by Mantle · v 1.0
          </span>
        </div>
      </div>
    </main>
  );
}

function QScoreBar() {
  const { adaptive, setVolatility } = useStability();
  const isHighVol = adaptive.volatility === "high";

  const metrics = [
    { label: "Yield Score", value: "94", unit: "/100", color: "hsl(104 100% 68%)" },
    { label: "Risk Score", value: "0.42", unit: "σ", color: "hsl(200 100% 72%)" },
    { label: "Accuracy", value: "98.7", unit: "%", color: "hsl(40 100% 72%)" },
    { label: "Uptime", value: "99.9", unit: "%", color: "hsl(270 80% 80%)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-sm px-8 py-4 flex items-center justify-between gap-6"
    >
      {/* Left: identity */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        <span
          className="text-[9px] uppercase text-muted-foreground"
          style={{ letterSpacing: "0.35em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          ERC-8004 · Q-Score
        </span>
      </div>

      {/* Centre: metrics */}
      <div className="flex items-center gap-8 flex-1 justify-center">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
            className="flex items-center gap-3"
          >
            <span
              className="text-[9px] uppercase text-muted-foreground hidden lg:block"
              style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {m.label}
            </span>
            <span className="text-[10px] text-muted-foreground hidden lg:block">·</span>
            <span
              className="text-sm"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "-0.02em",
                color: m.color,
                textShadow: `0 0 12px ${m.color}55`,
              }}
            >
              {m.value}
              <span className="text-[10px] text-muted-foreground ml-0.5">{m.unit}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Right: regime toggle (demo control) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="text-[9px] uppercase text-muted-foreground hidden xl:block"
          style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Regime
        </span>
        {/* Pill toggle: Stable ↔ Risk-Averse */}
        <button
          onClick={() => setVolatility(isHighVol ? "low" : "high")}
          className="relative flex items-center gap-0 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            height: "24px",
          }}
          title="Toggle volatility regime (demo)"
        >
          {(["low", "high"] as const).map((v) => (
            <span
              key={v}
              className="relative z-10 px-3 text-[9px] uppercase transition-colors duration-500"
              style={{
                letterSpacing: "0.2em",
                fontFamily: "'JetBrains Mono', monospace",
                color:
                  adaptive.volatility === v
                    ? v === "high"
                      ? "hsl(30 100% 70%)"
                      : "hsl(104 100% 68%)"
                    : "rgba(255,255,255,0.22)",
              }}
            >
              {v === "low" ? "Stable" : "High Volatility"}
            </span>
          ))}
          {/* Sliding pill */}
          <motion.span
            className="absolute top-0 bottom-0 w-1/2 pointer-events-none"
            animate={{ x: isHighVol ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: isHighVol
                ? "rgba(255, 160, 60, 0.10)"
                : "rgba(100, 255, 120, 0.07)",
              borderRight: isHighVol ? "none" : "0.5px solid rgba(255,255,255,0.09)",
              borderLeft: isHighVol ? "0.5px solid rgba(255,255,255,0.09)" : "none",
            }}
          />
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.28em" }}>
        {label}
      </p>
      <p className="text-lg text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
    </div>
  );
}

const positions = [
  { symbol: "M", name: "Mantle Core Yield", strategy: "Conservative · Auto", balance: "$182,430", change: "+0.82%", up: true },
  { symbol: "L", name: "Liquid Staking Blend", strategy: "Balanced · Auto", balance: "$98,210", change: "+1.24%", up: true },
  { symbol: "S", name: "Stable Reserves", strategy: "Capital preservation", balance: "$84,020", change: "+0.12%", up: true },
  { symbol: "G", name: "Growth Basket", strategy: "Ambitious · Manual", balance: "$63,490", change: "-0.34%", up: false },
];

const perfStats = [
  { label: "30-Day Return", value: "+4.12%", delta: "+0.84% vs prev", up: true },
  { label: "Max Drawdown", value: "-1.84%", delta: "well contained", up: false },
  { label: "Win Rate", value: "86%", delta: "+3% MoM", up: true },
  { label: "Avg. Volatility", value: "0.42σ", delta: "stable", up: true },
];

const months = [
  { label: "May", value: 22 },
  { label: "Jun", value: 48 },
  { label: "Jul", value: 31 },
  { label: "Aug", value: 62 },
  { label: "Sep", value: 12 },
  { label: "Oct", value: 54 },
  { label: "Nov", value: 38 },
  { label: "Dec", value: 71 },
  { label: "Jan", value: 44 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 33 },
  { label: "Apr", value: 67 },
];
