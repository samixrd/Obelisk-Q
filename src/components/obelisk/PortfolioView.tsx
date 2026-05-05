import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight, IconArrowDownRight } from "./LineIcons";
import { PortfolioAllocation } from "./PortfolioAllocation";
import { useVault } from "@/hooks/useVault";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

const POSITIONS = [
  { symbol: "M", name: "Mantle Core Yield",    strategy: "Conservative · Auto",  balance: "$182,430", change: "+0.82%", up: true,  alloc: 43 },
  { symbol: "L", name: "Liquid Staking Blend", strategy: "Balanced · Auto",      balance: "$98,210",  change: "+1.24%", up: true,  alloc: 23 },
  { symbol: "S", name: "Stable Reserves",      strategy: "Capital preservation", balance: "$84,020",  change: "+0.12%", up: true,  alloc: 20 },
  { symbol: "G", name: "Growth Basket",        strategy: "Ambitious · Manual",   balance: "$63,490",  change: "-0.34%", up: false, alloc: 14 },
];

export function PortfolioView() {
  const { txHistory, explorerUrl } = useVault();

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-20">
      <PortfolioAllocation />

      {/* Allocation donut — text-based since no charting lib imported */}
      <div className="col-span-12 lg:col-span-5 glass-card rounded-2xl p-6 md:p-10 flex flex-col justify-between min-h-[280px]">
        <p className="text-[10px] uppercase text-muted-foreground mb-6" style={{ letterSpacing: "0.28em" }}>
          Allocation
        </p>
        <div className="space-y-4 flex-1">
          {POSITIONS.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground/80 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.alloc}%</span>
              </div>
              <div className="h-1 bg-foreground/5 rounded-full relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-foreground/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${p.alloc}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
          Total allocated · 92.4%
        </p>
      </div>

      {/* Performance snapshot */}
      <div className="col-span-12 lg:col-span-7 glass-card rounded-2xl p-6 md:p-10">
        <p className="text-[10px] uppercase text-muted-foreground mb-6" style={{ letterSpacing: "0.28em" }}>
          30-day performance
        </p>
        <StabilityGraph seed={7} height={140} />
      </div>

      {/* Position table */}
      <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
        <p className="text-2xl text-foreground mb-8"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          All <span style={{ fontWeight: 300 }}>positions</span>
        </p>
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[700px] md:min-w-0">
            {POSITIONS.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-12 items-center py-5 border-t border-foreground/5 hover:bg-foreground/[0.01] transition-colors duration-500"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full border border-foreground/10 flex items-center justify-center">
                    <span className="text-xs text-foreground/70"
                      style={{ fontFamily: "'Inter', sans-serif" }}>{p.symbol}</span>
                  </div>
                  <span className="text-base text-foreground font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                </div>
                <div className="col-span-3 text-sm text-muted-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.strategy}</div>
                <div className="col-span-2 text-sm text-foreground text-right"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.balance}</div>
                <div className={`col-span-2 text-sm text-right flex items-center justify-end gap-1 ${p.up ? "text-foreground/75" : "text-muted-foreground"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.up ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                  {p.change}
                </div>
              </motion.div>
            ))}
          </div>
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
