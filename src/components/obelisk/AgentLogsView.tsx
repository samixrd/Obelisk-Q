import { motion, AnimatePresence } from "framer-motion";
import { useAgentFeed, FeedEntry, AgentAction } from "@/hooks/useAgentFeed";
import { useVault } from "@/hooks/useVault";
import { useEffect, useRef, useState } from "react";

const ACTION_CONFIG: Record<AgentAction, { label: string, color: string, textColor: string }> = {
  scan: { label: "SCAN", color: "rgba(255,255,255,0.05)", textColor: "rgba(0,0,0,0.4)" },
  hold: { label: "HOLD", color: "rgba(0,0,0,0.05)", textColor: "rgba(0,0,0,0.8)" },
  rebalance: { label: "ACTION", color: "hsl(104 100% 68% / 0.1)", textColor: "hsl(104 100% 30%)" },
  warn: { label: "WARN", color: "hsl(30 100% 70% / 0.1)", textColor: "hsl(30 100% 35%)" },
  circuit_breaker: { label: "CIRCUIT", color: "hsl(0 70% 65% / 0.1)", textColor: "hsl(0 70% 45%)" },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function AgentLogsView() {
  const { logs, stats } = useAgentFeed();
  const { txHistory, explorerUrl } = useVault();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [relativeLastAction, setRelativeLastAction] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const updateTime = () => {
      if (!stats.lastActionAt) {
        setRelativeLastAction("Never");
        return;
      }
      const diff = Math.floor((Date.now() - stats.lastActionAt.getTime()) / 60000);
      if (diff < 1) setRelativeLastAction("Just now");
      else if (diff < 60) setRelativeLastAction(`${diff} minutes ago`);
      else setRelativeLastAction(`${Math.floor(diff / 60)} hours ago`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [stats.lastActionAt]);

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6">
      
      {/* Stats row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total scans today", value: stats.totalScans.toString() },
          { label: "Actions taken", value: stats.actionsTaken.toString() },
          { label: "Last action", value: relativeLastAction },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-2xl px-8 py-6"
          >
            <p className="text-[10px] uppercase text-muted-foreground mb-3" style={{ letterSpacing: "0.28em" }}>
              {s.label}
            </p>
            <p className="text-3xl text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Live Indicator */}
      <div className="col-span-12 flex items-center gap-3 px-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium text-emerald-600/80 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Agent active · scanning every 10s
          </span>
        </div>
      </div>

      {/* Log stream */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10 flex flex-col min-h-[600px] max-h-[800px]">
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl text-foreground"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            Agent <span style={{ fontWeight: 300 }}>activity feed</span>
          </p>
          <span className="text-[9px] uppercase text-muted-foreground/40" style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
            Real-time synchronization
          </span>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-4 space-y-0 scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <LogRow key={log.timestamp.getTime() + i} log={log} />
            ))}
          </AnimatePresence>
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs font-mono uppercase tracking-widest">
              Awaiting first signal...
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl text-foreground"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            Transaction <span style={{ fontWeight: 300 }}>history</span>
          </p>
          <span className="text-[9px] uppercase text-muted-foreground/40 font-mono tracking-widest">
            On-chain ledger
          </span>
        </div>

        <div className="space-y-0 overflow-x-auto no-scrollbar">
          <div className="min-w-[600px] md:min-w-0">
            {txHistory.map((tx, i) => (
              <div key={tx.hash + i} className="grid grid-cols-12 items-center py-4 border-t border-foreground/[0.03]">
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Confirmed' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-foreground font-medium">{tx.type}</span>
                </div>
                <div className="col-span-3 text-[11px] text-foreground/60 font-mono">
                  {tx.amount}
                </div>
                <div className="col-span-3 text-[11px] text-muted-foreground/50 font-mono">
                   {new Date(tx.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                </div>
                <div className="col-span-3 text-right">
                  <a 
                    href={explorerUrl(tx.hash)}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors font-mono tracking-wider"
                  >
                    View ↗
                  </a>
                </div>
              </div>
            ))}
            {txHistory.length === 0 && (
              <p className="text-center py-8 text-[11px] uppercase text-muted-foreground/30 tracking-widest font-mono">
                No recent transactions detected
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LogRow({ log }: { log: FeedEntry }) {
  const config = ACTION_CONFIG[log.action];
  const timeStr = log.timestamp.toLocaleTimeString('en-GB', { hour12: false });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 py-3.5 border-b border-foreground/[0.03] group"
    >
      {/* Time */}
      <span className="text-[11px] text-muted-foreground/40 w-16 font-mono">
        {timeStr}
      </span>

      {/* Badge */}
      <div 
        className="px-2 py-0.5 rounded text-[9px] font-bold w-16 text-center tracking-tighter"
        style={{ background: config.color, color: config.textColor }}
      >
        {config.label}
      </div>

      {/* Message */}
      <span className="flex-1 text-[13px] text-foreground/70 font-mono truncate group-hover:text-foreground transition-colors">
        {log.message}
      </span>

      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="h-1 w-12 bg-foreground/[0.05] rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground/20" 
            style={{ width: `${log.score}%` }}
          />
        </div>
        <span className="text-[11px] text-foreground font-mono w-6 text-right">
          {log.score}
        </span>
      </div>
    </motion.div>
  );
}
