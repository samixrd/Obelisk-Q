import { motion } from "framer-motion";
import { useYieldData, YieldInfo } from "@/hooks/useYieldData";
import { useState, useEffect } from "react";

function useRelativeTime(date: Date | null) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!date) return;
    const update = () => {
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (diff < 60) setTime("Just now");
      else if (diff < 3600) setTime(`Updated ${Math.floor(diff / 60)}m ago`);
      else setTime(`Updated ${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [date]);

  return time;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

interface AssetCardProps {
  title: string;
  subtitle: string;
  fields: { label: string; value: string; isLink?: boolean; href?: string }[];
  delay: number;
  yieldInfo: YieldInfo;
}

function AssetCard({ title, subtitle, fields, delay, yieldInfo }: AssetCardProps) {
  const relativeTime = useRelativeTime(yieldInfo.lastUpdated);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-8 md:p-10 col-span-12 lg:col-span-6 flex flex-col h-full"
    >
      <div className="mb-8">
        <h3
          className="text-2xl font-semibold text-foreground mb-1"
        >
          {title}
        </h3>
        <p
          className="text-sm text-muted-foreground"
        >
          {subtitle}
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {fields.map((field, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span
              className="text-[9px] uppercase text-muted-foreground/60"
              style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
            >
              {field.label}
            </span>
            {field.label === "Current APY" ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] text-foreground/80"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
                >
                  {yieldInfo.apy.toFixed(2)}%
                </span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-neon/5 border border-neon/10">
                  <div className="h-1 w-1 rounded-full bg-neon animate-pulse" />
                  <span className="text-[8px] uppercase text-neon tracking-wider font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Live</span>
                </div>
                <span className="text-[9px] text-muted-foreground/40 ml-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{relativeTime}</span>
              </div>
            ) : field.isLink ? (
              <a
                href={field.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-foreground/80 hover:text-foreground transition-colors break-all"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
              >
                {field.value} <span className="opacity-30">↗</span>
              </a>
            ) : (
              <span
                className="text-[13px] text-foreground/80"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
              >
                {field.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function AssetsView() {
  const yieldData = useYieldData();
  return (
    <motion.div {...fadeUp} className="space-y-8">
      {/* Assets Grid */}
      <div className="grid grid-cols-12 gap-6">
        <AssetCard
          delay={0.1}
          yieldInfo={yieldData.usdy}
          title="USDY — US Dollar Yield"
          subtitle="Tokenized US Treasury Note by Ondo Finance"
          fields={[
            { label: "Asset type", value: "Tokenized short-term US Treasuries" },
            { label: "Issuer", value: "Ondo Finance" },
            { label: "Backing", value: "US Treasury bills + bank demand deposits" },
            { label: "Current APY", value: `${yieldData.usdy.apy.toFixed(1)}% (variable)` },
            { label: "Token standard", value: "ERC-20 (upgradeable proxy)" },
            { label: "Chain", value: "Mantle Network (L2)" },
            { label: "Contract", value: "0x5bE26527e817998A7206475496fDE1E68957c5A6" },
            { 
              label: "Explorer link", 
              value: "mantlescan.xyz/token/0x5bE...", 
              isLink: true, 
              href: "https://mantlescan.xyz/token/0x5bE26527e817998A7206475496fDE1E68957c5A6" 
            },
            { label: "Transfer restriction", value: "Non-US persons only" },
            { label: "Total supply on Mantle", value: "~24 million USDY" },
          ]}
        />

        <AssetCard
          delay={0.2}
          yieldInfo={yieldData.meth}
          title="mETH — Mantle Staked ETH"
          subtitle="Liquid staking receipt token by Mantle LSP"
          fields={[
            { label: "Asset type", value: "Liquid staked Ethereum" },
            { label: "Issuer", value: "Mantle Liquid Staking Protocol" },
            { label: "Backing", value: "ETH staked on Ethereum L1" },
            { label: "Current APY", value: `${yieldData.meth.apy.toFixed(1)}% (variable)` },
            { label: "Token standard", value: "ERC-20 (upgradeable proxy)" },
            { label: "Chain", value: "Mantle Network (L2)" },
            { label: "Contract", value: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0" },
            { 
              label: "Explorer link", 
              value: "mantlescan.xyz/token/0xcDA...", 
              isLink: true, 
              href: "https://mantlescan.xyz/token/0xcDA86A272531e8640cD7F1a92c01839911B90bb0" 
            },
            { label: "Transfer restriction", value: "None — permissionless" },
            { label: "Total supply on Mantle", value: "~29,000 mETH" },
          ]}
        />
      </div>

      {/* Allocation Logic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-2xl p-8 md:p-10"
      >
        <h3
          className="text-xl font-semibold text-foreground mb-8"
        >
          How the AI allocates between these assets
        </h3>

        <div className="flex flex-col gap-6">
          {[
            { condition: "Score >= 80 + Stable", action: "Rotate to mETH (higher yield)" },
            { condition: "Score < 60 or High Volatility", action: "Rotate to USDY (stable)" },
            { condition: "Between 60-80", action: "Hold current allocation" },
            { condition: "Circuit breaker fired", action: "Pause all allocation" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="w-[200px] flex-shrink-0">
                <span
                  className="text-[11px] text-muted-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
                >
                  {item.condition}
                </span>
              </div>
              <div className="h-px flex-1 bg-foreground/5" />
              <div className="w-[240px] text-right">
                <span
                  className="text-[11px] text-foreground/70"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
                >
                  {item.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-[11px] text-muted-foreground/50 text-center max-w-2xl mx-auto leading-relaxed"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}
      >
        Both assets are yield-bearing RWAs. 
        The AI agent monitors yield spread, volatility, 
        and liquidity depth every 10 seconds to optimize allocation.
      </motion.p>
    </motion.div>
  );
}
