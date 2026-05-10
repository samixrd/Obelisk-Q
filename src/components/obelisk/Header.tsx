import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { Logo } from "./Logo";
import { UserProfile } from "./UserProfile";
import { useVault } from "@/hooks/useVault";
import { usePriceOracle } from "@/hooks/usePriceOracle";
import { useAgentData } from "@/hooks/useAgentData";
import { useTheme } from "@/hooks/useTheme";

import { DashboardTab } from "./Dashboard";

interface HeaderProps {
  onMenuClick:     () => void;
  onTourClick?:    () => void;
  activeTab:       DashboardTab;
  onTabChange:     (tab: DashboardTab) => void;
  needsWallet?:    boolean;
  walletAddress?:  string | null;
  onConnectWallet?: () => void;
  onSignOut?:      () => void;
}

export function Header({
  onMenuClick,
  onTourClick,
  activeTab,
  onTabChange,
  needsWallet,
  walletAddress,
  onConnectWallet,
  onSignOut,
}: HeaderProps) {
  const { vaultStats } = useVault();
  const prices = usePriceOracle();
  const { score, regime } = useAgentData();
  const { theme, toggleTheme } = useTheme();

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: val < 10 ? 2 : 0,
      maximumFractionDigits: 2
    }).format(val);
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-[20px] saturate-[160%] border-b border-foreground/10"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-14 py-5 flex items-center justify-between">

        {/* Left: menu + wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors duration-500"
          >
            <IconMenu size={16} />
          </button>
          <div className="h-4 w-px bg-foreground/10" />
          <div className="flex items-center gap-3">
            <Logo size={24} className="text-foreground" />
            <h1 className="hidden sm:block text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              Obelisk <span className="font-normal text-muted-foreground/50">Q</span>
            </h1>
          </div>

          <div className="hidden lg:block h-4 w-px bg-foreground/5 mx-2.5" />

          <nav className="hidden lg:flex items-center gap-8">
            {(["earn", "portfolio", "safeguards", "agent-logs"] as DashboardTab[]).map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`text-[13px] capitalize transition-colors duration-300 ${
                  activeTab === t ? "text-foreground font-semibold" : "text-muted-foreground/60 hover:text-foreground/80 font-normal"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>


        {/* Right: network + wallet status + tour + avatar */}
        <div className="flex items-center gap-6">
          {onTourClick && (
            <button
              onClick={onTourClick}
              className="hidden md:inline-block text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60 hover:text-foreground transition-colors duration-300"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Guided tour
            </button>
          )}

          <div className="hidden md:block h-4 w-px bg-foreground/5" />

          <div className="flex items-center gap-5">
            <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-muted-foreground/60">
              <span style={{
                height: 6, width: 6, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                display: "inline-block",
              }} />
              Mantle Network
            </span>

            <div className="hidden lg:block h-4 w-px bg-foreground/5" />

            <div className="hidden lg:flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-[0.15em] leading-none mb-1">Q-Score</span>
                <span className="text-[14px] font-bold text-foreground leading-none tabular-nums">{score}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-[0.15em] leading-none mb-1">Regime</span>
                <span className="text-[14px] font-bold text-foreground leading-none">{regime}</span>
              </div>
            </div>

            <div className="hidden md:block h-4 w-px bg-foreground/5" />

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all text-muted-foreground hover:text-foreground"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>
              )}
            </button>

            <UserProfile onSignOut={onSignOut} onConnectWallet={onConnectWallet} />
          </div>
        </div>
      </div>
      <div className="hairline opacity-30" />
    </motion.header>
  );
}
