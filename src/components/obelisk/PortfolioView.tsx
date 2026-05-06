import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight, IconArrowDownRight } from "./LineIcons";
import { PortfolioAllocation } from "./PortfolioAllocation";
import { useVault } from "@/hooks/useVault";
import { MagneticText } from "./MagneticText";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
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
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-8 pb-24">
      <div className="col-span-12">
        <PortfolioAllocation />
      </div>

      {/* ── Allocation & Performance row ── */}
      <div className="col-span-12 lg:col-span-5 glass-card rounded-[40px] p-10 flex flex-col justify-between min-h-[320px] transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] uppercase text-muted-foreground/40 mb-8 font-bold tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <MagneticText text="Allocation Breakdown" />
        </p>
        <div className="space-y-6 flex-1">
          {POSITIONS.map((p) => (
            <div key={p.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] text-foreground font-semibold group-hover:text-black transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                <span className="text-[12px] text-muted-foreground/50 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.alloc}%</span>
              </div>
              <div className="h-1.5 bg-black/[0.03] rounded-full relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-black/20 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${p.alloc}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-black/[0.04] text-[10px] uppercase text-muted-foreground/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Total allocated · 92.4%
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7 glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <p className="text-[11px] uppercase text-muted-foreground/40 mb-8 font-bold tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <MagneticText text="30-Day Performance" />
        </p>
        <div className="flex-1 flex items-center">
          <StabilityGraph seed={7} height={160} />
        </div>
      </div>

      {/* ── Position Table ── */}
      <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
        <div className="text-3xl text-black font-bold mb-12 flex flex-wrap gap-x-[0.3em]"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
          <MagneticText text="All" />
          <div className="font-light"><MagneticText text="positions" /></div>
        </div>
        
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 mb-6 px-4 text-[10px] uppercase text-muted-foreground/40 font-bold tracking-[0.2em]">
              <div className="col-span-5">Asset</div>
              <div className="col-span-3">Strategy</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-2 text-right">7D Change</div>
            </div>
            {POSITIONS.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-12 items-center py-6 px-4 border-t border-black/[0.04] hover:bg-black/[0.01] transition-all rounded-2xl group"
              >
                <div className="col-span-5 flex items-center gap-5">
                  <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <span className="text-[13px] font-bold tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.symbol}</span>
                  </div>
                  <div>
                    <span className="text-[16px] text-black font-bold block"
                      style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                    <span className="text-[11px] text-muted-foreground/50 font-medium">Obelisk Core</span>
                  </div>
                </div>
                <div className="col-span-3 text-[13px] text-muted-foreground font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}>{p.strategy}</div>
                <div className="col-span-2 text-[15px] text-black text-right font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.balance}</div>
                <div className={`col-span-2 text-[13px] text-right flex items-center justify-end gap-1.5 font-bold tabular-nums ${p.up ? "text-emerald-500" : "text-muted-foreground/60"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.up ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
                  {p.change}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="col-span-12 glass-card rounded-[48px] p-10 md:p-14 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="text-3xl text-black font-bold flex flex-wrap gap-x-[0.3em]"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
            <MagneticText text="Transaction" />
            <div className="font-light"><MagneticText text="history" /></div>
          </div>
          <div className="px-6 py-2 bg-black/[0.03] border border-black/[0.04] rounded-full">
            <span className="text-[10px] uppercase text-black/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              On-chain ledger
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[700px]">
            {txHistory.map((tx, i) => (
              <motion.div 
                key={tx.hash + i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 items-center py-5 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-colors rounded-xl"
              >
                <div className="col-span-3 flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${tx.status === 'Confirmed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : tx.status === 'Pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <span className="text-[14px] text-black font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{tx.type}</span>
                </div>
                <div className="col-span-3 text-[13px] text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {tx.amount}
                </div>
                <div className="col-span-3 text-[12px] text-muted-foreground/30 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                   {new Date(tx.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                </div>
                <div className="col-span-3 text-right">
                  <motion.a 
                    whileHover={{ x: 2 }}
                    href={explorerUrl(tx.hash)}
                    target="_blank" rel="noreferrer"
                    className="text-[11px] uppercase text-muted-foreground/40 hover:text-black transition-colors font-bold tracking-[0.15em] flex items-center justify-end gap-1"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Details <span className="text-[14px]">↗</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
            {txHistory.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center opacity-20">
                <div className="h-12 w-px bg-black mb-6" />
                <p className="text-[10px] uppercase text-black font-bold tracking-[0.3em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Empty Ledger
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


