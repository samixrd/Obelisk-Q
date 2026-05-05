import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { Logo } from "./Logo";
import { UserProfile } from "./UserProfile";
import { useVault } from "@/hooks/useVault";
import { usePriceOracle } from "@/hooks/usePriceOracle";

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
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: "rgba(240, 242, 245, 0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid rgba(50, 50, 93, 0.1)",
      }}
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-14 py-5 flex items-center justify-between">

        {/* Left: menu + wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="h-9 w-9 flex items-center justify-center transition-colors duration-500"
            style={{ color: "#999" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#333"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#999"; }}
          >
            <IconMenu size={16} />
          </button>
          <div style={{ height: 16, width: 1, background: "rgba(0,0,0,0.10)" }} />
          <div className="flex items-center gap-3">
            <Logo size={24} className="text-foreground" />
            <h1 className="hidden sm:block" style={{
              fontSize: 20, lineHeight: 1, letterSpacing: "-0.03em",
              color: "#0a0a0a", fontWeight: 600, fontFamily: "'Inter', sans-serif",
            }}>
              Obelisk <span style={{ fontWeight: 400, color: "#888" }}>Q</span>
            </h1>
          </div>

          <div style={{ height: 16, width: 1, background: "rgba(0,0,0,0.06)", margin: "0 10px" }} className="hidden lg:block" />

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {(["overview", "portfolio", "performance", "safeguards", "assets"] as DashboardTab[]).map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`text-[13px] capitalize transition-colors duration-300 ${
                  activeTab === t ? "text-foreground font-semibold" : "text-muted-foreground/60 hover:text-foreground/80 font-normal"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Price Ticker */}
        <div className="hidden lg:flex items-center gap-4 overflow-hidden px-4">
          <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide text-muted-foreground whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span className="text-foreground/60 uppercase">USDY</span>
              <span className="text-foreground">{prices.usdy.loading ? "..." : formatPrice(prices.usdy.price)}</span>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-foreground/60 uppercase">mETH</span>
              <span className="text-foreground">{prices.meth.loading ? "..." : formatPrice(prices.meth.price)}</span>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-foreground/60 uppercase">MNT</span>
              <span className="text-foreground">{prices.mnt.loading ? "..." : formatPrice(prices.mnt.price)}</span>
            </span>
          </div>
        </div>

        {/* Right: network + wallet status + tour + avatar */}
        <div className="flex items-center gap-6">
          {onTourClick && (
            <button
              onClick={onTourClick}
              style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
                color: "#999", textTransform: "uppercase" as const,
                background: "none", border: "none", cursor: "pointer",
                transition: "color 0.3s ease",
              }}
              className="hidden md:inline-block"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#333"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#999"; }}
            >
              Guided tour
            </button>
          )}

          <div style={{ height: 16, width: 1, background: "rgba(0,0,0,0.06)" }} className="hidden md:block" />

          <div className="flex items-center gap-5">
            <span className="hidden md:inline-flex items-center gap-2" style={{
              fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
              color: "#999", textTransform: "uppercase" as const,
            }}>
              <span style={{
                height: 6, width: 6, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                display: "inline-block",
              }} />
              Mantle Network
            </span>
            <UserProfile onSignOut={onSignOut} onConnectWallet={onConnectWallet} />
          </div>
        </div>
      </div>
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(50, 50, 93, 0.1) 50%, transparent 100%)",
      }} />
    </motion.header>
  );
}
