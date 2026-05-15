import { motion } from "framer-motion";

export function RegimeMatrix() {
  const regimes = ["Expansion", "Consolidation", "Contraction"];
  
  return (
    <div className="space-y-6">
      <p className="text-[10px] uppercase text-zinc-500 font-mono tracking-[0.2em]">
        HMM Regime Transition Matrix
      </p>
      <div className="grid grid-cols-3 gap-[1px] bg-slate-200 border border-slate-200">
        {regimes.map((row, i) => (
          regimes.map((col, j) => {
            const isDiagonal = i === j;
            const probability = isDiagonal ? 0.92 : 0.04;
            return (
              <div 
                key={`${i}-${j}`}
                className={`p-4 flex flex-col items-center justify-center gap-2 transition-all ${isDiagonal ? "bg-zinc-900 text-white" : "bg-white text-zinc-500"}`}
              >
                <span className="text-[9px] uppercase font-mono tracking-widest opacity-60">
                  {row.slice(0, 3)} → {col.slice(0, 3)}
                </span>
                <span className="text-xl font-light font-mono">
                  {(probability * 100).toFixed(0)}%
                </span>
              </div>
            );
          })
        ))}
      </div>
      <p className="text-[10px] text-zinc-500 font-mono italic leading-relaxed text-center mt-4">
        "Current transition probability indicates 92% state-retention in {regimes[0]} regime."
      </p>
    </div>
  );
}
