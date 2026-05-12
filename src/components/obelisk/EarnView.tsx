import { motion } from "framer-motion";
import { VaultCard } from "./dashboard/VaultCard";
import { StabilityScoreCard } from "./StabilityScoreCard";

import { useStability } from "./StabilityContext";
import { MagneticText } from "./MagneticText";

interface EarnViewProps {
  onOpenInvest: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function EarnView({ onOpenInvest }: EarnViewProps) {
  const { score, engineLoading } = useStability();

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 md:gap-8">
      {/* Primary Vault Interaction */}
      <VaultCard onOpenInvest={onOpenInvest} />

      {/* Strategy & Metadata Grid */}
      <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 content-start">
        <StabilityScoreCard />

        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Yield Source</p>
            <div className="text-[17px] font-semibold text-[#0a0a0a]">
              <MagneticText disabled text="USDY + mETH + WMNT" />
            </div>
            <p className="text-[12px] text-muted-foreground mt-2">Diversified real-world assets, liquid staking, and stable native yields.</p>
          </div>

          <div className="mt-8 pt-8 border-t border-black/[0.03] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
                <span className="text-[11px] font-bold text-black/60 uppercase tracking-wider">USDY</span>
              </div>
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">RWA Yield</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D395]" />
                <span className="text-[11px] font-bold text-black/60 uppercase tracking-wider">mETH</span>
              </div>
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">LST Staking</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
                <span className="text-[11px] font-bold text-black/60 uppercase tracking-wider">WMNT</span>
              </div>
              <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Native Yield</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Strategy</p>
          <div className="text-[17px] font-semibold text-[#0a0a0a]">
            <MagneticText disabled text="AI-Managed · Auto" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">Continuous rebalancing based on regime detection.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Lock-up</p>
          <div className="text-[17px] font-semibold text-[#0a0a0a]">
            <MagneticText disabled text="Zero · Instant" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">No minimum terms. Withdraw your capital anytime.</p>
        </div>
      </div>
    </motion.div>
  );
}
