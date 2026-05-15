import { motion } from "framer-motion";
import { useAgentData } from "@/hooks/useAgentData";
import { useVault } from "@/hooks/useVault";
import { MagneticText } from "./MagneticText";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

const ASSET_DETAILS = [
  {
    symbol: "USDY",
    name: "Ondo USD Yield",
    issuer: "Ondo Finance",
    standard: "ERC-20",
    backing: "US Treasuries / Bank Deposits",
    chain: "Mantle Network",
    address: "0x8D6857216076fb05316B3C068694086E6689799c",
    allocation_rule: "Score < 60 → Default Reserve"
  },
  {
    symbol: "mETH",
    name: "Mantle Staked ETH",
    issuer: "Mantle LSP",
    standard: "ERC-20",
    backing: "Staked ETH (Beacon Chain)",
    chain: "Mantle Network",
    address: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
    allocation_rule: "Score ≥ 80 → Targeted Growth"
  },
  {
    symbol: "M-GAME",
    name: "Mantle Game-Fi Index",
    issuer: "Animoca Partner Swarm",
    standard: "ERC-20 (Basket)",
    backing: "Metaverse Land / Gaming Rewards",
    chain: "Mantle Network",
    address: "0x5698E89Ec2396e02679ddde33c2BA78de88F7fce",
    allocation_rule: "Expansion → Max Yield Extraction"
  }
];

