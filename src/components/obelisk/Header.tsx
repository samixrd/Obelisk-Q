import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { UserProfile } from "./UserProfile";

interface HeaderProps {
  onMenuClick: () => void;
  onTourClick?: () => void;
  needsWallet?: boolean;
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

export function Header({
  onMenuClick,
  onTourClick,
  needsWallet,
  walletAddress,
  onConnectWallet,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: "rgba(7,7,10,0.82)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-14 py-5 flex items-center justify-between">

        {/* Left: menu + wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            <IconMenu size={16} />
          </button>
          <div className="h-4 w-px bg-border-strong/60" />
          <h1 className="font-serif text-[26px] leading-none tracking-tightest text-foreground">
            Obelisk <span className="italic font-light">Q</span>
          </h1>
        </div>

        {/* Right: network + wallet status + tour + avatar */}
        <div className="flex items-center gap-5">

          <span className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-luxe text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-neon shadow-neon" />
            Mantle Network
          </span>

          {/* Wallet status — always visible */}
          {walletAddress ? (
            /* Connected state — address chip */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{
                  background: "hsl(104 100% 68%)",
                  boxShadow: "0 0 5px hsl(104 100% 68% / 0.65)",
                }}
              />
              <span
                className="text-[9px] uppercase text-foreground/55"
                style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {walletAddress}
              </span>
            </motion.div>
          ) : needsWallet ? (
            /* Google user — prompt to connect */
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={onConnectWallet}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2.5 px-4 py-1.5 group"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                border: "0.5px solid rgba(255,255,255,0.22)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.38)";
                (e.currentTarget as HTMLElement).style.background =
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
                (e.currentTarget as HTMLElement).style.background =
                  "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)";
              }}
            >
              {/* Wallet icon */}
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                className="text-white/55 group-hover:text-white/80 transition-colors">
                <rect x="1" y="4" width="14" height="10" rx="1.5"
                  stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1 7h14" stroke="currentColor" strokeWidth="1.1"/>
                <circle cx="11.5" cy="10" r="1" fill="currentColor"/>
                <path d="M11 4V3a1.5 1.5 0 0 1 3 0v1" stroke="currentColor" strokeWidth="1.1"/>
              </svg>
              <span
                className="text-[9px] uppercase text-white/55 group-hover:text-white/80 transition-colors"
                style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
              >
                Connect wallet
              </span>
            </motion.button>
          ) : null}

          {onTourClick && (
            <button
              onClick={onTourClick}
              className="hidden md:inline-block text-[10px] uppercase tracking-luxe text-muted-foreground hover:text-foreground transition-colors duration-500"
            >
              Guided tour
            </button>
          )}
          <UserProfile />
        </div>
      </div>
      <div className="hairline" />
    </motion.header>
  );
}
