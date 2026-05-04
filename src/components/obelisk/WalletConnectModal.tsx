/**
 * WalletConnectModal — shown when a Google-authenticated user wants to
 * link a wallet post-login. Clean, light-themed Agent Layer aesthetic.
 */
import { AnimatePresence, motion } from "framer-motion";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension · EVM compatible",
    icon: (
      <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
        <path d="M36.2 3L22 14.3l2.5-5.9L36.2 3z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.8 3l14.1 11.4-2.4-6L3.8 3z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30.9 27.5l-3.8 5.8 8.1 2.2 2.3-7.9-6.6-.1zM2.6 27.6l2.3 7.9 8.1-2.2-3.8-5.8-6.6.1z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.6 18.2l-2.2 3.4 7.9.4-.3-8.5-5.4 4.7zM27.4 18.2l-5.5-4.8-.3 8.6 7.9-.4-2.1-3.4z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 33.3l4.7-2.3-4.1-3.2-.6 5.5zM22.3 31l4.7 2.3-.5-5.5-4.2 3.2z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    desc: "QR code · Mobile wallets",
    icon: (
      <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
        <rect width="40" height="40" rx="10" fill="#3B99FC" fillOpacity="0.1"/>
        <path d="M9 16.5c6.1-5.9 15.9-5.9 22 0l.7.7c.3.3.3.8 0 1.1l-2.5 2.4c-.2.1-.4.1-.5 0l-1-1c-4.2-4.1-11.1-4.1-15.3 0l-1 1c-.2.1-.4.1-.5 0L8.4 18.3c-.3-.3-.3-.8 0-1.1l.6-.7zm27.2 5L38.5 24c.3.3.3.8 0 1.1L28 35.6c-.3.3-.8.3-1.1 0l-7.4-7.1c-.1-.1-.3-.1-.4 0l-7.4 7.1c-.3.3-.8.3-1.1 0L1.2 25.1c-.3-.3-.3-.8 0-1.1l2.3-2.2c.3-.3.8-.3 1.1 0l7.4 7.1c.1.1.3.1.4 0l7.4-7.1c.3-.3.8-.3 1.1 0l7.4 7.1c.1.1.3.1.4 0l7.4-7.1c.3-.3.8-.3 1.1 0z" fill="#3B99FC"/>
      </svg>
    ),
  },
  {
    id: "ledger",
    name: "Ledger",
    desc: "Hardware wallet · Maximum security",
    icon: (
      <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
        <rect width="40" height="40" rx="10" fill="rgba(0,0,0,0.05)"/>
        <path d="M8 8h10v3H11v10H8V8zM32 32H22v-3h7V19h3v13z" fill="rgba(0,0,0,0.8)"/>
        <rect x="8" y="23" width="3" height="9" fill="rgba(0,0,0,0.8)"/>
        <rect x="29" y="8" width="3" height="9" fill="rgba(0,0,0,0.8)"/>
      </svg>
    ),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody · Mantle supported",
    icon: (
      <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
        <rect width="40" height="40" rx="10" fill="#1652F0" fillOpacity="0.1"/>
        <circle cx="20" cy="20" r="10" stroke="#1652F0" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="20" r="4" fill="#1652F0" fillOpacity="0.6"/>
      </svg>
    ),
  },
];

interface WalletConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (address: string) => void;
}

export function WalletConnectModal({ open, onClose, onConnected }: WalletConnectModalProps) {
  const handleConnect = (walletId: string) => {
    const mockAddress = "0x4f3a…c12e";
    onConnected(mockAddress);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(240, 242, 245, 0.75)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative w-full max-w-[420px] overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                borderRadius: "28px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 32px 80px -16px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.02)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Visual */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20" />

              <div className="p-8">
                {/* Header row */}
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600/80">
                      Connect Infrastructure
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
                      Link your wallet
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
                      Select a provider to authenticate your on-chain identity and manage assets.
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 -mt-1 -mr-1 rounded-full hover:bg-black/5 text-muted-foreground hover:text-black transition-all"
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Wallet options */}
                <div className="space-y-2.5">
                  {WALLETS.map((w, i) => (
                    <motion.button
                      key={w.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                      onClick={() => handleConnect(w.id)}
                      className="group w-full flex items-center gap-4 p-4 text-left rounded-2xl transition-all duration-300"
                      style={{
                        background: "rgba(0, 0, 0, 0.03)",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(0, 0, 0, 0.05)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 0, 0, 0.08)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(0, 0, 0, 0.03)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 0, 0, 0.04)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}
                    >
                      <div className="flex-shrink-0 p-1 bg-white rounded-xl shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                        {w.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#0a0a0a]">
                          {w.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {w.desc}
                        </p>
                      </div>
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                        className="text-black/10 group-hover:text-black/40 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Footer note */}
                <div className="mt-8 pt-6 border-t border-black/5">
                  <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    <span>Non-custodial</span>
                    <span className="w-1 h-1 rounded-full bg-black/10" />
                    <span>Mantle L2</span>
                    <span className="w-1 h-1 rounded-full bg-black/10" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
