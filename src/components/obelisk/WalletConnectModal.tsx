/**
 * WalletConnectModal — shown when a Google-authenticated user wants to
 * link a wallet post-login. Clean, light-themed Agent Layer aesthetic.
 */
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { modal } from "@/config/wallet";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useVault } from "@/hooks/useVault";
import { toast } from "@/hooks/use-toast";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension · EVM compatible",
    icon: (
      <svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="#e2761b" d="M28.7 5l-12.8 7.8 6.1-1.3zM3.3 5l12.8 7.8-6.1-1.3z" />
        <path fill="#e4761b" d="M25.8 24.3l-9.1 2.1 2.1-7.3zM6.2 24.3l9.1 2.1-2.1-7.3z" />
        <path fill="#d7c1b3" d="M25.4 11.3l-5.1 1.9.5-3.2zM6.6 11.3l5.1 1.9-.5-3.2z" />
        <path fill="#233447" d="M16 18.6l-3.3-2.3.2-.3zM16 18.6l3.3-2.3-.2-.3z" />
        <path fill="#cd7d32" d="M16 16.3L13.8 20h4.4z" />
        <path fill="#e4761b" d="M25.8 24.3l-5.1-7.5-2.5 8 7.6-.5zM6.2 24.3l7.6.5-2.5-8-5.1 7.5z" />
        <path fill="#f6851b" d="M11.1 17.1l-2.1 3.1 7-.4-.3-8zM20.9 17.1l-4.7-4.4-.3 8.1 7-.4-2.1-3.2z" />
        <path fill="#f6851b" d="M11.4 29.5l4-1.9-3.4-2.6zM20.6 29.5l-.6-4.5-3.4 2.6z" />
        <path fill="#e2761b" d="M11.1 17.1l4.6-4.4.3 7.9-4.9 1.5zM20.9 17.1l-1.9 6.1-4.9-1.5.3-7.9 4.7 4.4z" />
        <path fill="#d7c1b3" d="M11.4 29.5l.5-4.5h8.2l.5 4.5-4.6-2.2z" />
      </svg>
    ),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody · Mantle supported",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z" fill="#0052FF"/>
        <path d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" fill="white"/>
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#0052FF"/>
      </svg>
    ),
  },
  {
    id: "trust",
    name: "Trust Wallet",
    desc: "Mobile app · Binance ecosystem",
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
        <path d="M12 0L3 3.6v7.2C3 16.5 6.8 21.8 12 24c5.2-2.2 9-7.5 9-13.2V3.6L12 0z" fill="#3375BB"/>
        <path d="M12 2.4l7.2 2.9v6.5c0 4.6-3 8.8-7.2 10.6-4.2-1.8-7.2-6-7.2-10.6V5.3l7.2-2.9z" fill="white" fillOpacity="0.2"/>
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
  const { address: appKitAddress, isConnected } = useAppKitAccount();
  const { connect } = useVault();

  // Sync AppKit connection back to our auth context
  useEffect(() => {
    if (isConnected && appKitAddress && open) {
      onConnected(appKitAddress);
      onClose();
    }
  }, [isConnected, appKitAddress, open, onConnected, onClose]);

  const handleConnect = async (walletId: string) => {
    try {
      if (walletId === "walletconnect") {
        await modal.open();
        return;
      }

      // For MetaMask, Coinbase, etc. use our standard hook logic
      // which handles window.ethereum injection
      await connect();
      
      // The address should be picked up by the auth context via the hook
      // but we need to notify the parent to close the modal
      const eth = (window as any).ethereum;
      if (eth) {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts?.[0]) {
          onConnected(accounts[0]);
          onClose();
        }
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      toast({
        title: "Connection Failed",
        description: err.message || "Could not connect wallet.",
        variant: "destructive",
      });
    }
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
                <div className="flex items-start gap-4 mb-8">
                  <Logo size={32} className="text-foreground shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600/80">
                      Connect Infrastructure
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
                      Link your wallet
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Select a provider to authenticate your identity.
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
