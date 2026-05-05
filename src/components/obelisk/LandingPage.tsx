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
import { Logo } from "./Logo";
import "./LandingPage.css";

import { FloatingSymbols } from "./FloatingSymbols";

// ─── Navigation ───────────────────────────────────────────────────────────────

function NavBar({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Dashboard", "Wallet", "Features", "About"];

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
            <Logo size={32} />
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

import { MagneticText } from "./MagneticText";

// ─── Section Components ───────────────────────────────────────────────────────

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
        <div className="landing-hero-heading" style={{ fontWeight: 700 }}>
          <MagneticText text="Multi-agent wealth" />
          <MagneticText text="orchestrated by AI." />
        </div>
        <p className="landing-hero-sub">
          The first autonomous RWA navigator powered by the Antigravity Protocol.
          <br />
          Multi-agent LangGraph architecture on Mantle Network with ERC-8004 identity.
        </p>
        <div className="landing-hero-actions">
          <button onClick={onLaunch} className="landing-hero-cta">
            Enter Dashboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
              <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a href="#features" className="landing-hero-link">Engine logic</a>
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
        <span className="landing-section-label">ANTIGRAVITY PROTOCOL</span>
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <MagneticText text="High-availability" />
          <MagneticText text="agent resilience" />
        </div>
        <p className="landing-section-desc">
          Obelisk Q uses the Antigravity Protocol to ensure 100% uptime through 500ms agent timeouts and state-bypass logic.
        </p>
        <ul className="landing-bullet-list">
          <li><span className="landing-bullet" /> multi-agent supervisor (analyst, risk, tracker)</li>
          <li><span className="landing-bullet" /> sovereign agent identity with erc-8004</li>
          <li><span className="landing-bullet" /> stateless 0% local disk execution on azure cloud</li>
        </ul>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      num: "01",
      title: "Regime Switching Model",
      desc: "Dynamic market adaptation using Hidden Markov Models. The engine classifies regimes—Expansion, Consolidation, or Contraction—and adjusts control transfer functions with built-in hysteresis to prevent rapid switching.",
      tags: ["HMM", "Regime Detection", "Hysteresis"],
    },
    {
      num: "02",
      title: "LangGraph Orchestration",
      desc: "Specialized agents for RWA analysis and risk management coordinated by a central supervisor. High-frequency reasoning with Azure GPT-4o.",
      tags: ["Multi-Agent", "LangGraph", "Azure AI"],
    },
    {
      num: "03",
      title: "ERC-8004 Identity",
      desc: "Trustless on-chain reputation and identity. Every decision is verifiable, creating a portable audit trail of agent competence on Mantle.",
      tags: ["ERC-8004", "Identity", "Transparent"],
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
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <MagneticText text="Intelligence meets" />
          <MagneticText text="infrastructure" />
        </div>
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
            <div className="landing-feature-title" style={{ fontWeight: 600 }}>
              <MagneticText text={f.title} />
            </div>
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

function BuiltForSection() {
  const profiles = [
    {
      id: "idle",
      icon: <TriangleIcon />,
      headline: "You have stablecoins sitting idle",
      body: "USDY and mETH generate real yield backed by US Treasuries and staked ETH. The AI agent puts your capital to work automatically — no manual trading required.",
      tag: "Passive investor",
    },
    {
      id: "defi",
      icon: <CircleIcon />,
      headline: "You want yield without the complexity",
      body: "No need to monitor pools, manage positions, or time the market. Obelisk Q's confidence scoring engine handles allocation decisions based on real-time on-chain signals.",
      tag: "DeFi participant",
    },
    {
      id: "inst",
      icon: <SquareIcon />,
      headline: "You need compliant RWA exposure",
      body: "USDY is a regulated instrument backed by short-term US Treasuries. Full on-chain transparency, automated risk management, and non-custodial architecture.",
      tag: "Institutional",
    },
  ];

  return (
    <section className="landing-section" id="built-for">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="landing-section-label">USER PROFILES</span>
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <MagneticText text="Built for" />
        </div>
      </motion.div>

      <div className="landing-profiles-grid">
        {profiles.map((p, i) => (
          <motion.div
            key={p.id}
            className="landing-profile-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-profile-icon">{p.icon}</div>
            <div className="landing-profile-headline" style={{ fontWeight: 600 }}>
              <MagneticText text={p.headline} />
            </div>
            <p className="landing-profile-body">{p.body}</p>
            <div className="mt-auto pt-6">
              <span className="landing-profile-tag">{p.tag}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="landing-built-bottom"
      >
        "Non-custodial · No minimum deposit · Withdraw anytime · Built on Mantle Network"
      </motion.div>
    </section>
  );
}

function TriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4L4 20H20L12 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Footer() {
  const linkGroups = [
    { title: "", links: ["Dashboard", "Wallet", "Features"] },
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
          <div className="flex items-center gap-3">
            <Logo size={24} className="text-foreground" />
            <span className="landing-footer-brand">Obelisk Q</span>
          </div>
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
          Mantle Network · ERC-8004 Sovereign Identity · Antigravity Protocol
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
      <BuiltForSection />
      <Footer />
    </motion.div>
  );
}
