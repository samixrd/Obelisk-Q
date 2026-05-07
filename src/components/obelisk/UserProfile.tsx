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
          else setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-10 pl-1.5 pr-4 rounded-full flex items-center gap-2.5 relative overflow-hidden group border border-black/5 shadow-sm transition-all hover:bg-white hover:border-black/10"
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

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && isWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-3 w-[340px] rounded-[32px] p-2 z-50 overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
            }}
          >
            <div className="px-6 py-7 relative">
              {/* Top right settings/power icons */}
              <div className="absolute top-7 right-7 flex items-center gap-5 text-black/30">
                <button className="hover:text-black transition-colors" aria-label="Settings">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button onClick={onSignOut} className="hover:text-red-500 transition-colors" aria-label="Sign Out">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                  </svg>
                </button>
              </div>

              {/* Large Avatar */}
              <div className="relative w-[64px] h-[64px] mb-6">
                <ProjectAvatar size={64} />
                <div className="absolute -bottom-1 -right-1 z-10 drop-shadow-md">
                  <MetaMaskIcon size={22} />
                </div>
              </div>

              {/* Wallet Address */}
              <p className="text-[14px] text-black/40 font-medium mb-1 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                Active Identity
              </p>
              <p className="text-[20px] text-black font-semibold mb-8" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                {displayAddress}
              </p>

              {/* Portfolio Value */}
              <div className="mb-8">
                <p className="text-[11px] text-black/30 font-bold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Vault Balance
                </p>
                <div className="flex items-baseline">
                  <span className="text-[42px] text-black font-light leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                    ${whole}
                  </span>
                  <span className="text-[42px] text-black/20 font-light leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                    .{decimal || "00"}
                  </span>
                </div>
              </div>

              {/* History Section */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] text-black/30 font-bold uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Recent Activity
                  </p>
                  <button className="text-[10px] text-black/40 hover:text-black font-bold uppercase tracking-wider transition-colors">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {txHistory.length > 0 ? (
                    txHistory.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {tx.type === 'Deposit' ? '↓' : '↑'}
                          </div>
                          <div>
                            <p className="text-[13px] text-black font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{tx.type}</p>
                            <p className="text-[10px] text-black/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {tx.status === 'Confirmed' ? 'Success' : tx.status}
                            </p>
                          </div>
                        </div>
                        <p className="text-[13px] text-black font-light" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                          {tx.type === 'Deposit' ? '+' : '-'}{tx.amount}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-[12px] text-black/20 italic" style={{ fontFamily: "'Inter', sans-serif" }}>No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mx-6 mb-4">
              <div className="w-full h-px bg-black/[0.03]" />
            </div>
            
            <div className="h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
