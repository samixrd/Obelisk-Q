import { motion } from "framer-motion";
import { useState } from "react";
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
  const { txHistory, explorerUrl, vaultStats, withdrawPartial } = useVault();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [metrics, setMetrics] = useState({
    ytd_return: 14.82,
    sharpe_ratio: 2.41,
  });

  const balance = parseFloat(vaultStats?.userBalance ?? "0");
  const inputAmount = parseFloat(withdrawAmount) || 0;
  const isInsufficient = inputAmount > balance;

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";
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

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 pb-24">
      {/* ── Consolidated Metrics Bar ── */}
      <div className="col-span-12 glass-card rounded-[32px] px-8 py-5 flex flex-wrap items-center justify-between gap-10 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.04)] mb-2">
        <div className="flex items-center gap-12">
          {/* Balance */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-[0.15em] mb-1">Portfolio Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-black tabular-nums" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                {vaultStats?.userBalance ?? "0.00"}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">MNT</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-black/[0.04]" />

          {/* YTD Return */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-[0.15em] mb-1">YTD Return</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-black tabular-nums" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                +{metrics.ytd_return}%
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-black/[0.04]" />

          {/* Sharpe Ratio */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-[0.15em] mb-1">Sharpe Ratio</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
                {metrics.sharpe_ratio}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Optimized</span>
           </div>
        </div>
      </div>

      {/* ── Withdrawal Section (Minimized & Centered) ── */}
      <div className="col-span-12 glass-card rounded-[40px] px-10 py-12 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] mb-2">
        <div className="w-full max-w-[340px] flex flex-col items-center gap-5">
          <div className="w-full relative">
            <div className={`flex items-center gap-4 bg-black/[0.02] border ${isInsufficient ? 'border-red-500/20 bg-red-50/10' : 'border-black/[0.04]'} rounded-2xl px-5 py-3.5 transition-all focus-within:border-black/10 focus-within:bg-black/[0.04]`}>
               <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                className="bg-transparent outline-none text-[18px] font-bold text-black w-full placeholder:text-black/10 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            {isInsufficient && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-500 mt-2 font-normal"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Insufficient balance
              </motion.p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {["25%", "50%", "Max"].map((label) => (
              <button
                key={label}
                onClick={() => {
                  const b = parseFloat(vaultStats?.userBalance ?? "0");
                  if (label === "Max") setWithdrawAmount(b.toString());
                  else if (label === "50%") setWithdrawAmount((b * 0.5).toFixed(4));
                  else if (label === "25%") setWithdrawAmount((b * 0.25).toFixed(4));
                }}
                className="text-[10px] font-bold text-muted-foreground/60 hover:text-black transition-all px-4 py-2 rounded-xl bg-black/[0.02] border border-black/[0.04] hover:bg-black/5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {label}
              </button>
            ))}
          </div>

          <motion.button
            onClick={() => {
              if (withdrawAmount && !isInsufficient && parseFloat(withdrawAmount) > 0) {
                withdrawPartial(withdrawAmount);
              }
            }}
            disabled={isInsufficient || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            whileHover={!(isInsufficient || !withdrawAmount || parseFloat(withdrawAmount) <= 0) ? { scale: 1.01, y: -1 } : {}}
            whileTap={!(isInsufficient || !withdrawAmount || parseFloat(withdrawAmount) <= 0) ? { scale: 0.99 } : {}}
            className={`w-full py-4 rounded-full text-[12px] font-bold uppercase tracking-[0.15em] transition-all shadow-lg shadow-black/5 mt-2 ${isInsufficient || !withdrawAmount || parseFloat(withdrawAmount) <= 0 ? 'bg-black/10 text-white/40 cursor-not-allowed' : 'bg-[#0a0a0a] text-white'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Withdraw Funds
          </motion.button>
        </div>
      </div>

      <div className="col-span-12">
        <PortfolioAllocation />
      </div>

      {/* ── Allocation & Performance row ── */}
      <div className="col-span-12 lg:col-span-5 glass-card rounded-[32px] p-8 flex flex-col justify-between min-h-[280px] transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]">
        <p className="text-[10px] uppercase text-muted-foreground/40 mb-6 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Allocation Breakdown
        </p>
        <div className="space-y-5 flex-1">
          {POSITIONS.map((p) => (
            <div key={p.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-foreground font-semibold group-hover:text-black transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                <span className="text-[11px] text-muted-foreground/50 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.alloc}%</span>
              </div>
              <div className="h-1 bg-black/[0.03] rounded-full relative overflow-hidden">
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
      </div>

      <div className="col-span-12 lg:col-span-7 glass-card rounded-[32px] p-8 transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <p className="text-[10px] uppercase text-muted-foreground/40 mb-6 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          30-Day Performance
        </p>
        <div className="flex-1 flex items-center">
          <StabilityGraph seed={7} height={140} />
        </div>
      </div>

      {/* ── Position Table ── */}
      <div className="col-span-12 glass-card rounded-[40px] p-8 transition-all hover:bg-white/80 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="text-2xl text-black font-bold mb-8 flex flex-wrap gap-x-[0.3em]"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
          All <span className="font-light text-muted-foreground/40">positions</span>
        </div>
        
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 mb-4 px-4 text-[9px] uppercase text-muted-foreground/40 font-bold tracking-[0.15em]">
              <div className="col-span-5">Asset</div>
              <div className="col-span-3">Strategy</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-2 text-right">7D Change</div>
            </div>
            {POSITIONS.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-12 items-center py-4 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-all rounded-xl group"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <span className="text-[11px] font-bold tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.symbol}</span>
                  </div>
                  <div>
                    <span className="text-[14px] text-black font-bold block"
                      style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                  </div>
                </div>
                <div className="col-span-3 text-[12px] text-muted-foreground font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}>{p.strategy}</div>
                <div className="col-span-2 text-[14px] text-black text-right font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.balance}</div>
                <div className={`col-span-2 text-[12px] text-right flex items-center justify-end gap-1.5 font-bold tabular-nums ${p.up ? "text-emerald-500" : "text-muted-foreground/40"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.up ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                  {p.change}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="col-span-12 glass-card rounded-[40px] p-8 transition-all hover:bg-white/80 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="text-2xl text-black font-bold flex flex-wrap gap-x-[0.3em]"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
            Transaction <span className="font-light text-muted-foreground/40">history</span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[700px]">
            {txHistory.map((tx, i) => (
              <motion.div 
                key={tx.hash + i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 items-center py-4 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-colors rounded-xl"
              >
                <div className="col-span-3 flex items-center gap-4">
                  <div className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Confirmed' ? 'bg-emerald-400' : tx.status === 'Pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <span className="text-[13px] text-black font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{tx.type}</span>
                </div>
                <div className="col-span-3 text-[12px] text-black font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {tx.amount}
                </div>
                <div className="col-span-3 text-[11px] text-muted-foreground/30 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                   {new Date(tx.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                </div>
                <div className="col-span-3 text-right">
                  <motion.a 
                    whileHover={{ x: 2 }}
                    href={explorerUrl(tx.hash)}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] uppercase text-muted-foreground/40 hover:text-black transition-colors font-bold tracking-[0.1em] flex items-center justify-end gap-1"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Details <span className="text-[12px]">↗</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
            {txHistory.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center opacity-10">
                <p className="text-[9px] uppercase text-black font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
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


