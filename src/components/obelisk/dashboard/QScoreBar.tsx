import { motion } from "framer-motion";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { Logo } from "../Logo";

export function QScoreBar() {
  const { score, regime, countdown, liveYields } = useAgentWebSocket();
  const isHighVol = regime === "Volatile";

  const spread = Math.abs(liveYields.usdy - liveYields.meth).toFixed(1);

  const metrics = [
    { 
      label: "Next Scan",   
      value: `${countdown}s`, 
      unit: "to cycle", 
      color: "#000" 
    },
    { 
      label: "Live Yields",   
      value: `USDY ${liveYields.usdy.toFixed(1)}% · mETH ${liveYields.meth.toFixed(1)}%`, 
      unit: "", 
      color: "#000" 
    },
    { label: "Stability Score", value: String(score), unit: "/ 100", color: "#000" },
    { label: "Current Spread", value: spread, unit: "%", color: "#000" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card-premium rounded-[32px] px-6 md:px-10 py-5 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 shadow-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 1)",
      }}
    >
      {/* Left: identity */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="h-10 w-10 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
          <Logo size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-black tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Q-Score Engine
          </span>
          <span className="text-[9px] uppercase text-muted-foreground/60 tracking-[0.1em] font-mono">
            Active Scanning
          </span>
        </div>
        <div className="hidden xl:block h-8 w-px bg-black/5 ml-2" />
      </div>

      {/* Centre: metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:flex items-center gap-x-12 gap-y-6 md:gap-10 flex-1 justify-center w-full md:w-auto">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
            className="flex flex-col items-center lg:items-start gap-1"
          >
            <span className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
              {m.label}
            </span>
            <span className="text-base md:text-[17px] font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
              {m.value}
              <span className="text-[10px] text-muted-foreground/40 ml-1 font-normal uppercase">{m.unit}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Right: regime status */}
      <div className="flex items-center gap-5 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 border-black/5 pt-6 lg:pt-0">
        <div className="flex flex-col items-end hidden xl:flex mr-2">
          <span className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Current Regime
          </span>
          <span className="text-[10px] text-black/40 font-mono">AI Synchronized</span>
        </div>
        
        <div className="px-6 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isHighVol ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`} />
          {regime} Mode
        </div>
      </div>
    </motion.div>
  );
}
