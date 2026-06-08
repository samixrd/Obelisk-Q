import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { IconArrowUpRight } from "./LineIcons";

interface ZKProofTx {
  cycle: number;
  timestamp: string;
  fear_greed: number;
  mnt_change: number;
  prev_vol: number;
  out_vol: number;
  out_risk_score: number;
  out_regime: number;
  proof: string;
  tx_hash: string;
  status: string;
}

export function AgentZKProofs() {
  const { sessionToken } = useAuth();
  const [proofs, setProofs] = useState<ZKProofTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProofs = async () => {
    try {
      const res = await fetch("/api/agent/zk-proofs");
      if (res.ok) {
        const data = await res.json();
        // Filter out N/A or empty hashes
        const realProofs = data.filter((p: ZKProofTx) => 
          p.tx_hash && 
          p.tx_hash !== "N/A" && 
          !p.tx_hash.startsWith("SIM_")
        );
        setProofs(realProofs);
        setErrorMsg(null);
      } else {
        setErrorMsg(`HTTP Error: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch ZK proofs:", err);
      setErrorMsg(`Fetch failed. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
    const interval = setInterval(fetchProofs, 60000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-400/10 text-emerald-500 border-emerald-500/20";
      case "fallback":
        return "bg-amber-400/10 text-amber-500 border-amber-500/20";
      case "failed":
        return "bg-rose-400/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-black/5 text-black/40 border-black/10";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "ZK Verified";
      case "fallback":
        return "Fallback Sync";
      case "failed":
        return "Failed";
      default:
        return status.toUpperCase();
    }
  };

  const formatHash = (hash: string) => {
    if (!hash || hash === "N/A") return "N/A";
    if (hash.startsWith("FAILED_")) return "FAILED";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getRegimeName = (regimeNum: number) => {
    switch (regimeNum) {
      case 0:
        return "Expansion (Low Vol)";
      case 1:
        return "Transition (Normal)";
      case 2:
        return "Contraction (High Vol)";
      default:
        return `Regime #${regimeNum}`;
    }
  };

  return (
    <div className="col-span-12 glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] mt-8">
      <div className="flex items-center justify-between mb-10">
        <div className="text-[24px] text-black font-bold flex items-baseline gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Agent ZK <span className="font-light text-[#9CA3AF]">Regime Proofs</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hidden">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-12 mb-6 px-4 text-[10px] uppercase text-[#9CA3AF] font-bold tracking-[0.2em]">
            <div className="col-span-1">Cycle</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-3">ZK Inputs (F&G | MNT Change | Prev Vol)</div>
            <div className="col-span-2">ZK Outputs (Vol | Score)</div>
            <div className="col-span-2">Assigned Regime</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-right">Proof Tx</div>
          </div>

          <div className="space-y-1">
            {errorMsg ? (
              <div className="py-20 text-center text-[12px] uppercase text-rose-500 font-bold tracking-widest">{errorMsg}</div>
            ) : loading && proofs.length === 0 ? (
              <div className="py-20 text-center text-[12px] uppercase text-black/20 tracking-widest">Initializing Feed...</div>
            ) : proofs.length === 0 ? (
              <div className="py-20 text-center text-[12px] uppercase text-black/20 tracking-widest text-center">No proofs verified yet</div>
            ) : (
              proofs.map((p, i) => (
                <motion.div
                  key={`${p.cycle}-${p.timestamp}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  className="grid grid-cols-12 items-center py-5 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-all rounded-2xl group lift-on-hover"
                >
                  <div className="col-span-1">
                    <span className="text-[13px] font-medium text-black/40 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      #{p.cycle}
                    </span>
                  </div>
                  <div className="col-span-2 text-[13px] text-black/60 font-medium">
                    {new Date(p.timestamp).toLocaleTimeString("en-GB", { hour12: false })}
                  </div>
                  <div className="col-span-3 text-[12px] text-black/60 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    F&G: {p.fear_greed} | MNT: {p.mnt_change > 0 ? "+" : ""}{p.mnt_change.toFixed(2)}% | V: {p.prev_vol.toFixed(3)}
                  </div>
                  <div className="col-span-2 text-[12px] text-black/60 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Vol: {p.out_vol.toFixed(3)} | S: {p.out_risk_score}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[13px] text-black/60 font-medium">{getRegimeName(p.out_regime)}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border whitespace-nowrap ${getStatusStyle(p.status)}`}>
                      {getStatusText(p.status)}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    {p.tx_hash && p.tx_hash !== "N/A" && !p.tx_hash.startsWith("FAILED_") ? (
                      <a
                        href={`https://explorer.mantle.xyz/tx/${p.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] text-emerald-500 font-bold hover:underline"
                      >
                        {formatHash(p.tx_hash)}
                        <IconArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="text-[12px] text-black/20 font-bold tracking-widest uppercase">
                        {formatHash(p.tx_hash)}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
