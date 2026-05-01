// Concierge "Guided Tour" — explains Obelisk Q's stability logic in plain
// language. Three short steps. Skippable. Stored in localStorage so it
// only appears for first-time users.
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IconArrowRight, IconClose } from "./LineIcons";

const KEY = "obelisk_q_tour_seen";

const steps = [
  {
    eyebrow: "Step · 01",
    title: (
      <>
        We manage your <span className="italic">risk</span>,
        <br />
        so you don't have to.
      </>
    ),
    body: "Obelisk Q continuously monitors your portfolio against thousands of market scenarios. If conditions drift, the agent rebalances on your behalf — quietly, automatically.",
    accent: "Stability before yield.",
  },
  {
    eyebrow: "Step · 02",
    title: (
      <>
        A single number for <span className="italic">peace of mind</span>.
      </>
    ),
    body: "Your Stability Score (0–100) tells you everything. Above 90 means your capital is well within safe parameters. The agent never lets it drop without warning.",
    accent: "Today, you're at 98.",
  },
  {
    eyebrow: "Step · 03",
    title: (
      <>
        One tap is all it <span className="italic">takes</span>.
      </>
    ),
    body: "Press 'Invest' to put idle capital to work. Obelisk Q allocates across managed assets like USDY and mETH with a built-in Safety Buffer to absorb shocks.",
    accent: "Always reversible.",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GuidedTour({ open, onClose }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      localStorage.setItem(KEY, "1");
      onClose();
    }
  };

  const skip = () => {
    localStorage.setItem(KEY, "1");
    onClose();
  };

  const s = steps[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          {/* Subtle radial accent */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(104 100% 78% / 0.06), transparent 60%)" }}
          />

          {/* Close */}
          <button
            onClick={skip}
            className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors duration-500"
            aria-label="Skip tour"
          >
            <IconClose size={18} />
          </button>

          <div className="relative w-full max-w-xl px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-8">
                  {s.eyebrow} · A guided tour
                </p>
                <h2 className="font-serif text-5xl md:text-6xl tracking-tightest text-foreground leading-[0.98] text-balance">
                  {s.title}
                </h2>
                <p className="mt-8 text-base text-muted-foreground max-w-md mx-auto leading-relaxed text-balance">
                  {s.body}
                </p>
                <p className="mt-6 font-serif italic text-sm text-neon">{s.accent}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-14 flex flex-col items-center gap-6">
              <button
                onClick={next}
                className="group inline-flex items-center gap-3 px-8 py-3 bg-gradient-metal rounded-full text-[11px] uppercase tracking-luxe text-primary-foreground font-medium hover:shadow-dial transition-shadow duration-500"
              >
                {step === steps.length - 1 ? "Begin" : "Continue"}
                <IconArrowRight size={12} />
              </button>
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-px transition-all duration-700 ${
                      i === step ? "w-10 bg-foreground" : "w-5 bg-border-strong/60"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={skip}
                className="text-[10px] uppercase tracking-luxe text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                Skip the tour
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function shouldShowTour() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(KEY);
}
