import { motion } from "framer-motion";

export function AgentAttestation({ signature, hash }: { signature: string; hash: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-black/[0.03] rounded-2xl border border-black/[0.05] group/att">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-widest">
          Agent Attestation
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Verified</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] text-black font-mono truncate opacity-60">
          SIG: {signature}
        </span>
        <a 
          href={`https://explorer.mantle.xyz/tx/${hash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] text-primary font-bold hover:underline"
        >
          VIEW PROOF
        </a>
      </div>
    </div>
  );
}
