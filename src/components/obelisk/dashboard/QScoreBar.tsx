import { motion } from "framer-motion";
import { useStability } from "../StabilityContext";
import { useYieldData } from "@/hooks/useYieldData";
import { Logo } from "../Logo";

export function QScoreBar() {
  const { adaptive, setVolatility, engineLoading, components } = useStability();
  const isHighVol = adaptive.volatility === "high";

  const { usdy, meth } = useYieldData();
  const spread = Math.abs(usdy.apy - meth.apy).toFixed(1);

  const metrics = [
    { 
      label: "Live Yields",   
      value: `USDY ${usdy.apy.toFixed(1)}% · mETH ${meth.apy.toFixed(1)}% · Spread ${spread}%`, 
      unit: "", 
      color: "#000" 
    },
    { label: "Risk Score",    value: "0.42",                                                                   unit: "σ",    color: "#000" },
    { label: "Accuracy",      value: engineLoading ? "—" : String(Math.round(components.volatility_score)),  unit: "%",    color: "#000" },
    { label: "Uptime",        value: "99.9",                                                                   unit: "%",    color: "#000" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card-premium rounded-3xl px-6 md:px-10 py-5 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12"
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03), inset 0 0 20px rgba(255,255,255,0.4)"
      }}
    >
      {/* Left: identity */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="h-10 w-10 rounded-2xl bg-foreground flex items-center justify-center shadow-lg shadow-foreground/10">
          <Logo size={22} className="text-background" />
        </div>
        <div className="flex flex-col">
          <span
            className="text-[10px] font-bold uppercase text-foreground/90 tracking-[0.2em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Q-Score Engine
          </span>
          <span
            className="text-[9px] uppercase text-muted-foreground/60 tracking-[0.1em] font-mono"
          >
            ERC-8004 Protocol
          </span>
        </div>
        <div className="hidden xl:block h-8 w-px bg-foreground/5 ml-2" />
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
            <span
              className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
            >
              {m.label}
            </span>
            <span
              className="text-base md:text-[17px]"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.01em",
                color: m.color,
                fontWeight: 400,
              }}
            >
              {m.value}
              <span className="text-[10px] text-muted-foreground/40 ml-0.5 font-normal">{m.unit}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Right: regime toggle */}
      <div className="flex items-center gap-5 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 border-foreground/5 pt-6 lg:pt-0">
        <div className="flex flex-col items-end hidden xl:flex mr-2">
          <span className="text-[9px] uppercase text-muted-foreground/50 tracking-[0.15em] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Status
          </span>
          <span className="text-[10px] text-foreground/40 font-mono">Real-time</span>
        </div>
        <button
          onClick={() => setVolatility(isHighVol ? "low" : "high")}
          className="relative flex items-center overflow-hidden w-full md:w-[180px]"
          style={{
            background: "rgba(0,0,0,0.04)",
            padding: "3px",
            height: "36px",
            borderRadius: "18px",
            border: "1px solid rgba(0,0,0,0.03)"
          }}
          title="Toggle volatility regime (demo)"
        >
          {(["low", "high"] as const).map((v) => (
            <span
              key={v}
              className="relative z-10 px-4 text-[10px] font-bold uppercase transition-colors duration-500 w-1/2 text-center"
              style={{
                letterSpacing: "0.1em",
                fontFamily: "'Inter', sans-serif",
                color:
                  adaptive.volatility === v
                    ? "#000"
                    : "rgba(0,0,0,0.25)",
              }}
            >
              {v === "low" ? "Stable" : "Volatile"}
            </span>
          ))}
          <motion.span
            className="absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] pointer-events-none"
            animate={{ x: isHighVol ? "calc(100% + 0px)" : "0%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              borderRadius: "15px",
            }}
          />
        </button>
      </div>
    </motion.div>
  );
}
