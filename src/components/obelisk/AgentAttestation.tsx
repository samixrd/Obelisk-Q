import { useAgentData } from "@/hooks/useAgentData";
import { motion } from "framer-motion";

export function AgentAttestation({ signature, hash }: { signature: string; hash: string }) {
  const { zkMl } = useAgentData();

  const proofHex = zkMl?.last_zk_proof?.proof_hex || (typeof zkMl?.last_zk_proof === "string" ? zkMl.last_zk_proof : null);
  const displayProof = typeof proofHex === "string" && proofHex.startsWith("0x")
    ? `${proofHex.substring(0, 24)}...${proofHex.substring(proofHex.length - 12)}`
    : "Verified on-chain via ZKRegimeVerifier";

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-black/[0.03] rounded-2xl border border-black/[0.05] group/att">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase text-muted-foreground/40 font-bold tracking-widest">
          Agent ZK-ML Cryptographic Attestation
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">ZK-Verified</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-1 text-[10px] text-zinc-500 font-mono border-y border-black/[0.03]">
        <div>
          <span className="text-zinc-400">Verifier:</span> <span className="text-zinc-700 truncate block max-w-[150px]" title={zkMl?.verifier_address}>{zkMl?.verifier_address || "0xNotSet"}</span>
        </div>
        <div>
          <span className="text-zinc-400">Signature:</span> <span className="text-zinc-700 block truncate max-w-[150px]" title={signature}>{signature}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-[9.5px] text-zinc-500 font-mono truncate max-w-[280px]">
          PROOF: {displayProof}
        </span>
        <a 
          href={`https://explorer.mantle.xyz/tx/${hash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] text-[#0a0a0a] bg-white border border-black/[0.08] hover:bg-[#fafafa] font-bold px-3 py-1.5 rounded-full shadow-sm transition-all"
        >
          VIEW TX
        </a>
      </div>
    </div>
  );
}
