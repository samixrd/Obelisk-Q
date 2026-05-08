import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

import { MagneticText } from "./MagneticText";

export function SafeguardsView() {
  const { score, regime, lastMessage, agentLogs } = useAgentWebSocket();
  
  const isHighVol = regime === "Contraction";
  const circuitBreakerArmed = lastMessage.includes("CIRCUIT BREAKER");

  const PROTOCOLS = [
    {
      name: "Drawdown Circuit Breaker",
      status: circuitBreakerArmed ? "TRIGGERED" : "Armed",
      statusOk: !circuitBreakerArmed,
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

  // If no logs yet, show a placeholder
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


      {/* Protocol cards */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <div className="mb-8">
          <p className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.28em" }}>Risk Protocols</p>
          <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 }}>
            <MagneticText disabled text="Automated" />
            <div style={{ fontWeight: 300 }}><MagneticText disabled text="safeguard" /></div>
            <MagneticText disabled text="layer" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOLS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-[24px] p-6 bg-black/[0.01] border border-black/5 hover:border-black/15 transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-base text-black font-bold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>{p.name}</p>
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${p.statusOk ? "text-emerald-600" : "text-red-600"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.statusOk ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">{p.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Threshold</p>
                  <p className="text-sm text-black font-bold">{p.threshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Last event</p>
                  <p className="text-sm text-muted-foreground font-medium">{p.lastTrigger}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stability graph */}
      <div className="col-span-12 lg:col-span-8 glass-card rounded-[32px] p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.28em" }}>Risk Exposure · 30 days</p>
            <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 700 }}>
              <MagneticText disabled text="Consistently" />
              <div style={{ fontWeight: 300 }}><MagneticText disabled text="within envelope" /></div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground mb-1 font-bold" style={{ letterSpacing: "0.2em" }}>Stability Score</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-[12px] text-muted-foreground font-medium">/ 100</span>
            </div>
            <p className={`text-[10px] uppercase font-bold mt-1 ${isHighVol ? "text-orange-600" : "text-emerald-600"}`} style={{ letterSpacing: "0.15em" }}>
              Regime: {regime}
            </p>
          </div>
        </div>
        <StabilityGraph seed={17} height={160} />
      </div>

      {/* Audit log */}
      <div className="col-span-12 lg:col-span-4 glass-card rounded-[32px] p-6 md:p-10">
        <p className="text-[10px] uppercase text-muted-foreground mb-6 font-bold tracking-widest">Agent Audit Feed</p>
        <div className="space-y-0">
          {AUDIT_EVENTS.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 py-4 border-b border-black/5"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${ev.ok ? "bg-emerald-500" : "bg-red-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-black font-medium leading-snug">{ev.event}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{ev.time}</span>
                  <span className="text-[9px] text-muted-foreground/30">·</span>
                  <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">{ev.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>



    </motion.div>
  );
}
