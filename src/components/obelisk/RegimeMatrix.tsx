import { motion } from "framer-motion";

export function RegimeMatrix() {
  const regimes = ["Expansion", "Consolidation", "Contraction"];
  
  return (
    <div className="space-y-6">
      <p className="text-[11px] uppercase text-muted-foreground/30 font-bold tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
        HMM Regime Transition Matrix (Simulated)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {regimes.map((row, i) => (
          regimes.map((col, j) => {
            const isDiagonal = i === j;
            const probability = isDiagonal ? 0.92 : 0.04;
            return (
              <div 
                key={`${i}-${j}`}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${isDiagonal ? "bg-[#1a1a1a] text-white/90 border-[#1a1a1a]" : "bg-black/[0.02] border-black/[0.05]"}`}
              >
                <span className="text-[8px] uppercase font-bold tracking-tighter opacity-40">
                  {row.slice(0, 3)} → {col.slice(0, 3)}
                </span>
                <span className="text-sm font-mono font-bold">
                  {(probability * 100).toFixed(0)}%
                </span>
              </div>
            );
          })
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/40 font-medium italic leading-relaxed text-center">
        "Current transition probability indicates 92% state-retention in {regimes[0]} regime."
      </p>
    </div>
  );
}
