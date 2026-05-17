/**
 * AuthScreen — Light-themed auth matching Agent Layer landing style
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { WalletConnectModal } from "./WalletConnectModal";

interface AuthScreenProps {
  onAuthenticated: () => void;
}
export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { setAuthMethod, setWalletAddress, setSessionToken } = useAuth();
  const [step,          setStep]           = useState<1 | 2>(1);
  const [walletLoading,  setWalletLoading]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [compliance, setCompliance] = useState({
    "non-us": false,
    "regulated": false,
    "terms": false,
  });

  const allChecked = Object.values(compliance).every(v => v);

  // ── Antigravity Login Flow (Signature Required) ────────────────────────
  const handleWallet = () => {
    setWalletModalOpen(true);
  };

  const handleWalletConnected = async (address: string) => {
    const eth = (window as any).ethereum;
    // Note: If using WalletConnect via AppKit, window.ethereum might not be the right provider
    // but our current backend login logic relies on personal_sign.
    // For now, we assume the provider is injected or handled by AppKit's EthersAdapter.
    
    setWalletLoading(true);
    setError(null);
    try {
      // Request signature for session validation
      const message = `Antigravity Protocol Login\n\nSession Duration: 5 Minutes\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      let signature;
      // If we're using WalletConnect, we should use the provider from the modal/appkit
      // but to keep it simple, we check if window.ethereum is available
      if (eth) {
        signature = await eth.request({
          method: "personal_sign",
          params: [message, address],
        });
      } else {
        throw new Error("No provider found for signing.");
      }

      // Submit to backend for temporal token issuance
      const API_URL = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, message }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.detail || "Cloud validation failed.");
      }

      const { token } = await resp.json();

      setWalletAddress(address);
      setSessionToken(token);
      setAuthMethod("wallet");
      onAuthenticated();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Auth failed.";
      if (!msg.includes("rejected")) setError(msg);
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "#f5f5f8" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Blue glow border — same as landing */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none",
        boxShadow: "inset 0 0 80px 20px rgba(100,160,255,0.12), inset 0 0 200px 40px rgba(80,140,255,0.06)",
        border: "1px solid rgba(100,160,255,0.08)",
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.45, delay: 0, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px] mx-4 sm:mx-6"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
          borderRadius: "16px",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div className="p-6 md:p-10 flex-1 flex flex-col">
          <Logo size={48} className="mx-auto mb-8 text-foreground" />
          
          {/* Identity badge */}
          <motion.div className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}>
            <span style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em",
              color: "#999", fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
            }}>Step {step} of 2</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col"
              >
                {/* Greeting */}
                <div className="mb-8">
                  <h2 className="text-[26px] md:text-[32px] font-bold text-[#0a0a0a] leading-tight tracking-tight">
                    Compliance
                    <br />
                    <span style={{ fontWeight: 400, color: "#888" }}>Verification.</span>
                  </h2>
                  <p style={{
                    marginTop: 12, fontSize: 13, color: "#888",
                    fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", lineHeight: 1.6,
                  }}>
                    To proceed, please confirm you meet the institutional eligibility requirements.
                  </p>
                </div>

                <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 24 }} />

                {/* Compliance Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
                  {[
                    { id: "non-us", label: "I confirm I am not a US person or entity" },
                    { id: "regulated", label: "I understand USDY is a regulated financial instrument subject to transfer restrictions" },
                    { id: "terms", label: "I accept the Terms of Service and Risk Disclosure" },
                  ].map((item) => (
                    <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", userSelect: "none" }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <input
                          type="checkbox"
                          checked={compliance[item.id as keyof typeof compliance]}
                          onChange={(e) => setCompliance(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="peer appearance-none h-5 w-5 rounded-md border border-black/10 bg-black/5 checked:bg-black checked:border-black transition-all duration-300 cursor-pointer"
                          style={{ flexShrink: 0 }}
                        />
                        <svg 
                          className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" 
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 13, color: "#666", fontFamily: "'Inter', sans-serif", lineHeight: 1.5, paddingTop: 1 }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                <motion.button
                  whileHover={allChecked ? { scale: 1.01 } : {}}
                  whileTap={allChecked ? { scale: 0.99 } : {}}
                  onClick={() => setStep(2)}
                  disabled={!allChecked}
                  className={`mt-auto w-full py-4 rounded-xl text-[14px] font-bold transition-all duration-300 ${allChecked ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-black/5 text-black/20 cursor-not-allowed'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Continue to Access
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col"
              >
                {/* Identity Header */}
                <div className="mb-8">
                  <h2 className="text-[26px] md:text-[32px] font-bold text-[#0a0a0a] leading-tight tracking-tight">
                    Identity
                    <br />
                    <span style={{ fontWeight: 400, color: "#888" }}>Selection.</span>
                  </h2>
                  <p style={{
                    marginTop: 12, fontSize: 13, color: "#888",
                    fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", lineHeight: 1.6,
                  }}>
                    Choose your preferred authentication method to enter the Obelisk network.
                  </p>
                </div>

                <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 24 }} />

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      marginBottom: 20, padding: "12px 16px", fontSize: 12, lineHeight: 1.5,
                      background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.15)",
                      borderRadius: 10, color: "#d44", fontFamily: "'Inter', sans-serif",
                    }}>
                    {error}
                  </motion.div>
                )}

                {/* Auth buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Web3 Wallet */}
                  <AuthButton
                    onClick={handleWallet}
                    loading={walletLoading}
                    icon={
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <rect x="2" y="6" width="20" height="14" rx="2" stroke="#555" strokeWidth="1.4"/>
                        <path d="M2 10h20" stroke="#555" strokeWidth="1.4"/>
                        <circle cx="17" cy="15" r="1.5" fill="#555"/>
                        <path d="M16 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" stroke="#555" strokeWidth="1.4"/>
                      </svg>
                    }
                    label={walletLoading ? "Connecting..." : "Web3 Wallet"}
                    sublabel="MetaMask · WalletConnect · Mobile"
                    accent
                  />

                  {/* AA / Gasless stub (EIP-4337) */}
                  <AuthButton
                    onClick={() => {}}
                    loading={false}
                    disabled={true}
                    icon={
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                    label="Gasless Wallet (EIP-4337)"
                    sublabel="Account Abstraction · No ETH for gas · Coming soon"
                  />

                  {/* AA Info badge */}
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(99,102,241,0.05)",
                    border: "1px solid rgba(99,102,241,0.12)",
                  }}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" stroke="#6366f1" strokeWidth="1.2"/>
                      <path d="M8 7v5M8 5v.5" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <p style={{
                      fontSize: 11, color: "#6366f1", lineHeight: 1.5,
                      fontFamily: "'Inter', sans-serif", margin: 0,
                    }}>
                      <strong>EIP-4337 Account Abstraction</strong> will enable gasless transactions on Mantle — users pay zero gas fees via sponsored bundlers, lowering the barrier for retail onboarding.
                    </p>
                  </div>

                  <WalletConnectModal 
                    open={walletModalOpen}
                    onClose={() => setWalletModalOpen(false)}
                    onConnected={handleWalletConnected}
                  />

                  <button 
                    onClick={() => setStep(1)}
                    className="mt-4 text-[11px] text-muted-foreground hover:text-black transition-colors uppercase tracking-widest font-bold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ← Back to Terms
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div style={{
            marginTop: "auto", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                height: 6, width: 6, borderRadius: "50%", background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.5)",
              }} />
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                color: "#999", textTransform: "uppercase",
              }}>Mantle Network</span>
            </div>
            <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>v1.02.4 Security Verified</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Auth Button ───────────────────────────────────────────────────────────────

