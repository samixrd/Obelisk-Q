/**
 * AuthScreen — Light-themed auth matching Agent Layer landing style
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { Logo } from "./Logo";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface AuthScreenProps {
  onAuthenticated: (method: "google" | "wallet") => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { setAuthMethod, setWalletAddress } = useAuth();
  const [googleLoading,  setGoogleLoading]  = useState(false);
  const [walletLoading,  setWalletLoading]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // Compliance checkboxes — all must be checked to proceed
  const [checkUS,    setCheckUS]    = useState(false);
  const [checkReg,   setCheckReg]   = useState(false);
  const [checkTOS,   setCheckTOS]   = useState(false);
  const allChecked = checkUS && checkReg && checkTOS;

  // ── Real Google sign-in via Firebase ──────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setAuthMethod("google");
      onAuthenticated("google");
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Google sign-in failed.";
      if (!msg.includes("popup-closed")) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── MetaMask wallet connect ────────────────────────────────────────────
  const handleWallet = async () => {
    const eth = (window as Window & { ethereum?: Record<string,unknown> }).ethereum;
    if (!eth) {
      setError("MetaMask not found. Please install it.");
      return;
    }
    setWalletLoading(true);
    setError(null);
    try {
      const accounts = await (eth.request as Function)({
        method: "eth_requestAccounts",
      }) as string[];

      if (!accounts[0]) throw new Error("No account returned.");

      // Switch to Mantle Sepolia
      try {
        await (eth.request as Function)({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x138B" }],
        });
      } catch {
        await (eth.request as Function)({
          method: "wallet_addEthereumChain",
          params: [{
            chainId:          "0x138B",
            chainName:        "Mantle Sepolia Testnet",
            nativeCurrency:   { name: "MNT", symbol: "MNT", decimals: 18 },
            rpcUrls:          ["https://rpc.sepolia.mantle.xyz"],
            blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
          }],
        });
      }

      setWalletAddress(accounts[0]);
      setAuthMethod("wallet");
      onAuthenticated("wallet");
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Wallet connection failed.";
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
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px] mx-6"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
          borderRadius: "16px",
        }}
      >
        <div className="p-10">
          <Logo size={64} className="mx-auto mb-10 text-foreground" />
          {/* Identity badge */}
          <motion.div className="flex items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}>
            <span style={{
              fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em",
              color: "#999", fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
            }}>Mantle Network</span>
            <div style={{ height: 12, width: 1, background: "rgba(0,0,0,0.12)" }} />
            <span style={{
              fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em",
              color: "#999", fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
            }}>ERC-8004</span>
          </motion.div>

          {/* Greeting */}
          <motion.div className="mb-10"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <h2 style={{
              fontSize: 38, lineHeight: 1.1, letterSpacing: "-0.03em",
              color: "#0a0a0a", fontWeight: 700, fontFamily: "'Inter', sans-serif",
            }}>
              Welcome
              <br />
              <span style={{ fontWeight: 400, color: "#888" }}>back.</span>
            </h2>
            <p style={{
              marginTop: 16, fontSize: 14, color: "#888",
              fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", lineHeight: 1.6,
            }}>
              Your private investment intelligence is ready.
            </p>
          </motion.div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 28 }} />

          {/* Compliance checkboxes */}
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <p style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" as const,
              color: "#aaa", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14,
            }}>
              Compliance Confirmation
            </p>
            {[
              { id: "us", checked: checkUS, set: setCheckUS, label: "I confirm I am not a US person or entity" },
              { id: "reg", checked: checkReg, set: setCheckReg, label: "I understand USDY is a regulated financial instrument subject to transfer restrictions" },
              { id: "tos", checked: checkTOS, set: setCheckTOS, label: "I accept the Terms of Service and Risk Disclosure" },
            ].map((item) => (
              <label
                key={item.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  marginBottom: 10, padding: "8px 10px", borderRadius: 8,
                  background: item.checked ? "rgba(34,197,94,0.04)" : "transparent",
                  border: `1px solid ${item.checked ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.06)"}`,
                  transition: "all 0.3s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => item.set(!item.checked)}
                  style={{ display: "none" }}
                />
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: item.checked ? "#0a0a0a" : "#fff",
                  border: `1.5px solid ${item.checked ? "#0a0a0a" : "rgba(0,0,0,0.18)"}`,
                  transition: "all 0.25s ease",
                }}>
                  {item.checked && (
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{
                  fontSize: 12, color: item.checked ? "#333" : "#888",
                  fontFamily: "'Inter', sans-serif", lineHeight: 1.5, letterSpacing: "-0.01em",
                  transition: "color 0.25s ease",
                }}>
                  {item.label}
                </span>
              </label>
            ))}
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                marginBottom: 16, padding: "12px 16px", fontSize: 12, lineHeight: 1.5,
                background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.15)",
                borderRadius: 10, color: "#d44", fontFamily: "'Inter', sans-serif",
              }}>
              {error}
            </motion.div>
          )}

          {/* Auth buttons */}
          <motion.div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: allChecked ? 1 : 0.45, pointerEvents: allChecked ? "auto" : "none", transition: "opacity 0.4s ease" }}
            initial={{ opacity: 0 }} animate={{ opacity: allChecked ? 1 : 0.45 }}
            transition={{ duration: 0.8, delay: 0.6 }}>

            {/* Google */}
            <AuthButton
              onClick={handleGoogle}
              loading={googleLoading}
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
              label={googleLoading ? "Signing in..." : "Sign in with Google"}
              sublabel="OAuth 2.0 · Encrypted session"
            />

            {/* Wallet */}
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
              label={walletLoading ? "Connecting..." : "Connect Wallet"}
              sublabel="MetaMask · Mantle Sepolia"
              accent
            />
          </motion.div>

          {/* Footer */}
          <motion.div style={{
            marginTop: 32, paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
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
                fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
                color: "#999", textTransform: "uppercase",
              }}>Mantle Network</span>
            </div>
            <span style={{ fontSize: 11, color: "#bbb" }}>Non-custodial</span>
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
}

function AuthButton({ onClick, loading, icon, label, sublabel, accent }: AuthButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={loading ? {} : { y: -2 }}
      whileTap={loading ? {} : { scale: 0.99 }}
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
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.35s ease",
      }}
      onMouseEnter={(e) => {
        if (loading) return;
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
