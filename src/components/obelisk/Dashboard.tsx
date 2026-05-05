import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

import { OptimizationDial } from "./OptimizationDial";
import { StabilityGraph } from "./StabilityGraph";
import { ManagedAssets } from "./ManagedAssets";
import { DecisionTransparency } from "./DecisionTransparency";
import { SafeguardsView } from "./SafeguardsView";
import { PortfolioView } from "./PortfolioView";
import { AgentLogsView } from "./AgentLogsView";
import { PreferencesView } from "./PreferencesView";
import { AssetsView } from "./AssetsView";
import { StabilityScoreCard } from "./StabilityScoreCard";
import { YieldEstimator } from "./YieldEstimator";
import { IconArrowUpRight, IconArrowDownRight } from "./LineIcons";
import { InvestModal } from "./InvestModal";
import { Logo } from "./Logo";
import { useStability } from "./StabilityContext";
import { useVault } from "@/hooks/useVault";
import { useYieldData } from "@/hooks/useYieldData";
import { useAgentFeed } from "@/hooks/useAgentFeed";

export type DashboardTab =
  | "earn"
  | "performance"
  | "safeguards"
  | "portfolio"
  | "agent-logs"
  | "preferences"
  | "assets";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

interface DashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

export function Dashboard({ activeTab: externalTab, onTabChange, walletAddress, onConnectWallet }: DashboardProps) {
  const [internalTab, setInternalTab] = useState<DashboardTab>("earn");
  const tab = externalTab ?? internalTab;
  const { engineError, engineLoading, lastFetched } = useStability();
  const { vaultStats } = useVault();
  const { logs } = useAgentFeed();

  // Human-readable sync label for the tab bar
  const syncLabel = engineError
    ? "Engine offline"
    : engineLoading
    ? "Connecting..."
    : lastFetched
    ? `Live · ${Math.round((Date.now() - lastFetched) / 1000)}s ago`
    : "Live";

  // When tab changes, always snap to top so the content is immediately visible
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  const setTab = (t: DashboardTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  const [investOpen, setInvestOpen] = useState(false);

  return (
    <main className="relative min-h-screen pb-20">
      {/* Global background vignette */}
      <div className="absolute inset-0 vignette" />

      {/* Push content below fixed header */}
      <div style={{ height: "72px" }} />

      {/* Main Stats Header */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-6 md:mt-8 mb-8 z-10">
        <QScoreBar />
      </div>


      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-14 mt-8 md:mt-12">
        <AnimatePresence mode="wait">
          {tab === "earn" && (
            <motion.div key="earn" {...fadeUp} className="grid grid-cols-12 gap-5 md:gap-6">
              <div className="col-span-12 lg:col-span-7 glass-card rounded-2xl p-6 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col justify-between">
                <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6 md:gap-0">
                  <div>
                    <p
                      className="text-[10px] uppercase text-muted-foreground mb-4 md:mb-6"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      Balance (MNT)
                    </p>
                    <p
                      className="text-4xl md:text-7xl text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                    >
                      {vaultStats?.userBalance?.split('.')[0] ?? "0"}<span className="text-muted-foreground">.{vaultStats?.userBalance?.split('.')[1] ?? "0000"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] text-neon"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <IconArrowUpRight size={12} />
                      +2.41%
                    </span>
                    <button
                      onClick={() => setInvestOpen(true)}
                      className="px-6 py-2.5 bg-[#0a0a0a] text-white text-[13px] font-bold rounded-full hover:bg-[#222] transition-colors shadow-lg shadow-black/5"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
                <div>
                  <div className="hairline mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    <Stat label="24h Yield" value="$1,032.18" />
                    <Stat label="Allocated" value="92.4%" />
                    <Stat label="In Reserve" value="$32,520" />
                  </div>
                </div>
              </div>
              <StabilityScoreCard />
              <YieldEstimator />
              

              <ManagedAssets />
            </motion.div>
          )}


          {tab === "performance" && (
            <motion.div key="performance" {...fadeUp} className="grid grid-cols-12 gap-5 md:gap-6">
              <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                  <div>
                    <p
                      className="text-[10px] uppercase text-muted-foreground mb-4"
                      style={{ letterSpacing: "0.28em" }}
                    >
                      Cumulative Return · YTD
                    </p>
                    <p
                      className="text-5xl md:text-7xl text-foreground"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                    >
                      +14.82<span className="text-muted-foreground">%</span>
                    </p>
                  </div>
                  <div className="flex md:block items-center gap-4 md:text-right md:space-y-1">
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
                  className="col-span-6 lg:col-span-3 glass-card rounded-2xl p-6 md:p-8"
                >
                  <p
                    className="text-[9px] md:text-[10px] uppercase text-muted-foreground mb-4 md:mb-5 truncate"
                    style={{ letterSpacing: "0.28em" }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-2xl md:text-4xl text-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className={`mt-2 md:mt-3 text-[10px] md:text-xs ${s.up ? "text-foreground/70" : "text-muted-foreground"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {s.delta}
                  </p>
                </motion.div>
              ))}

              <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
                <p
                  className="text-2xl text-foreground mb-8"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
                >
                  Monthly Returns
                </p>
                <div className="grid grid-cols-12 gap-1.5 md:gap-3 items-end h-48">
                  {months.map((m, i) => (
                    <div key={m.label} className="flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${m.value}%` }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full max-w-[12px] md:max-w-none ${
                          m.value > 0
                            ? "bg-gradient-to-t from-foreground/5 to-foreground/40"
                            : "bg-muted"
                        }`}
                        style={{ minHeight: "2px", borderRadius: "1px 1px 0 0" }}
                      />
                      <span
                        className="text-[8px] md:text-[10px] uppercase text-muted-foreground -rotate-45 md:rotate-0 mt-2 md:mt-0"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        {m.label.slice(0, 3)}
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

          {tab === "portfolio" && (
            <motion.div key="portfolio" {...fadeUp}>
              <PortfolioView />
            </motion.div>
          )}

          {tab === "agent-logs" && (
            <motion.div key="agent-logs" {...fadeUp}>
              <AgentLogsView />
            </motion.div>
          )}

          {tab === "preferences" && (
            <motion.div key="preferences" {...fadeUp}>
              <PreferencesView walletAddress={walletAddress} onConnectWallet={onConnectWallet} />
            </motion.div>
          )}

          {tab === "assets" && (
            <motion.div key="assets" {...fadeUp}>
              <AssetsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-6 flex items-end justify-center overflow-hidden select-none"
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.04em",
              fontSize: "clamp(60px, 10vw, 140px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "rgba(0,0,0,0.04)",
            }}
          >
            Mantle
          </span>
        </div>
        <div className="hairline mb-6" />
        <div
          className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-[10px] uppercase text-muted-foreground text-center md:text-left"
          style={{ letterSpacing: "0.28em" }}
        >
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span>Obelisk Q</span>
          </div>
          <span
            style={{ fontSize: 14, color: "#aaa", letterSpacing: "normal" }}
          >
            A quiet intelligence.
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            Powered by Mantle · v 1.0
          </span>
        </div>
      </div>
      <InvestModal open={investOpen} onClose={() => setInvestOpen(false)} />
    </main>
  );
}

function QScoreBar() {
  const { adaptive, setVolatility, engineLoading, engineError, components } = useStability();
  const isHighVol = adaptive.volatility === "high";

  const { usdy, meth } = useYieldData();
  const spread = Math.abs(usdy.apy - meth.apy).toFixed(1);

  const metrics = [
    { 
      label: "Live Yields",   
      value: `USDY ${usdy.apy.toFixed(1)}% · mETH ${meth.apy.toFixed(1)}% · Spread ${spread}%`, 
      unit: "", 
      color: "#000" 
    },
    { label: "Risk Score",    value: "0.42",                                                                   unit: "σ",    color: "#000" },
    { label: "Accuracy",      value: engineLoading ? "—" : String(Math.round(components.volatility_score)),  unit: "%",    color: "#000" },
    { label: "Uptime",        value: "99.9",                                                                   unit: "%",    color: "#000" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card-premium rounded-[24px] px-6 md:px-10 py-5 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12"
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03), inset 0 0 20px rgba(255,255,255,0.4)"
      }}
    >
      {/* Left: identity */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="h-10 w-10 rounded-2xl bg-foreground flex items-center justify-center shadow-lg shadow-foreground/10">
          <Logo size={22} className="text-background" />
        </div>
        <div className="flex flex-col">
          <span
            className="text-[10px] font-bold uppercase text-foreground/90 tracking-[0.2em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Q-Score Engine
          </span>
          <span
            className="text-[9px] uppercase text-muted-foreground/60 tracking-[0.1em] font-mono"
          >
            ERC-8004 Protocol
          </span>
        </div>
        <div className="hidden xl:block h-8 w-px bg-foreground/5 ml-2" />
      </div>

      {/* Centre: metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:flex items-center gap-x-12 gap-y-6 md:gap-10 flex-1 justify-center w-full md:w-auto">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
            className="flex flex-col items-center lg:items-start gap-1"
          >
            <span
              className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
            >
              {m.label}
            </span>
            <span
              className="text-base md:text-[17px]"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.01em",
                color: m.color,
                fontWeight: 400,
              }}
            >
              {m.value}
              <span className="text-[10px] text-muted-foreground/40 ml-0.5 font-normal">{m.unit}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Right: regime toggle */}
      <div className="flex items-center gap-5 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 border-foreground/5 pt-6 lg:pt-0">
        <div className="flex flex-col items-end hidden xl:flex mr-2">
          <span className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Status
          </span>
          <span className="text-[10px] text-foreground/40 font-mono">Real-time</span>
        </div>
        <button
          onClick={() => setVolatility(isHighVol ? "low" : "high")}
          className="relative flex items-center overflow-hidden w-full md:w-[180px]"
          style={{
            background: "rgba(0,0,0,0.04)",
            padding: "3px",
            height: "36px",
            borderRadius: "18px",
            border: "1px solid rgba(0,0,0,0.03)"
          }}
          title="Toggle volatility regime (demo)"
        >
          {(["low", "high"] as const).map((v) => (
            <span
              key={v}
              className="relative z-10 px-4 text-[10px] font-bold uppercase transition-colors duration-500 w-1/2 text-center"
              style={{
                letterSpacing: "0.1em",
                fontFamily: "'Inter', sans-serif",
                color:
                  adaptive.volatility === v
                    ? "#000"
                    : "rgba(0,0,0,0.25)",
              }}
            >
              {v === "low" ? "Stable" : "Volatile"}
            </span>
          ))}
          <motion.span
            className="absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] pointer-events-none"
            animate={{ x: isHighVol ? "calc(100% + 0px)" : "0%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              borderRadius: "15px",
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
      <p className="text-[9px] md:text-[10px] uppercase text-muted-foreground mb-2 truncate" style={{ letterSpacing: "0.28em" }}>
        {label}
      </p>
      <p className="text-base md:text-lg text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
