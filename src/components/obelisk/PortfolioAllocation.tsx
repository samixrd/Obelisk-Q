import { motion } from "framer-motion";
import { useStability } from "./StabilityContext";
import { useYieldData } from "@/hooks/useYieldData";

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
    <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
      <div className="grid grid-cols-12 gap-12">
        
        {/* Left: Current Allocation */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-6" style={{ letterSpacing: "0.28em" }}>
              Current Allocation
            </p>
            
            <div className="space-y-6">
              {/* USDY Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-foreground/70 font-mono">USDY</span>
                  <div className="text-right">
                    <span className="text-[11px] text-foreground font-mono mr-4">{current.usdy.pct}%</span>
                    <span className="text-[11px] text-muted-foreground font-mono">${current.usdy.val.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${current.usdy.pct}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-foreground/20"
                    style={{ background: "linear-gradient(90deg, #e5e7eb 0%, #9ca3af 100%)" }}
                  />
                </div>
              </div>

              {/* mETH Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-foreground/70 font-mono">mETH</span>
                  <div className="text-right">
                    <span className="text-[11px] text-foreground font-mono mr-4">{current.meth.pct}%</span>
                    <span className="text-[11px] text-muted-foreground font-mono">${current.meth.val.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${current.meth.pct}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="h-full bg-neon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-foreground/[0.03] grid grid-cols-3 gap-6">
            <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.2em" }}>Portfolio Value</p>
              <p className="text-lg text-foreground font-mono">${totalVal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.2em" }}>Est. Yield (Mo)</p>
              <p className="text-lg text-emerald-500/80 font-mono">+$2,410</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.2em" }}>Avg. APY</p>
              <p className="text-lg text-foreground font-mono">{blendedApy.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Right: AI Target & History */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.28em" }}>
                AI Target Allocation
              </p>
              <div className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/[0.03] text-[9px] text-emerald-500/60 font-mono uppercase tracking-widest">
                {adaptive.modeLabel}
              </div>
            </div>

            <div className="bg-foreground/[0.02] border border-foreground/[0.04] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-foreground/60">Recommended Target</span>
                <span className="text-xs text-foreground font-mono">{target.usdy}% USDY · {target.meth}% mETH</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500/40 animate-pulse" />
                <p className="text-xs text-foreground/80">
                  Agent suggests increasing mETH by <span className="text-neon">{target.meth - current.meth.pct}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[10px] uppercase text-muted-foreground mb-4" style={{ letterSpacing: "0.28em" }}>
              7D Allocation History
            </p>
            <div className="relative h-20 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <motion.path
                  d={`M ${history.map((h, i) => `${(i / (history.length - 1)) * 100}% ${100 - h}`).join(' L ')}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  vectorEffect="non-scaling-stroke"
                  style={{ transform: 'scale(1, 0.6)', transformOrigin: 'top' }}
                />
                {/* Labels for events */}
                <foreignObject x="0" y="45" width="100%" height="40">
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] uppercase text-muted-foreground/30 font-mono">Rebalanced</span>
                    <span className="text-[8px] uppercase text-muted-foreground/30 font-mono">Score Dropped</span>
                    <span className="text-[8px] uppercase text-muted-foreground/30 font-mono">Recovered</span>
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
