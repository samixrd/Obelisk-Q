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
    id: "walletconnect",
    name: "Email & Social Logins (Gasless)",
    desc: "Google · Apple · X · Discord · Email",
  },
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension · EVM compatible",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody · Mantle supported",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    desc: "Mobile app · Binance ecosystem",
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
                      <div className="flex-1 min-w-0 px-2">
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
