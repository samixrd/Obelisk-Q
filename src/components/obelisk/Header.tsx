import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { Logo } from "./Logo";
import { UserProfile } from "./UserProfile";
import { useVault } from "@/hooks/useVault";

interface HeaderProps {
  onMenuClick:     () => void;
  onTourClick?:    () => void;
  needsWallet?:    boolean;
  walletAddress?:  string | null;
  onConnectWallet?: () => void;
  onSignOut?:      () => void;
}

export function Header({
  onMenuClick,
  onTourClick,
  needsWallet,
  walletAddress,
  onConnectWallet,
  onSignOut,
}: HeaderProps) {
  const { vaultStats } = useVault();
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
            <h1 style={{
              fontSize: 22, lineHeight: 1, letterSpacing: "-0.03em",
              color: "#0a0a0a", fontWeight: 600, fontFamily: "'Inter', sans-serif",
            }}>
              Obelisk <span style={{ fontWeight: 400, color: "#888" }}>Q</span>
            </h1>
          </div>
        </div>

        {/* Right: network + wallet status + tour + avatar */}
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

          {/* Wallet status */}
          {walletAddress ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5"
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
              }}
            >
              <span style={{
                height: 6, width: 6, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.5)",
                flexShrink: 0,
              }} />
              <div className="hidden md:flex flex-col items-end mr-3">
                <span className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>
                  Connected
                </span>
                <span className="text-xs text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-border">
                <div className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {vaultStats?.walletBalance ?? "0.0000"} MNT
                </span>
              </div>
            </motion.div>
          ) : needsWallet ? (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={onConnectWallet}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2.5 px-4 py-1.5 group"
              style={{
                background: "#0a0a0a",
                color: "#fff",
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#222";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
              }}
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" style={{ color: "#fff" }}>
                <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1 7h14" stroke="currentColor" strokeWidth="1.1"/>
                <circle cx="11.5" cy="10" r="1" fill="currentColor"/>
                <path d="M11 4V3a1.5 1.5 0 0 1 3 0v1" stroke="currentColor" strokeWidth="1.1"/>
              </svg>
              <span style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}>
                Connect wallet
              </span>
            </motion.button>
          ) : null}

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
          <UserProfile onSignOut={onSignOut} />
        </div>
      </div>
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(50, 50, 93, 0.1) 50%, transparent 100%)",
      }} />
    </motion.header>
  );
}
