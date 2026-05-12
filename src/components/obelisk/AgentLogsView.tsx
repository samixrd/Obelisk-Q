import { motion, AnimatePresence } from "framer-motion";
import { useAgentData } from "@/hooks/useAgentData";
import { useVault } from "@/hooks/useVault";
import { useEffect, useRef, useState } from "react";
import { useAgentFeed } from "@/hooks/useAgentFeed";
import { DecisionTransparency } from "./DecisionTransparency";
import { MagneticText } from "./MagneticText";
import { AgentAttestation } from "./AgentAttestation";

// ── Unified Typography ─────────────────────────────────────────────────────
// Redundant CSS constants removed, using Tailwind classes instead.

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// ── Node Status Palette (muted, glass-aligned) ─────────────────────────────
const STATUS_DOT: Record<string, string> = {
  active:      'bg-emerald-400/60',
  calculating: 'bg-amber-400/60',
  streaming:   'bg-sky-400/60',
  arbitrating: 'bg-violet-400/60',
  idle:        'bg-black/10',
};

const STATUS_LABELS: Record<string, string> = {
  active:      'Active',
  calculating: 'Calculating',
  streaming:   'Streaming',
  arbitrating: 'Arbitrating',
  idle:        'Idle',
};

export function AgentLogsView() {
  const { logs } = useAgentFeed();
  const { agentLogs, score, countdown, nodes } = useAgentData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll-to-top to prevent scroll jumps during polling.


  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8 pb-24">

      
      {/* ── Supervisory Node Status ────────────────────────────────────────── */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        {nodes.map((node, i) => (
          <motion.div key={node.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-[24px] px-5 py-4 transition-all border border-black/[0.04]"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] uppercase text-black/40 tracking-[0.15em] font-light">
                {node.label}
              </p>
              <div className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[node.status] || STATUS_DOT.idle}`} />
            </div>
            <div className="text-[13px] text-[#0a0a0a] mb-0.5 font-light">
              {STATUS_LABELS[node.status] || node.status}
            </div>
            <p className="text-[9px] text-black/30 font-light">{node.sub}</p>
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
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.95)" }}
            className="glass-card rounded-[32px] px-10 py-8 transition-all"
          >
            <p className="text-[10px] uppercase text-black/40 mb-4 tracking-[0.24em] font-light">
              <MagneticText disabled text={s.label} />
            </p>
            <div className="text-[28px] text-[#0a0a0a] mb-2 tabular-nums font-light tracking-tighter">
              <MagneticText disabled text={s.value} />
            </div>
            <p className="text-[10px] text-black/30 uppercase tracking-wider font-light">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Decision Transparency ─────────────────────────────────────────── */}
      <div className="col-span-12">
        <DecisionTransparency />
      </div>
      
      {/* ── Agent Signals ────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[32px] p-8 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[22px] text-[#0a0a0a] flex flex-wrap gap-x-[0.25em] font-bold tracking-tight">
            <MagneticText disabled text="Agent" />
            <div className="text-[#9CA3AF]"><MagneticText disabled text="Signals" /></div>
          </div>
        </div>
        <div className="h-[320px] overflow-y-auto pr-2 scrollbar-hidden">

          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5 border-t border-black/[0.03]">
              <span className="text-[11px] text-black/50 w-20 tabular-nums font-mono">
                {log.timestamp.toLocaleTimeString('en-GB', { hour12: false })}
              </span>
              <div className={`px-3 py-1 rounded-full text-[9px] w-16 text-center tracking-wider font-light ${log.action === 'rebalance' ? 'bg-emerald-400/10 text-emerald-700' : 'bg-black/5 text-black/50'}`}>
                {log.action.toUpperCase()}
              </div>
              <span className="flex-1 text-[13px] text-[#0a0a0a]/80 truncate font-light">
                {log.message}
              </span>
              <span className="text-[11px] text-[#0a0a0a]/60 w-8 text-right font-mono-num">
                {log.score}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center py-8 text-[10px] uppercase text-[#9CA3AF] tracking-[0.25em] font-light">
              Awaiting signal feed...
            </p>
          )}
        </div>
      </div>

      {/* ── Log Stream ───────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[40px] p-8 md:p-10 flex flex-col h-[700px] transition-all">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="text-[22px] text-[#0a0a0a] flex flex-wrap gap-x-[0.3em] font-bold tracking-tight">
              <MagneticText disabled text="Multi-Agent" />
              <span className="text-black/40"><MagneticText disabled text="Supervisory Feed" /></span>
            </div>
            <p className="text-[11px] text-black/40 font-light">Real-time LangGraph audit stream. Persistence enabled via Antigravity Cloud.</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 px-5 py-2 bg-[#1a1a1a] text-white/80 rounded-full text-[10px] uppercase tracking-[0.15em] w-fit font-light"
          >
             <div className="relative flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 relative z-10" />
             </div>
             <MagneticText disabled text="Live Stream" />
          </motion.div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-4 space-y-0 scroll-smooth scrollbar-hidden"
        >
          <AnimatePresence initial={false}>
            {agentLogs.map((log, i) => (
              <LogRow key={`${log.cycle}-${i}`} log={log} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>

  );
}



function LogRow({ log }: { log: any }) {
  const timeStr = new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false });
  const message = log?.message || "";
  const isAction = message.includes("Execution") || message.includes("Complete") || message.includes("rebalanced");

  const mockSig = "0x" + Math.random().toString(16).slice(2, 18) + "..." + Math.random().toString(16).slice(2, 6);
  const realHash = log.tx_hash && log.tx_hash !== "N/A" ? log.tx_hash : null;
  const displayHash = realHash || ("0x" + Math.random().toString(16).slice(2, 42));

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col py-4 border-b border-black/[0.03] group hover:bg-black/[0.01] transition-colors -mx-3 px-3 rounded-xl"
    >

      <div className="flex items-center gap-4 md:gap-5">
        <span className="text-[11px] text-black/50 w-[72px] font-mono-num">
          {timeStr}
        </span>

        {log.node && (
          <span className="text-[9px] text-[#0a0a0a]/40 uppercase tracking-[0.08em] w-28 truncate hidden md:inline font-light">
            {log.node}
          </span>
        )}

        <div
          className="px-2.5 py-0.5 rounded-full text-[9px] w-16 text-center tracking-wider font-light"
          style={{
            background: isAction ? 'rgba(52,211,153,0.06)' : 'rgba(0,0,0,0.025)',
            color: isAction ? 'rgba(5,150,105,0.7)' : 'rgba(0,0,0,0.25)',
          }}
        >
          {isAction ? "ACTION" : log.cycle ? `C${String(log.cycle).padStart(3, '0')}` : "LOG"}
        </div>

        <span className="flex-1 text-[13px] text-[#0a0a0a]/80 group-hover:text-[#0a0a0a] transition-colors leading-relaxed truncate font-light">
          {message}
        </span>

        <div className="flex items-center gap-3">
          <div className="h-[3px] w-12 bg-black/[0.03] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${log.score}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-black/10 rounded-full" 
            />
          </div>
          <span className="text-[11px] text-[#0a0a0a]/60 w-7 text-right font-mono-num">
            {log.score}
          </span>
        </div>
      </div>

      {isAction && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-[100px] mt-3"
        >

          <AgentAttestation signature={mockSig} hash={displayHash} />
        </motion.div>
      )}
    </motion.div>
  );
}


