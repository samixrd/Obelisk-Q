import { motion } from "framer-motion";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { useYieldData } from "@/hooks/useYieldData";
import { MagneticText } from "../MagneticText";
import { useTokenLogos } from "@/hooks/useTokenLogos";

interface VaultCardProps {
  onOpenInvest: () => void;
}

export function VaultCard({ onOpenInvest }: VaultCardProps) {
  const { vaultStats, deposit, connect, isConnected, isWrongNetwork, txState } = useVault();
  const { usdy, meth, wmnt } = useYieldData();
  const logos = useTokenLogos();
  const [depositAmount, setDepositAmount] = useState("");
  const isPending = txState === "waiting" || txState === "pending";

  const handleDeposit = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    if (depositAmount && parseFloat(depositAmount) > 0) {
      await deposit(depositAmount);
    } else {
      onOpenInvest();
    }
  };

  return (
    <div id="tour-stability-score" className="col-span-12 lg:col-span-6 glass-card rounded-3xl overflow-hidden">
      {/* Card Header — Token icons + vault name */}
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Overlapping token icons */}
            <div className="flex items-center -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-background flex items-center justify-center p-1.5" style={{ zIndex: 2 }}>
                {logos.mETH ? (
                  <img src={logos.mETH} alt="mETH" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-white/40 font-black">M</span>
                )}
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-primary/20 flex items-center justify-center" style={{ zIndex: 1 }}>
                {logos.USDY ? (
                  <img src={logos.USDY} alt="USDY" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-primary font-black">U</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-white flex items-center gap-2 tracking-tightest">
                OBELISK VAULT
                <div className="px-2 py-0.5 bg-primary/10 text-[9px] text-primary font-black rounded-md border border-primary/20 uppercase tracking-widest flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                   OPTIMIZED
                </div>
              </div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                Institutional RWA · mETH + USDY + WMNT
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row — APY + AUM */}
        <div className="flex items-start gap-0 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                Est. APY
              </span>
            </div>
            <p className="text-[42px] font-black text-primary tabular-nums tracking-tightest leading-none">
              {usdy.loading ? "—" : `${((usdy.apy + meth.apy + (wmnt?.apy || 0)) / 3 + 0.42).toFixed(1)}%`}
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                AUM
              </span>
            </div>
            <p className="text-[42px] font-black text-white tabular-nums tracking-tightest leading-none">
              {vaultStats?.totalDeposited ? `${parseFloat(vaultStats.totalDeposited).toFixed(2)}` : "0.00"}
              <span className="text-sm font-black text-white/30 ml-2">MNT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Input Area */}
      <div className="px-8 pb-6">
        <div
          className="flex items-center justify-between px-6 py-5 bg-white/[0.03] rounded-[18px] border border-white/5"
        >
          <input
            type="number"
            placeholder="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-transparent outline-none text-[32px] font-black text-white w-full tabular-nums tracking-tightest max-w-[65%]"
          />
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 bg-background border border-white/10 rounded-full"
          >
            <div className="h-6 w-6 rounded-full overflow-hidden bg-background flex items-center justify-center border border-white/10">
              {logos.MNT ? (
                <img src={logos.MNT} alt="MNT" className="w-4 h-4 object-contain" />
              ) : (
                <span className="text-[8px] text-primary font-black">M</span>
              )}
            </div>
            <span className="text-[12px] font-black text-white uppercase tracking-widest">MNT</span>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2.5 mt-6">
          {["25%", "50%", "Max"].map((label) => (
            <button
              key={label}
              onClick={() => {
                const bal = parseFloat(vaultStats?.walletBalance || "0");
                if (label === "Max") setDepositAmount(vaultStats?.walletBalance || "0");
                else if (label === "50%") setDepositAmount((bal * 0.5).toFixed(4));
                else if (label === "25%") setDepositAmount((bal * 0.25).toFixed(4));
              }}
              className="text-[10px] px-5 py-2.5 text-white/60 font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Est. Annual Yield */}
        <div className="flex items-center justify-between mt-6 px-1">
          <span className="text-[13px] text-[#6B7280]">
            Mantle Native Yield (Est. Annual)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#0a0a0a] tabular-nums">
              {depositAmount && parseFloat(depositAmount) > 0
                ? `${(parseFloat(depositAmount) * ((usdy.apy + meth.apy + (wmnt?.apy || 0)) / 3) / 100).toFixed(4)} MNT`
                : "—"
              }
            </span>
            <div className="h-4.5 w-4.5 rounded-full overflow-hidden bg-white flex items-center justify-center border border-black/5">
              {logos.MNT ? (
                <img src={logos.MNT} alt="MNT" className="w-3 h-3 object-contain" />
              ) : (
                <span className="text-[6.5px] text-black font-bold">M</span>
              )}
            </div>
          </div>
        </div>

        {/* Wallet balance info */}
        {vaultStats && (
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-[12px] text-[#9CA3AF]">
              Wallet Balance
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium tabular-nums">
              {vaultStats.walletBalance} MNT
            </span>
          </div>
        )}

        {/* Vault balance info */}
        {vaultStats && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[12px] text-[#9CA3AF]">
              Your Vault Balance
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium tabular-nums">
              {vaultStats.userBalance} MNT
            </span>
          </div>
        )}

        {/* Strategy Insight */}
        <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1.5 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[18px]">info</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Insight</p>
              <p className="text-[12px] leading-relaxed text-white/60">
                While static assets like USDY offer fixed yields, <strong>Obelisk Q</strong> dynamically rotates to <strong>mETH</strong> during expansions to capture growth potential, switching back to <strong>USDY</strong> to protect your capital during volatility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Button — full width, pill shape, solid black */}
      <div className="px-8 pb-10">
        <motion.button
          id="tour-invest-button"
          onClick={handleDeposit}
          disabled={isPending}
          className={`w-full py-5 text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-full ${isPending ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/20' : 'btn-premium'}`}
        >
          {isPending ? "Processing..." : isWrongNetwork ? "Switch to Mantle" : isConnected ? "Deposit Funds" : "Connect Wallet"}
        </motion.button>
      </div>
    </div>
  );
}
