/**
 * WalletConnectModal — shown when a Google-authenticated user wants to
 * link a wallet post-login. Glassmorphism card, same LuxOS aesthetic as AuthScreen.
 */
import { AnimatePresence, motion } from "framer-motion";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension · EVM compatible",
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
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
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
        <rect width="40" height="40" rx="8" fill="#3B99FC" fillOpacity="0.15"/>
        <path d="M9 16.5c6.1-5.9 15.9-5.9 22 0l.7.7c.3.3.3.8 0 1.1l-2.5 2.4c-.2.1-.4.1-.5 0l-1-1c-4.2-4.1-11.1-4.1-15.3 0l-1 1c-.2.1-.4.1-.5 0L8.4 18.3c-.3-.3-.3-.8 0-1.1l.6-.7zm27.2 5L38.5 24c.3.3.3.8 0 1.1L28 35.6c-.3.3-.8.3-1.1 0l-7.4-7.1c-.1-.1-.3-.1-.4 0l-7.4 7.1c-.3.3-.8.3-1.1 0L1.2 25.1c-.3-.3-.3-.8 0-1.1l2.3-2.2c.3-.3.8-.3 1.1 0l7.4 7.1c.1.1.3.1.4 0l7.4-7.1c.3-.3.8-.3 1.1 0l7.4 7.1c.1.1.3.1.4 0l7.4-7.1c.3-.3.8-.3 1.1 0z" fill="#3B99FC"/>
      </svg>
    ),
  },
  {
    id: "ledger",
    name: "Ledger",
    desc: "Hardware wallet · Maximum security",
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
        <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.06)"/>
        <path d="M8 8h10v3H11v10H8V8zM32 32H22v-3h7V19h3v13z" fill="rgba(255,255,255,0.65)"/>
        <rect x="8" y="23" width="3" height="9" fill="rgba(255,255,255,0.65)"/>
        <rect x="29" y="8" width="3" height="9" fill="rgba(255,255,255,0.65)"/>
      </svg>
    ),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody · Mantle supported",
    icon: (
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
        <rect width="40" height="40" rx="8" fill="#1652F0" fillOpacity="0.18"/>
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
    // Simulate connection — in production wire to wagmi/ethers
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
            style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative w-full max-w-[400px]"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.008) 100%), rgba(8,8,12,0.92)",
                backdropFilter: "blur(48px)",
                WebkitBackdropFilter: "blur(48px)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-8 right-8 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />

              <div className="p-8">
                {/* Header row */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <p className="text-[9px] uppercase text-muted-foreground mb-2"
                      style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Connect wallet
                    </p>
                    <h3 className="text-2xl text-foreground"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif",
                        letterSpacing: "-0.03em", fontWeight: 400 }}>
                      Link your <span className="italic" style={{ fontWeight: 300 }}>wallet</span>
                    </h3>
                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.01em" }}>
                      Connect a wallet to sign transactions and manage on-chain positions directly.
                    </p>
                  </div>
                  <button onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors mt-1 ml-4 flex-shrink-0">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px mb-5"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)" }} />

                {/* Wallet options */}
                <div className="space-y-2">
                  {WALLETS.map((w, i) => (
                    <motion.button
                      key={w.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => handleConnect(w.id)}
                      className="group w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all duration-400"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        transition: "all 0.4s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <span className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground/85 group-hover:text-foreground transition-colors"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
                          {w.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5"
                          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em" }}>
                          {w.desc}
                        </p>
                      </div>
                      <svg viewBox="0 0 16 16" width="10" height="10" fill="none"
                        className="text-white/18 group-hover:text-white/50 transition-colors flex-shrink-0">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Footer note */}
                <p className="mt-5 text-[9px] text-muted-foreground/45 text-center leading-relaxed"
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}>
                  Non-custodial · Your keys remain yours · Mantle L2
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
