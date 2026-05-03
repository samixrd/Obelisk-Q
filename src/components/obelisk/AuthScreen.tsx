/**
 * AuthScreen — real Firebase Google auth + MetaMask wallet connect
 */
import { motion } from "framer-motion";
import { useState } from "react";
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
      style={{ background: "#000000" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(220 50% 8% / 0.5), transparent 80%)" }} />

      {/* Fine grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat", backgroundSize: "180px 180px", mixBlendMode: "overlay",
        }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px] mx-6"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 100%), rgba(8,8,10,0.7)",
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 50px 100px -30px rgba(0,0,0,0.95)",
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-6 right-6 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

        <div className="p-10">
          {/* Identity badge — centred */}
          <motion.div className="flex items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}>
            <span className="text-[9px] uppercase tracking-[0.38em] text-white/30"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mantle Network</span>
            <div className="h-3 w-px bg-white/15" />
            <span className="text-[9px] uppercase tracking-[0.38em] text-white/30"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>ERC-8004</span>
          </motion.div>

          {/* Greeting */}
          <motion.div className="mb-10"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-[34px] leading-tight tracking-[-0.03em] text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}>
              Welcome
              <br />
              <span className="italic text-white/60" style={{ fontWeight: 300 }}>back.</span>
            </h2>
            <p className="mt-4 text-[11px] text-white/35 leading-relaxed"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}>
              Your private investment intelligence is ready.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="h-px mb-8"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }} />

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-5 px-4 py-3 text-[10px] leading-relaxed"
              style={{ background: "rgba(255,60,60,0.06)", border: "0.5px solid rgba(255,60,60,0.22)",
                fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 70% 70%)" }}>
              {error}
            </motion.div>
          )}

          {/* Auth buttons */}
          <motion.div className="space-y-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}>

            {/* Google */}
            <AuthButton
              onClick={handleGoogle}
              loading={googleLoading}
              icon={
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
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
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
                  <path d="M2 10h20" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
                  <circle cx="17" cy="15" r="1.5" fill="rgba(255,255,255,0.6)"/>
                  <path d="M16 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
                </svg>
              }
              label={walletLoading ? "Connecting..." : "Connect Wallet"}
              sublabel="MetaMask · Mantle Sepolia"
              accent
            />
          </motion.div>

          {/* Footer */}
          <motion.div className="mt-10 pt-6 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full"
                style={{ background: "hsl(104 100% 68%)", boxShadow: "0 0 6px hsl(104 100% 68% / 0.7)" }} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/30"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mantle Network</span>
            </div>
            <span className="text-[9px] text-white/20"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>Non-custodial</span>
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
      className="group w-full flex items-center gap-4 px-5 py-4 text-left"
      style={{
        background: accent
          ? "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))"
          : "rgba(255,255,255,0.02)",
        border: "0.5px solid rgba(255,255,255,0.10)",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.5s ease",
      }}
      onMouseEnter={(e) => {
        if (loading) return;
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
        (e.currentTarget as HTMLElement).style.background = accent
          ? "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))"
          : "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.10)";
        (e.currentTarget as HTMLElement).style.background = accent
          ? "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))"
          : "rgba(255,255,255,0.02)";
      }}
    >
      <span className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white/85 group-hover:text-white transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
          {label}
        </p>
        <p className="text-[9px] text-white/28 mt-0.5"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
          {sublabel}
        </p>
      </div>
      <svg viewBox="0 0 16 16" width="10" height="10" fill="none"
        className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}
