import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative flex-shrink-0"
      style={{ width: "36px", height: "20px", background: "transparent", border: "none" }}
    >
      <span className="block w-full h-full rounded-full transition-colors duration-500"
        style={{ background: on ? "hsl(104 100% 68% / 0.25)" : "rgba(255,255,255,0.08)",
          border: `0.5px solid ${on ? "hsl(104 100% 68% / 0.55)" : "rgba(255,255,255,0.15)"}` }} />
      <motion.span animate={{ x: on ? 18 : 2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[3px] h-[14px] w-[14px] rounded-full"
        style={{ background: on ? "hsl(104 100% 68%)" : "rgba(255,255,255,0.35)",
          boxShadow: on ? "0 0 6px hsl(104 100% 68% / 0.6)" : "none" }} />
    </button>
  );
}

interface PreferencesViewProps {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
}

export function PreferencesView({ walletAddress, onConnectWallet }: PreferencesViewProps) {
  const [prefs, setPrefs] = useState({
    autoRebalance: true,
    riskAlerts: true,
    emailReports: false,
    highFrequency: false,
    darkMode: true,
    compactView: false,
  });

  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const sections = [
    {
      title: "Agent behaviour",
      items: [
        { key: "autoRebalance" as const, label: "Automatic rebalancing", desc: "The agent adjusts positions when allocation drifts beyond 2% from target." },
        { key: "highFrequency" as const, label: "High-frequency scanning", desc: "Increases the scan interval to every 15 minutes. Uses more compute credits." },
      ],
    },
    {
      title: "Notifications",
      items: [
        { key: "riskAlerts" as const, label: "Risk threshold alerts",  desc: "Receive a notification when the stability score falls below 80." },
        { key: "emailReports" as const, label: "Weekly email digest", desc: "A summary of portfolio performance, yield, and agent actions sent each Monday." },
      ],
    },
    {
      title: "Display",
      items: [
        { key: "darkMode" as const,    label: "Dark interface",   desc: "Use the obsidian dark theme. Disabling this is not recommended." },
        { key: "compactView" as const, label: "Compact dashboard", desc: "Reduce card padding and hide secondary descriptions for a denser layout." },
      ],
    },
  ];

  return (
    <motion.div {...fadeUp} className="grid grid-cols-12 gap-6">
      {sections.map((section, si) => (
        <div key={section.title} className="col-span-12 glass-card rounded-sm p-10">
          <p className="text-[10px] uppercase text-muted-foreground mb-8"
            style={{ letterSpacing: "0.28em" }}>{section.title}</p>
          <div className="space-y-0">
            {section.items.map((item, ii) => (
              <motion.div key={item.key}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 + ii * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex-1 pr-12">
                  <p className="text-base text-foreground/85"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed"
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.01em" }}>
                    {item.desc}
                  </p>
                </div>
                <Toggle on={prefs[item.key]} onChange={() => toggle(item.key)} />
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Account section */}
      <div className="col-span-12 glass-card rounded-sm p-10">
        <p className="text-[10px] uppercase text-muted-foreground mb-8" style={{ letterSpacing: "0.28em" }}>Account</p>
        <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <p className="text-base text-foreground/85"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Connected wallet</p>
            <p className="mt-1 text-[11px] text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {walletAddress ? `${walletAddress} · Mantle Mainnet` : "No wallet connected"}
            </p>
          </div>
          {walletAddress ? (
            <button className="text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors"
              style={{ letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
              Disconnect
            </button>
          ) : (
            <motion.button
              onClick={onConnectWallet}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 text-[9px] uppercase transition-all duration-400"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                border: "0.5px solid rgba(255,255,255,0.22)",
                letterSpacing: "0.25em",
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.38)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.88)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              }}
            >
              <svg viewBox="0 0 14 14" width="11" height="11" fill="none">
                <rect x="1" y="3.5" width="12" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                <path d="M1 6h12" stroke="currentColor" strokeWidth="1"/>
                <circle cx="10" cy="8.5" r="0.9" fill="currentColor"/>
                <path d="M9.5 3.5V2.8A1.3 1.3 0 0 1 12 2.8v.7" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Connect wallet
            </motion.button>
          )}
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-base text-foreground/85"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Agent identity</p>
            <p className="mt-1 text-[11px] text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>ERC-8004 · Token ID #1024 · Active</p>
          </div>
          <span className="flex items-center gap-2 text-[9px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="h-1 w-1 rounded-full"
              style={{ background: "hsl(104 100% 68%)", boxShadow: "0 0 4px hsl(104 100% 68% / 0.6)" }} />
            Verified
          </span>
        </div>
      </div>
    </motion.div>
  );
}
