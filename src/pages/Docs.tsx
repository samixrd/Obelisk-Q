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
      content: "Obelisk Q is an institutional-grade RWA (Real World Asset) navigator powered by the Antigravity Protocol. It leverages a multi-agent LangGraph architecture to orchestrate wealth management with autonomous precision on the Mantle Network.",
    },
    {
      id: "protocol",
      title: "Antigravity Protocol",
      content: "The Antigravity Protocol ensures 100% high-availability for agent operations. By implementing 500ms timeout windows and state-bypass logic, the protocol guarantees that agent intelligence remains resilient even under extreme network conditions.",
    },
    {
      id: "architecture",
      title: "Multi-Agent Architecture",
      content: "Our system utilizes specialized agents—Analyst, Risk, and Tracker—coordinated by a central supervisor. This 'swarm' intelligence allows for high-frequency reasoning and real-time adaptation to market regimes using Hidden Markov Models.",
    },
    {
      id: "identity",
      title: "ERC-8004 Identity",
      content: "Every decision made by an Obelisk agent is tied to a sovereign on-chain identity via ERC-8004. This creates a portable, immutable audit trail of competence and ensures full transparency for institutional participants.",
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
