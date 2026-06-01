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
  const { vaultStats, sendMnt, txState } = useVault();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendError, setSendError] = useState("");
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
                setShowSendForm(!showSendForm);
                setSendError("");
              }}
              className="w-full py-2.5 bg-black/5 hover:bg-black/10 text-black/80 text-[11px] uppercase tracking-[0.15em] font-bold rounded-xl transition-all border border-black/5 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              {showSendForm ? "Cancel Send" : "Send MNT"}
            </button>

            {showSendForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 pt-1"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-[0.12em] text-black/40 font-bold">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value);
                      setSendError("");
                    }}
                    placeholder="0x..."
                    className="w-full px-3 py-2 text-[12px] bg-black/[0.03] border border-black/10 rounded-xl font-mono focus:outline-none focus:border-black/30 placeholder:text-black/30 text-black"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-[0.12em] text-black/40 font-bold">Amount (MNT)</label>
                    <button
                      onClick={() => {
                        const bal = parseFloat(vaultStats?.walletBalance || "0");
                        // Deduct a tiny buffer (0.005 MNT) for gas
                        const maxVal = Math.max(0, bal - 0.005);
                        setSendAmount(maxVal.toFixed(4));
                        setSendError("");
                      }}
                      className="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={sendAmount}
                    onChange={(e) => {
                      setSendAmount(e.target.value);
                      setSendError("");
                    }}
                    placeholder="0.0"
                    className="w-full px-3 py-2 text-[12px] bg-black/[0.03] border border-black/10 rounded-xl font-mono focus:outline-none focus:border-black/30 placeholder:text-black/30 text-black"
                  />
                </div>

                {sendError && (
                  <p className="text-[10px] text-red-500 font-semibold leading-snug">{sendError}</p>
                )}

                <button
                  disabled={txState === "waiting" || txState === "pending"}
                  onClick={async () => {
                    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
                      setSendError("Please enter a valid 42-character hex address.");
                      return;
                    }
                    const amt = parseFloat(sendAmount);
                    if (isNaN(amt) || amt <= 0) {
                      setSendError("Please enter a valid amount greater than 0.");
                      return;
                    }
                    const walletBal = parseFloat(vaultStats?.walletBalance || "0");
                    if (amt > walletBal) {
                      setSendError(`Amount exceeds wallet balance (${vaultStats?.walletBalance} MNT).`);
                      return;
                    }

                    try {
                      setSendError("");
                      await sendMnt(recipientAddress, sendAmount);
                      setRecipientAddress("");
                      setSendAmount("");
                      setShowSendForm(false);
                    } catch (err: any) {
                      setSendError(err.message || "Transfer failed.");
                    }
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {txState === "waiting" || txState === "pending" ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Confirm Send"
                  )}
                </button>
              </motion.div>
            )}

            <div className="h-px bg-black/[0.04]" />

            <button
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
              className="w-full py-3 bg-red-50 hover:bg-red-100/80 text-red-600 text-[11px] uppercase tracking-[0.15em] font-bold rounded-xl transition-all border border-red-200/30 cursor-pointer"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
