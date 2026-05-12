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
        <div className="glass-card rounded-[32px] p-8 border border-black/5 bg-white">
          <p className="text-[10px] uppercase text-primary/30 mb-3 font-black tracking-[0.25em]">Yield Source</p>
          <div className="text-[17px] font-black text-primary uppercase tracking-tightest">
            <MagneticText disabled text="USDY + mETH + WMNT" />
          </div>
          <p className="text-[12px] text-primary/50 mt-2 font-bold uppercase tracking-wide">Real-world assets, liquid staking, and native yields.</p>
        </div>
        
        <div className="glass-card rounded-[32px] p-8 border border-black/5 bg-white">
          <p className="text-[10px] uppercase text-primary/30 mb-3 font-black tracking-[0.25em]">Strategy</p>
          <div className="text-[17px] font-black text-primary uppercase tracking-tightest">
            <MagneticText disabled text="AI-Managed · Auto" />
          </div>
          <p className="text-[12px] text-primary/50 mt-2 font-bold uppercase tracking-wide">Continuous rebalancing based on regime detection.</p>
        </div>
        
        
        <div className="glass-card rounded-[32px] p-8 border border-black/5 bg-white">
          <p className="text-[10px] uppercase text-primary/30 mb-3 font-black tracking-[0.25em]">Lock-up</p>
          <div className="text-[17px] font-black text-primary uppercase tracking-tightest">
            <MagneticText disabled text="Zero · Instant" />
          </div>
          <p className="text-[12px] text-primary/50 mt-2 font-bold uppercase tracking-wide">No minimum terms. Withdraw your capital anytime.</p>
        </div>
      </div>

      {/* Supporting Cards */}
      <div className="col-span-12 grid grid-cols-1 gap-6 md:gap-8 mt-4">
        <StabilityScoreCard />
      </div>
    </motion.div>
  );
}
