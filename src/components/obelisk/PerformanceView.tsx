import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const perfStats = [
  { label: "30-Day Return", value: "+4.12%", delta: "+0.84% vs prev", up: true },
  { label: "Max Drawdown", value: "-1.84%", delta: "well contained", up: false },
  { label: "Win Rate", value: "86%", delta: "+3% MoM", up: true },
  { label: "Avg. Volatility", value: "0.42σ", delta: "stable", up: true },
];

const months = [
  { label: "May", value: 22 },
  { label: "Jun", value: 48 },
  { label: "Jul", value: 31 },
  { label: "Aug", value: 62 },
  { label: "Sep", value: 12 },
  { label: "Oct", value: 54 },
  { label: "Nov", value: 38 },
  { label: "Dec", value: 71 },
  { label: "Jan", value: 44 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 33 },
  { label: "Apr", value: 67 },
];

export function PerformanceView() {
  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 md:gap-8">
      <div className="col-span-12 glass-card rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div>
            <p
              className="text-[10px] uppercase text-muted-foreground mb-4 font-semibold tracking-[0.2em]"
              style={{ letterSpacing: "0.28em" }}
            >
              Cumulative Return · YTD
            </p>
            <p
              className="text-6xl md:text-8xl text-foreground font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
            >
              +14.82<span className="text-muted-foreground/30">%</span>
            </p>
          </div>
          <div className="flex md:block items-center gap-6 md:text-right md:space-y-2">
            <p
              className="text-[10px] uppercase text-muted-foreground font-semibold tracking-[0.2em]"
              style={{ letterSpacing: "0.28em" }}
            >
              Sharpe Ratio
            </p>
            <p
              className="text-3xl text-foreground font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              2.41
            </p>
          </div>
        </div>
        <div className="h-[280px]">
          <StabilityGraph seed={3} height={280} />
        </div>
      </div>

      {perfStats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-3xl p-8 transition-all hover:bg-white/80"
        >
          <p
            className="text-[10px] uppercase text-muted-foreground mb-5 font-semibold tracking-[0.2em] truncate"
            style={{ letterSpacing: "0.28em" }}
          >
            {s.label}
          </p>
          <p
            className="text-3xl md:text-4xl text-foreground font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}
          >
            {s.value}
          </p>
          <div className="flex items-center gap-2 mt-4">
             <div className={`h-1 w-1 rounded-full ${s.up ? "bg-green-500" : "bg-blue-400"}`} />
             <p
               className={`text-[11px] font-medium ${s.up ? "text-green-600" : "text-blue-500"}`}
               style={{ fontFamily: "'JetBrains Mono', monospace" }}
             >
               {s.delta}
             </p>
          </div>
        </motion.div>
      ))}

      <div className="col-span-12 glass-card rounded-3xl p-8 md:p-12">
        <p
          className="text-2xl font-bold text-foreground mb-10"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
        >
          Monthly Performance Breakdown
        </p>
        <div className="grid grid-cols-12 gap-3 md:gap-6 items-end h-64">
          {months.map((m, i) => (
            <div key={m.label} className="flex flex-col items-center gap-4 group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-2 py-1 rounded mb-2 font-mono">
                {m.value}%
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${m.value}%` }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full max-w-[16px] transition-all group-hover:opacity-80 ${
                  m.value > 0
                    ? "bg-gradient-to-t from-blue-500/10 to-blue-600/60"
                    : "bg-muted"
                }`}
                style={{ minHeight: "3px", borderRadius: "4px 4px 0 0" }}
              />
              <span
                className="text-[10px] font-bold text-muted-foreground/60 group-hover:text-foreground transition-colors uppercase"
                style={{ letterSpacing: "0.1em" }}
              >
                {m.label.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
