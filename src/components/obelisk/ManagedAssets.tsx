// Managed Assets — features USDY (Ondo USD Yield) and mETH (Mantle Staked
// ETH). Each card displays current yield and the Safety Buffer maintained
// by the Obelisk Q controller.
import { motion } from "framer-motion";
import { StabilityGraph } from "./StabilityGraph";

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
}

const assets: Asset[] = [
  {
    symbol: "USDY",
    name: "Ondo US Dollar Yield",
    blurb: "Tokenized US treasuries. Conservative, dollar-denominated.",
    yield: "5.18%",
    yieldLabel: "Real-time APY",
    buffer: "$24,180",
    bufferPct: 78,
    tvl: "$182,430",
    seed: 7,
  },
  {
    symbol: "mETH",
    name: "Mantle Staked Ether",
    blurb: "Liquid-staked ETH on Mantle. Balanced growth with hedged downside.",
    yield: "4.02%",
    yieldLabel: "Staking yield",
    buffer: "$11,640",
    bufferPct: 62,
    tvl: "$98,210",
    seed: 11,
  },
];

export function ManagedAssets() {
  return (
    <div className="col-span-12 glass-card rounded-sm p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-2">
            Managed Assets
          </p>
          <p className="font-serif text-2xl text-foreground">
            Curated by the <span className="italic">Obelisk Q</span> controller
          </p>
        </div>
        <p className="hidden md:block text-[10px] uppercase tracking-luxe text-muted-foreground">
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
            className="relative group rounded-sm p-8 border border-border hover:border-foreground/20 transition-all duration-500"
            style={{
              background:
                "linear-gradient(145deg, hsl(0 0% 100% / 0.025) 0%, hsl(0 0% 100% / 0.005) 100%)",
            }}
          >
            {/* Soft hover glow */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, hsl(104 100% 78% / 0.06), transparent 60%)",
              }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gradient-metal/40 border border-border-strong/60">
                    <span className="font-serif italic text-sm text-foreground/90">{a.symbol[0]}</span>
                  </span>
                  <div>
                    <p className="font-serif text-xl text-foreground tracking-tightest">{a.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">{a.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-1">
                    {a.yieldLabel}
                  </p>
                  <p className="font-mono-num text-2xl text-neon tracking-tightest">{a.yield}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">{a.blurb}</p>

              <div className="-mx-2 mb-6">
                <StabilityGraph seed={a.seed} height={70} />
              </div>

              <div className="hairline mb-5" />

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-1.5">
                    Allocated
                  </p>
                  <p className="font-mono-num text-sm text-foreground">{a.tvl}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-1.5">
                    Safety Buffer
                  </p>
                  <p className="font-mono-num text-sm text-foreground">{a.buffer}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-luxe text-muted-foreground mb-1.5">
                    Coverage
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative h-px flex-1 bg-foreground/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.bufferPct}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-y-0 left-0 bg-foreground/70"
                      />
                    </div>
                    <span className="font-mono-num text-[11px] text-muted-foreground">
                      {a.bufferPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-muted-foreground/80 max-w-2xl leading-relaxed">
        The Safety Buffer is a reserve maintained by Obelisk Q to absorb short-term volatility. If
        an asset moves outside its risk envelope, the buffer is deployed before any drawdown
        reaches your principal.
      </p>
    </div>
  );
}
