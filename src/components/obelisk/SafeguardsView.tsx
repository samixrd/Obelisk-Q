import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { DecisionTransparency } from "./DecisionTransparency";
import { useAgentFeed } from "@/hooks/useAgentFeed";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

import { MagneticText } from "./MagneticText";

export function SafeguardsView() {
  const { logs } = useAgentFeed();
  const { score, regime, lastMessage } = useAgentWebSocket();
  
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
      name: "Counterparty Exposure Cap",
      status: "Active",
      statusOk: true,
      description: "No single protocol may represent more than 45% of total allocated capital.",
      threshold: "45% max",
      lastTrigger: "4 days ago",
    },
  ];

  const AUDIT_EVENTS = [
    { time: "Just now", event: lastMessage, category: "AI Decision", ok: !circuitBreakerArmed },
    { time: "14:32:01", event: "Volatility scan passed", category: "Routine", ok: true },
    { time: "14:31:45", event: "mETH position rebalanced –0.8%", category: "Auto-adjust", ok: true },
    { time: "09:14:22", event: "Liquidity check · reserve at 8.2%", category: "Routine", ok: true },
    { time: "Yesterday", event: "Drawdown circuit test · PASS", category: "Scheduled", ok: true },
  ];

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">

      {/* Header stat row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Protocols Active", value: circuitBreakerArmed ? "3 / 4" : "4 / 4", note: circuitBreakerArmed ? "Circuit triggered" : "All systems normal" },
          { label: "Risk Score", value: isHighVol ? "0.68σ" : "0.42σ", note: isHighVol ? "High Volatility detected" : "Well within bounds" },
          { label: "Days Without Incident", value: "186", note: "Consecutive" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl px-8 py-6"
          >
            <p className="text-[10px] uppercase text-muted-foreground mb-4" style={{ letterSpacing: "0.28em" }}>{s.label}</p>
            <p className="text-3xl md:text-4xl text-foreground font-bold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>{s.value}</p>
            <p className="mt-2 text-[10px] text-muted-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{s.note}</p>
          </motion.div>
        ))}
      </div>

      {/* Protocol cards */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <div className="mb-8">
          <p className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.28em" }}>Risk Protocols</p>
          <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 }}>
            <MagneticText text="Automated" />
            <div style={{ fontWeight: 300 }}><MagneticText text="safeguard" /></div>
            <MagneticText text="layer" />
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
              <MagneticText text="Consistently" />
              <div style={{ fontWeight: 300 }}><MagneticText text="within envelope" /></div>
            </div>
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

      <DecisionTransparency />

      {/* Mini Agent Feed */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", fontWeight: 600 }}>
            <MagneticText text="Agent" />
            <div style={{ fontWeight: 300 }}><MagneticText text="Signals" /></div>
          </div>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-t border-foreground/[0.03]">
              <span className="text-[10px] text-muted-foreground/40 font-mono w-16">
                {log.timestamp.toLocaleTimeString('en-GB', { hour12: false })}
              </span>
              <div className="px-2 py-0.5 rounded text-[8px] font-bold w-14 text-center tracking-tighter"
                style={{ 
                  background: log.action === 'rebalance' ? 'hsl(104 100% 68% / 0.1)' : 'rgba(0,0,0,0.05)',
                  color: log.action === 'rebalance' ? 'hsl(104 100% 30%)' : 'rgba(0,0,0,0.5)'
                }}
              >
                {log.action.toUpperCase()}
              </div>
              <span className="flex-1 text-xs text-foreground/60 font-mono truncate">
                {log.message}
              </span>
              <span className="text-[10px] text-foreground font-mono">
                {log.score}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center py-4 text-[10px] uppercase text-muted-foreground/30 tracking-widest">
              Initializing agent feed...
            </p>
          )}
        </div>
      </div>

    </motion.div>
  );
}
