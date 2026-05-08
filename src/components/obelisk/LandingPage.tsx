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

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ clipPath: "inset(0 100% 0 0)" }}
    whileInView={{ clipPath: "inset(0 0% 0 0)" }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{ position: 'relative' }}
  >
    {children}
  </motion.div>
);

// ─── Navigation ───────────────────────────────────────────────────────────────

function NavBar({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Dashboard", "Protocol", "Features", "Archetypes"];

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
            Obelisk Q
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
          <Reveal>
            <MagneticText text="Autonomous Investment" />
          </Reveal>
          <Reveal delay={0.2}>
            <MagneticText text="Intelligence on Mantle." />
          </Reveal>
        </div>
        <p className="landing-hero-sub">
          The first autonomous wealth navigator optimized for Mantle Mainnet.
          <br />
          Experience automated yields from mETH and USDY through a verified multi-agent LangGraph architecture.
        </p>
        <div className="landing-hero-actions">
          <button onClick={onLaunch} className="landing-hero-cta">
            Launch App
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

function ProtocolSection() {
  return (
    <section className="landing-section" id="protocol">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <Reveal>
          <span className="landing-section-label">ANTIGRAVITY PROTOCOL</span>
        </Reveal>
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <Reveal delay={0.1}>
            <MagneticText text="High-availability" />
          </Reveal>
          <Reveal delay={0.2}>
            <MagneticText text="agent resilience" />
          </Reveal>
        </div>
        <p className="landing-section-desc">
          Obelisk Q uses the Antigravity Protocol to ensure 100% uptime and deterministic rebalancing through verified cross-token unwind logic on Mantle Mainnet.
        </p>
        <ul className="landing-bullet-list">
          <li><span className="landing-bullet" /> multi-agent supervisor (analyst, risk, tracker, executor)</li>
          <li><span className="landing-bullet" /> verified swapExactNativeForTokens DEX integration</li>
          <li><span className="landing-bullet" /> automatic cross-token switching (mETH ↔ USDY)</li>
        </ul>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      num: "01",
      title: "AI-Managed",
      desc: "Dynamic market adaptation using Hidden Markov Models. The engine classifies regimes—Expansion, Consolidation, or Contraction—and adjusts allocations automatically.",
      tags: ["HMM", "Regime Detection", "Autonomous"],
    },
    {
      num: "02",
      title: "Real Yield",
      desc: "Access institutional-grade yields from tokenized US Treasuries (USDY) and liquid-staked ETH (mETH) on Mantle Network.",
      tags: ["USDY", "mETH", "Mantle"],
    },
    {
      num: "03",
      title: "Liquid Buffer",
      desc: "Optimized gas management with a fixed 0.01 MNT buffer. The engine ensures the vault always remains liquid and ready for rebalancing without external intervention.",
      tags: ["Gas Optimized", "Liquid", "Verified"],
    },
    {
      num: "04",
      title: "Mantle Mainnet",
      desc: "Fully operational at 0xfEDA...1389. Orchestrated rebalancing with Merchant Moe to capture deep liquidity and institutional RWA spreads.",
      tags: ["Mainnet", "Verified", "Merchant Moe"],
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
        <Reveal>
          <span className="landing-section-label">PROTOCOL FEATURES</span>
        </Reveal>
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <Reveal delay={0.1}>
            <MagneticText text="Intelligence meets" />
          </Reveal>
          <Reveal delay={0.2}>
            <MagneticText text="infrastructure" />
          </Reveal>
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
      num: "01",
      headline: "You have capital sitting idle",
      body: "Maximize your Mantle assets. The AI agent automatically rebalances your MNT into USDY and mETH to capture real yield from US Treasuries and staked ETH.",
      tag: "Passive investor",
    },
    {
      id: "defi",
      num: "02",
      headline: "You want yield without the complexity",
      body: "No need to monitor pools, manage positions, or time the market. Obelisk Q's confidence scoring engine handles allocation decisions based on real-time on-chain signals.",
      tag: "DeFi participant",
    },
    {
      id: "inst",
      num: "03",
      headline: "You need compliant RWA exposure",
      body: "USDY is a regulated instrument backed by short-term US Treasuries. Full on-chain transparency, automated risk management, and non-custodial architecture.",
      tag: "Institutional",
    },
  ];

  return (
    <section className="landing-section" id="archetypes">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <Reveal>
          <span className="landing-section-label">ARCHETYPES</span>
        </Reveal>
        <div className="landing-section-heading" style={{ fontWeight: 700 }}>
          <Reveal delay={0.1}>
            <MagneticText text="Built for" />
          </Reveal>
        </div>
      </motion.div>

      <div className="landing-features-grid">
        {profiles.map((p, i) => (
          <motion.div
            key={p.id}
            className="landing-feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="landing-feature-num">{p.num}</span>
            <div className="landing-feature-title" style={{ fontWeight: 600 }}>
              <MagneticText text={p.headline} />
            </div>
            <p className="landing-feature-desc">{p.body}</p>
            <div className="landing-tags">
              <span className="landing-tag">{p.tag}</span>
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



function Footer() {
  const linkGroups = [
    { title: "", links: [
      { name: "Dashboard", href: "#dashboard" },
      { name: "Protocol", href: "#protocol" },
      { name: "Features", href: "#features" }
    ]},
    { title: "", links: [
      { name: "Docs", href: "/docs", external: false },
      { name: "GitHub", href: "https://github.com/samixrd/Obelisk-Q", external: true },
      { name: "X", href: "https://x.com/ObeliskQAi", external: true }
    ]},
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
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="landing-footer-link"
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.name}
                </a>
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
      <ProtocolSection />
      <FeaturesSection />
      <BuiltForSection />
      <Footer />
    </motion.div>
  );
}
