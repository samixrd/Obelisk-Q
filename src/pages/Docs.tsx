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
      content: "Obelisk Q is an institutional-grade wealth navigator optimized for Mantle Mainnet. It leverages a multi-agent LangGraph architecture to orchestrate capital across growth assets like mETH and yield-bearing RWAs like USDY with autonomous precision.",
    },
    {
      id: "protocol",
      title: "Antigravity Protocol",
      content: "The Antigravity Protocol ensures 100% high-availability and deterministic execution. By implementing verified cross-token unwind logic, the protocol guarantees that transitions between assets (e.g., mETH ↔ USDY) are executed with zero idle capital and optimized gas efficiency.",
    },
    {
      id: "architecture",
      title: "Multi-Agent Architecture",
      content: "The system utilizes a specialized swarm—Analyst, Risk, Tracker, and Executor—hosted on Azure. This architecture allows for real-time market regime detection (Expansion, Contraction, Consolidation) and automated on-chain rebalancing whenever market confidence thresholds are met.",
    },
    {
      id: "mainnet",
      title: "Mantle Mainnet Integration",
      content: "Obelisk Q is fully operational on Mantle Mainnet. The protocol utilizes a custom ObeliskVault (0xfEDA...1389) integrated with Merchant Moe liquidity pools, maintaining a 0.01 MNT safety buffer for continuous, touchless rebalancing.",
    },
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
