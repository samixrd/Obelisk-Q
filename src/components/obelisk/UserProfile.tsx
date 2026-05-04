import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface UserProfileProps {
  onSignOut?: () => void;
}

export function UserProfile({ onSignOut }: UserProfileProps) {
  const { displayName, avatarUrl, walletAddress } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get initials from display name
  const initials = displayName
    .split(" ")
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
        className="h-10 w-10 rounded-full flex items-center justify-center relative overflow-hidden group"
        style={{
          background: avatarUrl ? "transparent" : "linear-gradient(135deg, #f0f2f5 0%, #e0e2e5 100%)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span
            className="text-xs font-semibold text-foreground/60 transition-colors group-hover:text-foreground/80"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {initials}
          </span>
        )}
        <motion.div
          className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-3 w-56 rounded-2xl p-2 z-50 overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            }}
          >
            <div className="px-3 py-4 mb-2">
              <p className="text-[10px] uppercase text-muted-foreground/60 font-bold mb-1" style={{ letterSpacing: "0.2em" }}>
                Connected Identity
              </p>
              <p
                className="text-lg text-foreground font-medium"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
              >
                {displayName}
              </p>
              {walletAddress && (
                <p className="text-[11px] text-muted-foreground font-mono truncate opacity-60">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>

            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all group"
                >
                  <span className="w-5 text-[10px] font-bold text-muted-foreground/40 group-hover:text-foreground/60 transition-colors">
                    {item.icon}
                  </span>
                  <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-foreground/5">
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <span className="w-5 text-[10px] font-bold opacity-60">LO</span>
                <span className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
