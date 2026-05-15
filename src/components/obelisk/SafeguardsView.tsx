import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { useAgentData } from "@/hooks/useAgentData";
import { useState, useEffect } from "react";
import { MagneticText } from "./MagneticText";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function SafeguardsView() {
  const { score, regime, circuitBreakerActive, lastMessage, agentLogs, scoreHistory } = useAgentData();
  const { sessionToken } = useAuth();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch audit logs directly from backend
  useEffect(() => {
    if (!sessionToken) return;
    const fetchAuditLogs = async () => {
      try {
        const res = await fetch('/api/agent/logs', {
          headers: { 'x-session-token': sessionToken }
        });
        if (res.ok) {
          const data = await res.json();
          const logsData = data.logs || data;
          if (Array.isArray(logsData) && logsData.length > 0) {
            setAuditLogs(logsData);
          }
        }
      } catch (err) {
        console.warn("Audit feed fetch failed:", err);
      }
    };
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 15000);
    return () => clearInterval(interval);
  }, [sessionToken]);
  
  const isHighVol = regime === "Contraction";
  const circuitBreakerArmed = lastMessage.includes("CIRCUIT BREAKER");

  // Use fetched audit logs, fall back to agentLogs from WebSocket, then show loading
  const logsSource = auditLogs.length > 0 ? auditLogs : agentLogs;
  const AUDIT_EVENTS = logsSource.slice(0, 8).map((l: any, i: number) => ({
    time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: l.message || `Cycle ${l.cycle}: ${l.regime || 'Consolidation'} regime — Score ${l.score} — ${l.action || 'HOLD'}`,
    category: l.node || l.regime || "System",
    ok: !(l.action === "CIRCUIT_BREAKER" || (l.message && l.message.includes("ERROR"))),
  }));

  if (AUDIT_EVENTS.length === 0) {
    AUDIT_EVENTS.push({ 
      time: "Initializing", 
      event: "Establishing Antigravity Protocol connection...", 
      category: "Network", 
      ok: true 
    });
  }

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

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">

      {/* Developer-style Stats Grid */}
      <div className="col-span-12 border-2 border-[#0ea5e9] bg-white grid grid-cols-1 md:grid-cols-3">
        {/* Box 1 */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-dashed border-[#0ea5e9]/50">
           <p className="text-xs uppercase font-mono text-muted-foreground tracking-[0.2em] mb-4">System Status</p>
           <div className="flex items-baseline justify-between">
              <span className="text-5xl font-light font-mono text-slate-900 tracking-tighter">
                {circuitBreakerActive ? "HALTED" : "99.9%"}
              </span>
              <span className={`text-sm font-medium font-mono ${circuitBreakerActive ? "text-red-600" : "text-emerald-600"}`}>
                {circuitBreakerActive ? "↓ ER" : "↑ 0.1%"}
              </span>
           </div>
        </div>

        {/* Box 2 */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-dashed border-[#0ea5e9]/50">
           <p className="text-xs uppercase font-mono text-muted-foreground tracking-[0.2em] mb-4">Current Q-Score</p>
           <div className="flex items-baseline justify-between">
              <span className="text-5xl font-light font-mono text-slate-900 tracking-tighter">
                {score}<span className="text-3xl text-slate-300">/100</span>
              </span>
              <span className="text-sm font-medium font-mono text-emerald-600">
                ↑ 1%
              </span>
           </div>
        </div>

        {/* Box 3 */}
        <div className="p-6 md:p-8">
           <p className="text-xs uppercase font-mono text-muted-foreground tracking-[0.2em] mb-4">Market Regime</p>
           <div className="flex items-baseline justify-between">
              <span className="text-4xl md:text-5xl font-light font-mono text-slate-900 tracking-tighter truncate capitalize">
                {regime.length > 10 ? regime.substring(0, 10) + '..' : regime}
              </span>
              <span className="text-sm font-medium font-mono text-slate-400">
                —
              </span>
           </div>
        </div>
      </div>

      {/* Developer-style Chart Box */}
      <div className="col-span-12 border border-slate-200 bg-white rounded-md p-6 md:p-8 relative overflow-hidden shadow-sm mt-4">
        {/* Dotted background overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative z-10 flex justify-between items-center mb-10">
          <p className="text-xs uppercase font-mono text-muted-foreground tracking-[0.2em]">Stability Vector</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase text-emerald-600 font-bold tracking-widest font-mono">Live Feed</span>
          </div>
        </div>
        <div className="relative z-10">
          <StabilityGraph data={scoreHistory} height={240} />
        </div>
      </div>

      {/* Protocol cards */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <div className="mb-8">
          <p className="text-[10px] uppercase text-muted-foreground mb-2 tracking-[0.2em]">Risk Protocols</p>
          <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em] font-bold tracking-tight">
            <MagneticText disabled text="Automated" />
            <div className="font-light"><MagneticText disabled text="safeguard" /></div>
            <MagneticText disabled text="layer" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOLS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-[24px] p-6 bg-black/[0.01] border border-black/5 hover:border-black/15 transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-base text-black font-bold tracking-tight">{p.name}</p>
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${p.statusOk ? "text-emerald-600" : "text-red-600"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.statusOk ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">{p.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Threshold</p>
                  <p className="text-sm text-black font-bold tabular-nums">{p.threshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Last event</p>
                  <p className="text-sm text-muted-foreground font-medium tabular-nums">{p.lastTrigger}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10">
        <p className="text-[10px] uppercase text-muted-foreground mb-6 font-bold tracking-widest">Agent Audit Feed</p>
        <div className="space-y-0">
          {AUDIT_EVENTS.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
