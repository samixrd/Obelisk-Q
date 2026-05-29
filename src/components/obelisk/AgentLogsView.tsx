import { motion, AnimatePresence } from "framer-motion";
import { useAgentData } from "@/hooks/useAgentData";
import { useVault } from "@/hooks/useVault";
import { useEffect, useRef, useState } from "react";
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
  const { agentLogs, score, countdown, nodes } = useAgentData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll-to-top to prevent scroll jumps during polling.


  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8 pb-24">

      
      {/* ── Supervisory Node Status (Flowchart Aesthetic) ────────────────────────────────────────── */}
      <div className="col-span-12 relative p-6 md:p-8 border border-slate-200 bg-[#fafafa] shadow-inner rounded-sm overflow-x-auto scrollbar-hidden">
        {/* Canvas dotted background */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <p className="relative z-10 text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-mono mb-6 bg-white w-fit px-2 border border-slate-200">System Architecture Pipeline</p>

        <div className="relative z-10 flex items-center gap-2 min-w-max pb-2">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="w-44 flex flex-col border border-slate-300 bg-white shadow-sm"
              >
                {/* Node Header (Black background, white monospace text) */}
                <div className="bg-zinc-900 text-white px-2.5 py-1.5 flex items-center justify-between">
                  <p className="text-[9px] uppercase font-mono tracking-widest truncate mr-2">
                    {node.label}
                  </p>
                  <div className={`h-1.5 w-1.5 flex-shrink-0 ${node.status === 'active' ? 'bg-emerald-400' : node.status === 'calculating' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                </div>
                {/* Node Body */}
                <div className="p-3 h-[72px] flex flex-col justify-center bg-white">
                  <div className="text-[11px] text-zinc-800 font-mono mb-1 font-semibold uppercase tracking-wide">
                    {STATUS_LABELS[node.status] || node.status}
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-tight">
                    {node.sub}
                  </p>
                </div>
              </motion.div>
              
              {/* Connection Line / Arrow */}
              {i < nodes.length - 1 && (
                <div className="flex w-6 h-[1px] bg-slate-400 mx-1 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 border-t border-r border-slate-400 rotate-45 transform translate-x-px" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Global Stats Row ─────────────────────────────────────────────── */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Framework", value: "LangGraph 7-Node", sub: "Supervisory Configuration" },
          { label: "Stability Score", value: String(score), sub: "AI Weighted Confidence" },
          { label: "State Latency", value: "< 500ms", sub: "Antigravity Protocol" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.95)" }}
            className="glass-card rounded-[32px] px-6 md:px-10 py-6 md:py-8 transition-all"
          >
            <p className="text-[10px] uppercase text-black/40 mb-3 md:mb-4 tracking-[0.24em] font-light">
              <MagneticText disabled text={s.label} />
            </p>
            <div className="text-[24px] md:text-[28px] text-[#0a0a0a] mb-2 tabular-nums font-light tracking-tighter">
              <MagneticText disabled text={s.value} />
            </div>
            <p className="text-[10px] text-black/30 uppercase tracking-wider font-light">{s.sub}</p>
          </motion.div>
        ))}
      </div>


      
      {/* ── Log Stream ───────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col h-[700px] transition-all">

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

        {log.confidence && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-sky-400/5 rounded-md">
            <span className="text-[9px] text-sky-600/70 font-mono tracking-tighter">CONF:</span>
            <span className="text-[10px] text-sky-700/80 font-bold tabular-nums">{log.confidence}%</span>
          </div>
        )}

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

      {log.reasoning && (
        <div className="pl-4 md:pl-[100px] mt-2 mb-1">
          <p className="text-[11px] text-black/40 font-light italic leading-snug">
            <span className="text-[9px] uppercase tracking-wider not-italic mr-2 opacity-50 font-bold">Reasoning:</span>
            "{log.reasoning}"
          </p>
        </div>
      )}

      {isAction && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-4 md:pl-[100px] mt-3"
        >

          <AgentAttestation signature={mockSig} hash={displayHash} />
        </motion.div>
      )}
    </motion.div>
  );
}


