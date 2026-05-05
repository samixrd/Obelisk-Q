import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight } from "./LineIcons";
import { useYieldData } from "@/hooks/useYieldData";

interface Asset {
  symbol: string;
  name: string;
  blurb: string;
  yield: string;
  yieldLabel: string;
  buffer: string;
  bufferPct: number; // 0–100
  tvl: string;
  seed: number;
  trend?: string | null;
}

export function ManagedAssets() {
  const { usdy, meth } = useYieldData();

  const assets: Asset[] = [
    {
      symbol: "USDY",
      name: "Ondo US Dollar Yield",
      blurb: "Tokenized US treasuries. Conservative, dollar-denominated.",
      yield: `${usdy.apy.toFixed(2)}%`,
      yieldLabel: "Real-time APY",
      buffer: "$24,180",
      bufferPct: 78,
      tvl: "$182,430",
      seed: 7,
      trend: usdy.trend7d?.toFixed(2),
    },
    {
      symbol: "mETH",
      name: "Mantle Staked Ether",
      blurb: "Liquid-staked ETH on Mantle. Balanced growth with hedged downside.",
      yield: `${meth.apy.toFixed(2)}%`,
      yieldLabel: "Staking yield",
      buffer: "$11,640",
      bufferPct: 62,
      tvl: "$98,210",
      seed: 11,
      trend: meth.trend7d?.toFixed(2),
    },
  ];

  return (
    <div className="col-span-12 glass-card rounded-3xl p-8 md:p-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground mb-2" style={{ letterSpacing: "0.28em" }}>
            Managed Assets
          </p>
          <p className="text-2xl text-foreground" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            Curated by the <span>Obelisk Q</span> controller
          </p>
        </div>
        <p className="hidden md:block text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: "0.28em" }}>
          Safety Buffer · Active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((a, i) => (
          <motion.div
            key={a.symbol}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="relative group rounded-2xl p-6 md:p-8 bg-foreground/[0.01] border border-foreground/5 hover:border-foreground/15 transition-all duration-500"
          >
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gradient-metal/20 border border-foreground/10">
                    <span className="text-sm text-foreground/90" style={{ fontFamily: "'Inter', sans-serif" }}>{a.symbol[0]}</span>
                  </span>
                  <div>
                    <p className="text-xl text-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{a.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">{a.name}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1" style={{ letterSpacing: "0.2em" }}>
                    {a.yieldLabel}
                  </p>
                  <div className="flex flex-col sm:items-end">
                    <p className="text-2xl text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.yield}</p>
                    {a.trend && (
                      <p className="text-[9px] text-neon flex items-center gap-0.5 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <IconArrowUpRight size={8} />
                        {a.trend}% (7d)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">{a.blurb}</p>

              <div className="-mx-2 mb-8">
                <StabilityGraph seed={a.seed} height={70} />
              </div>

              <div className="hairline mb-6" />

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground mb-1.5" style={{ letterSpacing: "0.15em" }}>
                    Allocated
                  </p>
                  <p className="text-sm text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.tvl}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground mb-1.5" style={{ letterSpacing: "0.15em" }}>
                    Safety Buffer
                  </p>
                  <p className="text-sm text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.buffer}</p>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <p className="text-[9px] uppercase text-muted-foreground mb-1.5" style={{ letterSpacing: "0.15em" }}>
                    Coverage
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative h-1 flex-1 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.bufferPct}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-y-0 left-0 bg-foreground/30 rounded-full"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {a.bufferPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-muted-foreground/60 max-w-2xl leading-relaxed">
        The Safety Buffer is a reserve maintained by Obelisk Q to absorb short-term volatility. If
        an asset moves outside its risk envelope, the buffer is deployed before any drawdown
        reaches your principal.
      </p>
    </div>
  );
}
