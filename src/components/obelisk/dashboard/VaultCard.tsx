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
    <div className="col-span-12 lg:col-span-6 glass-card rounded-3xl overflow-hidden">
      {/* Card Header — Token icons + vault name */}
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Overlapping token icons */}
            <div className="flex items-center -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm flex items-center justify-center p-1.5" style={{ zIndex: 2 }}>
                {logos.mETH ? (
                  <img src={logos.mETH} alt="mETH" className="w-full h-full object-contain" />
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
              <div className="text-[17px] font-bold text-[#0a0a0a] flex items-center gap-2 tracking-tight">
                <MagneticText text="Obelisk Vault" />
                <div className="px-2 py-0.5 bg-emerald-50 text-[9px] text-emerald-600 font-bold rounded-md border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Mantle Optimized
                </div>
              </div>
              <p className="text-[12px] text-[#6B7280]">
                Institutional RWA · mETH + USDY + WMNT
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row — APY + AUM */}
        <div className="flex items-start gap-0 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider">
                Est. APY
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#1976D2]">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[36px] font-bold text-emerald-500 tabular-nums tracking-tighter leading-none">
              {usdy.loading ? "—" : `${((usdy.apy + meth.apy + (wmnt?.apy || 0)) / 3 + 0.42).toFixed(1)}%`}
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider">
                AUM
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#1976D2]">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[36px] font-bold text-[#0a0a0a] tabular-nums tracking-tighter leading-none">
              {vaultStats?.totalDeposited ? `${parseFloat(vaultStats.totalDeposited).toFixed(2)}` : "0.00"}
              <span className="text-[16px] font-medium text-[#6B7280] ml-1.5">MNT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Input Area */}
      <div className="px-8 pb-6">
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{
            background: "#F9FAFB",
            borderRadius: 18,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <input
            type="number"
            placeholder="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-transparent outline-none text-[32px] font-bold text-[#0a0a0a] w-full tabular-nums tracking-tight max-w-[65%]"
          />
          <div
            className="flex items-center gap-2.5 px-4 py-2.5"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 100,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="h-6 w-6 rounded-full overflow-hidden bg-white flex items-center justify-center border border-black/5">
              {logos.MNT ? (
                <img src={logos.MNT} alt="MNT" className="w-4 h-4 object-contain" />
              ) : (
                <span className="text-[8px] text-black font-bold">M</span>
              )}
            </div>
            <span className="text-[14px] font-semibold text-[#0a0a0a]">MNT</span>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2.5 mt-4">
          {[
            { label: "25%", value: (parseFloat(vaultStats?.walletBalance || "0") * 0.25).toFixed(4) },
            { label: "50%", value: (parseFloat(vaultStats?.walletBalance || "0") * 0.50).toFixed(4) },
            { label: "75%", value: (parseFloat(vaultStats?.walletBalance || "0") * 0.75).toFixed(4) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setDepositAmount(item.value)}
              className="text-[12px] px-4 py-2 text-[#6B7280] hover:text-[#0a0a0a] hover:bg-[#F3F4F6] transition-all border border-black/[0.08] rounded-full font-medium"
            >
              {item.label}
            </button>
          ))}
          {vaultStats?.walletBalance && (
            <button
              onClick={() => setDepositAmount(vaultStats.walletBalance)}
              className="text-[12px] px-4 py-2 text-[#1976D2] hover:text-[#1565C0] hover:bg-blue-50 transition-all ml-auto border border-[#1976D2]/20 rounded-full font-medium"
            >
              Max
            </button>
          )}
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
        <div className="mt-6 p-4 rounded-2xl bg-[#F0F7FF] border border-[#E0EFFF] relative overflow-hidden group">
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 p-1 rounded-md bg-blue-100 text-blue-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Strategy Insight</p>
              <p className="text-[12px] leading-relaxed text-blue-800/80">
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
          whileHover={{ 
            y: isPending ? 0 : -2, 
            boxShadow: isPending ? "none" : "0 20px 40px rgba(0,0,0,0.2), 0 0 20px rgba(0,211,149,0.15)" 
          }}
          whileTap={{ scale: isPending ? 1 : 0.98 }}
          className={`w-full py-5 text-[15px] font-semibold text-white transition-all duration-300 rounded-full ${isPending ? 'opacity-50 cursor-not-allowed bg-[#222]' : 'bg-[#0a0a0a]'} relative z-50`}
          style={{
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : isWrongNetwork ? (
            "Switch to Mantle"
          ) : isConnected ? (
            "Deposit"
          ) : (
            "Connect Wallet"
          )}
        </motion.button>
      </div>
    </div>
  );
}
