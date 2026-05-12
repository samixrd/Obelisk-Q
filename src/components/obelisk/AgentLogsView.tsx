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
  active:      'bg-primary shadow-[0_0_8px_hsla(var(--primary)/0.4)]',
  calculating: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]',
  streaming:   'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]',
  arbitrating: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.4)]',
  idle:        'bg-white/10',
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

      
      {/* ── Node Status Grid ────────────────────────────────────────────── */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        {nodes.map((node, i) => (
          <motion.div key={node.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-[24px] px-5 py-4 border border-black/5 bg-white hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] uppercase text-primary/30 tracking-[0.15em] font-black">
                {node.label}
              </p>
              <div className={`h-1.5 w-1.5 rounded-full ${node.status === 'active' ? 'bg-primary' : 'bg-primary/20'}`} />
            </div>
            <div className="text-[13px] text-primary mb-0.5 font-black uppercase tracking-tight">
              {STATUS_LABELS[node.status] || node.status}
            </div>
            <p className="text-[9px] text-primary/30 font-black uppercase tracking-widest">{node.sub}</p>
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
            className="glass-card rounded-[32px] px-10 py-8 border border-black/5 bg-white"
          >
            <p className="text-[10px] uppercase text-primary/30 mb-4 font-black tracking-[0.25em]">
              {s.label}
            </p>
            <div className="text-[32px] text-primary mb-2 tabular-nums font-black tracking-tightest">
              {s.value}
            </div>
            <p className="text-[10px] text-primary/20 uppercase tracking-widest font-black">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Decision Transparency ─────────────────────────────────────────── */}
      <div className="col-span-12">
        <DecisionTransparency />
      </div>
      
      {/* ── Agent Signals ────────────────────────────────────────────────── */}
      <div className="col-span-12 glass-card rounded-[32px] p-8 md:p-10 border border-black/5 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[22px] text-primary flex flex-wrap gap-x-[0.25em] font-black tracking-tightest uppercase">
            Agent <span className="text-primary/30">Signals</span>
          </div>
        </div>
        <div className="h-[320px] overflow-y-auto pr-2 scrollbar-hidden">

          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-t border-black/5">
              <span className="text-[11px] text-primary/30 w-20 tabular-nums font-mono-num font-black">
                {log.timestamp.toLocaleTimeString('en-GB', { hour12: false })}
              </span>
              <div className={`px-3 py-1 rounded-full text-[9px] w-20 text-center tracking-widest font-black uppercase ${log.action === 'rebalance' ? 'bg-primary/10 text-primary' : 'bg-black/5 text-primary/30'}`}>
                {log.action}
              </div>
              <span className="flex-1 text-[13px] text-primary/70 truncate font-black uppercase tracking-tight">
                {log.message}
              </span>
              <span className="text-[11px] text-primary w-8 text-right font-black">
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
      <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 flex flex-col h-[800px] border border-black/5 bg-white hover:border-primary/20">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="text-[28px] text-primary flex flex-wrap gap-x-[0.3em] font-black tracking-tightest uppercase">
              Multi-Agent <span className="text-primary/20">Supervisory Feed</span>
            </div>
            <p className="text-[12px] text-primary/30 font-black uppercase tracking-widest">Real-time LangGraph audit stream · Antigravity Protocol Verified</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-6 py-2.5 bg-primary text-white rounded-full text-[10px] uppercase tracking-[0.2em] w-fit font-black"
          >
             <div className="relative flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-30" />
                <span className="h-2 w-2 rounded-full bg-white relative z-10" />
             </div>
             Live Audit Stream
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
  const mockHash = "0x" + Math.random().toString(16).slice(2, 42);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col py-4 border-b border-primary/10 group hover:bg-primary/5 transition-colors -mx-3 px-3 rounded-xl"
    >

      <div className="flex items-center gap-4 md:gap-5">
        <span className="text-[11px] text-primary/50 w-[72px] font-mono-num">
          {timeStr}
        </span>

        {log.node && (
          <span className="text-[9px] text-primary/40 uppercase tracking-[0.08em] w-28 truncate hidden md:inline font-bold">
            {log.node}
          </span>
        )}

        <div
          className="px-3 py-1 rounded-full text-[9px] w-20 text-center tracking-widest font-black"
          style={{
            background: isAction ? 'rgba(var(--foreground-rgb), 0.1)' : 'rgba(0,0,0,0.03)',
            color: 'hsl(var(--primary))',
            border: isAction ? '1px solid hsla(var(--primary)/0.2)' : '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {isAction ? "ACTION" : log.cycle ? `C-${String(log.cycle).padStart(3, '0')}` : "TRACE"}
        </div>

        <span className="flex-1 text-[13px] text-primary/70 group-hover:text-primary transition-colors leading-relaxed truncate font-black uppercase tracking-wide">
          {message}
        </span>

        <div className="flex items-center gap-3">
          <div className="h-[3px] w-12 bg-primary/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${log.score}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-primary/20 rounded-full" 
            />
          </div>
          <span className="text-[11px] text-primary/60 w-7 text-right font-mono-num font-bold">
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

          <AgentAttestation signature={mockSig} hash={mockHash} />
        </motion.div>
      )}
    </motion.div>
  );
}


