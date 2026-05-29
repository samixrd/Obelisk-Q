import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState, useEffect } from "react";

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

export function LiveAgentStats() {
  const [health, setHealth] = useState<any>(null);
  
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('https://obeliskq.app/api/agent/health');
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        console.error('Failed to fetch health:', err);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (!health) {
    return (
      <div className="mb-8 glass-card rounded-3xl p-6 border border-blue-200/20 shadow-[0_4px_20px_rgba(100,150,255,0.04)] animate-pulse flex items-center justify-center text-muted-foreground/60 text-[13px] font-medium" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,250,255,0.85) 100%)" }}>
        Connecting to sovereign agent swarm...
      </div>
    );
  }

  const uptime = health.uptime_hours ?? 0;
  const cycles = health.cycles_executed ?? health.cycles_total ?? health.last_cycle?.number ?? 0;
  const qScore = health.q_score ?? health.last_cycle?.score ?? 50;
  const isHealthy = health.status === 'healthy' || health.status === 'operational';

  return (
    <div 
      className="mb-8 glass-card rounded-3xl p-6 border border-blue-200/20 shadow-[0_10px_30px_rgba(100,150,255,0.06)] grid grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,252,255,0.9) 100%)" }}
    >
      <div className="text-center md:border-r border-black/[0.03] py-2">
        <p className="text-[#00D395] text-3xl font-extrabold tracking-tight">{uptime}h</p>
        <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ letterSpacing: "0.2em" }}>Swarm Uptime</p>
      </div>
      <div className="text-center md:border-r border-black/[0.03] py-2">
        <p className="text-black text-3xl font-extrabold tracking-tight">{cycles}</p>
        <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ letterSpacing: "0.2em" }}>Cycles Completed</p>
      </div>
      <div className="text-center md:border-r border-black/[0.03] py-2">
        <p className="text-[#0052FF] text-3xl font-extrabold tracking-tight">{qScore}</p>
        <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ letterSpacing: "0.2em" }}>Consensus Q-Score</p>
      </div>
      <div className="text-center flex flex-col items-center justify-center py-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-[#00D395] animate-pulse' : 'bg-rose-500'}`} />
          <p className={`text-[17px] font-bold tracking-tight ${isHealthy ? 'text-[#00D395]' : 'text-rose-500'}`}>
            {isHealthy ? 'Operational' : 'Degraded'}
          </p>
        </div>
        <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ letterSpacing: "0.2em" }}>Agent Status</p>
      </div>
    </div>
  );
}

export function Dashboard({ activeTab: externalTab, onTabChange, walletAddress, onConnectWallet }: DashboardProps) {
  const [internalTab, setInternalTab] = useState<DashboardTab>("earn");
  const tab = externalTab ?? internalTab;
  
  // When tab changes, always snap to top so the content is immediately visible
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  const [investOpen, setInvestOpen] = useState(false);
  const [compliance, setCompliance] = useState(() => {
    const saved = localStorage.getItem("obelisk_compliance_accepted");
    if (saved === "true") {
      return { "non-us": true, "regulated": true, "terms": true };
    }
    return { "non-us": false, "regulated": false, "terms": false };
  });
  const allComplianceChecked = Object.values(compliance).every(v => v);

  // Persist compliance
  useEffect(() => {
    if (allComplianceChecked) {
      localStorage.setItem("obelisk_compliance_accepted", "true");
    }
  }, [allComplianceChecked]);

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
      className="relative min-h-screen pb-10 landing-root flex flex-col justify-between"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >


      {/* Blue viewport glow border */}
      <div className="landing-glow-border" aria-hidden />

      {/* Floating math symbols */}
      <FloatingSymbols />

      {/* Push content below fixed header */}
      <div style={{ height: "72px" }} />



      {/* Tab Content Area */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-14 mt-8 md:mt-14 relative z-10 flex-grow w-full" style={{ flexGrow: 1 }}>
        <LiveAgentStats />
        
        {!walletAddress && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col lg:flex-row items-stretch justify-between gap-8 md:gap-10 border border-blue-200/20 shadow-[0_20px_50px_rgba(100,150,255,0.08)]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,250,255,0.85) 100%)" }}
          >
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight mb-2">Access the Vault.</h2>
                <p className="text-[14px] text-muted-foreground/80 max-w-md leading-relaxed">
                  Connect your identity to begin navigating Mantle's yield landscape with institutional-grade AI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-2">
                {localStorage.getItem("obelisk_compliance_accepted") === "true" ? (
                  <div className="flex items-center gap-2 py-2 px-4 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Compliance Verified</span>
                  </div>
                ) : (
                  [
                    { id: "non-us", label: "I confirm I am not a US person or entity" },
                    { id: "regulated", label: "I understand USDY is a regulated financial instrument" },
                    { id: "terms", label: "I accept the Terms of Service and Risk Disclosure" },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={compliance[item.id as keyof typeof compliance]}
                          onChange={(e) => setCompliance(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="peer appearance-none h-5 w-5 rounded-md border border-black/10 bg-white checked:bg-black checked:border-black transition-all duration-300 cursor-pointer"
                        />
                        <svg 
                          className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" 
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[12px] text-muted-foreground group-hover:text-black transition-colors font-medium">
                        {item.label}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center items-center md:items-end gap-6 lg:border-l border-black/[0.05] lg:pl-10 pt-4 lg:pt-0">
              <div className="text-center md:text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Step 2: Authenticate</p>
                <p className="text-[13px] font-medium text-black/60">Choose your preferred provider</p>
              </div>
              
              <motion.button
                onClick={onConnectWallet}
                disabled={!allComplianceChecked}
                whileHover={allComplianceChecked ? { scale: 1.02, y: -2 } : {}}
                whileTap={allComplianceChecked ? { scale: 0.98 } : {}}
                className={`px-10 py-5 rounded-full text-[14px] font-bold flex items-center gap-3 transition-all ${allComplianceChecked ? 'bg-black text-white shadow-2xl shadow-black/20' : 'bg-black/5 text-black/20 cursor-not-allowed'}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                  <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
                  <path d="M16 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/>
                </svg>
                Connect Wallet
              </motion.button>
              
              {!allComplianceChecked && (
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest animate-pulse">
                  Please accept terms to continue
                </p>
              )}
            </div>
          </motion.div>
        )}

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
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-14 mt-16 md:mt-32">
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