interface AuthButtonProps {
  onClick:  () => void;
  loading:  boolean;
  icon:     React.ReactNode;
  label:    string;
  sublabel: string;
  accent?:  boolean;
  disabled?: boolean;
}

function AuthButton({ onClick, loading, icon, label, sublabel, accent, disabled }: AuthButtonProps) {
  const isReallyDisabled = loading || disabled;
  return (
    <motion.button
      onClick={onClick}
      disabled={isReallyDisabled}
      whileHover={isReallyDisabled ? {} : { y: -2 }}
      whileTap={isReallyDisabled ? {} : { scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        textAlign: "left" as const,
        background: accent ? "rgba(0,0,0,0.03)" : "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        opacity: isReallyDisabled ? 0.4 : 1,
        cursor: isReallyDisabled ? "not-allowed" : "pointer",
        transition: "all 0.35s ease",
      }}
      onMouseEnter={(e) => {
        if (isReallyDisabled) return;
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.18)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <span style={{ flexShrink: 0, opacity: 0.8 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, color: "#0a0a0a",
          fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em",
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 11, color: "#aaa", marginTop: 2,
          fontFamily: "'Inter', sans-serif", letterSpacing: "0.02em",
        }}>
          {sublabel}
        </p>
      </div>
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
        style={{ color: "#ccc", flexShrink: 0 }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}
