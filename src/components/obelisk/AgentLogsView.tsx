import { motion } from "framer-motion";

const LOGS = [
  { ts: "14:32:01", level: "info",  msg: "Volatility scan passed. σ = 0.42, within bounds.",      tag: "Monitor"   },
  { ts: "14:31:45", level: "exec",  msg: "mETH position rebalanced –0.8% toward target weight.",   tag: "Rebalance" },
  { ts: "14:28:12", level: "info",  msg: "Liquidity depth check — reserve buffer at 8.2%.",        tag: "Routine"   },
  { ts: "13:55:00", level: "exec",  msg: "USDY yield differential widened. Allocation increased.",  tag: "Yield"     },
  { ts: "11:40:33", level: "warn",  msg: "Growth Basket drawdown approaching soft limit (–2.1%).", tag: "Risk"      },
  { ts: "09:14:22", level: "info",  msg: "Daily allocation scan initiated. All protocols nominal.", tag: "Routine"   },
  { ts: "Yesterday","level": "exec", msg: "Drawdown circuit breaker test — PASS. No action taken.", tag: "Scheduled" },
  { ts: "2d ago",   level: "info",  msg: "Counterparty exposure recalculated. Cap not reached.",   tag: "Routine"   },
  { ts: "3d ago",   level: "exec",  msg: "Mantle Core Yield increased by 1.2% following momentum.", tag: "Yield"    },
  { ts: "4d ago",   level: "info",  msg: "Sharpe ratio updated: 2.41 (30-day rolling).",            tag: "Monitor"  },
];

const LEVEL_COLOR: Record<string, string> = {
  info: "rgba(0,0,0,0.25)",
  exec: "hsl(104 100% 35%)",
  warn: "hsl(38 100% 40%)",
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

export function AgentLogsView() {
  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6">

      {/* Summary row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Actions today",      value: "4" },
          { label: "Warnings",           value: "1" },
          { label: "Uptime",             value: "99.9%" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-2xl px-8 py-6"
          >
            <p className="text-[10px] uppercase text-muted-foreground mb-3" style={{ letterSpacing: "0.28em" }}>
              {s.label}
            </p>
            <p className="text-4xl text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Log stream */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-2xl text-foreground"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            Agent <span style={{ fontWeight: 300 }}>log stream</span>
          </p>
          <span className="flex items-center gap-2 text-[9px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="h-1 w-1 rounded-full"
              style={{ background: "hsl(104 100% 45%)", boxShadow: "0 0 4px hsl(104 100% 45% / 0.3)", animation: "pulse 3s infinite" }} />
            Live
          </span>
        </div>

        <div className="space-y-0">
          {LOGS.map((log, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 py-4 border-b border-foreground/5"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Level dot */}
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: LEVEL_COLOR[log.level] }} />

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 w-20"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{log.ts}</span>
                
                {/* Tag on mobile */}
                <span className="md:hidden text-[9px] uppercase text-muted-foreground/40 ml-auto"
                  style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}>{log.tag}</span>
              </div>

              {/* Message */}
              <span className="flex-1 text-sm text-foreground/75 leading-snug pl-5 md:pl-0"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>{log.msg}</span>

              {/* Tag on desktop */}
              <span className="hidden md:block text-[9px] uppercase text-muted-foreground/40 flex-shrink-0"
                style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}>{log.tag}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
