import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { MagneticText } from "./MagneticText";

export function ComplianceGate({ onVerified }: { onVerified: () => void }) {
  const [step, setStep] = useState<"intro" | "scanning" | "verified">("intro");

  const startScan = () => {
    setStep("scanning");
    setTimeout(() => setStep("verified"), 2400);
  };

  useEffect(() => {
    if (step === "verified") {
      const timer = setTimeout(onVerified, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, onVerified]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background">
      <div className="landing-glow-border pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] glass-card-premium p-10 md:p-14 text-center space-y-10"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-[24px] bg-black flex items-center justify-center shadow-2xl shadow-black/20">
            <Logo size={32} className="text-white" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <MagneticText text="Institutional Access" />
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Obelisk Q bridges Real-World Assets on Mantle. To proceed, we must verify your wallet against the Antigravity Compliance Protocol.
                </p>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={startScan}
                  className="w-full py-5 bg-black text-white rounded-full text-sm font-bold uppercase tracking-[0.15em] shadow-xl hover:shadow-black/20 transition-all active:scale-[0.98]"
                >
                  Verify Wallet Identity
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">
                Mantle Network · ERC-8004 Standard
              </p>
            </motion.div>
          )}

          {step === "scanning" && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 py-4"
            >
              <div className="relative h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 w-1/2 bg-black/20 rounded-full"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-black uppercase tracking-widest animate-pulse">
                  Scanning Wallet Attestations
                </p>
                <p className="text-[11px] text-muted-foreground/60 font-medium">
                  Checking against global RWA compliance database...
                </p>
              </div>
            </motion.div>
          )}

          {step === "verified" && (
            <motion.div 
              key="verified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4"
            >
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-emerald-600 tracking-tight">
                  Identity Verified
                </p>
                <p className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                  Compliance Check: PASSED
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
