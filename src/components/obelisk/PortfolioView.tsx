import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight, IconArrowDownRight } from "./LineIcons";
import { useVault } from "@/hooks/useVault";
import { MagneticText } from "./MagneticText";
import { useTokenLogos } from "@/hooks/useTokenLogos";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

const POSITIONS = [
  { symbol: "mETH", name: "Mantle Staked Ether", strategy: "Balanced · Auto",      balance: "$284,420",  change: "+1.24%", up: true,  alloc: 60, id: "mETH" },
  { symbol: "USDY", name: "Ondo US Dollar Yield", strategy: "Conservative · Auto",  balance: "$144,310", change: "+0.82%", up: true,  alloc: 40, id: "USDY" },
];

export function PortfolioView() {
  const { sessionToken, logout } = useAuth();
  const { txHistory, explorerUrl, vaultStats, withdrawPartial, txState } = useVault();
  const logos = useTokenLogos();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [metrics, setMetrics] = useState({
    ytd_return: 14.82,
    sharpe_ratio: 2.41,
  });

  const isPending = txState === "waiting" || txState === "pending";
  const balance = parseFloat(vaultStats?.userBalance ?? "0");
  const inputAmount = parseFloat(withdrawAmount) || 0;
  const isInsufficient = inputAmount > balance;

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";
    const loadMetrics = async () => {
      if (!sessionToken) return;
      try {
        const res = await fetch(`${API_BASE}/api/performance`, {
          headers: { 'X-Session-Token': sessionToken }
        });
        if (res.status === 401) {
          logout();
          return;
        }
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
      
      {/* ── Top Metrics Bar (Slim & Minimalist) ── */}
      <div className="col-span-12 glass-card rounded-[32px] px-10 py-7 flex flex-wrap items-center justify-between shadow-[0_4px_24px_-10px_rgba(0,0,0,0.04)] mb-2">
        <div className="flex items-center gap-16">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#9CA3AF] font-semibold tracking-[0.15em] mb-2">Portfolio Balance</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold text-[#0a0a0a] tabular-nums" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                {vaultStats?.userBalance ?? "0.0000"}
              </span>
              <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase">MNT</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-black/[0.06]" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#9CA3AF] font-semibold tracking-[0.15em] mb-2">YTD Return</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-bold text-[#0a0a0a] tabular-nums" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                +{metrics.ytd_return}%
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
           <div className="h-2 w-2 rounded-full bg-emerald-400" />
           <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Vault Optimized</span>
        </div>
      </div>

      {/* ── Withdrawal Card Interface (Mirroring VaultCard) ── */}
      <div className="col-span-12 lg:col-span-6 glass-card rounded-[40px] overflow-hidden flex flex-col shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]">
        <div className="p-10 pb-0">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm flex items-center justify-center" style={{ zIndex: 2 }}>
                {logos.mETH ? (
                  <img src={logos.mETH} alt="mETH" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#00D395] font-bold">M</span>
                )}
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-[#2775CA] shadow-sm flex items-center justify-center" style={{ zIndex: 1 }}>
                {logos.USDY ? (
                  <img src={logos.USDY} alt="USDY" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-white font-bold">U</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[18px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Portfolio Withdrawal
              </div>
              <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Withdraw to Mantle Network
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-7 py-6 bg-[#F9FAFB] rounded-[24px] border border-black/[0.04]">
            <input
              type="number"
              placeholder="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-transparent outline-none text-[34px] font-semibold text-[#0a0a0a] w-full"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
            />
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-black/[0.1] rounded-full shadow-sm">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-white flex items-center justify-center border border-black/5">
              {logos.MNT ? (
                <img src={logos.MNT} alt="MNT" className="w-4 h-4 object-contain" />
              ) : (
                <span className="text-[8px] text-black font-bold">M</span>
              )}
            </div>
              <span className="text-[14px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>MNT</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            {["25%", "50%", "Max"].map((label) => (
              <button
                key={label}
                onClick={() => {
                  if (label === "Max") setWithdrawAmount(balance.toString());
                  else if (label === "50%") setWithdrawAmount((balance * 0.5).toFixed(4));
                  else if (label === "25%") setWithdrawAmount((balance * 0.25).toFixed(4));
                }}
                className="text-[12px] px-5 py-2.5 text-[#6B7280] hover:text-[#0a0a0a] hover:bg-[#F3F4F6] border border-black/[0.06] rounded-full transition-all font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {label}
              </button>
            ))}
            {isInsufficient && (
              <span className="text-[12px] text-red-500/70 ml-auto font-normal" style={{ fontFamily: "'Inter', sans-serif" }}>
                Insufficient balance
              </span>
            )}
          </div>
        </div>

        <div className="p-10 pt-10">
          <motion.button
            onClick={() => {
              if (withdrawAmount && !isInsufficient && parseFloat(withdrawAmount) > 0) {
                withdrawPartial(withdrawAmount);
              }
            }}
            disabled={isInsufficient || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || isPending}
            whileHover={!(isInsufficient || !withdrawAmount || isPending) ? { y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" } : {}}
            whileTap={!(isInsufficient || !withdrawAmount || isPending) ? { scale: 0.98 } : {}}
            className={`w-full py-5 rounded-full text-[15px] font-semibold transition-all duration-300 ${isInsufficient || !withdrawAmount || isPending ? 'bg-black/10 text-[#9CA3AF] cursor-not-allowed' : 'bg-[#0a0a0a] text-white shadow-xl shadow-black/10'}`}
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
          >
            {isPending ? "Processing..." : "Withdraw Funds"}
          </motion.button>
        </div>
      </div>

      {/* ── Stats & Breakdown Grid ── */}
      <div className="col-span-12 lg:col-span-6 grid grid-cols-1 gap-6">
        <div className="glass-card rounded-[32px] p-8 flex flex-col justify-between transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] h-full">
          <p className="text-[10px] uppercase text-[#9CA3AF] mb-8 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Allocation Breakdown
          </p>
          <div className="space-y-6 flex-1">
            {POSITIONS.map((p) => (
              <div key={p.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-black font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                  <span className="text-[12px] text-[#9CA3AF] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{p.alloc}%</span>
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
        </div>
      </div>

      <div className="col-span-12 glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] uppercase text-[#9CA3AF] mb-8 font-bold tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>
          30-Day Performance History
        </p>
        <div className="h-[180px]">
          <StabilityGraph seed={7} height={180} />
        </div>
      </div>

      {/* ── Position Table ── */}
      <div className="col-span-12 glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
        <div className="text-[24px] text-black font-bold mb-10 flex items-baseline gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Active <span className="font-light text-[#9CA3AF]">Positions</span>
        </div>
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 mb-6 px-4 text-[10px] uppercase text-[#9CA3AF] font-bold tracking-[0.2em]">
              <div className="col-span-5">Asset</div>
              <div className="col-span-3">Strategy</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-2 text-right">7D Change</div>
            </div>
            {POSITIONS.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                className="grid grid-cols-12 items-center py-5 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-all rounded-2xl group"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-black/[0.04] overflow-hidden flex items-center justify-center transition-all p-1.5">
                    {logos[p.id as keyof typeof logos] ? (
                      <img src={logos[p.id as keyof typeof logos]} alt={p.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[13px] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{p.symbol[0]}</span>
                    )}
                  </div>
                  <span className="text-[15px] text-black font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</span>
                </div>
                <div className="col-span-3 text-[13px] text-[#6B7280] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{p.strategy}</div>
                <div className="col-span-2 text-[15px] text-black text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{p.balance}</div>
                <div className={`col-span-2 text-[13px] text-right flex items-center justify-end gap-1.5 tabular-nums ${p.up ? "text-emerald-500" : "text-[#9CA3AF]"}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                  {p.up ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
                  {p.change}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}


