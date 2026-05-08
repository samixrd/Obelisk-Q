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
  const { vaultStats, txHistory } = useVault();
  const [isOpen, setIsOpen] = useState(false);
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

  // Use real-time balance or fallback to 0
  const balanceValue = vaultStats?.userBalance ?? "0.00";
  const [whole, decimal] = balanceValue.split(".");

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar Pill Button */}
      <motion.button
        onClick={() => {
          if (!isWalletConnected && onConnectWallet) onConnectWallet();
        }}
        whileHover={!isWalletConnected ? { scale: 1.02 } : {}}
        whileTap={!isWalletConnected ? { scale: 0.98 } : {}}
        className={`h-10 pl-1.5 pr-4 rounded-full flex items-center gap-2.5 relative overflow-hidden group border border-black/5 shadow-sm transition-all ${!isWalletConnected ? 'hover:bg-white hover:border-black/10 cursor-pointer' : 'cursor-default'}`}
        style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)" }}
      >
        <ProjectAvatar size={28} />
        <span
          className="text-[14px] text-black/80 font-medium"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}
        >
          {displayAddress}
        </span>
      </motion.button>
    </div>
  );
}
