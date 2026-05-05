import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

import { SafeguardsView } from "./SafeguardsView";
import { PortfolioView } from "./PortfolioView";
import { AgentLogsView } from "./AgentLogsView";
import { PreferencesView } from "./PreferencesView";
import { AssetsView } from "./AssetsView";
import { EarnView } from "./EarnView";
import { PerformanceView } from "./PerformanceView";
import { QScoreBar } from "./dashboard/QScoreBar";
import { InvestModal } from "./InvestModal";
import { Logo } from "./Logo";
import { useStability } from "./StabilityContext";

export type DashboardTab =
  | "earn"
  | "performance"
  | "safeguards"
  | "portfolio"
  | "agent-logs"
  | "preferences"
  | "assets";

interface DashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

export function Dashboard({ activeTab: externalTab, onTabChange, walletAddress, onConnectWallet }: DashboardProps) {
  const [internalTab, setInternalTab] = useState<DashboardTab>("earn");
  const tab = externalTab ?? internalTab;
  
  // When tab changes, always snap to top so the content is immediately visible
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  const [investOpen, setInvestOpen] = useState(false);

  return (
    <main className="relative min-h-screen pb-20">
      {/* Global background vignette */}
      <div className="absolute inset-0 vignette" />

      {/* Push content below fixed header */}
      <div style={{ height: "72px" }} />

      {/* Main Stats Header — Q-Score & Live Metrics */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-8 md:mt-10 mb-10 z-10">
        <QScoreBar />
      </div>

      {/* Tab Content Area */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-14 mt-10 md:mt-14 relative z-10">
        <AnimatePresence mode="wait">
          {tab === "earn" && (
            <div key="earn">
              <EarnView onOpenInvest={() => setInvestOpen(true)} />
            </div>
          )}

          {tab === "performance" && (
            <div key="performance">
              <PerformanceView />
            </div>
          )}

          {tab === "safeguards" && (
            <div key="safeguards">
              <SafeguardsView />
            </div>
          )}

          {tab === "portfolio" && (
            <div key="portfolio">
              <PortfolioView />
            </div>
          )}

          {tab === "agent-logs" && (
            <div key="agent-logs">
              <AgentLogsView />
            </div>
          )}

          {tab === "preferences" && (
            <div key="preferences">
              <PreferencesView walletAddress={walletAddress} onConnectWallet={onConnectWallet} />
            </div>
          )}

          {tab === "assets" && (
            <div key="assets">
              <AssetsView />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified Footer */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-8 flex items-end justify-center overflow-hidden select-none"
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.04em",
              fontSize: "clamp(80px, 15vw, 180px)",
              fontWeight: 900,
              lineHeight: 1,
              color: "rgba(0,0,0,0.03)",
            }}
          >
            Mantle
          </span>
        </div>
        <div className="hairline mb-8" />
        <div
          className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 text-[10px] uppercase text-muted-foreground/60 text-center md:text-left"
          style={{ letterSpacing: "0.28em", fontWeight: 600 }}
        >
          <div className="flex items-center gap-3">
            <Logo size={20} className="text-muted-foreground/40" />
            <span>Obelisk Q Navigator</span>
          </div>
          <span
            style={{ fontSize: 15, color: "#bbb", letterSpacing: "normal", fontWeight: 400 }}
          >
            A quiet intelligence.
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-foreground/10" />
            ERC-8004 Protocol · v 1.0
          </span>
        </div>
      </div>

      {/* Global Modals */}
      <InvestModal open={investOpen} onClose={() => setInvestOpen(false)} />
    </main>
  );
}
