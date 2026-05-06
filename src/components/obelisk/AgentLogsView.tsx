import { motion, AnimatePresence } from "framer-motion";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { useVault } from "@/hooks/useVault";
import { useEffect, useRef, useState } from "react";
import { useAgentFeed } from "@/hooks/useAgentFeed";
import { DecisionTransparency } from "./DecisionTransparency";
import { MagneticText } from "./MagneticText";
import { AgentAttestation } from "./AgentAttestation";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
  calculating: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
  streaming: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
  arbitrating: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]',
  idle: 'bg-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  calculating: 'Calculating',
  streaming: 'Streaming',
  arbitrating: 'Arbitrating',
  idle: 'Idle',
};

export function AgentLogsView() {
  const { logs } = useAgentFeed();
  const { agentLogs, score, countdown, nodes } = useAgentWebSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [agentLogs]);

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 md:gap-8 pb-24">
      
      {/* ── Supervisory Node Status ────────────────────────────────────────── */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        {nodes.map((node, i) => (
          <motion.div key={node.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-[24px] px-6 py-5 transition-all shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] border border-black/5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-[0.15em]">
                {node.label}
              </p>
              <div className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[node.status] || STATUS_COLORS.idle}`} />
            </div>
            <div className="text-sm text-black font-bold mb-1">
              {STATUS_LABELS[node.status] || node.status}
            </div>
            <p className="text-[9px] text-muted-foreground/40 font-medium">{node.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Global Stats Row ─────────────────────────────────────────────── */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Framework", value: "LangGraph 5-Node", sub: "Supervisory Configuration" },
          { label: "Stability Score", value: String(score), sub: "AI Weighted Confidence" },
          { label: "State Latency", value: "< 500ms", sub: "Antigravity Protocol" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.95)" }}
            className="glass-card rounded-[32px] px-10 py-8 transition-all shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[10px] uppercase text-muted-foreground/40 mb-4 font-bold tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <MagneticText disabled text={s.label} />
            </p>
            <div className="text-3xl text-black font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
              <MagneticText disabled text={s.value} />
            </div>
            <p className="text-[10px] text-muted-foreground/40 font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Decision Transparency ─────────────────────────────────────────── */}
      <div className="col-span-12">
        <DecisionTransparency />
      </div>
      
      {/* ── Agent Signals ────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[32px] p-8 md:p-10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl text-black font-bold flex flex-wrap gap-x-[0.25em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            <MagneticText disabled text="Agent" />
            <div className="font-light text-muted-foreground"><MagneticText disabled text="Signals" /></div>
          </div>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-t border-black/[0.03]">
              <span className="text-[11px] text-muted-foreground/40 font-mono w-20 font-bold">
                {log.timestamp.toLocaleTimeString('en-GB', { hour12: false })}
              </span>
              <div className="px-3 py-1 rounded-full text-[9px] font-bold w-16 text-center tracking-wider"
                style={{ 
                  background: log.action === 'rebalance' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(0,0,0,0.05)',
                  color: log.action === 'rebalance' ? 'rgb(5, 150, 105)' : 'rgba(0,0,0,0.4)'
                }}
              >
                {log.action.toUpperCase()}
              </div>
              <span className="flex-1 text-[13px] text-black/60 font-medium truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                {log.message}
              </span>
              <span className="text-[11px] text-black font-bold font-mono w-8 text-right">
                {log.score}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center py-8 text-[10px] uppercase text-muted-foreground/30 font-bold tracking-[0.25em]">
              Initializing agent telemetry...
            </p>
          )}
        </div>
      </div>

      {/* ── Log Stream ───────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[48px] p-8 md:p-12 flex flex-col min-h-[700px] max-h-[900px] transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="text-3xl text-black font-bold flex flex-wrap gap-x-[0.3em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
              <MagneticText disabled text="Multi-Agent" />
              <div className="font-light"><MagneticText disabled text="Supervisory Feed" /></div>
            </div>
            <p className="text-xs text-muted-foreground/40 font-medium">Arbitrated cross-node telemetry from the Obelisk controller. 0% local disk persistence.</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_12px_24px_rgba(0,0,0,0.15)] w-fit"
          >
             <div className="relative flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] relative z-10" />
             </div>
             <MagneticText disabled text="Live Stream" />
          </motion.div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-6 space-y-0 scroll-smooth scrollbar-hidden"
        >
          <AnimatePresence initial={false}>
            {agentLogs.map((log, i) => (
              <LogRow key={`${log.cycle}-${i}`} log={log} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}



function LogRow({ log }: { log: any }) {
  const timeStr = new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false });
  const message = log?.message || "";
  const isAction = message.includes("Execution") || message.includes("Complete") || message.includes("rebalanced");

  // Mock signature/hash for the demo/live feel
  const mockSig = "0x" + Math.random().toString(16).slice(2, 18) + "..." + Math.random().toString(16).slice(2, 6);
  const mockHash = "0x" + Math.random().toString(16).slice(2, 42);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col py-6 border-b border-black/[0.04] group hover:bg-black/[0.01] transition-colors -mx-4 px-4 rounded-xl"
    >
      <div className="flex items-center gap-4 md:gap-6 flex-wrap">
        <span className="text-[12px] text-muted-foreground/30 w-20 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {timeStr}
        </span>

        {log.node && (
          <span className="text-[9px] text-black/30 font-bold uppercase tracking-[0.1em] w-28 truncate hidden md:inline" style={{ fontFamily: "'Inter', sans-serif" }}>
            {log.node}
          </span>
        )}

        <div className={`px-3 py-1 rounded-full text-[9px] font-bold w-20 text-center tracking-wider transition-all ${isAction ? "bg-emerald-400/10 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.1)]" : "bg-black/5 text-black/40"}`}>
          {isAction ? "ACTION" : log.cycle ? `C${String(log.cycle).padStart(3, '0')}` : "LOG"}
        </div>

        <span className="flex-1 text-[14px] text-black/70 font-semibold group-hover:text-black transition-colors leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
          {message}
        </span>

        <div className="flex items-center gap-4">
          <div className="h-1 w-16 bg-black/[0.04] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${log.score}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-black/20 rounded-full" 
            />
          </div>
          <span className="text-[12px] text-black font-bold w-8 text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {log.score}
          </span>
        </div>
      </div>

      {isAction && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pl-[120px] mt-4"
        >
          <AgentAttestation signature={mockSig} hash={mockHash} />
        </motion.div>
      )}
    </motion.div>
  );
}


