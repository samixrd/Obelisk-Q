import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight, IconArrowDownRight, IconShield, IconActivity } from "./LineIcons";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";

export function PerformanceView() {
  const [metrics, setMetrics] = useState({
    ytd_return: 14.82,
    sharpe_ratio: 2.41,
    max_drawdown: -1.84,
    win_rate: 86
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/performance`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (data) setMetrics(data);
      } catch (err) {
        console.warn("Performance API offline, using cache.");
      }
    };
    loadMetrics();
  }, []);

  const perfStats = [
    { label: "YTD Return", value: `+${metrics.ytd_return}%`, delta: "Outperforming", up: true },
    { label: "Sharpe Ratio", value: metrics.sharpe_ratio.toString(), delta: "Risk-Adjusted", up: true },
    { label: "Max Drawdown", value: `${metrics.max_drawdown}%`, delta: "Contained", up: false },
    { label: "AI Win Rate", value: `${metrics.win_rate}%`, delta: "MoM Growth", up: true },
  ];

  const months = [
    { label: "Jan", value: 4.2 },
    { label: "Feb", value: 3.8 },
    { label: "Mar", value: 5.1 },
    { label: "Apr", value: 1.72 },
    { label: "May", value: 0 },
    { label: "Jun", value: 0 },
    { label: "Jul", value: 0 },
    { label: "Aug", value: 0 },
    { label: "Sep", value: 0 },
    { label: "Oct", value: 0 },
    { label: "Nov", value: 0 },
    { label: "Dec", value: 0 },
  ];

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">
      
      {/* Hero Stats */}
      <div className="col-span-12 glass-card rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-4 font-semibold tracking-[0.28em]">
              Cumulative Return · YTD
            </p>
            <p className="text-6xl md:text-8xl text-foreground font-bold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
              +{metrics.ytd_return}<span className="text-muted-foreground/30">%</span>
            </p>
          </div>
          <div className="flex md:block items-center gap-6 md:text-right md:space-y-2">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-[0.28em]">
              Sharpe Ratio
            </p>
            <p className="text-3xl text-foreground font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
              {metrics.sharpe_ratio}
            </p>
          </div>
        </div>
        <div className="h-[280px]">
          <StabilityGraph seed={3} height={280} />
        </div>
      </div>

      {/* Grid Stats */}
      {perfStats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-3xl p-8 transition-all hover:bg-white/80"
        >
          <p className="text-[10px] uppercase text-muted-foreground mb-5 font-semibold tracking-[0.2em] truncate">
            {s.label}
          </p>
          <p className="text-3xl md:text-4xl text-foreground font-bold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
            {s.value}
          </p>
          <div className="flex items-center gap-2 mt-4">
             <div className={`h-1 w-1 rounded-full ${s.up ? "bg-emerald-500" : "bg-blue-400"}`} />
             <p className={`text-[11px] font-bold ${s.up ? "text-emerald-600" : "text-blue-500"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
               {s.delta}
             </p>
          </div>
        </motion.div>
      ))}

      {/* Monthly Chart */}
      <div className="col-span-12 glass-card rounded-3xl p-8 md:p-12">
        <p className="text-2xl font-bold text-foreground mb-10" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Monthly <span style={{ fontWeight: 300 }}>Performance</span>
        </p>
        <div className="grid grid-cols-12 gap-3 md:gap-6 items-end h-64">
          {months.map((m, i) => (
            <div key={m.label + i} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-2 py-1 rounded mb-2">
                {m.value}%
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${m.value > 0 ? m.value * 12 : 4}%` }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full max-w-[20px] transition-all group-hover:opacity-80 rounded-t-lg ${
                  m.value > 0 ? "bg-black" : "bg-black/5"
                }`}
                style={{ minHeight: "3px" }}
              />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
