import { motion } from "framer-motion";
import { Logo } from "@/components/obelisk/Logo";
import { MagneticText } from "@/components/obelisk/MagneticText";
import { Link } from "react-router-dom";
import "./Docs.css";

const Docs = () => {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      content: "Obelisk Q is a sovereign wealth navigator designed for the Mantle ecosystem. It operates as a fully autonomous multi-agent system that optimizes capital allocation across institutional-grade liquid staked assets (mETH), yield-bearing RWAs (USDY), and stable Mantle yield (WMNT). By utilizing advanced market regime detection, it ensures capital is always positioned for the optimal risk-adjusted yield.",
    },
    {
      id: "protocol",
      title: "Antigravity Protocol",
      content: "The Antigravity Protocol is the high-availability backbone of Obelisk Q. It provides a deterministic execution environment with verified cross-token unwind logic. The protocol enforces strict telemetry synchronization (10s polling) to maintain a sub-500ms state latency between the agent node and the on-chain vault.",
    },
    {
      id: "architecture",
      title: "5-Node LangGraph Swarm",
      content: "At its core, Obelisk Q utilizes a 5-node LangGraph orchestration: 1) Regime Detection (HMM-based market analysis), 2) Risk Assessment (volatility audit), 3) Q-Score Engine (confidence calculation), 4) Telemetry Aggregator (state broadcasting), and 5) Supervisory Controller (on-chain execution authority).",
    },
    {
      id: "circuit-breaker",
      title: "Safety & Circuit Breaker",
      content: "The system features an autonomous circuit breaker that continuously monitors the Q-Score (confidence index). If the agent detects a volatility spike causing a 10-point drop within a 60-minute window, the system triggers an emergency unwind to safety (MNT/Mantle native), protecting user capital from rapid regime shifts.",
    },
    {
      id: "mainnet",
      title: "Mantle Mainnet Deployment",
      content: "Obelisk Q is live on Mantle Mainnet (Chain ID: 5000). The primary entry point is the ObeliskVault contract: 0x1f15C9C4c80734400c8a8681CDa39E4288c6AC16. The vault is non-custodial, integrated with Merchant Moe liquidity, and maintains a strictly enforced 0.01 MNT gas buffer for autonomous operation.",
    },
    {
      id: "yield",
      title: "Yield & Asset Framework",
      content: "The navigator focuses on three primary yield vectors: 1) mETH (Mantle LSP) for native staked ETH rewards, 2) USDY (Ondo Finance) for institutional US Treasury exposure, and 3) WMNT (Wrapped MNT) for stable consolidation yield. The agent dynamically balances these positions to capture maximum yield during expansions, hedge into RWAs during market contractions, and stabilize in WMNT during consolidation periods.",
    },
    {
      id: "security",
      title: "Sovereign Identity (ERC-8004)",
      content: "To ensure institutional trust, the Obelisk Q agent maintains a sovereign on-chain identity (0x5698E89Ec2396e02679ddde33c2BA78de88F7fce) under the ERC-8004 standard. This manifest defines the agent's rebalancing logic and capabilities, providing a verifiable audit trail for all autonomous transactions executed on the Mantle Network.",
    }
  ];

  return (
    <div className="docs-root">
      <nav className="docs-nav">
        <div className="docs-nav-inner">
          <Link to="/" className="docs-nav-left">
            <Logo size={24} />
            <span className="docs-brand">Obelisk Q</span>
          </Link>
          <Link to="/" className="docs-back-link">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="docs-main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="docs-header"
        >
          <span className="docs-label">DOCUMENTATION</span>
          <h1 className="docs-title">
            <MagneticText disabled text="Protocol" />
            <MagneticText disabled text="Specifications" />
          </h1>
        </motion.div>

        <div className="docs-content">
          <aside className="docs-sidebar">
            <ul className="docs-sidebar-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="docs-sidebar-link">{s.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          <section className="docs-articles">
            {sections.map((s, i) => (
              <motion.article 
                key={s.id} 
                id={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="docs-article"
              >
                <h2 className="docs-article-title">{s.title}</h2>
                <p className="docs-article-text">{s.content}</p>
              </motion.article>
            ))}
          </section>
        </div>
      </main>

      <footer className="docs-footer">
        <span className="docs-footer-text">© 2026 Obelisk Q · Antigravity Protocol</span>
      </footer>
    </div>
  );
};

export default Docs;
