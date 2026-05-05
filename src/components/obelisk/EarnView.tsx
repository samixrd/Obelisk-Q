import { motion } from "framer-motion";
import { VaultCard } from "./dashboard/VaultCard";
import { StabilityScoreCard } from "./StabilityScoreCard";
import { YieldEstimator } from "./YieldEstimator";
import { ManagedAssets } from "./ManagedAssets";
import { useStability } from "./StabilityContext";
import { MagneticText } from "./MagneticText";

interface EarnViewProps {
  onOpenInvest: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export function EarnView({ onOpenInvest }: EarnViewProps) {
  const { score, engineLoading } = useStability();

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6 md:gap-8">
      {/* Primary Vault Interaction */}
      <VaultCard onOpenInvest={onOpenInvest} />

      {/* Strategy & Metadata Grid */}
      <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 content-start">
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Yield Source</p>
          <div className="text-[17px] font-semibold text-[#0a0a0a]">
            <MagneticText text="USDY + mETH Blend" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">Diversified real-world assets and liquid staking tokens.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Strategy</p>
          <div className="text-[17px] font-semibold text-[#0a0a0a]">
            <MagneticText text="AI-Managed · Auto" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">Continuous rebalancing based on regime detection.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Q-Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[32px] font-bold text-[#0a0a0a]">{engineLoading ? "—" : score}</p>
            <p className="text-[14px] text-muted-foreground">/ 100</p>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">Institutional stability rating.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 transition-all hover:bg-white/80">
          <p className="text-[10px] uppercase text-muted-foreground mb-3 font-semibold tracking-[0.2em]" style={{ letterSpacing: "0.28em" }}>Lock-up</p>
          <div className="text-[17px] font-semibold text-[#0a0a0a]">
            <MagneticText text="Zero · Instant" />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">No minimum terms. Withdraw your capital anytime.</p>
        </div>
      </div>

      {/* Supporting Cards */}
      <div className="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-4">
        <StabilityScoreCard />
        <YieldEstimator />
        <ManagedAssets />
      </div>
    </motion.div>
  );
}
