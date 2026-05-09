import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";
import { IconArrowUpRight } from "./LineIcons";
import { useYieldData } from "@/hooks/useYieldData";
import { MagneticText } from "./MagneticText";
import { useTokenLogos } from "@/hooks/useTokenLogos";
import { useVault } from "@/hooks/useVault";
import { useAgentData } from "@/hooks/useAgentData";

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
  const { usdy, meth, wmnt } = useYieldData();
  const logos = useTokenLogos();
  const { vaultStats } = useVault();
  const { currentPosition } = useAgentData();

  // 1. Calculate Real Totals from Vault Contract
  const totalMnt = parseFloat(vaultStats?.totalDeposited ?? "0");

  // 2. Define Buffer (7.5% as per Safeguards protocol)
  const bufferRatio = 0.075;
  const totalBuffer = totalMnt * bufferRatio;
  const investable = totalMnt - totalBuffer;

  // 3. Define Allocation Ratio based on Real-Time Agent Position
  let methRatio = 0;
  let usdyRatio = 0;
  let wmntRatio = 0;

  if (currentPosition === "mETH") {
    methRatio = 1.0;
  } else if (currentPosition === "USDY") {
    usdyRatio = 1.0;
  } else if (currentPosition === "WMNT") {
    wmntRatio = 1.0;
  }

  const assets: Asset[] = [
    {
      symbol: "USDY",
      name: "Ondo US Dollar Yield",
      blurb: "Tokenized US treasuries. Conservative, dollar-denominated.",
      yield: `${usdy.apy.toFixed(2)}%`,
      yieldLabel: "Real-time APY",
      buffer: `$${(totalBuffer * (usdyRatio > 0 ? 1 : 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      bufferPct: Math.round(usdyRatio * 100),
      tvl: `$${(investable * usdyRatio).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      seed: 7,
      trend: usdy.trend7d?.toFixed(2),
    },
    {
      symbol: "mETH",
      name: "Mantle Staked Ether",
      blurb: "Liquid-staked ETH on Mantle. Balanced growth with hedged downside.",
      yield: `${meth.apy.toFixed(2)}%`,
      yieldLabel: "Staking yield",
      buffer: `$${(totalBuffer * (methRatio > 0 ? 1 : 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      bufferPct: Math.round(methRatio * 100),
      tvl: `$${(investable * methRatio).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      seed: 11,
      trend: meth.trend7d?.toFixed(2),
    },
    {
      symbol: "WMNT",
      name: "Wrapped Mantle",
      blurb: "Native Mantle token wrapped for stability. Low volatility, steady baseline yield.",
      yield: `${wmnt.apy.toFixed(2)}%`,
      yieldLabel: "Baseline yield",
      buffer: `$${(totalBuffer * (wmntRatio > 0 ? 1 : 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      bufferPct: Math.round(wmntRatio * 100),
      tvl: `$${(investable * wmntRatio).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      seed: 9,
      trend: wmnt.trend7d?.toFixed(2),
    },
  ];

  return (
    <div className="col-span-12 glass-card rounded-3xl p-8 md:p-10 transition-all hover:bg-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground mb-2 font-bold tracking-[0.24em]">
            Managed Assets
          </p>
          <div className="text-2xl text-foreground flex flex-wrap gap-x-[0.25em] font-display">
            <MagneticText disabled text="Curated by the" />
            <div className="font-light"><MagneticText disabled text="Obelisk Q" /></div>
            <MagneticText disabled text="controller" />
          </div>
        </div>
        <p className="hidden md:block text-[10px] uppercase text-muted-foreground font-bold tracking-[0.24em]">
          Safety Buffer · Active
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="flex flex-col gap-5 mb-6">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-foreground/10 overflow-hidden bg-white shrink-0">
                    {logos[a.symbol] ? (
                      <img src={logos[a.symbol]!} alt={a.symbol} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-foreground/90 font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{a.symbol[0]}</span>
                    )}
                  </span>
                  <div>
                    <p className="text-xl text-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{a.symbol}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{a.name}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1" style={{ letterSpacing: "0.2em" }}>
                    {a.yieldLabel}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl text-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.yield}</p>
                    {a.trend && (
                      <p className="text-[10px] text-neon flex items-center gap-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <IconArrowUpRight size={10} />
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

              <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                <div className="min-w-0">
                  <p className="text-[8px] uppercase text-muted-foreground mb-1" style={{ letterSpacing: "0.1em" }}>
                    Allocated
                  </p>
                  <p className="text-xs text-foreground font-medium truncate pr-2" style={{ fontFamily: "'JetBrains Mono', monospace" }} title={a.tvl}>{a.tvl}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] uppercase text-muted-foreground mb-1" style={{ letterSpacing: "0.1em" }}>
                    Reserve
                  </p>
                  <p className="text-xs text-foreground font-medium truncate pr-2" style={{ fontFamily: "'JetBrains Mono', monospace" }} title={a.buffer}>{a.buffer}</p>
                </div>
                <div className="col-span-2 mt-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[8px] uppercase text-muted-foreground" style={{ letterSpacing: "0.1em" }}>
                      Coverage
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {a.bufferPct}%
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.bufferPct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 bg-foreground/30 rounded-full"
                    />
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
