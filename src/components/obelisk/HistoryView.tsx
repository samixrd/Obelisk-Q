import { motion } from "framer-motion";
import { useVault } from "@/hooks/useVault";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

export function HistoryView() {
  const { txHistory, explorerUrl } = useVault();

  return (
    <motion.div {...fadeUp} className="pb-24">
      <div className="glass-card rounded-[40px] p-10 transition-all hover:bg-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
        <div className="text-[24px] text-black font-bold mb-10 flex items-baseline gap-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Recent <span className="font-light text-[#9CA3AF]">Transactions</span>
        </div>
        
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-12 mb-6 px-4 text-[10px] uppercase text-[#9CA3AF] font-bold tracking-[0.2em]">
              <div className="col-span-3">Action</div>
              <div className="col-span-3">Amount</div>
              <div className="col-span-3">Time</div>
              <div className="col-span-3 text-right">Receipt</div>
            </div>
            {txHistory.map((tx, i) => (
              <div key={tx.hash + i} className="grid grid-cols-12 items-center py-5 px-4 border-t border-black/[0.03] hover:bg-black/[0.01] transition-all rounded-2xl group">
                <div className="col-span-3 flex items-center gap-4">
                  <div className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Confirmed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-[15px] text-black font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{tx.type}</span>
                </div>
                <div className="col-span-3 text-[15px] text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>{tx.amount}</div>
                <div className="col-span-3 text-[13px] text-[#6B7280] tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="col-span-3 flex justify-end">
                  <a 
                    href={explorerUrl(tx.hash)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] uppercase text-[#9CA3AF] group-hover:text-black transition-colors font-bold tracking-[0.1em]"
                  >
                    Details ↗
                  </a>
                </div>
              </div>
            ))}

            {txHistory.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                <p className="text-[11px] uppercase text-black font-bold tracking-[0.3em]">No Transactions Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