export function AssetsView() {
  const { livePrices, liveYields } = useAgentData();
  const { vaultStats } = useVault();

  return (
    <motion.div {...fadeUp} className="space-y-12 pb-24">
      
      {/* ── Sector Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="region" aria-label="Sector Overview">
        {ASSET_DETAILS.map((asset, i) => {
          const isUSDY = asset.symbol === "USDY";
          const isGame = asset.symbol === "M-GAME";
          const price = isGame ? 4.25 : (isUSDY ? livePrices.usdy : livePrices.meth);
          const apy = isGame ? 12.5 : (isUSDY ? liveYields.usdy : liveYields.meth);

          return (
            <motion.div 
              key={asset.symbol}
              whileHover={{ y: -4 }}
              className="glass-card rounded-[48px] overflow-hidden flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl"
              aria-labelledby={`asset-title-${asset.symbol}`}
            >
              <div className="p-10 md:p-12 flex-1">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className={`h-14 w-14 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isUSDY ? "bg-blue-500/10 text-blue-600" : (isGame ? "bg-emerald-500/10 text-emerald-600" : "bg-purple-500/10 text-purple-600")}`} aria-hidden="true">
                      <span className="font-bold text-xl">{asset.symbol[0]}</span>
                    </div>
                    <div>
                      <h3 id={`asset-title-${asset.symbol}`} className="text-3xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
                        <MagneticText disabled text={asset.name} />
                      </h3>
                      <p className="text-[11px] text-black/20 font-bold uppercase tracking-[0.24em]" style={{ fontFamily: "'Inter', sans-serif" }}>{asset.issuer} · {asset.chain}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="inline-flex items-center gap-2.5 px-5 py-1.5 bg-black/[0.03] border border-black/[0.04] rounded-full" aria-label="Live Status">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                      <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Live</span>
                    </div>
                    <div className="text-2xl text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }} aria-label="Current Price">
                      <MagneticText disabled text={isUSDY ? `$${price.toFixed(2)}` : `$${price.toLocaleString()}`} />
                    </div>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-2 gap-6 mb-12">
                  <div className="p-8 bg-black/[0.02] border border-black/[0.04] rounded-[32px]" role="group" aria-label="Yield Metric">
                    <p className="text-[10px] uppercase text-black/20 font-bold tracking-[0.24em] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Current APY</p>
                    <div className="text-3xl text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }} aria-live="polite">
                      <MagneticText disabled text={`${apy}%`} />
                    </div>
                  </div>
                  <div className="p-8 bg-black/[0.02] border border-black/[0.04] rounded-[32px]" role="group" aria-label="Market Cap Metric">
                    <p className="text-[10px] uppercase text-black/20 font-bold tracking-[0.24em] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Market Cap</p>
                    <div className="text-3xl text-black tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                      <MagneticText disabled text={isUSDY ? "~24M" : "~29K"} />
                      <span className="text-xs text-black/10 font-bold ml-1 uppercase">{asset.symbol}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="space-y-6">
                  {[
                    { label: "Token Standard", value: asset.standard },
                    { label: "Backing Reserve", value: asset.backing },
                    { label: "Allocation Rule", value: asset.allocation_rule },
                    { label: "Contract Address", value: `${asset.address.slice(0, 10)}...${asset.address.slice(-8)}`, copy: true }
                  ].map(spec => (
                    <div key={spec.label} className="flex items-center justify-between py-4 border-b border-black/[0.03]">
                      <span className="text-[11px] text-black/20 font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.label}</span>
                      <span className="text-[13px] font-bold text-black/70" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Rules Table ── */}
      <div className="glass-card rounded-[48px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white/70 backdrop-blur-3xl" role="region" aria-label="AI Allocation Rules Engine">
        <div className="flex items-center justify-between mb-16">
          <div className="text-3xl text-black font-bold flex flex-wrap gap-x-[0.3em]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
            <MagneticText disabled text="AI Allocation" />
            <div className="font-light"><MagneticText disabled text="Rules Engine" /></div>
          </div>
          <IconShield className="text-black/10" size={40} aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { range: "≥ 80", target: "mETH", color: "bg-purple-400", desc: "Aggressive Growth" },
            { range: "60 - 80", target: "HOLD", color: "bg-black/10", desc: "Maintain Neutral" },
            { range: "< 60", target: "USDY", color: "bg-blue-400", desc: "Defensive Hedge" },
            { range: "Δ5/60m", target: "PAUSE", color: "bg-red-400", desc: "Circuit Breaker" }
          ].map(rule => (
            <div key={rule.range} className="p-8 border border-black/5 rounded-[32px] hover:bg-black/[0.01] transition-colors group" role="listitem">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.24em]">Score Range</span>
                <div className={`h-2.5 w-2.5 rounded-full ${rule.color} shadow-sm transition-transform group-hover:scale-125`} aria-hidden="true" />
              </div>
              <div className="text-2xl text-black mb-1 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300 }}>
                <MagneticText disabled text={rule.range} />
              </div>
              <p className="text-[11px] font-bold text-black/30 uppercase tracking-widest mb-6">{rule.desc}</p>
              <div className="py-2.5 px-5 bg-black text-white rounded-full inline-flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Action</span>
                <span className="text-[10px] font-bold tracking-[0.1em]">{rule.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Constraints & Governance ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-10 bg-black/[0.02] border border-black/[0.04] rounded-[48px] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] opacity-30">Counterparty Exposure</h4>
              <span className="px-3 py-1 bg-black text-[9px] text-white rounded-full font-bold uppercase tracking-widest">DAO Locked</span>
            </div>
            <p className="text-[14px] text-black/70 font-medium leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Enforced at <span className="text-black font-bold">45%</span> per counterparty. Parameter tunable via <span className="text-black font-bold">$OBELISK</span> governance.
            </p>
         </div>
         <div className="p-10 bg-black/[0.02] border border-black/[0.04] rounded-[48px] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] opacity-30">Liquidity Reserve</h4>
              <span className="px-3 py-1 bg-black text-[9px] text-white rounded-full font-bold uppercase tracking-widest">DAO Locked</span>
            </div>
            <p className="text-[14px] text-black/70 font-medium leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Minimum <span className="text-black font-bold">7.5%</span> floor. Designed to absorb gas spikes and facilitate instant exit liquidity.
            </p>
         </div>
         <div className="p-10 bg-black/[0.02] border border-black/[0.04] rounded-[48px] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] opacity-30">ZK-ML Proof Status</h4>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <p className="text-[14px] text-black/70 font-medium leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Regime detection validated via <span className="text-black font-bold">ZK-ML Proofs</span>. Zero-knowledge verification of AI reasoning path.
            </p>
         </div>
      </div>
    </motion.div>
  );
}

function IconShield({ className, size }: { className?: string, size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size ?? 24} height={size ?? 24} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

