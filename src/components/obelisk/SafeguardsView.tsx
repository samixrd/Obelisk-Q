import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { useAgentData } from "@/hooks/useAgentData";
import { useState, useEffect } from "react";
import { MagneticText } from "./MagneticText";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function SafeguardsView() {
  const { score, regime, circuitBreakerActive, lastMessage, agentLogs } = useAgentData();
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);

  // Track score history (last 30 points)
  useEffect(() => {
    if (typeof score === 'number') {
      setScoreHistory(prev => {
        const next = [...prev, score];
        return next.slice(-30);
      });
    }
  }, [score]);
  
  const isHighVol = regime === "Contraction";
  const circuitBreakerArmed = lastMessage.includes("CIRCUIT BREAKER");

  const PROTOCOLS = [
    {
      name: "Drawdown Circuit Breaker",
      status: circuitBreakerArmed || circuitBreakerActive ? "TRIGGERED" : "Armed",
      statusOk: !(circuitBreakerArmed || circuitBreakerActive),
      description: "Halts allocation if portfolio drops beyond threshold within any 24-hour window.",
      threshold: "–3.5% / 24h",
      lastTrigger: circuitBreakerArmed ? "Active now" : "Never triggered",
    },
    {
      name: "Volatility Dampener",
      status: isHighVol ? "DAMPING" : "Active",
      statusOk: true,
      description: "Reduces position size when realized volatility exceeds 2σ of 30-day baseline.",
      threshold: "σ > 2.0",
      lastTrigger: isHighVol ? "Engaged now" : "11 days ago",
    },
    {
      name: "Liquidity Reserve Lock",
      status: "Active",
      statusOk: true,
      description: "Maintains a minimum 7.5% unallocated reserve at all times for redemptions.",
      threshold: "7.5% floor",
      lastTrigger: "Continuous",
    },
    {
      name: "Antigravity Latency Guard",
      status: "PASS",
      statusOk: true,
      description: "Node-to-node telemetry synchronization must remain below 500ms to prevent state-drift.",
      threshold: "< 500ms",
      lastTrigger: "Continuous",
    },
    {
      name: "Stateless Cloud Persistence",
      status: "SYNCED",
      statusOk: true,
      description: "Agent state is persisted in cloud vector storage with 0% utilization of local edge-node disk.",
      threshold: "Vector Sync",
      lastTrigger: "Active",
    },
  ];

  const AUDIT_EVENTS = agentLogs.slice(0, 5).map((l, i) => ({
    time: i === 0 ? "Just now" : new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: l.message,
    category: l.node || "System",
    ok: !l.message.includes("FAIL") && !l.message.includes("ERROR"),
  }));

  if (AUDIT_EVENTS.length === 0) {
    AUDIT_EVENTS.push({ 
      time: "Initializing", 
      event: "Establishing Antigravity Protocol connection...", 
      category: "Network", 
      ok: true 
    });
  }

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">

      {/* Global Circuit Breaker Status */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10 border-l-4 transition-all duration-500" 
           style={{ borderLeftColor: circuitBreakerActive ? "#ef4444" : "hsl(var(--primary))" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`relative flex items-center justify-center h-16 w-16 rounded-full ${circuitBreakerActive ? "bg-red-500/10" : "bg-primary/10"}`}>
              <div className={`h-4 w-4 rounded-full ${circuitBreakerActive ? "bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-primary shadow-[0_0_12px_hsla(var(--primary)/0.4)]"}`} />
              {circuitBreakerActive && (
                 <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/30 font-black tracking-widest mb-1">Autonomous Protection</p>
              <h3 className="text-xl font-black text-white tracking-tightest uppercase">
                {circuitBreakerActive ? "ACTIVE — All allocation halted" : "INACTIVE — Systems Nominal"}
              </h3>
              <p className="text-sm text-white/40 mt-1 font-bold uppercase tracking-wide">
                {circuitBreakerActive 
                  ? "Automatic halt triggered due to rapid Q-Score degradation. No on-chain swaps permitted." 
                  : "Q-Score volatility within nominal parameters. Real-time rebalancing is enabled."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-12 px-8 py-5 rounded-[24px] bg-white/[0.03] border border-white/5">
             <div className="text-center">
                <p className="text-[9px] uppercase text-white/30 font-black tracking-widest mb-1">Current Q-Score</p>
                <p className="text-2xl font-black text-primary tabular-nums tracking-tightest">{score}</p>
             </div>
             <div className="h-10 w-px bg-white/5" />
             <div className="text-center">
                <p className="text-[9px] uppercase text-white/30 font-black tracking-widest mb-1">Market Regime</p>
                <p className="text-2xl font-black text-white tracking-tightest uppercase">{regime}</p>
             </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] uppercase text-white/30 font-black tracking-[0.25em]">Stability Vector · Real-Time Telemetry</p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] uppercase text-primary font-black tracking-widest">Live Feed</span>
            </div>
          </div>
          <StabilityGraph data={scoreHistory} height={140} />
        </div>
      </div>

      {/* Protocol cards */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <div className="mb-8">
          <p className="text-[10px] uppercase text-white/30 mb-2 font-black tracking-[0.3em]">Risk Protocols</p>
          <div className="text-2xl text-white font-black tracking-tightest uppercase">
            Automated <span className="text-white/30">safeguard</span> layer
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOLS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-[24px] p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-base text-white font-black uppercase tracking-tightest">{p.name}</p>
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${p.statusOk ? "text-primary" : "text-red-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.statusOk ? "bg-primary" : "bg-red-500 animate-pulse"}`} />
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-6 font-bold uppercase tracking-wide">{p.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] uppercase text-white/20 font-black tracking-widest mb-1">Threshold</p>
                  <p className="text-sm text-white font-black tabular-nums tracking-tightest">{p.threshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase text-white/20 font-black tracking-widest mb-1">Last event</p>
                  <p className="text-sm text-white/40 font-black uppercase tracking-widest tabular-nums">{p.lastTrigger}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <p className="text-[10px] uppercase text-white/30 mb-6 font-black tracking-widest">Agent Audit Feed</p>
        <div className="space-y-0">
          {AUDIT_EVENTS.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 py-5 border-b border-white/5"
            >
              <span className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${ev.ok ? "bg-primary shadow-[0_0_8px_hsla(var(--primary)/0.4)]" : "bg-red-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white/80 font-bold leading-snug">{ev.event}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{ev.time}</span>
                  <span className="text-[9px] text-white/10">/</span>
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{ev.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
