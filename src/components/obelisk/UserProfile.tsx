import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-10 w-10 rounded-full flex items-center justify-center relative overflow-hidden group border border-border/40 shadow-sm"
        style={{
          background: avatarUrl ? "transparent" : "linear-gradient(135deg, #fff 0%, #f0f2f5 100%)",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span
            className="text-[11px] font-bold text-foreground/40 group-hover:text-foreground/80 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {initials}
          </span>
        )}
        {isWalletConnected && (
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_5px_rgba(34,197,94,0.3)]" />
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
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono bg-foreground/[0.03] px-2 py-1 rounded-lg w-fit border border-foreground/[0.03]">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-foreground font-bold hover:bg-foreground/[0.03] mb-1"
                >
                  <span className="w-5 text-[10px] font-bold opacity-30">WA</span>
                  <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Connect Wallet</span>
                </button>
              )}
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-500/80 hover:bg-red-50/50 hover:text-red-500 transition-colors"
              >
                <span className="w-5 text-[10px] font-bold opacity-40">LO</span>
                <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
