import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MagneticText } from "./MagneticText";

interface PreferencesViewProps {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

export function PreferencesView({ walletAddress, onConnectWallet }: PreferencesViewProps) {
  const [notifications, setNotifications] = useState(true);
  const [autoRebalance, setAutoRebalance] = useState(true);
  const { displayName, avatarUrl } = useAuth();

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-8 pb-24">
      
      {/* ── Settings Sections ── */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        
        {/* Identity & Wallet */}
        <div className="glass-card rounded-[40px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
          <p className="text-[10px] uppercase text-black/20 mb-10 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <MagneticText disabled text="Identity & Infrastructure" />
          </p>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <p className="text-xl text-black font-bold mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>Connected wallet</p>
                <p className="text-[13px] text-black/40 font-medium leading-relaxed">The primary settlement address for your autonomous agent.</p>
              </div>
              {walletAddress ? (
                <div className="px-6 py-3 bg-black/[0.03] border border-black/[0.04] rounded-2xl">
                  <span className="text-[13px] tabular-nums text-black/60" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{walletAddress}</span>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConnectWallet} 
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg shadow-black/10 transition-all"
                >
                  Connect Wallet
                </motion.button>
              )}
            </div>
 
            <div className="h-px bg-black/[0.03]" />
 
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <p className="text-xl text-black font-bold mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>Network node</p>
                <p className="text-[13px] text-black/40 font-medium leading-relaxed">Current gateway for on-chain execution and data retrieval.</p>
              </div>
              <div className="flex items-center gap-4 px-6 py-3 bg-black/[0.03] border border-black/[0.04] rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>Mantle RPC (Mainnet)</span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Agent Behaviors */}
        <div className="glass-card rounded-[40px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
          <p className="text-[10px] uppercase text-black/20 mb-10 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <MagneticText disabled text="Automation Logic" />
          </p>
          
          <div className="space-y-12">
            <Toggle 
              label="Autonomous Rebalancing" 
              desc="Allow the agent to rebalance positions automatically when scores drift outside thresholds." 
              enabled={autoRebalance} 
              onToggle={() => setAutoRebalance(!autoRebalance)} 
            />
            <Toggle 
              label="Real-time Notifications" 
              desc="Receive push updates for critical safeguard triggers and execution completions." 
              enabled={notifications} 
              onToggle={() => setNotifications(!notifications)} 
            />
          </div>
        </div>
      </div>
 
      {/* ── Sidebar Info ── */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        <div className="glass-card rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl">
          <p className="text-[10px] uppercase text-black/20 mb-8 font-bold tracking-[0.28em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <MagneticText disabled text="Agent Profile" />
          </p>
          <div className="flex items-center gap-6 mb-10">
            <div className="h-16 w-16 rounded-[24px] bg-black/5 border border-black/[0.04] flex items-center justify-center relative overflow-hidden text-xl font-bold text-black/20 shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-xl text-black font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{displayName}</p>
              <p className="text-[11px] text-black/30 font-bold uppercase tracking-widest mt-1">Standard Tier Agent</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center py-4 border-t border-black/[0.03]">
              <span className="text-[11px] text-black/20 font-bold uppercase tracking-widest">Subscription</span>
              <span className="text-[13px] font-bold text-black/60">Active · Lifetime</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-black/[0.03]">
              <span className="text-[11px] text-black/20 font-bold uppercase tracking-widest">Data Retention</span>
              <span className="text-[13px] font-bold text-black/60">90 Days</span>
            </div>
          </div>
        </div>

        <div className="p-10 bg-black/[0.02] border border-black/[0.04] rounded-[40px]">
          <p className="text-[11px] text-black font-bold mb-4 uppercase tracking-[0.2em] opacity-30" style={{ fontFamily: "'Inter', sans-serif" }}>Security Note</p>
          <p className="text-[13px] text-black/50 font-medium leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            All configuration changes are signed locally and broadcast via the ERC-8004 protocol. Obelisk Q never stores your private keys.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Toggle({ label, desc, enabled, onToggle }: { label: string, desc: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-start justify-between gap-8 group">
      <div className="flex-1">
        <p className="text-xl text-black font-bold mb-2 transition-colors group-hover:text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>{label}</p>
        <p className="text-[13px] text-black/40 font-medium leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-all duration-500 flex-shrink-0 shadow-inner ${enabled ? 'bg-black' : 'bg-black/5'}`}
      >
        <motion.div 
          animate={{ x: enabled ? 24 : 4 }}
          className="absolute top-1 left-0 h-5 w-5 bg-white rounded-full shadow-lg"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </button>
    </div>
  );
}

