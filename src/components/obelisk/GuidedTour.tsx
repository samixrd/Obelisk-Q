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
    note: null,
    target: "#tour-stability-score",
  },
  {
    eyebrow: "Step · 02 · How it thinks",
    title: (
      <>
        A single number for <span className="italic">peace of mind</span>.
      </>
    ),
    body: "Your Stability Score is a composite of three weighted signals: 40% Yield Differential, 35% Volatility Penalty, and 25% Liquidity Depth. A 5% circuit breaker halts all allocation if the score drops 5 points within any 60-minute window. In Contraction regimes the confidence threshold rises to 75%; in Expansion or Consolidation markets it sits at 60-65%.",
    accent: null,
    note: "The engine identifies Market Regimes (Expansion/Consolidation/Contraction) through Hidden Markov Model analysis of volatility to dynamically assign Control Transfer Functions (H(s)).",
    target: "#tour-stability-score",
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
    note: null,
    target: "#tour-invest-button",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GuidedTour({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const targetSelector = steps[step].target;
      const element = document.querySelector(targetSelector);
      
      if (element && tooltipRef.current) {
        // Scroll target into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait a bit for scroll to settle before measuring
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const tooltipRect = tooltipRef.current!.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          // Position tooltip below the element, but keep it within viewport
          // If it doesn't fit below, we could put it above, but the user suggested Math.min(rect.bottom, ...)
          let top = rect.bottom + 20;
          let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

          // Bound checks
          if (top + tooltipRect.height > viewportHeight - 20) {
            top = rect.top - tooltipRect.height - 20;
          }
          
          top = Math.max(20, Math.min(top, viewportHeight - tooltipRect.height - 20));
          left = Math.max(20, Math.min(left, viewportWidth - tooltipRect.width - 20));

          setCoords({ top, left });
        }, 100);
      } else {
        // Fallback to center if no target found
        setCoords(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [open, step]);

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
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/40 backdrop-blur-sm"
        >
          {/* Subtle radial accent */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(104 100% 78% / 0.1), transparent 70%)" }}
          />

          {/* Close */}
          <button
            onClick={skip}
            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors duration-500 z-[10000]"
            aria-label="Skip tour"
          >
            <IconClose size={18} />
          </button>

          <div className="min-h-full w-full flex items-center justify-center p-6">
            <motion.div 
              ref={tooltipRef}
              layout
              style={coords ? {
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                margin: 0,
                zIndex: 10001
              } : {}}
              className={`relative w-full max-w-[480px] bg-background rounded-2xl p-8 md:p-10 shadow-2xl border border-border/50 transition-all duration-500 ease-[0.22,1,0.36,1] ${!coords ? 'opacity-0' : 'opacity-100'}`}
            >
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
                <h2 
                  className="text-4xl md:text-5xl font-display tracking-tighter text-foreground leading-[1.1] text-balance"
                >
                  {s.title}
                </h2>
                <p 
                  className="mt-8 text-base text-muted-foreground max-w-md mx-auto leading-relaxed text-balance"
                >
                  {s.body}
                </p>
                {s.note && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 mx-auto max-w-md px-5 py-4 text-left"
                    style={{
                      background: "rgba(0,0,0,0.03)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <p
                      className="text-[9px] uppercase text-muted-foreground mb-2 font-mono-num tracking-[0.28em] font-light"
                    >
                      Regime Detection
                    </p>
                    <p
                      className="text-[11px] leading-relaxed font-mono-num font-light text-muted-foreground tracking-tight"
                    >
                      {s.note}
                    </p>
                  </motion.div>
                )}
                {s.accent && <p className="mt-6 italic text-sm text-primary font-medium tracking-tight">{s.accent}</p>}
              </motion.div>
            </AnimatePresence>

            <div className="mt-14 flex flex-col items-center gap-6">
              <button
                onClick={next}
                className="group inline-flex items-center gap-3 px-8 py-3 bg-black rounded-full text-[11px] uppercase tracking-luxe text-white hover:bg-black/90 transition-colors duration-300 font-display"
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
