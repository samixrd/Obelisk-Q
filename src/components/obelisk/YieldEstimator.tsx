import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useYieldData } from "@/hooks/useYieldData";
import { useStability } from "./StabilityContext";
import { usePriceOracle } from "@/hooks/usePriceOracle";

type RiskLevel = "Conservative" | "Balanced" | "Growth";
type Period = 1 | 3 | 6 | 12;

export function YieldEstimator() {
  const { usdy, meth } = useYieldData();
  const { score, adaptive } = useStability();
  const prices = usePriceOracle();

  const [amount, setAmount] = useState("1000");
  const [currency, setCurrency] = useState<"MNT" | "USDC">("USDC");
  const [period, setPeriod] = useState<Period>(12);
  const [risk, setRisk] = useState<RiskLevel>("Balanced");

  const calculations = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    const mntPrice = prices.mnt.price || 0.64; // Fallback if loading
    const amountInUsd = currency === "MNT" ? numAmount * mntPrice : numAmount;

    let blendedApy = 0;
    if (risk === "Conservative") {
      blendedApy = 0.7 * usdy.apy + 0.3 * meth.apy;
    } else if (risk === "Balanced") {
      blendedApy = 0.5 * usdy.apy + 0.5 * meth.apy;
    } else {
      blendedApy = 0.3 * usdy.apy + 0.7 * meth.apy;
    }

    const estimatedYield = amountInUsd * (blendedApy / 100) * (period / 12);
    const finalBalance = amountInUsd + estimatedYield;

    return {
      amountInUsd,
      blendedApy,
      estimatedYield,
      finalBalance,
    };
  }, [amount, currency, period, risk, usdy.apy, meth.apy, prices.mnt.price]);

  const recommendation = useMemo(() => {
    if (score >= 80) return "Based on current score " + score + " (" + adaptive.modeLabel + "), the agent suggests Growth allocation for maximum yield.";
    if (score >= 60) return "Based on current score " + score + " (" + adaptive.modeLabel + "), the agent suggests Balanced allocation.";
    return "Based on current score " + score + " (" + adaptive.modeLabel + "), the agent suggests Conservative allocation for capital preservation.";
  }, [score, adaptive.modeLabel]);

  return (
    <div className="col-span-12 glass-card rounded-2xl p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <p className="text-2xl text-foreground" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Yield <span style={{ fontWeight: 300 }}>estimator</span>
        </p>
        <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-full">
           <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
           <span className="text-[9px] uppercase text-muted-foreground font-mono tracking-widest">Live Rates</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-12">
        {/* Inputs */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
          {/* Amount & Currency */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase text-muted-foreground font-mono tracking-[0.2em]">Principal Amount</label>
              <div className="flex bg-foreground/[0.05] p-0.5 rounded-lg border border-foreground/[0.08]">
                {(["USDC", "MNT"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                      currency === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/10 py-3 text-2xl font-mono text-foreground focus:border-foreground/30 outline-none transition-colors"
                placeholder="0.00"
              />
              <span className="absolute right-0 bottom-3 text-xs text-muted-foreground/40 font-mono">
                {currency === "MNT" ? `≈ $${calculations.amountInUsd.toLocaleString()}` : "Fixed USD value"}
              </span>
            </div>
          </div>

          {/* Period */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase text-muted-foreground font-mono tracking-[0.2em]">Time Horizon</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setPeriod(m as Period)}
                  className={`py-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                    period === m 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-transparent border-foreground/10 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {m >= 12 ? "1 Year" : `${m} Months`}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Preference */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-[10px] uppercase text-muted-foreground font-mono tracking-[0.2em]">Strategy Profile</label>
              <span className="text-[11px] text-foreground font-mono">{risk}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={risk === "Conservative" ? 0 : risk === "Balanced" ? 1 : 2}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setRisk(val === 0 ? "Conservative" : val === 1 ? "Balanced" : "Growth");
              }}
              className="w-full accent-foreground h-1.5 bg-foreground/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono uppercase tracking-widest">
              <span>Safe (USDY)</span>
              <span>Yield (mETH)</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl p-8 h-full flex flex-col">
            <div className="grid grid-cols-2 gap-8 mb-auto">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-mono tracking-widest mb-2">Est. Yield</p>
                <p className="text-3xl text-neon font-mono">
                  +${calculations.estimatedYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-mono tracking-widest mb-2">Blended APY</p>
                <p className="text-3xl text-foreground font-mono">
                  {calculations.blendedApy.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-foreground/[0.05] space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Final estimated balance</span>
                <span className="text-xl text-foreground font-mono">
                  ${calculations.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-foreground/[0.03] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                  <p className="text-[10px] uppercase text-muted-foreground font-mono tracking-widest">AI Agent Insight</p>
                </div>
                <p className="text-[11px] text-foreground/70 leading-relaxed italic">
                  "{recommendation}"
                </p>
              </div>

              <p className="text-[9px] text-muted-foreground/40 leading-relaxed">
                * Estimated returns are based on current APY rates and do not guarantee future performance. 
                Calculations include compounding effects where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
