import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { Logo } from "./Logo";
import { UserProfile } from "./UserProfile";
import { useVault } from "@/hooks/useVault";
import { usePriceOracle } from "@/hooks/usePriceOracle";
import { useAgentData } from "@/hooks/useAgentData";

import { DashboardTab } from "./Dashboard";

interface HeaderProps {
  onMenuClick:     () => void;
  onLogoClick?:    () => void;
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
  onLogoClick,
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
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-[24px] border-b border-primary/5"
    >
      <div className="mx-auto max-w-[1680px] px-6 md:px-10 py-2.5 flex items-center justify-between">

        {/* Left: menu + wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="h-8 w-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors duration-500 outline-none"
          >
            <IconMenu size={14} />
          </button>
          <div className="h-4 w-px bg-foreground/10" />
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-2.5 group transition-transform active:scale-95 cursor-pointer outline-none"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-background">
              <span className="material-symbols-outlined text-[13px] font-bold">api</span>
            </div>
            <h1 className="text-[14px] font-black tracking-tighter text-primary transition-opacity group-hover:opacity-80 whitespace-nowrap">
              OBELISK <span className="text-primary/40">Q</span>
            </h1>
          </button>

          <div className="hidden lg:block h-4 w-px bg-foreground/5 mx-2.5" />

          <nav className="hidden xl:flex items-center gap-4">
            {(["earn", "portfolio", "safeguards", "agent-logs"] as DashboardTab[]).map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`text-[10px] uppercase tracking-widest transition-all duration-300 outline-none px-4 py-1.5 rounded-full font-black ${
                  activeTab === t 
                    ? "text-background bg-primary" 
                    : "text-primary/40 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>


        {/* Right: network + wallet status + tour + avatar */}
        <div className="flex items-center gap-4">
          {onTourClick && (
            <button
              onClick={onTourClick}
              className="hidden md:inline-block text-[9px] font-black tracking-widest uppercase text-primary/40 hover:text-primary transition-colors duration-300 outline-none"
            >
              Tour
            </button>
          )}

          <div className="hidden md:block h-3 w-px bg-primary/10" />

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline-flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase text-primary/60">
              <span style={{
                height: 5, width: 5, borderRadius: "50%",
                background: "hsl(var(--primary))", 
                display: "inline-block",
              }} />
              Mantle
            </span>

            <div className="hidden xl:block h-3 w-px bg-primary/10" />

            <div className="hidden xl:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-primary/30 uppercase font-black tracking-[0.15em] leading-none mb-1">Score</span>
                <span className="text-[12px] font-black text-primary leading-none tabular-nums">{score}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-primary/30 uppercase font-black tracking-[0.15em] leading-none mb-1">Regime</span>
                <span className="text-[12px] font-black text-primary leading-none uppercase">{regime}</span>
              </div>
            </div>

            <UserProfile onSignOut={onSignOut} onConnectWallet={onConnectWallet} />
          </div>
        </div>
      </div>
      <div className="hairline opacity-30" />
    </motion.header>
  );
}
