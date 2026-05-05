import { motion, AnimatePresence } from "framer-motion";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { useVault } from "@/hooks/useVault";
import { useEffect, useRef, useState } from "react";
import { DecisionTransparency } from "./DecisionTransparency";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function AgentLogsView() {
  const { agentLogs, score, countdown } = useAgentWebSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [agentLogs]);

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">
      
      {/* Decision Transparency */}
      <div className="col-span-12">
        <DecisionTransparency />
      </div>

      {/* Stats row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Nodes", value: "5 Agent Nodes", sub: "LangGraph Orchestrated" },
          { label: "Stability Score", value: String(score), sub: "AI Weighted Confidence" },
          { label: "Next Analysis", value: `${countdown}s`, sub: "Scheduled Heartbeat" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl px-8 py-6"
          >
            <p className="text-[10px] uppercase text-muted-foreground mb-3 font-bold tracking-[0.2em]">
              {s.label}
            </p>
            <p className="text-3xl text-black font-bold mb-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
              {s.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Log stream */}
      <div className="col-span-12 glass-card rounded-[32px] p-6 md:p-10 flex flex-col min-h-[600px] max-h-[800px]">
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl text-black font-bold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            Multi-Agent <span className="font-light">Supervisory Feed</span>
          </p>
          <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-bold uppercase tracking-widest">
             <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
             Live Stream
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-4 space-y-0 scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          <AnimatePresence initial={false}>
            {agentLogs.map((log, i) => (
              <LogRow key={i} log={log} />
            ))}
          </AnimatePresence>
          {agentLogs.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-[10px] font-bold uppercase tracking-widest">
              Connecting to agent graph...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LogRow({ log }: { log: any }) {
  const timeStr = new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false });
  const isAction = log.message.includes("Execution") || log.message.includes("Complete");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-6 py-4 border-b border-black/[0.03] group"
    >
      <span className="text-[11px] text-muted-foreground/40 w-16 font-mono">
        {timeStr}
      </span>

      <div className={`px-2 py-0.5 rounded text-[9px] font-bold w-20 text-center tracking-tighter ${isAction ? "bg-emerald-500/10 text-emerald-600" : "bg-black/5 text-black/40"}`}>
        {isAction ? "ACTION" : "LOG"}
      </div>

      <span className="flex-1 text-[13px] text-black/70 font-medium group-hover:text-black transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
        {log.message}
      </span>

      <div className="flex items-center gap-3">
        <div className="h-1 w-12 bg-black/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-black/20" style={{ width: `${log.score}%` }} />
        </div>
        <span className="text-[11px] text-black font-bold font-mono w-6 text-right">
          {log.score}
        </span>
      </div>
    </motion.div>
  );
}
