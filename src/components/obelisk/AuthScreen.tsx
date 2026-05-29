/**
 * AuthScreen — Light-themed auth matching Agent Layer landing style
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { usePrivy, useWallets, useCreateWallet } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface AuthScreenProps {
  onAuthenticated: () => void;
}
export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { setAuthMethod, setWalletAddress, sessionToken, setSessionToken, setIsEmbeddedWallet } = useAuth();
  const { toast } = useToast();
  const [step,          setStep]           = useState<1 | 2>(() => {
    if (typeof window !== "undefined") {
      const approved = localStorage.getItem("obelisk_compliance_approved");
      if (approved === "true") {
        return 2;
      }
    }
    return 1;
  });
  const [walletLoading,  setWalletLoading]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [compliance, setCompliance] = useState({
    "non-us": false,
    "regulated": false,
    "terms": false,
  });

  const allChecked = Object.values(compliance).every(v => v);

  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // 1. Programmatically trigger embedded wallet creation if authenticated via social/email and no wallet exists
  useEffect(() => {
    if (authenticated && ready && !user?.wallet?.address && !walletLoading) {
      const initWallet = async () => {
        setWalletLoading(true);
        setAuthStatus("Generating unique secure wallet...");
        try {
          console.log("Programmatically creating embedded wallet for authenticated user...");
          await createWallet();
        } catch (err) {
          console.error("Wallet creation failed:", err);
          setError("Failed to generate secure embedded wallet. Please ensure that 'Enable embedded wallets' is toggled ON under the 'Embedded Wallets' configuration tab in your Privy Developer Dashboard (dashboard.privy.io).");
          await logout();
        } finally {
          setWalletLoading(false);
          setAuthStatus(null);
        }
      };
      initWallet();
    }
  }, [authenticated, ready, user?.wallet?.address, createWallet]);

  // 2. Timeout detector to catch misconfigured Privy Embedded Wallet connection issues
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authenticated && user?.wallet?.address && wallets.length === 0 && !walletLoading) {
      timer = setTimeout(() => {
        console.warn("Privy wallets initialization timed out. Checking configurations.");
        setError(
          "Wallet provider initialization is taking longer than expected. " +
          "Please verify that: 1. Embedded Wallets are enabled in your Privy Developer Dashboard under 'Embedded Wallets'. " +
          "2. The current origin is registered in your 'Allowed Origins' list in the Privy dashboard. " +
          "3. You have enabled the social provider (Google, Twitter, Apple, Discord) in the dashboard."
        );
        setAuthStatus(null);
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [authenticated, user?.wallet?.address, wallets.length, walletLoading]);

  // 3. Sync Privy login back to our signature auth challenge
  useEffect(() => {
    if (authenticated && user?.wallet?.address && !sessionToken && !walletLoading) {
      // Find the specific wallet matching the authenticated address
      const matchingWallet = wallets.find(w => w.address.toLowerCase() === user.wallet.address.toLowerCase()) || wallets[0];
      if (matchingWallet) {
        handleWalletConnected(user.wallet.address, matchingWallet);
      } else {
        setAuthStatus("Initializing secure wallet provider...");
      }
    }
  }, [authenticated, user, wallets, walletLoading, sessionToken]);

  const handleGasless = async () => {
    if (!ready) {
      toast({
        title: "Privy SDK is not ready",
        description: "Please check your browser console. Ensure that you have set VITE_PRIVY_APP_ID in your .env.local file and configured allowed origins in your Privy developer dashboard.",
        variant: "destructive"
      });
      return;
    }
    if (authenticated && user?.wallet?.address) {
      const matchingWallet = wallets.find(w => w.address.toLowerCase() === user.wallet.address.toLowerCase()) || wallets[0];
      if (matchingWallet) {
        handleWalletConnected(user.wallet.address, matchingWallet);
      } else {
        setAuthStatus("Initializing secure wallet provider...");
      }
    } else {
      login();
    }
  };

  // ── Antigravity Login Flow (Signature Required) ────────────────────────
  const handleWallet = () => {
    if (!ready) {
      toast({
        title: "Privy SDK is not ready",
        description: "Please check your browser console. Ensure that you have set VITE_PRIVY_APP_ID in your .env.local file and configured allowed origins in your Privy developer dashboard.",
        variant: "destructive"
      });
      return;
    }
    if (authenticated && user?.wallet?.address) {
      const matchingWallet = wallets.find(w => w.address.toLowerCase() === user.wallet.address.toLowerCase()) || wallets[0];
      if (matchingWallet) {
        handleWalletConnected(user.wallet.address, matchingWallet);
      } else {
        setAuthStatus("Initializing secure wallet provider...");
      }
    } else {
      login();
    }
  };

  const handleWalletConnected = async (address: string, customWallet?: any) => {
    const activeWallet = customWallet || wallets.find(w => w.address.toLowerCase() === address.toLowerCase()) || wallets[0];
    if (!activeWallet) {
      setError("No active wallet provider found.");
      return;
    }

    const isEmbedded = activeWallet?.walletClientType === "privy";
    setWalletLoading(true);
    setError(null);

    // ── Path A: Embedded wallet (Social / Email login via Privy) ───────────
    // Privy already authenticated the user via OAuth — no signature needed.
    if (isEmbedded) {
      try {
        setAuthStatus("Initializing your secure session...");
        // Generate a deterministic local session token — no backend round-trip needed
        const token = `privy_${btoa(address).replace(/=/g, "")}_${Date.now()}`;
        setWalletAddress(address);
        setSessionToken(token);
        setIsEmbeddedWallet(true);
        setAuthMethod("wallet");
        setAuthStatus(null);
        onAuthenticated();
      } catch (err: unknown) {
        setError("Failed to initialize embedded wallet session.");
        setAuthStatus(null);
        await logout();
      } finally {
        setWalletLoading(false);
      }
      return;
    }

    // ── Path B: External wallet (MetaMask / WalletConnect) ────────────────
    // Requires cryptographic signature to prove wallet ownership.
    setAuthStatus("Awaiting secure signature challenge...");
    try {
      const message = `Antigravity Protocol Login\n\nSession Duration: 5 Minutes\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      const ethProvider = await activeWallet.getEthereumProvider();
      const browserProvider = new BrowserProvider(ethProvider);
      const signer = await browserProvider.getSigner();
      const signature = await signer.signMessage(message);

      setAuthStatus("Issuing temporal session token...");

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
      setIsEmbeddedWallet(false);
      setAuthMethod("wallet");
      setAuthStatus(null);
      onAuthenticated();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Auth failed.";
      if (!msg.includes("rejected")) {
        setError(msg);
      } else {
        setError("Signature request rejected by user.");
      }
      setAuthStatus(null);
      // Log out of Privy on failure so user can try again
      await logout();
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
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("obelisk_compliance_approved", "true");
                    }
                    setStep(2);
                  }}
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

                {/* Loading Status or Auth Buttons */}
                {authenticated || authStatus ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 gap-6">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-[3px] border-black/5 border-t-black border-r-black"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-10 h-10 rounded-full border-[2px] border-black/5 border-b-[#2563eb] border-l-[#2563eb]"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-bold text-[#0a0a0a] font-display">
                        {authStatus || "Securing connection..."}
                      </p>
                      <p className="text-[11px] text-[#888] mt-1.5 font-display">
                        Please check your browser prompts or wallet for verification
                      </p>
                    </div>

                    <button 
                      onClick={async () => {
                        await logout();
                        setAuthStatus(null);
                        setError(null);
                      }}
                      className="mt-4 px-4 py-2 text-[11px] text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest font-bold rounded-lg border border-red-100"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Cancel & Reset
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Web3 & Social Login */}
                    <AuthButton
                      onClick={handleGasless}
                      loading={walletLoading}
                      label={walletLoading ? "Connecting..." : "Web3 & Social Login"}
                      sublabel="Email, Google, Twitter, Discord & External Wallets"
                    />

                    {/* Apple login unavailable notice */}
                    <p style={{
                      fontSize: 11,
                      color: "#ef4444",
                      fontFamily: "'Inter', sans-serif",
                      marginTop: 2,
                      marginBottom: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                      <span style={{ fontSize: 14 }}>⚠️</span> Apple login is currently unavailable.
                    </p>

                    <button 
                      onClick={() => setStep(1)}
                      className="mt-4 text-[11px] text-muted-foreground hover:text-black transition-colors uppercase tracking-widest font-bold"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ← Back to Terms
                    </button>
                  </div>
                )}
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
      {icon && <span style={{ flexShrink: 0, opacity: 0.8 }}>{icon}</span>}
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
