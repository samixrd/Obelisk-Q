import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

interface UserProfileProps {
  onSignOut?: () => void;
  onConnectWallet?: () => void;
}

export function UserProfile({ onSignOut, onConnectWallet }: UserProfileProps) {
  const { displayName, avatarUrl, walletAddress } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isWalletConnected = walletAddress && walletAddress !== "connected";

  // Get initials from display name
  const initials = displayName === "Guest Identity" 
    ? "GU" 
    : displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Identity Settings", icon: "ID" },
    { label: "Notification Prefs", icon: "NT" },
    { label: "Audit Logs", icon: "AL" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-10 pl-3 pr-4 rounded-full flex items-center gap-2.5 relative overflow-hidden group border border-black/5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      >
        <div className="text-purple-600 flex items-center justify-center">
          <Logo size={18} />
        </div>
        <span
          className="text-[13px] text-black tabular-nums tracking-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}
        >
          {isWalletConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : "Connect Wallet"}
        </span>
        {isWalletConnected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-3 w-64 rounded-[24px] p-2 z-50 overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div className="px-4 py-5 mb-1">
              <p className="text-[9px] uppercase text-muted-foreground/40 font-bold mb-2 tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Active Session
              </p>
              <p
                className="text-[15px] text-foreground font-semibold mb-1"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
              >
                {displayName}
              </p>
              {isWalletConnected ? (
                <div 
                  className="flex items-center gap-2 text-[11px] text-muted-foreground/60 tabular-nums bg-black/[0.02] px-2.5 py-1.5 rounded-full w-fit border border-black/[0.04]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </div>
              ) : (
                <button 
                  onClick={() => { onConnectWallet?.(); setIsOpen(false); }}
                  className="flex items-center gap-2 text-[10px] text-primary font-bold hover:opacity-80 transition-opacity uppercase tracking-wider"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                  Link Wallet
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03] transition-all group"
                >
                  <span className="w-5 text-[9px] font-bold text-muted-foreground/30 group-hover:text-foreground/50 transition-colors">
                    {item.icon}
                  </span>
                  <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-foreground/5">
              {!isWalletConnected && (
                <button
                  onClick={() => { onConnectWallet?.(); setIsOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#222] transition-all mb-2 shadow-sm group/btn"
                >
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" className="opacity-60 group-hover/btn:opacity-100 transition-opacity">
                      <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="11.5" cy="10" r="1" fill="currentColor"/>
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Connect Wallet
                    </span>
                  </div>
                  <span className="text-[10px] opacity-30">→</span>
                </button>
              )}
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] text-red-500/80 hover:bg-red-50/50 hover:text-red-500 transition-colors"
              >
                <span className="w-5 text-[9px] font-bold opacity-40 text-center">SO</span>
                <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
