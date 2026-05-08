import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { IconArrowUpRight } from "./LineIcons";

interface Transaction {
  tx_hash: string;
  action: string;
  score: number;
  regime: string;
  timestamp: string;
  status: string;
  vault_address: string;
  cycle_number: number;
}

export function AgentTransactions() {
  const { sessionToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/agent/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
        setErrorMsg(null);
      } else {
        setErrorMsg(`HTTP Error: ${res.status} from ${API_BASE}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      const API_BASE = (import.meta as any).env?.VITE_SCORING_API_URL ?? "http://localhost:8000";
      setErrorMsg(`Fetch failed to ${API_BASE}. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-400/10 text-emerald-500 border-emerald-500/20";
      case "failed":
        return "bg-rose-400/10 text-rose-500 border-rose-500/20";
      case "pending":
        return "bg-amber-400/10 text-amber-500 border-amber-500/20";
      case "hold":
      case "simulation":
        return "bg-slate-400/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-black/5 text-black/40 border-black/10";
    }
  };

  const formatHash = (hash: string) => {
    if (hash === "N/A") return "N/A";
    if (hash.startsWith("SIM_")) return "SIMULATED";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="col-span-12 glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] mt-8">
      <div className="flex items-center justify-between mb-10">
        <div className="text-[24px] text-black font-bold flex items-baseline gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Agent <span className="font-light text-[#9CA3AF]">Transactions</span>
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
            <div className="col-span-1">Action</div>
            <div className="col-span-1 text-center">Score</div>
            <div className="col-span-2">Regime</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2">Vault</div>
            <div className="col-span-2 text-right">TX Hash</div>
          </div>

          <div className="space-y-1">
            {errorMsg ? (
              <div className="py-20 text-center text-[12px] uppercase text-rose-500 font-bold tracking-widest">{errorMsg}</div>
            ) : loading && transactions.length === 0 ? (
              <div className="py-20 text-center text-[12px] uppercase text-black/20 tracking-widest">Initializing Feed...</div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center text-[12px] uppercase text-black/20 tracking-widest">No Transactions Recorded</div>
            ) : (
              transactions.map((tx, i) => (
                <motion.div
                  key={`${tx.cycle_number}-${tx.timestamp}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  className="grid grid-cols-12 items-center py-5 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-all rounded-2xl group"
                >
                  <div className="col-span-1">
                    <span className="text-[13px] font-medium text-black/40 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      #{tx.cycle_number}
                    </span>
                  </div>
                  <div className="col-span-2 text-[13px] text-black/60 font-medium">
                    {new Date(tx.timestamp).toLocaleTimeString("en-GB", { hour12: false })}
                  </div>
                  <div className="col-span-1">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${tx.action === 'HOLD' ? 'bg-black/5 text-black/40' : 'bg-black/10 text-black'}`}>
                      {tx.action}
                    </span>
                  </div>
                  <div className="col-span-1 text-center text-[14px] font-bold text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {tx.score}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[13px] text-black/60 font-medium">{tx.regime}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${getStatusStyle(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-[12px] text-black/40 font-medium tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatAddress(tx.vault_address)}
                  </div>
                  <div className="col-span-2 text-right">
                    {tx.tx_hash !== "N/A" && !tx.tx_hash.startsWith("SIM_") ? (
                      <a
                        href={`https://explorer.mantle.xyz/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] text-emerald-500 font-bold hover:underline"
                      >
                        {formatHash(tx.tx_hash)}
                        <IconArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span className="text-[12px] text-black/20 font-bold tracking-widest uppercase">
                        {formatHash(tx.tx_hash)}
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
