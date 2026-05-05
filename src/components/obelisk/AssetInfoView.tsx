/**
 * AssetInfoView — Compliance & Asset Information page.
 * Explains USDY and mETH tokens with full regulatory context.
 */
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

interface AssetDetail {
  label: string;
  value: string;
  mono?: boolean;
}

interface AssetCardProps {
  name: string;
  ticker: string;
  tagColor: string;
  tagLabel: string;
  details: AssetDetail[];
  contractAddress: string;
  contractExplorer: string;
  delay: number;
}

function AssetCard({ name, ticker, tagColor, tagLabel, details, contractAddress, contractExplorer, delay }: AssetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-6 md:p-10 col-span-12 lg:col-span-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${tagColor}15, ${tagColor}08)`,
            border: `1px solid ${tagColor}20`,
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: tagColor }}
          >
            {ticker}
          </span>
        </div>
        <div className="flex-1">
          <h3
            className="text-xl text-foreground font-semibold"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
          >
            {name}
          </h3>
          <span
            className="text-[9px] uppercase px-2 py-0.5 rounded-full"
            style={{
              letterSpacing: "0.2em",
              fontFamily: "'JetBrains Mono', monospace",
              background: `${tagColor}10`,
              color: tagColor,
              border: `1px solid ${tagColor}20`,
            }}
          >
            {tagLabel}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-0">
        {details.map((d, i) => (
          <div
            key={d.label}
            className="flex items-start justify-between py-3"
            style={{
              borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <span
              className="text-[10px] uppercase text-muted-foreground flex-shrink-0"
              style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {d.label}
            </span>
            <span
              className="text-sm text-foreground text-right max-w-[60%]"
              style={{
                fontFamily: d.mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                letterSpacing: d.mono ? "-0.02em" : "-0.01em",
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>

      {/* Contract address */}
      <div
        className="mt-6 px-4 py-3 rounded-lg"
        style={{
          background: "rgba(0,0,0,0.02)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <p
          className="text-[9px] uppercase text-muted-foreground mb-1.5"
          style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Contract Address
        </p>
        <a
          href={contractExplorer}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-foreground/70 hover:text-foreground transition-colors break-all"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.01em" }}
        >
          {contractAddress}
          <span className="ml-1 opacity-50">↗</span>
        </a>
      </div>
    </motion.div>
  );
}

export function AssetInfoView() {
  return (
    <motion.div {...fadeUp}>
      {/* Page heading */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-[10px] uppercase text-muted-foreground mb-3"
            style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Compliance · Asset Information
          </p>
          <h2
            className="text-3xl md:text-4xl text-foreground mb-3"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", fontWeight: 600 }}
          >
            Managed Assets
          </h2>
          <p
            className="text-sm text-muted-foreground max-w-xl"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7, letterSpacing: "-0.01em" }}
          >
            Full transparency on the real-world assets and liquid staking tokens managed by Obelisk Q.
            All assets are issued by regulated or non-custodial protocols.
          </p>
        </motion.div>
      </div>

      {/* Asset cards grid */}
      <div className="grid grid-cols-12 gap-5 md:gap-6">
        <AssetCard
          name="USDY"
          ticker="USDY"
          tagColor="hsl(210, 100%, 50%)"
          tagLabel="Tokenized Treasury"
          delay={0.2}
          contractAddress="0x5bE26527e817998A7206475496fDE1E68957c5A6"
          contractExplorer="https://explorer.sepolia.mantle.xyz/address/0x5bE26527e817998A7206475496fDE1E68957c5A6"
          details={[
            { label: "Type", value: "Tokenized US Treasury Yield" },
            { label: "Issuer", value: "Ondo Finance" },
            { label: "Backing", value: "Short-term US Treasuries + bank deposits" },
            { label: "Yield", value: "~5% APY (variable)", mono: true },
            { label: "Restriction", value: "Non-US persons only" },
          ]}
        />

        <AssetCard
          name="mETH"
          ticker="mETH"
          tagColor="hsl(270, 80%, 55%)"
          tagLabel="Liquid Staked ETH"
          delay={0.35}
          contractAddress="0xcDA86A272531e8640cD7F1a92c01839911B90bb0"
          contractExplorer="https://explorer.sepolia.mantle.xyz/address/0xcDA86A272531e8640cD7F1a92c01839911B90bb0"
          details={[
            { label: "Type", value: "Liquid Staked ETH" },
            { label: "Issuer", value: "Mantle LSP" },
            { label: "Backing", value: "Staked ETH on Ethereum L1" },
            { label: "Yield", value: "~3.5% APY (variable)", mono: true },
            { label: "Model", value: "Non-custodial, permissionless" },
          ]}
        />

        {/* Regulatory notice card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 glass-card rounded-2xl p-6 md:p-10"
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.15)",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="hsl(30,100%,55%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg text-foreground font-semibold mb-1"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
              >
                Important Regulatory Notice
              </h3>
              <p
                className="text-[10px] uppercase text-muted-foreground"
                style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" }}
              >
                Please read before investing
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              "USDY is a regulated financial instrument. It is not available to US persons or entities under any circumstances.",
              "mETH is a liquid staking derivative. Staking involves risk including potential slashing penalties on the Ethereum beacon chain.",
              "Past yield performance is not indicative of future returns. All APY figures shown are estimates and subject to market conditions.",
              "Smart contract audits for the Obelisk Q vault are pending. Users interact at their own risk.",
              "This platform does not provide financial, legal, or tax advice. Users should consult qualified professionals.",
              "All on-chain interactions are final and irreversible. Obelisk Q operates in a fully non-custodial manner."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                />
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Protocol links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { label: "Ondo Finance", url: "https://ondo.finance", desc: "USDY Issuer" },
            { label: "Mantle LSP", url: "https://www.mantle.xyz/meth", desc: "mETH Protocol" },
            { label: "Mantle Explorer", url: "https://explorer.sepolia.mantle.xyz", desc: "Block Explorer" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card rounded-xl px-5 py-4 flex items-center justify-between group hover:border-foreground/10 transition-all duration-400"
            >
              <div>
                <p
                  className="text-sm text-foreground font-medium"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {link.label}
                </p>
                <p
                  className="text-[9px] uppercase text-muted-foreground mt-0.5"
                  style={{ letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {link.desc}
                </p>
              </div>
              <svg
                viewBox="0 0 16 16" width="12" height="12" fill="none"
                className="text-muted-foreground/40 group-hover:text-foreground/60 transition-colors"
              >
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
