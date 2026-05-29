import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useVault } from "@/hooks/useVault";
import { Logo } from "./Logo";

const ProjectAvatar = ({ size = 28 }) => (
  <div 
    style={{ width: size, height: size, backgroundColor: "#fff", color: "#000" }}
    className="rounded-full flex items-center justify-center border border-black/5 shadow-sm"
  >
    <Logo size={size * 0.55} />
  </div>
);

const MetaMaskIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#fff" />
    <path d="M22.5 12.3L23.4 9.4L19.5 11.2C18.4 10.8 17.2 10.6 16 10.6C14.8 10.6 13.6 10.8 12.5 11.2L8.6 9.4L9.5 12.3C7.9 13.6 6.9 15.6 6.9 17.9C6.9 22.2 11 25.7 16 25.7C21 25.7 25.1 22.2 25.1 17.9C25.1 15.6 24.1 13.6 22.5 12.3ZM12 18.6C11 18.6 10.1 17.7 10.1 16.7C10.1 15.6 11 14.8 12 14.8C13 14.8 13.9 15.6 13.9 16.7C13.9 17.7 13 18.6 12 18.6ZM20 18.6C19 18.6 18.1 17.7 18.1 16.7C18.1 15.6 19 14.8 20 14.8C21 14.8 21.9 15.6 21.9 16.7C21.9 17.7 21 18.6 20 18.6Z" fill="#F6851B" />
  </svg>
);

interface UserProfileProps {
  onSignOut?: () => void;
  onConnectWallet?: () => void;
}

export function UserProfile({ onSignOut, onConnectWallet }: UserProfileProps) {
  const { walletAddress } = useAuth();
  const { vaultStats } = useVault();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isWalletConnected = !!walletAddress;
  const displayAddress = isWalletConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : "Connect Wallet";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar Pill Button */}
      <motion.button
        onClick={() => {
          if (!isWalletConnected && onConnectWallet) {
            onConnectWallet();
          } else if (isWalletConnected) {
            setIsOpen(!isOpen);
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`h-10 pl-1.5 pr-4 rounded-full flex items-center gap-2.5 relative overflow-hidden group border border-black/5 shadow-sm transition-all bg-white/80 backdrop-blur-xl cursor-pointer hover:border-black/10`}
      >
        <ProjectAvatar size={28} />
        <span
          className="text-[13px] text-black/80 font-bold font-display"
        >
          {displayAddress}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && isWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-12 right-0 w-64 glass-card rounded-[24px] p-5 shadow-2xl z-50 border border-black/5 flex flex-col gap-5 overflow-hidden"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.85)", 
              backdropFilter: "blur(25px) saturate(160%)" 
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-mono-num text-black/80 truncate pr-2">{walletAddress}</p>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17L4 12" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v4M16 4v4h4" /></svg>
                  )}
                </button>
              </div>
              <p style={{
                fontSize: "9px",
                color: "#ef4444",
                fontWeight: 650,
                marginTop: "4px",
                lineHeight: 1.3,
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                ⚠️ Only deposit MNT on Mantle L2 Network
              </p>
            </div>

            <div className="h-px bg-black/[0.04]" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">MNT Balance</p>
                <p className="text-[14px] font-mono-num font-bold text-black">{vaultStats?.walletBalance || "0.00"}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">Vault Balance</p>
                <p className="text-[14px] font-mono-num font-bold text-[#22c55e]">{vaultStats?.userBalance || "0.00"}</p>
              </div>
            </div>

            <div className="h-px bg-black/[0.04]" />

            <button
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
              className="w-full py-3 bg-red-50 hover:bg-red-100/80 text-red-600 text-[11px] uppercase tracking-[0.15em] font-bold rounded-xl transition-all border border-red-200/30"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
