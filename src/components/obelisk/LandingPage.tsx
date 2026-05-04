/**
 * LandingPage — Agent Layer-inspired clean minimal design
 * Features:
 *  - Light/white background with blue viewport edge glow
 *  - Massive bold typography
 *  - Clean navigation bar
 *  - Sectioned content layout
 *  - Floating math symbols background
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "./LandingPage.css";

// ─── Floating Symbols ─────────────────────────────────────────────────────────

const SYMBOLS = ["+", "−", "=", "~", "×", "÷", "∑", "∞", "Δ", "π", "√", "∫"];

function FloatingSymbols() {
  const [symbols] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      char: SYMBOLS[i % SYMBOLS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 22,
      opacity: 0.04 + Math.random() * 0.06,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * -20,
    }))
  );

  return (
    <div className="landing-symbols" aria-hidden>
      {symbols.map((s, i) => (
        <span
          key={i}
          className="landing-symbol"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function NavBar({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Wallet", "Dashboard", "Features", "About"];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="landing-nav"
      style={{
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        background: scrolled ? "rgba(245,245,248,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <div className="landing-nav-inner">
        <div className="landing-nav-left">
          <span className="landing-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 4,24 24,24" stroke="#000" strokeWidth="1.8" fill="none" />
              <line x1="14" y1="8" x2="14" y2="20" stroke="#000" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="landing-brand">
            Obelisk Q <span className="landing-beta">β</span>
          </span>
        </div>

        <div className="landing-nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="landing-nav-link">
              {item}
            </a>
          ))}
        </div>

        <button onClick={onLaunch} className="landing-launch-btn">
          Launch App
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 6 }}>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="landing-hero" id="dashboard">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="landing-hero-content"
      >
        <h1 className="landing-hero-heading">
          Autonomous wealth
          <br />
          for the AI agents era.
        </h1>
        <p className="landing-hero-sub">
          Secure wallet infrastructure for autonomous investments.
          <br />
          Get pure finance, blockchain, and DeFi data. Built on Mantle Network with ERC-8004 protocol.
        </p>
        <div className="landing-hero-actions">
          <button onClick={onLaunch} className="landing-hero-cta">
            Enter Dashboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
              <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a href="#features" className="landing-hero-link">Learn more</a>
        </div>
      </motion.div>
    </section>
  );
}

function WalletSection() {
  return (
    <section className="landing-section" id="wallet">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="landing-section-label">WALLET</span>
        <h2 className="landing-section-heading">
          A local wallet runtime
          <br />
          for autonomous agents
        </h2>
        <p className="landing-section-desc">
          Obelisk Q Wallet gives autonomous agents a hardened execution layer for Mantle.
        </p>
        <ul className="landing-bullet-list">
          <li><span className="landing-bullet" /> local runtime for balances, swaps and staking</li>
          <li><span className="landing-bullet" /> non-custodial key management with ERC-8004</li>
          <li><span className="landing-bullet" /> real-time stability scoring engine</li>
        </ul>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      num: "01",
      title: "Q-Score Engine",
      desc: "Real-time stability scoring powered by multi-factor analysis. Yield, volatility, drawdown and momentum — combined into one decision metric.",
      tags: ["Stability", "Real-time", "ERC-8004"],
    },
    {
      num: "02",
      title: "Autonomous Rebalancing",
      desc: "AI-driven portfolio optimization that adapts to market conditions. Conservative in chaos, ambitious in calm — automatically.",
      tags: ["AI Agent", "Adaptive", "On-chain"],
    },
    {
      num: "03",
      title: "Mantle Native",
      desc: "Built natively on Mantle L2 for ultra-low fees and lightning execution. Every transaction is verifiable, every strategy transparent.",
      tags: ["Mantle L2", "Low fees", "Transparent"],
    },
  ];

  return (
    <section className="landing-section" id="features">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="landing-section-label">FEATURES</span>
        <h2 className="landing-section-heading">
          Intelligence meets
          <br />
          infrastructure
        </h2>
      </motion.div>

      <div className="landing-features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.num}
            className="landing-feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="landing-feature-num">{f.num}</span>
            <h3 className="landing-feature-title">{f.title}</h3>
            <p className="landing-feature-desc">{f.desc}</p>
            <div className="landing-tags">
              {f.tags.map((tag) => (
                <span key={tag} className="landing-tag">{tag}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const linkGroups = [
    { title: "", links: ["Wallet", "Dashboard", "Features"] },
    { title: "", links: ["Docs", "GitHub", "Blog"] },
  ];

  return (
    <footer className="landing-footer">
      <div className="landing-footer-big-text" aria-hidden>
        <span>autonomous</span>
        <span>wealth intelligence</span>
      </div>

      <div className="landing-footer-inner">
        <div className="landing-footer-left">
          <span className="landing-footer-brand">Obelisk Q</span>
        </div>
        <div className="landing-footer-links">
          {linkGroups.map((group, gi) => (
            <div key={gi} className="landing-footer-col">
              {group.links.map((link) => (
                <a key={link} href="#" className="landing-footer-link">{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="landing-footer-right">
          <span className="landing-footer-legal">About Obelisk Q</span>
          <span className="landing-footer-legal">Terms</span>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <span className="landing-footer-ca">
          CA: 0x...Mantle · ERC-8004 Protocol
        </span>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <motion.div
      className="landing-root"
      exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }}
    >
      {/* Blue viewport glow border */}
      <div className="landing-glow-border" aria-hidden />

      {/* Floating math symbols */}
      <FloatingSymbols />

      {/* Navigation */}
      <NavBar onLaunch={onEnter} />

      {/* Content */}
      <HeroSection onLaunch={onEnter} />
      <WalletSection />
      <FeaturesSection />
      <Footer />
    </motion.div>
  );
}
