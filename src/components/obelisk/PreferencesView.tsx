import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface PreferencesViewProps {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
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
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6">
      
      {/* Settings Sections */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* Identity & Wallet */}
        <div className="glass-card rounded-2xl p-6 md:p-10">
          <p className="text-[10px] uppercase text-muted-foreground mb-8" style={{ letterSpacing: "0.28em" }}>
            Identity & Infrastructure
          </p>
          
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xl text-foreground font-medium mb-1"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>Connected wallet</p>
                <p className="text-sm text-muted-foreground">The primary settlement address for your autonomous agent.</p>
              </div>
              {walletAddress ? (
                <div className="px-4 py-2 bg-foreground/5 border border-foreground/5 rounded-xl">
                  <span className="text-xs font-mono text-foreground/70">{walletAddress}</span>
                </div>
              ) : (
                <button onClick={onConnectWallet} className="px-6 py-2.5 bg-foreground text-background text-xs font-medium rounded-full hover:bg-foreground/80 transition-all">
                  Connect Wallet
                </button>
              )}
            </div>
 
            <div className="hairline" />
 
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xl text-foreground font-medium mb-1"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>Network node</p>
                <p className="text-sm text-muted-foreground">Current gateway for on-chain execution and data retrieval.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                <span className="text-xs font-mono text-foreground/60">Mantle RPC (Mainnet)</span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Agent Behaviors */}
        <div className="glass-card rounded-2xl p-6 md:p-10">
          <p className="text-[10px] uppercase text-muted-foreground mb-8" style={{ letterSpacing: "0.28em" }}>
            Automation Logic
          </p>
          
          <div className="space-y-8">
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
 
      {/* Sidebar Info */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <p className="text-[10px] uppercase text-muted-foreground mb-6" style={{ letterSpacing: "0.28em" }}>
            Agent Profile
          </p>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center relative overflow-hidden text-lg font-medium text-foreground/60">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-base text-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{displayName}</p>
              <p className="text-xs text-muted-foreground">Standard Tier Agent</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subscription</span>
              <span className="text-foreground">Active · Lifetime</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Data Retention</span>
              <span className="text-foreground">90 Days</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 bg-foreground/[0.02] border-foreground/10">
          <p className="text-[11px] text-foreground font-medium mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Security Note</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All configuration changes are signed locally and broadcast via the ERC-8004 protocol. Obelisk Q never stores your private keys.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Toggle({ label, desc, enabled, onToggle }: { label: string, desc: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-base text-foreground font-medium mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 flex-shrink-0 ${enabled ? 'bg-foreground' : 'bg-foreground/10'}`}
      >
        <motion.div 
          animate={{ x: enabled ? 22 : 4 }}
          className="absolute top-1 left-0 h-4 w-4 bg-white rounded-full shadow-sm"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </button>
    </div>
  );
}
