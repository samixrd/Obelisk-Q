/**
 * InvestModal — Mantle Testnet deposit/withdraw interface.
 * Redesigned to match the premium rounded-3xl glass aesthetic.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { usePriceOracle } from "@/hooks/usePriceOracle";
import { Logo } from "./Logo";
import { useStability } from "./StabilityContext";

interface InvestModalProps {
  open:    boolean;
  onClose: () => void;
}

export function InvestModal({ open, onClose }: InvestModalProps) {
  const {
    deposit, withdraw, withdrawPartial,
    vaultStats, txState, txHash, txError,
    isConnected, address, connect,
    confirmations, explorerUrl,
  } = useVault();
  const prices = usePriceOracle();

  const { score, adaptive } = useStability();
  const [tab,            setTab]           = useState<"deposit" | "withdraw">("deposit");
  const [amount,         setAmount]        = useState("0.1");
  const [withdrawMode,   setWithdrawMode]  = useState<"full" | "partial">("full");
  const [withdrawAmount, setWithdrawAmount]= useState("0.1");

  const isLoading  = txState === "waiting" || txState === "pending";
  const isSuccess  = txState === "success";
  const canDeposit = score >= adaptive.confidenceThreshold;

  const handleAction = async () => {
    if (!isConnected) { await connect(); return; }
    if (tab === "deposit") {
      await deposit(amount);
    } else {
      if (withdrawMode === "partial") {
        await withdrawPartial(withdrawAmount);
      } else {
        await withdraw();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div
              className="relative w-full max-w-[440px] glass-card rounded-[32px] overflow-hidden shadow-2xl"
              style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid rgba(255,255,255,1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
                      <Logo size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {tab === "deposit" ? "Add Capital" : "Withdraw"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Obelisk Vault · Mantle
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-black/5 rounded-2xl mb-8">
                  {(["deposit", "withdraw"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setTxState?.("idle"); }}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${tab === t ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-black"}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-black/[0.03] border border-black/[0.05] rounded-3xl">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Your Balance</p>
                    <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
                      {vaultStats?.userBalance ?? "0.00"} <span className="text-xs font-medium text-muted-foreground ml-0.5">MNT</span>
                    </p>
                  </div>
                  <div className="p-5 bg-black/[0.03] border border-black/[0.05] rounded-3xl">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Confidence</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>{score}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${canDeposit ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {canDeposit ? "SAFE" : "RISK"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action Area */}
                <div className="space-y-6">
                  {tab === "deposit" ? (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <label className="text-[11px] font-bold text-black uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Deposit Amount</label>
                        <span className="text-[11px] text-muted-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Max: {vaultStats?.walletBalance ?? "0"} MNT
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white border border-black/10 rounded-2xl focus-within:border-black/30 transition-all shadow-sm">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 bg-transparent text-2xl font-bold text-black outline-none"
                          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
                          placeholder="0.00"
                        />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-xl">
                          <div className="h-4 w-4 rounded-full bg-blue-500" />
                          <span className="text-xs font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>MNT</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <label className="text-[11px] font-bold text-black uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Withdraw Mode</label>
                      </div>
                      <div className="flex gap-3 mb-6">
                        {(["full", "partial"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setWithdrawMode(m)}
                            className={`flex-1 py-3 rounded-2xl text-[12px] font-bold transition-all border ${withdrawMode === m ? "bg-black text-white border-black" : "bg-white text-muted-foreground border-black/10 hover:border-black/30"}`}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {m === "full" ? "Withdraw All" : "Partial Amount"}
                          </button>
                        ))}
                      </div>
                      {withdrawMode === "partial" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white border border-black/10 rounded-2xl focus-within:border-black/30 transition-all shadow-sm flex items-center"
                        >
                          <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="flex-1 bg-transparent text-2xl font-bold text-black outline-none"
                            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
                            placeholder="0.00"
                          />
                          <button 
                            onClick={() => setWithdrawAmount(vaultStats?.userBalance ?? "0")}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            MAX
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Feedback Area */}
                  <AnimatePresence mode="wait">
                    {txError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[12px] text-red-600 font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <p className="flex items-center gap-2">
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.5 12h-1v-1h1v1zm0-2h-1V4h1v6z"/></svg>
                          {txError.includes("user rejected") ? "Transaction cancelled in MetaMask." : txError}
                        </p>
                      </motion.div>
                    )}

                    {txState === "pending" && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-6 bg-black/[0.03] border border-black/[0.05] rounded-[24px]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-black uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Confirmations</p>
                          <span className="text-[14px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{confirmations}/3</span>
                        </div>
                        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-black"
                            initial={{ width: 0 }}
                            animate={{ width: `${(confirmations / 3) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-4 font-medium text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Processing on Mantle Testnet...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary Action Button */}
                  <motion.button
                    onClick={handleAction}
                    disabled={isLoading || (tab === "deposit" && !canDeposit)}
                    whileHover={isLoading ? {} : { scale: 1.005 }}
                    whileTap={isLoading ? {} : { scale: 0.995 }}
                    className={`w-full py-5 rounded-[100px] text-[15px] font-bold text-white transition-all shadow-lg ${isLoading ? "bg-[#222] cursor-not-allowed" : (tab === "deposit" && !canDeposit) ? "bg-orange-500/20 text-orange-600 cursor-not-allowed" : "bg-[#0a0a0a] hover:shadow-black/20"}`}
                    style={{ fontFamily: "'Inter', sans-serif", border: "none" }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {txState === "waiting" ? "Check Wallet..." : "Processing..."}
                      </span>
                    ) : !isConnected ? (
                      "Connect Wallet"
                    ) : tab === "deposit" ? (
                      !canDeposit ? "Stability Warning: Low Score" : `Deposit ${amount} MNT`
                    ) : (
                      withdrawMode === "full" ? "Withdraw All Funds" : `Withdraw ${withdrawAmount} MNT`
                    )}
                  </motion.button>

                  <p className="text-[10px] text-muted-foreground/50 text-center font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {tab === "deposit" 
                      ? "Assets are allocated to mETH and USDY based on AI signals." 
                      : "Withdrawals are processed instantly on-chain."
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
