import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { useYieldData } from "@/hooks/useYieldData";
import { MagneticText } from "../MagneticText";
import { useTokenLogos } from "@/hooks/useTokenLogos";

interface VaultCardProps {
  onOpenInvest: () => void;
}

export function VaultCard({ onOpenInvest }: VaultCardProps) {
  const { vaultStats, deposit, connect, isConnected, txState } = useVault();
  const { usdy, meth } = useYieldData();
  const logos = useTokenLogos();
  const [depositAmount, setDepositAmount] = useState("");
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
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
              <div className="text-[17px] font-bold text-[#0a0a0a] flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
                <MagneticText text="Obelisk Vault" />
                <div className="px-2 py-0.5 bg-emerald-50 text-[9px] text-emerald-600 font-bold rounded-md border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Mantle Optimized
                </div>
              </div>
              <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Institutional RWA · mETH + USDY
              </p>
            </div>
          </div>
          <button
            onClick={() => setLearnMoreOpen(true)}
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
            <span className="text-[14px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>MNT</span>
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
            Mantle Native Yield (Est. Annual)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#0a0a0a]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {depositAmount && parseFloat(depositAmount) > 0
                ? `${(parseFloat(depositAmount) * ((usdy.apy + meth.apy) / 2) / 100).toFixed(4)} MNT`
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
          whileHover={{ 
            y: isPending ? 0 : -2, 
            boxShadow: isPending ? "none" : "0 20px 40px rgba(0,0,0,0.2), 0 0 20px rgba(0,211,149,0.15)" 
          }}
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
          ) : (isConnected ? "Deposit" : "Connect Wallet")}
        </motion.button>
      </div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {learnMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLearnMoreOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
            >
              <div className="w-[400px] bg-white rounded-[32px] p-8 shadow-2xl pointer-events-auto border border-black/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-black">Vault Mechanics</h3>
                  <button onClick={() => setLearnMoreOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20" /></svg>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-black mb-1">AI Management</h4>
                      <p className="text-[12px] text-[#6B7280] leading-relaxed">Dynamic balancing between Treasuries and Staking for optimal stability.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-black mb-1">Safety Buffer</h4>
                      <p className="text-[12px] text-[#6B7280] leading-relaxed">Protocol reserves protect your principal against market drawdowns.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-black mb-1">Instant Liquidity</h4>
                      <p className="text-[12px] text-[#6B7280] leading-relaxed">No lockups. Withdraw your assets back to MNT instantly at any time.</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setLearnMoreOpen(false)}
                  className="w-full mt-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-black/90 transition-all"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
