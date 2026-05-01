import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { IconArrowRight } from "./LineIcons";

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");

  const next = () => {
    if (step < 2) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex items-center justify-center overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-gradient-neon opacity-20" />
      <div className="absolute inset-0 vignette" />

      <div className="relative w-full max-w-md px-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-8">
                A private invitation
              </p>
              <h1 className="font-serif text-6xl md:text-7xl tracking-tightest text-foreground text-balance leading-[0.95]">
                Welcome to
                <br />
                <span className="italic font-light">Obelisk Q</span>
              </h1>
              <p className="mt-8 text-sm text-muted-foreground max-w-sm mx-auto text-balance leading-relaxed">
                A concierge-grade intelligence that quietly tends to your capital on the Mantle Network.
              </p>
              <button
                onClick={next}
                className="mt-14 group inline-flex items-center gap-3 text-[11px] uppercase tracking-luxe text-foreground hover:text-neon transition-colors duration-700"
              >
                Begin
                <span className="h-px w-10 bg-foreground/40 group-hover:bg-neon transition-colors duration-700" />
                <IconArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-6 text-center">
                Step · 01
              </p>
              <h2 className="font-serif text-4xl text-foreground text-center mb-2 tracking-tightest">
                Your <span className="italic">address</span>
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-12">
                No wallets, no seed phrases. Just an email.
              </p>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-transparent border-0 border-b border-border-strong pb-3 text-2xl font-serif text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon transition-colors duration-500"
                  autoFocus
                />
              </div>

              <button
                onClick={next}
                disabled={!email.includes("@")}
                className="mt-14 w-full group inline-flex items-center justify-center gap-3 py-3 border border-border-strong rounded-full text-[11px] uppercase tracking-luxe text-foreground hover:border-neon hover:text-neon transition-all duration-700 disabled:opacity-30 disabled:pointer-events-none"
              >
                Continue
                <IconArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="mx-auto mb-10 h-20 w-20 rounded-full bg-gradient-neon flex items-center justify-center animate-breathe">
                <div className="h-2 w-2 rounded-full bg-neon shadow-neon" />
              </div>
              <h2 className="font-serif text-5xl text-foreground tracking-tightest mb-4">
                At your <span className="italic">service</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-12">
                Your agent is calibrated. A steady hand, always watching.
              </p>
              <button
                onClick={next}
                className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-metal rounded-full text-[11px] uppercase tracking-luxe text-primary-foreground font-medium"
              >
                Enter the Vault
                <IconArrowRight size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-px transition-all duration-700 ${i === step ? "w-10 bg-neon" : "w-5 bg-border-strong"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
