import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

import { SafeguardsView } from "./SafeguardsView";
import { PortfolioView } from "./PortfolioView";
import { AgentLogsView } from "./AgentLogsView";
import { PreferencesView } from "./PreferencesView";
import { EarnView } from "./EarnView";
import { QScoreBar } from "./dashboard/QScoreBar";
import { InvestModal } from "./InvestModal";
import { Logo } from "./Logo";
import { useStability } from "./StabilityContext";

import { FloatingSymbols } from "./FloatingSymbols";

export type DashboardTab =
  | "earn"
  | "safeguards"
  | "portfolio"
  | "agent-logs"
  | "preferences";

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

  const TABS: DashboardTab[] = ["earn", "portfolio", "safeguards", "agent-logs", "preferences"];
  const [prevTab, setPrevTab] = useState<DashboardTab>(tab);

  const curIdx = TABS.indexOf(tab);
  const prevIdx = TABS.indexOf(prevTab);
  const direction = curIdx >= prevIdx ? 1 : -1;

  if (tab !== prevTab) {
    setPrevTab(tab);
  }

  const variants = {
    enter: {
      opacity: 0,
      y: 6,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -6,
    },
  };

  return (
    <main 
      className="relative min-h-screen pb-20 overflow-y-auto scroll-smooth" 
      style={{ WebkitOverflowScrolling: "touch", background: "var(--background)" }}
    >
      {/* Ambient Background Layer — same as landing */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="glass-blob w-[600px] h-[600px] -top-40 -left-40 bg-primary" style={{ animationDuration: '25s', animationDelay: '-2s', opacity: 0.08 }}></div>
        <div className="glass-blob w-[500px] h-[500px] top-1/2 -right-20 bg-primary" style={{ animationDuration: '30s', animationDelay: '-5s', opacity: 0.05 }}></div>
        <div className="glass-blob w-[400px] h-[400px] bottom-0 left-1/4 bg-primary" style={{ animationDuration: '22s', animationDelay: '-10s', opacity: 0.08 }}></div>
      </div>

      {/* Floating math symbols */}
      <FloatingSymbols />

      {/* Push content below fixed header */}
      <div className="h-24" />



      {/* Tab Content Area */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-14 mt-10 md:mt-14 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "earn" && <EarnView onOpenInvest={() => setInvestOpen(true)} />}
            {tab === "safeguards" && <SafeguardsView />}
            {tab === "portfolio" && <PortfolioView />}
            {tab === "agent-logs" && <AgentLogsView />}
            {tab === "preferences" && (
              <PreferencesView walletAddress={walletAddress} onConnectWallet={onConnectWallet} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Unified Footer */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-8 flex items-end justify-center overflow-hidden select-none"
        >
          <span
            className="font-display tracking-tighter text-foreground/5 opacity-50"
            style={{
              fontSize: "clamp(80px, 15vw, 180px)",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            Mantle
          </span>
        </div>
        <div className="hairline mb-8" />
        <div
          className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 text-[10px] uppercase text-muted-foreground/60 text-center md:text-left tracking-[0.28em] font-bold"
        >
          <div className="flex items-center gap-3">
            <Logo size={20} className="text-muted-foreground/40" />
            <span>Obelisk Q Navigator</span>
          </div>
          <span
            className="text-[15px] text-[#bbb] font-normal"
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
