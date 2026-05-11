/**
 * LandingPage — Neon Green / Dark Navy Cyber Aesthetic
 */

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { Link } from "react-router-dom";
import "./LandingPage.css";

// ─── Components ───────────────────────────────────────────────────────────────

function RevealWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} reveal ${isVisible ? "active" : ""}`}>
      {children}
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

  const navItems = ["Dashboard", "Protocol", "Features", "Archetypes"];

  return (
    <header className={`landing-nav animate-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="flex items-center gap-2 font-bold text-primary">
        Obelisk Q
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="text-[12px] font-medium text-primary/70 hover:text-primary transition-colors uppercase tracking-wider">
            {item}
          </a>
        ))}
      </nav>

      <button onClick={onLaunch} className="bg-primary text-background px-6 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-transform hover:shadow-lg">
        Launch App
      </button>
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="landing-hero" id="dashboard">
      <div className="animate-fade-up">
        <h1 className="landing-hero-heading animate-wipe">
          Autonomous Investment <br/>
          <span className="opacity-60">Intelligence on Mantle.</span>
        </h1>
        <p className="landing-hero-sub">
          The first autonomous wealth navigator optimized for Mantle Mainnet. 
          Experience automated yields from mETH and USDY through a verified 5-node LangGraph swarm with real-time protection.
        </p>
        <div className="flex justify-center">
          <button onClick={onLaunch} className="bg-primary text-background px-8 py-4 rounded-full text-[13px] font-bold hover:scale-[1.05] active:scale-95 transition-all shadow-xl">
            Launch App
          </button>
        </div>
      </div>

      <div className="mt-20 w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "5-Node", sub: "LangGraph Swarm" },
            { label: "100%", sub: "Uptime Goal" },
            { label: "Real-time", sub: "Telemetry" },
          ].map((stat, i) => (
            <div key={i} className="bg-primary/5 backdrop-blur-md p-6 rounded-2xl border border-primary/10 flex flex-col items-center hover:bg-primary/10 transition-colors group">
              <span className="text-primary text-[32px] font-bold mb-2 transition-transform group-hover:scale-110">{stat.label}</span>
              <span className="text-[11px] font-bold text-primary/70 uppercase tracking-widest">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Resilience Section ───────────────────────────────────────────────────────

function ResilienceSection() {
  return (
    <RevealWrapper className="landing-section bg-primary/5 backdrop-blur-sm border-y border-primary/10">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 text-left">
          <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Antigravity Protocol</div>
          <h2 className="text-[36px] md:text-[48px] font-bold text-primary leading-tight mb-6">High-availability agent resilience</h2>
          <p className="text-[16px] text-primary/70 mb-8">Obelisk Q uses the Antigravity Protocol to ensure 100% uptime and deterministic rebalancing through verified cross-token unwind logic on Mantle Mainnet.</p>
          <ul className="space-y-4">
            {[
              "5-node LangGraph swarm (regime, risk, score, telemetry, supervisor)",
              "autonomous circuit breaker (halts allocation on volatility)",
              "real-time telemetry synchronization (10s dashboard polling)"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-[14px] font-medium text-primary">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1 w-full bg-primary rounded-[2.5rem] p-10 border-2 border-primary shadow-2xl">
          <div className="space-y-8">
            <div className="flex justify-between items-center text-background font-bold text-[14px]">
              <span>Agent Network Health</span>
              <span className="text-[10px] uppercase bg-background text-primary px-3 py-1 rounded-full">Stable</span>
            </div>
            <div className="grid grid-cols-5 gap-3 h-32">
              {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, i) => (
                <div key={i} className="h-full w-full bg-background/10 rounded-xl flex items-end overflow-hidden p-1">
                  <div className="telemetry-bar-inner" style={{ animationDelay: `${delay}s`, animationDuration: `${1.5 + Math.random()}s` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-background/10 pt-4">
              <div className="text-[11px] text-background/60 uppercase font-bold tracking-wider">Swarm Latency: 142ms</div>
              <div className="text-[11px] text-background/60 uppercase font-bold tracking-wider">Nodes Active: 5/5</div>
            </div>
          </div>
        </div>
      </div>
    </RevealWrapper>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    { num: "01", title: "AI-Managed", desc: "Dynamic market adaptation using Hidden Markov Models. The engine classifies regimes and adjusts allocations automatically.", tags: ["HMM", "Autonomous"] },
    { num: "02", title: "Real Yield", desc: "Access institutional-grade yields from tokenized US Treasuries (USDY) and liquid-staked ETH (mETH) on Mantle Network.", tags: ["USDY", "mETH"] },
    { num: "03", title: "Circuit Breaker", desc: "Instant safety halt if market confidence (Q-Score) drops 5+ points in 60 min. Protects capital during rapid regime shifts.", tags: ["Safety", "Verified"] }
  ];

  return (
    <RevealWrapper className="landing-section">
      <div className="text-center mb-16">
        <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Protocol Features</div>
        <h2 className="text-[36px] md:text-[48px] font-bold text-primary">Intelligence meets <span className="opacity-40">infrastructure</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="group bg-primary/5 backdrop-blur-sm border border-primary/10 p-10 rounded-3xl flex flex-col hover:bg-primary/10 transition-all hover:border-primary hover:-translate-y-2 text-left">
            <div className="text-[12px] text-primary/40 font-mono mb-4">{f.num}</div>
            <h3 className="text-[20px] font-bold mb-4 text-primary">{f.title}</h3>
            <p className="text-[14px] text-primary/70 mb-8">{f.desc}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {f.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </RevealWrapper>
  );
}

// ─── Archetypes Section ───────────────────────────────────────────────────────

function ArchetypesSection() {
  const archetypes = [
    { num: "01", title: "You have capital sitting idle", desc: "Maximize your Mantle assets. The AI agent automatically rebalances your MNT into USDY and mETH.", tag: "Passive investor" },
    { num: "02", title: "You want yield without complexity", desc: "No need to monitor pools or manage positions. Obelisk Q handles allocation decisions autonomously.", tag: "DeFi participant" },
    { num: "03", title: "You need compliant RWA exposure", desc: "USDY is a regulated instrument backed by short-term US Treasuries. Full transparency and non-custodial.", tag: "Institutional" }
  ];

  return (
    <RevealWrapper className="landing-section bg-primary/5">
      <div className="text-center mb-16">
        <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4">Archetypes</div>
        <h2 className="text-[36px] md:text-[48px] font-bold text-primary">Built for</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {archetypes.map((a, i) => (
          <div key={i} className="p-10 rounded-3xl border border-primary/10 bg-background/50 backdrop-blur-sm hover:bg-background transition-all hover:shadow-xl group text-left">
            <div className="text-[12px] text-primary/40 font-mono mb-4">{a.num}</div>
            <h3 className="text-[20px] font-bold mb-4 text-primary">{a.title}</h3>
            <p className="text-[14px] text-primary/70 mb-8">{a.desc}</p>
            <span className="px-4 py-1.5 bg-primary text-background rounded-full text-[10px] font-bold group-hover:scale-105 transition-transform inline-block uppercase tracking-wider">{a.tag}</span>
          </div>
        ))}
      </div>
    </RevealWrapper>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

function CTASection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <RevealWrapper className="landing-section">
      <div className="bg-primary rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative shadow-2xl text-left">
        <div className="absolute inset-0 bg-gradient-to-tr from-background/10 to-transparent pointer-events-none"></div>
        <div className="flex-1 z-10">
          <h2 className="text-[48px] md:text-[64px] font-bold text-background mb-6 leading-tight">Autonomous wealth intelligence.</h2>
          <p className="text-[18px] text-background/80 mb-10 max-w-lg">
            Join the first autonomous investment swarm on Mantle. Secure, verified, and high-performance.
          </p>
          <button onClick={onLaunch} className="bg-background text-primary px-10 py-5 rounded-full text-[14px] font-bold hover:scale-105 active:scale-95 transition-all shadow-xl">
            Launch App
          </button>
        </div>
        <div className="flex-1 hidden md:flex justify-center z-10">
          {/* Decorative element removed */}
        </div>
      </div>
    </RevealWrapper>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="w-full py-16 px-12 bg-primary/5 backdrop-blur-md border-t border-primary/10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="flex flex-col gap-4 text-left">
            <div className="text-[20px] font-bold text-primary flex items-center gap-2">
              Obelisk Q
            </div>
            <p className="text-[11px] font-bold text-primary/60 max-w-xs uppercase tracking-widest">
              Autonomous investment intelligence optimized for Mantle Mainnet. Built on the Antigravity Protocol.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-left">
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-primary uppercase">Platform</span>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">Dashboard</a>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">Protocol</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-primary uppercase">Resources</span>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">Docs</a>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">GitHub</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-primary uppercase">Legal</span>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">Terms</a>
              <a className="text-[11px] text-primary/60 hover:text-primary transition-colors font-bold uppercase" href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-primary/40 uppercase tracking-widest">
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
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="glass-blob w-[600px] h-[600px] -top-40 -left-40 bg-primary" style={{ animationDuration: '25s', animationDelay: '-2s' }}></div>
        <div className="glass-blob w-[500px] h-[500px] top-1/2 -right-20 bg-primary" style={{ animationDuration: '30s', animationDelay: '-5s' }}></div>
        <div className="glass-blob w-[400px] h-[400px] bottom-0 left-1/4 bg-primary" style={{ animationDuration: '22s', animationDelay: '-10s' }}></div>
        
        {/* Floating Math Symbols */}
        <span className="floating-symbol text-6xl top-[10%] left-[5%]">Σ</span>
        <span className="floating-symbol text-4xl top-[20%] right-[10%]" style={{ animationDelay: '-2s' }}>λ</span>
        <span className="floating-symbol text-5xl bottom-[15%] left-[15%]" style={{ animationDelay: '-5s' }}>Δ</span>
        <span className="floating-symbol text-3xl bottom-[25%] right-[20%]" style={{ animationDelay: '-7s' }}>π</span>
        <span className="floating-symbol text-7xl top-1/2 left-1/2" style={{ animationDelay: '-3s' }}>∞</span>
      </div>

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
