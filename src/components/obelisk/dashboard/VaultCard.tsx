import { motion } from "framer-motion";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { useYieldData } from "@/hooks/useYieldData";
import { MagneticText } from "../MagneticText";

interface VaultCardProps {
  onOpenInvest: () => void;
}

export function VaultCard({ onOpenInvest }: VaultCardProps) {
  const { vaultStats, deposit, connect, isConnected, txState } = useVault();
  const { usdy, meth } = useYieldData();
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
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2775CA] to-[#1A5FB4] border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-sm" style={{ zIndex: 2 }}>
                MNT
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00D395] to-[#00A97A] border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-sm" style={{ zIndex: 1 }}>
                Q
              </div>
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#0a0a0a] flex" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
                <MagneticText text="Obelisk Vault" />
              </div>
              <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Mantle Network · MNT
              </p>
            </div>
          </div>
          <button
            className="text-[13px] text-[#1976D2] hover:text-[#1565C0] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            Learn more →
          </button>
        </div>

        {/* Stats Row — APY + AUM */}
        <div className="flex items-start gap-0 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                APY
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#1976D2]">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[36px] font-bold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {usdy.loading ? "—" : `${((usdy.apy + meth.apy) / 2).toFixed(1)}%`}
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] text-[#6B7280] font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                AUM
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#1976D2]">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[36px] font-bold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
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
            className="bg-transparent outline-none text-[32px] font-semibold text-[#0a0a0a] w-full"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", maxWidth: "65%" }}
          />
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-white/80 transition-colors"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 100,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#2775CA] to-[#1A5FB4] flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">M</span>
            </div>
            <span className="text-[14px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>MNT</span>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M3 5l3 3 3-3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2.5 mt-4">
          {["0.01", "0.05", "0.1", "0.5"].map((v) => (
            <button
              key={v}
              onClick={() => setDepositAmount(v)}
              className="text-[12px] px-4 py-2 text-[#6B7280] hover:text-[#0a0a0a] hover:bg-[#F3F4F6] transition-all"
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 100,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
            >
              {v} MNT
            </button>
          ))}
          {vaultStats?.walletBalance && (
            <button
              onClick={() => setDepositAmount(vaultStats.walletBalance)}
              className="text-[12px] px-4 py-2 text-[#1976D2] hover:text-[#1565C0] hover:bg-blue-50 transition-all ml-auto"
              style={{
                border: "1px solid rgba(25,118,210,0.2)",
                borderRadius: 100,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
            >
              Max
            </button>
          )}
        </div>

        {/* Est. Annual Yield */}
        <div className="flex items-center justify-between mt-6 px-1">
          <span className="text-[13px] text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Est. Annual Yield
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {depositAmount && parseFloat(depositAmount) > 0
                ? `${(parseFloat(depositAmount) * ((usdy.apy + meth.apy) / 2) / 100).toFixed(4)} MNT`
                : "—"
              }
            </span>
            <div className="h-4.5 w-4.5 rounded-full bg-gradient-to-br from-[#2775CA] to-[#1A5FB4] flex items-center justify-center">
              <span className="text-[6.5px] text-white font-bold">M</span>
            </div>
          </div>
        </div>

        {/* Wallet balance info */}
        {vaultStats && (
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-[12px] text-[#9CA3AF]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Wallet Balance
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
              {vaultStats.walletBalance} MNT
            </span>
          </div>
        )}

        {/* Vault balance info */}
        {vaultStats && (
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[12px] text-[#9CA3AF]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your Vault Balance
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
              {vaultStats.userBalance} MNT
            </span>
          </div>
        )}
      </div>

      {/* Deposit Button — full width, pill shape, solid black */}
      <div className="px-8 pb-10">
        <motion.button
          onClick={handleDeposit}
          disabled={isPending}
          whileHover={{ y: isPending ? 0 : -2, shadow: isPending ? "none" : "0 10px 20px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: isPending ? 1 : 0.98 }}
          className={`w-full py-5 text-[15px] font-semibold text-white transition-all duration-300 ${isPending ? 'opacity-50 cursor-not-allowed bg-[#222]' : 'bg-[#0a0a0a]'}`}
          style={{
            borderRadius: 100,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.01em",
            border: "none",
            cursor: isPending ? 'not-allowed' : 'pointer',
            position: 'relative',
            zIndex: 50
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
          ) : "Deposit"}
        </motion.button>
      </div>
    </div>
  );
}
