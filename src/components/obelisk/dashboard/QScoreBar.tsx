import { motion } from "framer-motion";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { Logo } from "../Logo";
import { MagneticText } from "../MagneticText";

export function QScoreBar() {
  const { score, regime, countdown, liveYields } = useAgentWebSocket();
  const isHighVol = regime === "Contraction" || regime === "Volatile";

  const spread = Math.abs(liveYields.usdy - liveYields.meth).toFixed(1);

  const metrics = [
    { 
      label: "Next Scan",   
      value: `${countdown}s`, 
      unit: "to cycle",
      id: "scan"
    },
    { 
      label: "Live Yields",   
      value: `USDY ${liveYields.usdy.toFixed(1)}% · mETH ${liveYields.meth.toFixed(1)}%`, 
      unit: "",
      id: "yields"
    },
    { label: "Stability Score", value: String(score), unit: "/ 100", id: "score" },
    { label: "Current Spread", value: spread, unit: "%", id: "spread" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[100px] px-8 md:px-14 py-6 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative z-20"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(40px) saturate(190%)",
        WebkitBackdropFilter: "blur(40px) saturate(190%)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
      }}
    >
      {/* ── Left: Identity ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 flex-shrink-0 group">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="h-11 w-11 rounded-[14px] bg-black flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-shadow group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          <Logo size={24} className="text-white" />
        </motion.div>
        <div className="flex flex-col">
          <div className="text-[11px] font-bold uppercase text-black tracking-[0.24em] mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <MagneticText text="Q-Score Engine" />
          </div>
          <span className="text-[10px] uppercase text-muted-foreground/40 tracking-[0.12em] font-medium">
            Active Scanning
          </span>
        </div>
        <div className="hidden xl:block h-10 w-px bg-black/[0.06] ml-4" />
      </div>

      {/* ── Centre: Metrics ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:flex items-center gap-x-12 gap-y-8 lg:gap-16 flex-1 justify-center w-full md:w-auto px-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center lg:items-start gap-1.5"
          >
            <span className="text-[9px] uppercase text-muted-foreground/40 tracking-[0.2em] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
              {m.label}
            </span>
            <div className="text-base md:text-[17px] font-bold text-black flex items-baseline gap-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
              <MagneticText text={m.value} />
              {m.unit && (
                <span className="text-[10px] text-muted-foreground/30 font-medium uppercase tracking-wider">{m.unit}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Right: Regime Status ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 border-black/[0.04] pt-8 lg:pt-0">
        <div className="flex flex-col items-end hidden xl:flex mr-2">
          <span className="text-[9px] uppercase text-muted-foreground/30 tracking-[0.18em] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Current Regime
          </span>
          <div className="text-[10px] text-black/30 font-medium tracking-tight">AI Synchronized</div>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-4 shadow-[0_8px_20px_rgba(0,0,0,0.12)] cursor-default select-none transition-shadow hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
        >
          <div className="relative flex items-center justify-center">
             <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isHighVol ? "bg-orange-400" : "bg-emerald-400"}`} />
             <span className={`h-2 w-2 rounded-full relative z-10 ${isHighVol ? "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,1)]" : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]"}`} />
          </div>
          <MagneticText text={`${regime} Mode`} />
        </motion.div>
      </div>
    </motion.div>
  );
}

