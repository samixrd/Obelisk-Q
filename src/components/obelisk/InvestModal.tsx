/**
 * InvestModal — Mantle Testnet deposit/withdraw interface.
 * Appears when "Activate Investment" is clicked.
 * Uses useVault hook to interact with ObeliskVault contract.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useVault } from "@/hooks/useVault";
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
                background: "rgb(10,10,14)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.98), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent */}
              <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)" }} />

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[9px] uppercase text-muted-foreground mb-1"
                      style={{ letterSpacing: "0.32em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Mantle Sepolia Testnet
                    </p>
                    <h3 className="text-2xl text-foreground"
                      style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.03em", fontWeight: 400 }}>
                      {tab === "deposit"
                        ? <>Activate <span className="italic" style={{ fontWeight: 300 }}>investment</span></>
                        : <>Withdraw <span className="italic" style={{ fontWeight: 300 }}>funds</span></>
                      }
                    </h3>
                  </div>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Confidence score indicator */}
                <div className="flex items-center justify-between mb-6 px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
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
                    <StatBox label="Your balance" value={`${vaultStats.userBalance} MNT`} />
                    <StatBox label="Total deposited" value={`${vaultStats.totalDeposited} MNT`} />
                    <StatBox label="Depositors" value={String(vaultStats.depositorCount)} />
                    <StatBox label="Vault status" value={vaultStats.paused ? "Paused" : "Active"}
                      accent={!vaultStats.paused} />
                  </div>
                )}

                {/* Tab switcher */}
                <div className="flex mb-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {(["deposit", "withdraw"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className="relative py-2 px-4 text-[11px] uppercase transition-colors"
                      style={{
                        letterSpacing: "0.22em",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: tab === t ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
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
                    <label className="block text-[9px] uppercase text-muted-foreground mb-2"
                      style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Amount (MNT)
                    </label>
                    <div className="flex items-center gap-0"
                      style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}>
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
                    <div className="flex gap-2 mt-2">
                      {["0.01", "0.05", "0.1", "0.5"].map((v) => (
                        <button key={v} onClick={() => setAmount(v)}
                          className="text-[9px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          style={{ border: "0.5px solid rgba(255,255,255,0.08)",
                            fontFamily: "'JetBrains Mono', monospace" }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Withdraw panel */}
                {tab === "withdraw" && (
                  <div className="mb-6">
                    {/* Your balance */}
                    <div className="flex items-center justify-between mb-4 px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-[9px] uppercase text-muted-foreground"
                        style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
                        Your balance
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
                              ? "rgba(255,255,255,0.07)"
                              : "transparent",
                            border: `0.5px solid ${withdrawMode === m
                              ? "rgba(255,255,255,0.22)"
                              : "rgba(255,255,255,0.08)"}`,
                            color: withdrawMode === m
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.30)",
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
                            style={{ border: "0.5px solid rgba(255,255,255,0.15)" }}>
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
                    style={{ background: "rgba(255,160,60,0.06)", border: "0.5px solid rgba(255,160,60,0.22)" }}>
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
                    style={{ background: "rgba(100,255,120,0.04)", border: "0.5px solid rgba(100,255,120,0.20)" }}>
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
                      ? "rgba(255,255,255,0.04)"
                      : !isConnected
                      ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))"
                      : "linear-gradient(135deg, hsl(40 14% 86%), hsl(35 10% 68%))",
                    color: isLoading
                      ? "rgba(255,255,255,0.3)"
                      : !isConnected
                      ? "rgba(255,255,255,0.65)"
                      : "rgba(0,0,0,0.75)",
                    border: "0.5px solid rgba(255,255,255,0.15)",
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
    <div className="px-3 py-2.5" style={{ background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[8px] uppercase text-muted-foreground mb-1"
        style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </p>
      <p className="text-sm"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: accent ? "hsl(104 100% 68%)" : "rgba(255,255,255,0.75)",
        }}>
        {value}
      </p>
    </div>
  );
}
