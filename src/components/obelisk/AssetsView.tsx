import { motion } from "framer-motion";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import { useVault } from "@/hooks/useVault";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
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
  }
];

export function AssetsView() {
  const { livePrices, liveYields } = useAgentWebSocket();
  const { vaultStats } = useVault();

  return (
    <motion.div {...fadeUp} className="space-y-12 pb-20">
      
      {/* Sector Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ASSET_DETAILS.map((asset, i) => {
          const isUSDY = asset.symbol === "USDY";
          const price = isUSDY ? livePrices.usdy : livePrices.meth;
          const apy = isUSDY ? liveYields.usdy : liveYields.meth;

          return (
            <div key={asset.symbol} className="glass-card rounded-[32px] overflow-hidden flex flex-col">
              <div className="p-8 md:p-10 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${isUSDY ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"}`}>
                      <span className="font-bold text-lg">{asset.symbol[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>{asset.name}</h3>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>{asset.issuer} · {asset.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">LIVE FEED</span>
                    </div>
                    <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {isUSDY ? `$${price.toFixed(2)}` : `$${price.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-black/[0.02] border border-black/[0.05] rounded-3xl">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Current APY</p>
                    <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>{apy}%</p>
                  </div>
                  <div className="p-5 bg-black/[0.02] border border-black/[0.05] rounded-3xl">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>Market Cap (Mantle)</p>
                    <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {isUSDY ? "~24M" : "~29K"} <span className="text-xs text-muted-foreground font-medium ml-0.5">{asset.symbol}</span>
                    </p>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="space-y-4">
                  {[
                    { label: "Token Standard", value: asset.standard },
                    { label: "Backing Reserve", value: asset.backing },
                    { label: "Allocation Rule", value: asset.allocation_rule },
                    { label: "Contract Address", value: `${asset.address.slice(0, 10)}...${asset.address.slice(-8)}`, copy: true }
                  ].map(spec => (
                    <div key={spec.label} className="flex items-center justify-between py-3 border-b border-black/[0.03]">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.label}</span>
                      <span className="text-[12px] font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules Table */}
      <div className="glass-card rounded-[32px] p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            AI Allocation <span className="font-light">Rules Engine</span>
          </h3>
          <IconShield className="text-black/20" size={32} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { range: "≥ 80", target: "mETH", color: "bg-purple-500", desc: "Aggressive Growth" },
            { range: "60 - 80", target: "HOLD", color: "bg-slate-400", desc: "Maintain Neutral" },
            { range: "< 60", target: "USDY", color: "bg-blue-500", desc: "Defensive Hedge" },
            { range: "Δ5/60m", target: "PAUSE", color: "bg-red-500", desc: "Circuit Breaker" }
          ].map(rule => (
            <div key={rule.range} className="p-6 border border-black/5 rounded-[24px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Score Range</span>
                <div className={`h-2 w-2 rounded-full ${rule.color}`} />
              </div>
              <p className="text-xl font-bold text-black mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{rule.range}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{rule.desc}</p>
              <div className="py-2 px-3 bg-black/5 rounded-xl inline-block">
                <span className="text-[10px] font-bold text-black">ACTION: {rule.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px]">
            <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-widest">Counterparty Exposure Cap</h4>
            <p className="text-xs text-blue-800/60 leading-relaxed">
              Automated enforcement ensures no single counterparty (Ondo/Mantle) exceeds **45%** of total vault NAV, mitigating platform-specific systemic risks.
            </p>
         </div>
         <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-[32px]">
            <h4 className="text-sm font-bold text-purple-900 mb-2 uppercase tracking-widest">Liquidity Reserve Floor</h4>
            <p className="text-xs text-purple-800/60 leading-relaxed">
              A minimum **7.5%** liquidity floor is maintained at all times to facilitate instant withdrawals and cover gas spikes during high volatility.
            </p>
         </div>
      </div>
    </motion.div>
  );
}

function IconShield({ className, size }: { className?: string, size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size ?? 24} height={size ?? 24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
