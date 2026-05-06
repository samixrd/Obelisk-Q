import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState } from "react";

export function OptimizationDial() {
  const [engaged, setEngaged] = useState(false);
  const rotation = useMotionValue(0);
  const dialRotate = useTransform(rotation, (v) => `${v}deg`);

  const handleClick = () => {
    if (engaged) return;
    setEngaged(true);
    animate(rotation, rotation.get() + 270, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    });
    setTimeout(() => setEngaged(false), 2400);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">One-Click Optimization</p>

      <button
        onClick={handleClick}
        className="relative group"
        aria-label="Optimize portfolio"
      >
        {/* Outer ring */}
        <div className="absolute -inset-3 rounded-full border border-border-strong/30 group-hover:border-neon/40 transition-colors duration-700" />
        <div className="absolute -inset-3 rounded-full border border-transparent group-hover:border-neon/20 transition-all duration-700"
          style={{
            background: engaged
              ? "conic-gradient(from 0deg, transparent, hsl(104 100% 82% / 0.5), transparent)"
              : "transparent",
          }}
        />

        {/* The dial */}
        <motion.div
          style={{ rotate: dialRotate }}
          className="relative h-36 w-36 rounded-full bg-gradient-metal shadow-dial flex items-center justify-center"
        >
          {/* Tick marks */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-2 left-1/2 h-1.5 w-px bg-metal-dark/60"
              style={{
                transform: `translateX(-50%) rotate(${i * 15}deg)`,
                transformOrigin: "center 4.25rem",
              }}
            />
          ))}
          {/* Inner plate */}
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-metal-mid via-metal-dark to-background flex items-center justify-center">
            <div className="absolute inset-1 rounded-full border border-background/40" />
            {/* Indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3 w-0.5 bg-neon rounded-full shadow-neon" />
            <span className="font-serif italic text-background/80 text-lg">Q</span>
          </div>
        </motion.div>
      </button>

      <div className="text-center">
        <p className="font-mono-num text-sm text-foreground">
          {engaged ? "Rebalancing…" : "Tap to optimize"}
        </p>
        <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mt-1">
          Est. gain · +0.42%
        </p>
      </div>
    </div>
  );
}
