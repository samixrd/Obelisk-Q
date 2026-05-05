/**
 * InvestModal — Mantle Testnet deposit/withdraw interface.
 * Appears when "Activate Investment" is clicked.
 * Uses useVault hook to interact with ObeliskVault contract.
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
  } = useVault();
  const prices = usePriceOracle();

  const { score, adaptive } = useStability();
  const [tab,            setTab]           = useState<"deposit" | "withdraw">("deposit");
  const [amount,         setAmount]        = useState("0.01");
  const [withdrawMode,   setWithdrawMode]  = useState<"full" | "partial">("full");
  const [withdrawAmount, setWithdrawAmount]= useState("0.01");

  const isLoading  = txState === "waiting" || txState === "pending";
  const isSuccess  = txState === "success";
  const canDeposit = !adaptive.volatility || score >= adaptive.confidenceThreshold;

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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center px-6"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 8,    scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative w-full max-w-[420px]"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.10)",
                boxShadow: "0 8px 30px -8px rgba(0,0,0,0.15), 0 40px 80px -20px rgba(0,0,0,0.10)",
                borderRadius: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent */}
              <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)", borderRadius: "16px 16px 0 0" }} />

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <Logo size={32} className="text-foreground" />
                  <div className="flex-1">
                    <p className="text-[9px] uppercase text-muted-foreground mb-1"
                      style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Mantle Sepolia Testnet
                    </p>
                    <h3 className="text-2xl text-foreground font-semibold"
                      style={{ letterSpacing: "-0.02em" }}>
                      {tab === "deposit"
                        ? <>Activate <span className="italic" style={{ fontWeight: 300 }}>investment</span></>
                        : <>Withdraw <span className="italic" style={{ fontWeight: 300 }}>funds</span></>
                      }
                    </h3>
                  </div>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors self-start">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Confidence score indicator */}
                <div className="flex items-center justify-between mb-6 px-4 py-3"
                  style={{ background: "rgba(0,0,0,0.03)", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 8 }}>
                  <div>
                    <p className="text-[9px] uppercase text-muted-foreground"
                      style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Confidence Score
                    </p>
                    <p className="text-2xl text-foreground mt-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.04em" }}>
                      {score}
                      <span className="text-sm text-muted-foreground ml-1">/ 100</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-muted-foreground"
                      style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
                      {adaptive.modeLabel}
                    </p>
                    <p className="text-[10px] mt-1"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: canDeposit ? "hsl(104 100% 68%)" : "hsl(30 100% 70%)",
                      }}>
                      Threshold: {adaptive.confidenceThreshold}%
                    </p>
                  </div>
                </div>

                {/* Vault stats */}
                {vaultStats && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatBox label="Vault balance" value={`${vaultStats.userBalance} MNT`} />
                    <StatBox label="Wallet balance" value={`${vaultStats.walletBalance} MNT`} />
                    <StatBox label="Total deposited" value={`${vaultStats.totalDeposited} MNT`} />
                    <StatBox label="Vault status" value={vaultStats.paused ? "Paused" : "Active"}
                      accent={!vaultStats.paused} />
                  </div>
                )}

                {/* Tab switcher */}
                <div className="flex mb-6"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.09)" }}>
                  {(["deposit", "withdraw"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className="relative py-2 px-4 text-[11px] uppercase transition-colors"
                      style={{
                        letterSpacing: "0.22em",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: tab === t ? "#0a0a0a" : "rgba(0,0,0,0.35)",
                      }}>
                      {t}
                      {tab === t && (
                        <motion.div layoutId="invest-tab"
                          className="absolute -bottom-px left-0 right-0 h-px bg-foreground"
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Amount input — deposit only */}
                {tab === "deposit" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[9px] uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
                        Amount (MNT)
                      </label>
                      <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        Wallet: {vaultStats?.walletBalance ?? "—"} MNT
                      </span>
                    </div>
                    <div className="flex items-center gap-0"
                      style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.001"
                        step="0.001"
                        className="flex-1 bg-transparent px-4 py-3 text-foreground text-sm outline-none"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        placeholder="0.01"
                      />
                      <span className="px-4 text-[10px] uppercase text-muted-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em" }}>
                        MNT
                      </span>
                    </div>

                    {!prices.mnt.loading && (
                      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground/60 px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <span>1 MNT = ${prices.mnt.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-foreground/40">·</span>
                        <span>Depositing {amount} MNT = ${(parseFloat(amount || "0") * prices.mnt.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      {["0.01", "0.05", "0.1", "0.5"].map((v) => (
                        <button key={v} onClick={() => setAmount(v)}
                          className="text-[9px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          style={{ border: "1px solid rgba(0,0,0,0.10)",
                            borderRadius: 4,
                            fontFamily: "'JetBrains Mono', monospace" }}>
                          {v}
                        </button>
                      ))}
                    </div>

                    {/* Risk Disclosure Data */}
                    <div className="mb-6 p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                      <p className="text-[10px] uppercase text-muted-foreground mb-3" style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" }}>
                        Asset Allocation Logic
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">Managed Asset 1</span>
                          <span className="text-[10px] text-foreground font-medium">USDY (Treasuries)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">Managed Asset 2</span>
                          <span className="text-[10px] text-foreground font-medium">mETH (Staked ETH)</span>
                        </div>
                        <div className="pt-2 border-t border-foreground/5">
                          <p className="text-[9px] text-muted-foreground leading-relaxed">
                            By depositing, you agree that the AI agent will rebalance your funds between these assets based on the current Q-Score and market regime.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Withdraw panel */}
                {tab === "withdraw" && (
                  <div className="mb-6">
                    {/* Your balance */}
                    <div className="flex items-center justify-between mb-4 px-4 py-3"
                      style={{ background: "rgba(0,0,0,0.03)", border: "0.5px solid rgba(0,0,0,0.07)", borderRadius: 8 }}>
                      <span className="text-[9px] uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
                        Available Vault Balance
                      </span>
                      <span className="text-base text-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {vaultStats?.userBalance ?? "—"} MNT
                      </span>
                    </div>

                    {/* Full / Partial toggle */}
                    <div className="flex gap-2 mb-4">
                      {(["full", "partial"] as const).map((m) => (
                        <button key={m} onClick={() => setWithdrawMode(m)}
                          className="flex-1 py-2 text-[9px] uppercase transition-all duration-300"
                          style={{
                            letterSpacing: "0.22em",
                            fontFamily: "'JetBrains Mono', monospace",
                            background: withdrawMode === m
                              ? "rgba(0,0,0,0.07)"
                              : "transparent",
                            border: `1px solid ${withdrawMode === m
                              ? "rgba(0,0,0,0.18)"
                              : "rgba(0,0,0,0.10)"}`,
                            borderRadius: 8,
                            color: withdrawMode === m
                              ? "#0a0a0a"
                              : "rgba(0,0,0,0.40)",
                          }}>
                          {m === "full" ? "Withdraw all" : "Partial"}
                        </button>
                      ))}
                    </div>

                    {/* Partial amount input */}
                    <AnimatePresence>
                      {withdrawMode === "partial" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <label className="block text-[9px] uppercase text-muted-foreground mb-2"
                            style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
                            Amount (MNT)
                          </label>
                          <div className="flex items-center"
                            style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                            <input
                              type="number"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              min="0.001"
                              step="0.001"
                              className="flex-1 bg-transparent px-4 py-3 text-foreground text-sm outline-none"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              placeholder="0.01"
                            />
                            <span className="px-4 text-[10px] uppercase text-muted-foreground"
                              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em" }}>
                              MNT
                            </span>
                          </div>
                          {/* Max button */}
                          {vaultStats && (
                            <button
                              onClick={() => setWithdrawAmount(vaultStats.userBalance)}
                              className="mt-2 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em" }}>
                              Max: {vaultStats.userBalance} MNT
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Non-custodial note */}
                    <p className="mt-3 text-[9px] text-muted-foreground/40 leading-relaxed"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.01em" }}>
                      Funds return directly to your wallet. No lock-up period.
                    </p>
                  </div>
                )}

                {/* Score warning */}
                {tab === "deposit" && !canDeposit && (
                  <div className="mb-5 px-4 py-3"
                    style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 8 }}>
                    <p className="text-[10px] leading-relaxed"
                      style={{ fontFamily: "'JetBrains Mono', monospace",
                        color: "hsl(30 100% 70%)", letterSpacing: "0.01em" }}>
                      Confidence score ({score}) is below the {adaptive.confidenceThreshold}% threshold.
                      The agent recommends waiting for market conditions to stabilise.
                    </p>
                  </div>
                )}

                {/* Success state */}
                {isSuccess && txHash && (
                  <div className="mb-5 px-4 py-3"
                    style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.20)", borderRadius: 8 }}>
                    <p className="text-[9px] uppercase mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace",
                        color: "hsl(104 100% 68%)", letterSpacing: "0.22em" }}>
                      Transaction confirmed
                    </p>
                    <a
                      href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
                      target="_blank" rel="noreferrer"
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors break-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {txHash.slice(0, 20)}...{txHash.slice(-8)} ↗
                    </a>
                  </div>
                )}

                {/* Error */}
                {txError && (
                  <p className="mb-4 text-[10px] text-red-400/80 leading-relaxed"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {txError}
                  </p>
                )}

                {/* Action button */}
                <motion.button
                  onClick={handleAction}
                  disabled={isLoading}
                  whileHover={isLoading ? {} : { scale: 1.01 }}
                  whileTap={isLoading ? {} : { scale: 0.99 }}
                  className="w-full py-3.5 text-[10px] uppercase transition-all duration-500"
                  style={{
                    letterSpacing: "0.28em",
                    fontFamily: "'JetBrains Mono', monospace",
                    background: isLoading
                      ? "rgba(0,0,0,0.04)"
                      : !isConnected
                      ? "#0a0a0a"
                      : "#0a0a0a",
                    color: isLoading
                      ? "rgba(0,0,0,0.3)"
                      : "#ffffff",
                    border: "none",
                    borderRadius: 100,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}>
                  {!isConnected
                    ? "Connect MetaMask"
                    : isLoading
                    ? txState === "waiting" ? "Confirm in MetaMask..." : "Transaction pending..."
                    : isSuccess
                    ? "Done"
                    : tab === "deposit"
                    ? `Deposit ${amount} MNT`
                    : withdrawMode === "partial"
                    ? `Withdraw ${withdrawAmount} MNT`
                    : "Withdraw all"
                  }
                </motion.button>

                {/* Footer */}
                <p className="mt-4 text-[9px] text-muted-foreground/35 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}>
                  Mantle Sepolia Testnet · Non-custodial · Withdraw anytime
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2.5" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8 }}>
      <p className="text-[8px] uppercase text-muted-foreground mb-1"
        style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </p>
      <p className="text-sm"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: accent ? "hsl(142 72% 36%)" : "var(--foreground)",
        }}>
        {value}
      </p>
    </div>
  );
}
