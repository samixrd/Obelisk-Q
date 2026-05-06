import { motion } from "framer-motion";
import { useStability } from "./StabilityContext";
import { useYieldData } from "@/hooks/useYieldData";
import { MagneticText } from "./MagneticText";

export function PortfolioAllocation() {
  const { score, adaptive } = useStability();
  const { usdy, meth } = useYieldData();

  // Mock data as requested
  const current = {
    usdy: { pct: 60, val: 257000 },
    meth: { pct: 40, val: 171150 }
  };

  const target = {
    usdy: 45,
    meth: 55
  };

  const totalVal = current.usdy.val + current.meth.val;
  const blendedApy = (current.usdy.pct * usdy.apy + current.meth.pct * meth.apy) / 100;

  // Last 7 days USDY % (Mock)
  const history = [62, 65, 63, 60, 58, 60, 60]; 

  return (
    <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
      <div className="grid grid-cols-12 gap-12 md:gap-20">
        
        {/* ── Left: Current Allocation ── */}
        <div className="col-span-12 lg:col-span-6 space-y-12">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground/30 mb-8 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <MagneticText disabled text="Current Allocation" />
            </p>
            
            <div className="space-y-10">
              {/* USDY Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-black/40 font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>USDY</span>
                  <div className="text-right">
                    <span className="text-[14px] text-black font-bold tabular-nums mr-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{current.usdy.pct}%</span>
                    <span className="text-[12px] text-black/20 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${current.usdy.val.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-black/[0.03] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${current.usdy.pct}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-black/20 rounded-full"
                  />
                </div>
              </div>

              {/* mETH Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-black/40 font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>mETH</span>
                  <div className="text-right">
                    <span className="text-[14px] text-black font-bold tabular-nums mr-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{current.meth.pct}%</span>
                    <span className="text-[12px] text-black/20 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${current.meth.val.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-black/[0.03] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${current.meth.pct}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="h-full bg-black/60 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-black/[0.04] grid grid-cols-3 gap-8">
            <div>
              <p className="text-[9px] uppercase text-muted-foreground/40 mb-2 font-bold tracking-[0.15em]">Portfolio Value</p>
              <div className="text-xl text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <MagneticText disabled text={`$${totalVal.toLocaleString()}`} />
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground/40 mb-2 font-bold tracking-[0.15em]">Est. Yield (Mo)</p>
              <div className="text-xl text-emerald-500 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <MagneticText disabled text="+$2,410" />
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground/40 mb-2 font-bold tracking-[0.15em]">Avg. APY</p>
              <div className="text-xl text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <MagneticText disabled text={`${blendedApy.toFixed(2)}%`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: AI Target & History ── */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] uppercase text-muted-foreground/30 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                <MagneticText disabled text="AI Target Allocation" />
              </p>
              <div className="px-4 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                {adaptive.modeLabel}
              </div>
            </div>

            <div className="bg-black/[0.02] border border-black/[0.04] rounded-[32px] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-black/40 font-semibold">Recommended Target</span>
                <span className="text-[13px] text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{target.usdy}% USDY · {target.meth}% mETH</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                <p className="text-[13px] text-black/70 font-medium">
                  Agent suggests increasing mETH by <span className="font-bold text-black">{target.meth - current.meth.pct}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-[10px] uppercase text-muted-foreground/30 mb-6 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <MagneticText disabled text="7D Allocation History" />
            </p>
            <div className="relative h-24 w-full px-2">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <motion.path
                  d={`M ${history.map((h, i) => `${(i / (history.length - 1)) * 100}% ${100 - h}`).join(' L ')}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  vectorEffect="non-scaling-stroke"
                  style={{ transform: 'scale(1, 0.7)', transformOrigin: 'top' }}
                />
                {/* Dots at key points */}
                {history.map((h, i) => (
                   <motion.circle 
                     key={i}
                     cx={`${(i / (history.length - 1)) * 100}%`}
                     cy={`${(100 - h) * 0.7}%`}
                     r="3"
                     fill="rgba(0,0,0,0.15)"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1.5 + i * 0.1 }}
                   />
                ))}
                {/* Labels for events */}
                <foreignObject x="0" y="55" width="100%" height="40">
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] uppercase text-black/20 font-bold tracking-widest">Rebalanced</span>
                    <span className="text-[9px] uppercase text-black/20 font-bold tracking-widest">Score Drop</span>
                    <span className="text-[9px] uppercase text-black/20 font-bold tracking-widest">Recovered</span>
                  </div>
                </foreignObject>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

