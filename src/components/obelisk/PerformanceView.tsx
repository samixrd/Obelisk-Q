import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight, IconArrowDownRight, IconShield, IconActivity } from "./LineIcons";
import { MagneticText } from "./MagneticText";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
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
    { label: "YTD Return", value: `+${metrics.ytd_return}%`, delta: "Outperforming", up: true, id: "ytd" },
    { label: "Sharpe Ratio", value: metrics.sharpe_ratio.toString(), delta: "Risk-Adjusted", up: true, id: "sharpe" },
    { label: "Max Drawdown", value: `${metrics.max_drawdown}%`, delta: "Contained", up: false, id: "drawdown" },
    { label: "AI Win Rate", value: `${metrics.win_rate}%`, delta: "MoM Growth", up: true, id: "winrate" },
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
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-8 pb-24">
      
      {/* ── Hero Stats ── */}
      <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
          <div className="space-y-4">
            <p className="text-[11px] uppercase text-muted-foreground/40 font-bold tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <MagneticText text="Cumulative Return · YTD" />
            </p>
            <div className="text-7xl md:text-8xl text-black font-bold flex items-baseline gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
              <MagneticText text={`+${metrics.ytd_return}`} />
              <span className="text-black/10 font-light">%</span>
            </div>
          </div>
          <div className="flex md:block items-center gap-8 md:text-right">
            <p className="text-[11px] uppercase text-muted-foreground/40 font-bold tracking-[0.24em] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              <MagneticText text="Sharpe Ratio" />
            </p>
            <div className="text-4xl text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <MagneticText text={String(metrics.sharpe_ratio)} />
            </div>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2">Top 5% Global</p>
          </div>
        </div>
        <div className="h-[320px] -mx-4">
          <StabilityGraph seed={3} height={320} />
        </div>
      </div>

      {/* ── Grid Stats ── */}
      {perfStats.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.95)" }}
          className="col-span-12 sm:col-span-6 lg:col-span-3 glass-card rounded-[32px] p-10 transition-all shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]"
        >
          <p className="text-[10px] uppercase text-muted-foreground/40 mb-6 font-bold tracking-[0.2em] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
            <MagneticText text={s.label} />
          </p>
          <div className="text-3xl md:text-4xl text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>
            <MagneticText text={s.value} />
          </div>
          <div className="flex items-center gap-2.5 mt-5">
             <div className={`h-1.5 w-1.5 rounded-full ${s.up ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-black/20"}`} />
             <p className={`text-[11px] font-bold uppercase tracking-widest ${s.up ? "text-emerald-600" : "text-black/30"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
               {s.delta}
             </p>
          </div>
        </motion.div>
      ))}

      {/* ── Monthly Chart ── */}
      <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
        <div className="text-3xl text-black font-bold mb-14 flex flex-wrap gap-x-[0.3em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
          <MagneticText text="Monthly" />
          <div className="font-light"><MagneticText text="Performance" /></div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-8 items-end h-72 px-4">
          {months.map((m, i) => (
            <div key={m.label + i} className="flex-1 flex flex-col items-center gap-6 group">
              <motion.div 
                className="opacity-0 group-hover:opacity-100 transition-all bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-2 shadow-xl"
                initial={false}
                whileHover={{ y: -4 }}
              >
                {m.value}%
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${m.value > 0 ? m.value * 12 : 4}%` }}
                transition={{ delay: 0.2 + i * 0.05, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full max-w-[24px] transition-all rounded-full ${
                  m.value > 0 ? "bg-black group-hover:bg-black/80" : "bg-black/5"
                }`}
                style={{ minHeight: "6px" }}
              />
              <span className="text-[11px] font-bold text-black/20 uppercase tracking-[0.1em]">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

