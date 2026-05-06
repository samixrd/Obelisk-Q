import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

const ProjectAvatar = ({ size = 28 }) => (
  <div 
    style={{ width: size, height: size, backgroundColor: "#3b1e3e", color: "#f472b6" }}
    className="rounded-full flex items-center justify-center shadow-inner"
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isWalletConnected = walletAddress && walletAddress !== "connected";
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

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar Pill Button */}
      <motion.button
        onClick={() => {
          if (!isWalletConnected && onConnectWallet) onConnectWallet();
          else setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-10 pl-1.5 pr-4 rounded-full flex items-center gap-2.5 relative overflow-hidden group border border-white/20 shadow-sm transition-all hover:bg-black hover:border-white/30"
        style={{ background: "#151515" }}
      >
        <ProjectAvatar size={28} />
        <span
          className="text-[14px] text-white font-medium"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em" }}
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
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-3 w-[320px] rounded-[24px] p-2 z-50 overflow-hidden"
            style={{
              background: "#151515",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="px-5 py-6 relative">
              {/* Top right settings/power icons */}
              <div className="absolute top-6 right-6 flex items-center gap-4 text-white/50">
                <button className="hover:text-white transition-colors" aria-label="Settings">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button onClick={onSignOut} className="hover:text-white transition-colors" aria-label="Sign Out">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                  </svg>
                </button>
              </div>

              {/* Large Avatar */}
              <div className="relative w-[60px] h-[60px] mb-4">
                <ProjectAvatar size={60} />
                <div className="absolute -bottom-1 -right-1 z-10 drop-shadow-sm">
                  <MetaMaskIcon size={20} />
                </div>
              </div>

              {/* Wallet Address */}
              <p className="text-[18px] text-white font-medium mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                {displayAddress}
              </p>

              {/* Portfolio Value */}
              <div className="flex items-baseline gap-1">
                <p className="text-[36px] text-white font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  $0<span className="text-white/40">.00</span>
                </p>
              </div>
            </div>

            <div className="mx-4 mb-2">
              <div className="w-full h-px bg-white/[0.08]" />
            </div>
            
            {/* Minimal spacing at the bottom since the user's image shows a separator line but no menu items below in the immediate viewport */}
            <div className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
