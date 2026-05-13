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
      content: "The Antigravity Protocol is the high-availability backbone of Obelisk Q. It provides a deterministic execution environment with verified Anti-MEV slippage guards (1% buffer) and optimized proportional asset unwinding. The protocol enforces strict telemetry synchronization (10s polling) to maintain a sub-500ms state latency between the agent node and the on-chain vault.",
    },
    {
      id: "architecture",
      title: "7-Node LangGraph Swarm",
      content: "At its core, Obelisk Q utilizes a 7-node LangGraph orchestration: 1) Regime Detection (HMM-inspired market analysis), 2) Risk Assessment (volatility audit \u0026 regime classification), 3) Deterministic Analyst (math-based second opinion), 4) Consensus Node (dual-model arbitration), 5) Q-Score Engine (confidence calculation), 6) Telemetry Aggregator (state broadcasting), and 7) Supervisory Controller (on-chain execution authority).",
    },
    {
      id: "hmm-regime",
      title: "HMM Regime Detection Algorithm",
      content: "Obelisk Q classifies markets into three hidden states: Expansion (vol \u003c 1.2), Consolidation (1.2 ≤ vol ≤ 2.2), and Contraction (vol \u003e 2.2). Volatility is modeled via a bounded random walk (±0.4 per cycle, clamped to [0.5, 3.5]). In the ambiguous Consolidation zone, GPT-4o-mini provides a second opinion using the last 3 regime history, Q-Score, and MNT price change. A deterministic Sanity Override forces Contraction if vol \u003e 2.5, and blocks Expansion if risk_score \u003c 40. When a regime change occurs, a 3-cycle hysteresis lock (~30 min) prevents rapid switching. Finally, a Consensus Node arbitrates between the AI regime and a deterministic analyst: any single Contraction vote overrides all, and Expansion requires unanimous agreement. The result maps to allocation: Expansion + score ≥ 65 → mETH, Contraction + score ≤ 45 → USDY, Consolidation + 50 ≤ score ≤ 65 → WMNT, else HOLD.",
    },
    {
      id: "circuit-breaker",
      title: "Safety \u0026 Hybrid AI Logic",
      content: "The system features a hybrid safety architecture. A real-time autonomous circuit breaker monitors the Q-Score, while a deterministic Sanity Filter overrides the AI (GPT-4o-mini) if volatility exceeds institutional safety thresholds (Vol \u003e 2.5). This ensures that during a rapid regime shift, the agent always defaults to a safe position (MNT/Mantle native), regardless of non-deterministic AI outlooks.",
    },
    {
      id: "mainnet",
      title: "Mantle Mainnet Deployment",
      content: "Obelisk Q is live on Mantle Mainnet (Chain ID: 5000). The primary entry point is the ObeliskVault contract: 0x2e7D0D1642Faf1b2FCb433597c34252d8c7F11bB. The vault is non-custodial, integrated with Merchant Moe liquidity, and maintains a strictly enforced 0.01 MNT gas buffer for autonomous operation.",
    },
    {
      id: "swarm",
      title: "Sovereign Swarm Architecture",
      content: "Obelisk Q runs a 3-process PM2 topology: one primary executor and two hot-standby shadow nodes with staggered restart delays (4s/10s/15s). Shadow nodes poll the primary's heartbeat in a shared SQLite table every 15 seconds. If the primary fails to pulse for 45 seconds, a shadow autonomously promotes itself to primary and resumes vault supervision. Current limitation: all processes share a single Azure VM and SQLite file. Cross-VM deployment requires replacing SQLite with PostgreSQL or Redis for the heartbeat store.",
    },
    {
      id: "consensus",
      title: "Hybrid AI/Math Consensus",
      content: "Decisions are routed through a 7-node LangGraph. The 'Consensus Node' arbitrates between the AI's LLM-driven market sentiment and a deterministic mathematical analyst. The arbitration has an asymmetric safety bias: any single Contraction vote overrides all other signals, any Consolidation vote blocks Expansion, and Expansion requires unanimous agreement from both models. This ensures capital is never exposed to growth risk unless both the AI and mathematical models agree conditions are favorable.",
    },
    {
      id: "whipsaw",
      title: "Anti-Whipsaw Protection",
      content: "To optimize gas efficiency on Mantle, the protocol enforces a 3-cycle Trend-Lock. Once a regime shift occurs, the vault enters a lock-in period where rebalancing is restricted unless a critical 10-point drop in the Q-Score triggers the Agent-Level Circuit Breaker.",
    },
    {
      id: "yield",
      title: "Yield \u0026 Asset Framework",
      content: "The navigator focuses on three primary yield vectors: 1) mETH (Mantle LSP) for native staked ETH rewards, 2) USDY (Ondo Finance) for institutional US Treasury exposure, and 3) WMNT (Wrapped MNT) for stable consolidation yield. The agent dynamically balances these positions to capture maximum yield during expansions, hedge into RWAs during market contractions, and stabilize in WMNT during consolidation periods.",
    },
    {
      id: "constraints",
      title: "Technical Constraints \u0026 Mitigations",
      content: "Current infrastructure constraints include Telemetry Latency caused by RPC congestion on Mantle Mainnet. During high-traffic events, the pulse frequency may drop. To mitigate this, Obelisk Q utilizes state persistence via SQLite and redundant RPC endpoints to ensure the agent never loses the vault's 'Last Known State'.",
    },
    {
      id: "security",
      title: "Sovereign Identity (ERC-8004)",
      content: "To ensure institutional trust, the Obelisk Q agent maintains a sovereign on-chain identity (0x5698E89Ec2396e02679ddde33c2BA78de88F7fce) under the ERC-8004 standard. This manifest defines the agent's rebalancing logic and capabilities, providing a verifiable audit trail for all autonomous transactions executed on the Mantle Network.",
    },
    {
      id: "growth-alpha",
      title: "Growth Alpha \u0026 Dynamic Rotation",
      content: "Unlike static yield-bearing products that fix capital in a single asset, Obelisk Q prioritizes 'Growth Alpha'. By dynamically rotating capital into mETH during market expansions, the system captures price appreciation and higher staking incentives that exceed stable RWA yields. Conversely, it automatically retreats to USDY during market contractions to protect capital, ensuring that users benefit from the best of both worlds: high-growth upside and institutional-grade downside protection.",
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
