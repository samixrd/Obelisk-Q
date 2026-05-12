/**
 * Obelisk Q — Neo-Brutalist Landing Page
 * Aesthetic: Lime Background / Bold Black Typography
 * Synchronized with Stitch Design
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "./LandingPage.css";

// ─── Shared Components ────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
    >
      {children}
    </motion.div>
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

  const navItems = ["Dashboard", "Protocol", "Features", "Archetypes"];

  return (
    <header className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="flex items-center gap-2 text-[#0b1421] font-black text-xl tracking-tighter">
        <span className="material-symbols-outlined font-bold">api</span>
        OBELISK Q
      </div>
      
      <nav className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="text-[11px] font-black text-[#0b1421]/60 hover:text-[#0b1421] transition-all uppercase tracking-widest"
          >
            {item}
          </a>
        ))}
      </nav>

      <button 
        onClick={onLaunch} 
        className="bg-[#0b1421] text-[#e1ff51] px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
      >
        Launch App
      </button>
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="hero-section" id="dashboard">
      <Reveal>
        <h1 className="hero-title-light">
          Autonomous Investment <br/>
          <span className="opacity-60">Intelligence on Mantle.</span>
        </h1>
        
        <p className="hero-subtitle-light">
          The first autonomous wealth navigator optimized for Mantle Mainnet. 
          Experience automated yields from mETH and USDY through a verified 5-node LangGraph swarm with real-time protection.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button onClick={onLaunch} className="btn-primary-black">
            Launch App
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </Reveal>

      {/* Hero Stats */}
      <div className="mt-24 w-full max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "5-Node", sub: "LangGraph Swarm" },
            { label: "100%", sub: "Uptime Goal" },
            { label: "Real-time", sub: "Telemetry" },
          ].map((stat, i) => (
            <Reveal key={i} delay={0.2 + i * 0.1}>
              <div className="glass-card p-10 rounded-[2rem] flex flex-col items-center">
                <span className="text-4xl font-black text-[#0b1421] mb-2">{stat.label}</span>
                <span className="text-[10px] font-black text-[#0b1421]/40 uppercase tracking-[0.25em]">{stat.sub}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Resilience Section ───────────────────────────────────────────────────────

function ResilienceSection() {
  return (
    <section className="section-container-light bg-black/[0.02] border-y border-black/[0.05]" id="protocol">
      <div className="flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 text-left">
          <Reveal>
            <span className="tag-light">Antigravity Protocol</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0b1421] leading-tight mb-8">
              High-availability <br/>agent resilience
            </h2>
            <p className="text-lg text-[#0b1421]/70 mb-10 leading-relaxed font-medium">
              Obelisk Q uses the Antigravity Protocol to ensure 100% uptime and deterministic rebalancing through verified cross-token unwind logic on Mantle Mainnet.
            </p>
            <ul className="space-y-5">
              {[
                "5-node LangGraph swarm (regime, risk, score, telemetry, supervisor)",
                "autonomous circuit breaker (halts allocation on volatility)",
                "real-time telemetry synchronization (10s dashboard polling)"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-black text-[#0b1421] uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-[#0b1421]"></div>
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        
        <div className="flex-1 w-full">
          <Reveal delay={0.2}>
            <div className="bg-[#0b1421] p-10 rounded-[3rem] shadow-2xl border-2 border-black">
              <div className="flex justify-between items-center mb-10">
                <span className="text-sm font-black text-[#e1ff51] uppercase tracking-widest">Agent Network Health</span>
                <span className="px-3 py-1 bg-[#e1ff51] text-[#0b1421] rounded-full text-[9px] font-black uppercase">Stable</span>
              </div>
              
              <div className="grid grid-cols-5 gap-3 h-24 mb-10">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="telemetry-bar bg-white/10">
                    <div className="telemetry-fill bg-[#e1ff51]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  </div>
                ))}
              </div>
              
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Swarm Latency: 142ms</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    { num: "01", title: "AI-Managed", desc: "Dynamic market adaptation using Hidden Markov Models. The engine classifies regimes—Expansion, Consolidation, or Contraction—and adjusts allocations automatically.", tags: ["HMM", "Regime Detection", "Autonomous"] },
    { num: "02", title: "Real Yield", desc: "Access institutional-grade yields from tokenized US Treasuries (USDY) and liquid-staked ETH (mETH) on Mantle Network.", tags: ["USDY", "mETH", "Mantle"] },
    { num: "03", title: "Circuit Breaker", desc: "Instant safety halt if market confidence (Q-Score) drops 5+ points in 60 min. Protects capital during rapid regime shifts.", tags: ["Safety", "Volatility", "Verified"] },
    { num: "04", title: "Mantle Mainnet", desc: "Fully operational at 0x0f43...eaFa. Orchestrated rebalancing with Merchant Moe to capture deep liquidity.", tags: ["Mainnet", "Verified", "Merchant Moe"] }
  ];

  return (
    <section className="section-container-light" id="features">
      <Reveal>
        <div className="text-center mb-20">
          <span className="tag-light">Protocol Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0b1421]">
            Intelligence meets <span className="opacity-30">infrastructure</span>
          </h2>
        </div>
      </Reveal>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col hover:bg-white/20 transition-all">
              <div className="text-[10px] font-black text-[#0b1421]/20 mb-6 font-mono tracking-widest">{f.num}</div>
              <h3 className="text-xl font-black mb-4 text-[#0b1421] uppercase tracking-tighter">{f.title}</h3>
              <p className="text-[#0b1421]/60 text-sm leading-relaxed mb-8 flex-grow font-medium">{f.desc}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {f.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#0b1421]/5 border border-black/5 rounded-full text-[9px] font-black text-[#0b1421]/60 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Archetypes Section ───────────────────────────────────────────────────────

function ArchetypesSection() {
  const archetypes = [
    { num: "01", title: "You have capital sitting idle", desc: "Maximize your Mantle assets. The AI agent automatically rebalances your MNT into USDY and mETH yields.", tag: "Passive investor" },
    { num: "02", title: "You want yield without complexity", desc: "No need to monitor pools or time the market. Obelisk Q handles allocation decisions based on real-time signals.", tag: "DeFi participant" },
    { num: "03", title: "You need compliant RWA exposure", desc: "USDY is a regulated instrument backed by short-term US Treasuries. Fully transparent and non-custodial.", tag: "Institutional" }
  ];

  return (
    <section className="section-container-light bg-black/[0.02] border-t border-black/[0.05]" id="archetypes">
      <Reveal>
        <div className="text-center mb-20">
          <span className="tag-light">Archetypes</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0b1421]">Built for</h2>
        </div>
      </Reveal>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {archetypes.map((a, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass-card p-10 rounded-[2.5rem] bg-[#e1ff51]/50 hover:bg-white/40 transition-all">
              <div className="text-[10px] font-black text-[#0b1421]/20 mb-6 font-mono tracking-widest">{a.num}</div>
              <h3 className="text-xl font-black mb-4 text-[#0b1421] uppercase tracking-tighter">{a.title}</h3>
              <p className="text-[#0b1421]/60 text-sm mb-10 leading-relaxed font-medium">{a.desc}</p>
              <span className="px-5 py-2 bg-[#0b1421] text-[#e1ff51] rounded-full text-[9px] font-black uppercase tracking-widest">
                {a.tag}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

function CTASection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="section-container-light">
      <Reveal>
        <div className="bg-[#0b1421] rounded-[3rem] p-16 md:p-24 text-center overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-[#e1ff51] mb-8 leading-tight tracking-tighter uppercase">
              Autonomous wealth <br/>intelligence.
            </h2>
            <p className="text-lg text-white/50 mb-12 max-w-lg mx-auto font-medium leading-relaxed">
              Join the first autonomous investment swarm on Mantle. Secure, verified, and high-performance.
            </p>
            <button 
              onClick={onLaunch} 
              className="bg-[#e1ff51] text-[#0b1421] px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Launch App
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="w-full py-20 px-10 bg-[#e1ff51] border-t border-black/5">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#0b1421] font-black text-xl tracking-tighter">
              <span className="material-symbols-outlined font-bold">api</span>
              OBELISK Q
            </div>
            <p className="text-[10px] font-black text-[#0b1421]/40 max-w-xs uppercase tracking-[0.25em] leading-loose">
              Autonomous investment intelligence optimized for Mantle Mainnet. Built on the Antigravity Protocol.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            {[
              { title: "Platform", links: ["Dashboard", "Protocol", "Features"] },
              { title: "Resources", links: ["Docs", "GitHub", "X"] },
              { title: "Legal", links: ["Terms", "Privacy"] }
            ].map((col, i) => (
              <div key={i} className="flex flex-col gap-6">
                <span className="text-[10px] font-black text-[#0b1421]/20 uppercase tracking-[0.3em]">{col.title}</span>
                {col.links.map(link => (
                  <a key={link} className="text-[11px] text-[#0b1421]/60 hover:text-[#0b1421] transition-colors font-black uppercase tracking-widest" href="#">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black text-[#0b1421]/20 uppercase tracking-[0.4em]">
          <p>© 2026 Obelisk Q. Mantle Mainnet - ERC-8004 Sovereign Identity.</p>
          <p>Antigravity Protocol Verified</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page Root ────────────────────────────────────────────────────────

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="landing-root">
      <div className="bg-circuit" />
      <div className="grid-overlay-light" />
      
      <NavBar onLaunch={onEnter} />

      <main>
        <HeroSection onLaunch={onEnter} />
        <ResilienceSection />
        <FeaturesSection />
        <ArchetypesSection />
        <CTASection onLaunch={onEnter} />
      </main>

      <Footer />
    </div>
  );
}
