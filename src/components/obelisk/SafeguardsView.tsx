import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const PROTOCOLS = [
  {
    name: "Drawdown Circuit Breaker",
    status: "Armed",
    statusOk: true,
    description: "Halts allocation if portfolio drops beyond threshold within any 24-hour window.",
    threshold: "–3.5% / 24h",
    lastTrigger: "Never triggered",
  },
  {
    name: "Volatility Dampener",
    status: "Active",
    statusOk: true,
    description: "Reduces position size when realized volatility exceeds 2σ of 30-day baseline.",
    threshold: "σ > 2.0",
    lastTrigger: "11 days ago",
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
  { time: "14:32:01", event: "Volatility scan passed", category: "Routine", ok: true },
  { time: "14:31:45", event: "mETH position rebalanced –0.8%", category: "Auto-adjust", ok: true },
  { time: "09:14:22", event: "Liquidity check · reserve at 8.2%", category: "Routine", ok: true },
  { time: "Yesterday", event: "Drawdown circuit test · PASS", category: "Scheduled", ok: true },
  { time: "2 days ago", event: "Counterparty cap recalculated", category: "Routine", ok: true },
];

export function SafeguardsView() {
  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6">

      {/* Header stat row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Protocols Active", value: "4 / 4", note: "All armed" },
          { label: "Risk Score", value: "0.42σ", note: "Well within bounds" },
          { label: "Days Without Incident", value: "186", note: "Consecutive" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-2xl px-8 py-6"
          >
            <p
              className="text-[10px] uppercase text-muted-foreground mb-4"
              style={{ letterSpacing: "0.28em" }}
            >
              {s.label}
            </p>
            <p
              className="text-3xl md:text-4xl text-foreground"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "-0.04em",
              }}
            >
              {s.value}
            </p>
            <p
              className="mt-2 text-[10px] text-muted-foreground"
              style={{ letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {s.note}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Protocol cards */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
        <div className="mb-8">
          <p
            className="text-[10px] uppercase text-muted-foreground mb-2"
            style={{ letterSpacing: "0.28em" }}
          >
            Risk Protocols
          </p>
          <p
            className="text-2xl text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Automated <span className="italic font-light">safeguard</span> layer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOLS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl p-6 bg-foreground/[0.015] border border-foreground/5 hover:border-foreground/15 transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-3">
                <p
                  className="text-base text-foreground font-medium"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
                >
                  {p.name}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] uppercase"
                  style={{
                    letterSpacing: "0.25em",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: p.statusOk ? "hsl(104 100% 35%)" : "hsl(0 70% 45%)",
                  }}
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{
                      background: p.statusOk ? "hsl(104 100% 45%)" : "hsl(0 70% 55%)",
                      boxShadow: p.statusOk
                        ? "0 0 4px hsl(104 100% 45% / 0.3)"
                        : "0 0 4px hsl(0 70% 55% / 0.3)",
                    }}
                  />
                  {p.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {p.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p
                    className="text-[9px] uppercase text-muted-foreground mb-1"
                    style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Threshold
                  </p>
                  <p
                    className="text-sm text-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {p.threshold}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-[9px] uppercase text-muted-foreground mb-1"
                    style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Last event
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {p.lastTrigger}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stability graph */}
      <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p
              className="text-[10px] uppercase text-muted-foreground mb-2"
              style={{ letterSpacing: "0.28em" }}
            >
              Risk Exposure · 30 days
            </p>
            <p
              className="text-2xl text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Consistently <span className="italic font-light">within envelope</span>
            </p>
          </div>
        </div>
        <StabilityGraph seed={17} height={160} />
      </div>

      {/* Audit log */}
      <div className="col-span-12 lg:col-span-4 glass-card rounded-2xl p-6 md:p-10">
        <p
          className="text-[10px] uppercase text-muted-foreground mb-6"
          style={{ letterSpacing: "0.28em" }}
        >
          Agent Log
        </p>
        <div className="space-y-0">
          {AUDIT_EVENTS.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3 py-4 border-b border-foreground/5"
            >
              <span
                className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0"
                style={{
                  background: ev.ok ? "hsl(104 100% 45%)" : "hsl(0 70% 55%)",
                  boxShadow: ev.ok ? "0 0 4px hsl(104 100% 45% / 0.2)" : "none",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground/85 leading-snug">{ev.event}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[9px] text-muted-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {ev.time}
                  </span>
                  <span className="text-[9px] text-muted-foreground/30">·</span>
                  <span
                    className="text-[9px] text-muted-foreground/60"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {ev.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
