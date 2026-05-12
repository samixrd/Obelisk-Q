/**
 * Obelisk Q — Premium Landing Page
 * Autonomous Investment Intelligence on Mantle
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import "./LandingPage.css";

// ─── Shared Components ────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background">
          <span className="material-symbols-outlined font-bold">api</span>
        </div>
        <span className="text-xl font-black tracking-tighter text-white">OBELISK Q</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="text-[11px] font-bold text-white/50 hover:text-primary transition-all uppercase tracking-widest"
          >
            {item}
          </a>
        ))}
      </nav>

      <button onClick={onLaunch} className="btn-primary py-2.5 px-6 text-[12px]">
        Launch App
      </button>
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="hero-section relative overflow-hidden" id="dashboard">
      <motion.div style={{ y, opacity }} className="z-10">
        <Reveal>
          <span className="tag mb-4">Mantle Mainnet Optimized</span>
          <h1 className="hero-title text-gradient">
            Autonomous Investment <br/>
            <span className="text-neon">Intelligence on Mantle.</span>
          </h1>
        </Reveal>
        
        <Reveal delay={0.2}>
          <p className="hero-subtitle">
            The first autonomous wealth navigator optimized for Mantle Mainnet. 
            Experience automated yields from mETH and USDY through a verified 5-node LangGraph swarm with real-time protection.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button onClick={onLaunch} className="btn-primary group">
              Launch Dashboard
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 font-black px-10 py-5 rounded-full text-[11px] uppercase tracking-widest transition-all">
              Read Docs
            </button>
          </div>
        </Reveal>
      </motion.div>

      {/* Hero Stats */}
      <div className="mt-24 w-full max-w-5xl px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "5-Node", sub: "LangGraph Swarm", icon: "hub" },
            { label: "100%", sub: "Uptime Goal", icon: "verified" },
            { label: "Real-time", sub: "Telemetry", icon: "analytics" },
          ].map((stat, i) => (
            <Reveal key={i} delay={0.6 + i * 0.1}>
              <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center group">
                <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors mb-4 text-3xl">
                  {stat.icon}
                </span>
                <span className="text-4xl font-black text-white mb-2">{stat.label}</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.sub}</span>
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
    <section className="section-container bg-white/[0.02]" id="protocol">
      <div className="flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 text-left">
          <Reveal>
            <span className="tag">Antigravity Protocol</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
              High-availability <br/><span className="text-primary">agent resilience</span>
            </h2>
            <p className="text-lg text-white/60 mb-10 leading-relaxed">
              Obelisk Q uses the Antigravity Protocol to ensure 100% uptime and deterministic rebalancing through verified cross-token unwind logic on Mantle Mainnet.
            </p>
            <div className="space-y-6">
              {[
                "5-node LangGraph swarm (regime, risk, score, telemetry, supervisor)",
                "autonomous circuit breaker (halts allocation on volatility)",
                "real-time telemetry synchronization (10s dashboard polling)"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        
        <div className="flex-1 w-full">
          <Reveal delay={0.2}>
            <div className="glass-card p-10 rounded-[3rem] border-2 border-primary/20 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Agent Swarm Health</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Live Network Telemetry</p>
                  </div>
                  <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black text-primary uppercase">Stable</span>
                  </div>
                </div>

                <div className="telemetry-grid mb-10">
                  {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, i) => (
                    <div key={i} className="telemetry-bar">
                      <div className="telemetry-fill" style={{ animationDelay: `${delay}s`, animationDuration: `${1.5 + Math.random()}s` }}></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                  <div>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block mb-1">Latency</span>
                    <span className="text-xl font-bold text-white">142ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block mb-1">Active Nodes</span>
                    <span className="text-xl font-bold text-white">5 / 5</span>
                  </div>
                </div>
              </div>
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
    { num: "01", title: "AI-Managed", desc: "Dynamic market adaptation using Hidden Markov Models. The engine classifies regimes and adjusts allocations automatically.", tags: ["HMM", "Autonomous"], icon: "smart_toy" },
    { num: "02", title: "Real Yield", desc: "Access institutional-grade yields from tokenized US Treasuries (USDY) and liquid-staked ETH (mETH) on Mantle Network.", tags: ["USDY", "mETH"], icon: "account_balance" },
    { num: "03", title: "Circuit Breaker", desc: "Instant safety halt if market confidence (Q-Score) drops 5+ points in 60 min. Protects capital during rapid shifts.", tags: ["Safety", "Verified"], icon: "lock" }
  ];

  return (
    <section className="section-container" id="features">
      <Reveal>
        <div className="text-center mb-20">
          <span className="tag">Protocol Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Intelligence meets <span className="text-white/30">infrastructure</span>
          </h2>
        </div>
      </Reveal>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col group hover:bg-white/[0.04] transition-all duration-500">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors text-xl">
                  {f.icon}
                </span>
              </div>
              <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tightest">{f.title}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed mb-8 flex-grow font-bold uppercase tracking-wide">{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/30 uppercase tracking-widest group-hover:border-primary/20 transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
        
        {/* Mantle Specific Card */}
        <Reveal delay={0.4}>
          <div className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col group border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-500">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xl">
                account_tree
              </span>
            </div>
            <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tightest">Mantle Mainnet</h3>
            <p className="text-white/40 text-[13px] leading-relaxed mb-8 flex-grow font-bold uppercase tracking-wide">
              Fully operational at <span className="text-primary/60">0x0f43...eaFa</span>. Orchestrated rebalancing with <span className="text-white/80">Merchant Moe</span> to capture deep liquidity.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                Mainnet
              </span>
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                Verified
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Archetypes Section ───────────────────────────────────────────────────────

function ArchetypesSection() {
  const archetypes = [
    { title: "Idle Capital", desc: "Maximize your Mantle assets. The AI agent automatically rebalances MNT into USDY and mETH yields.", tag: "Passive investor", icon: "savings" },
    { title: "Yield Simplified", desc: "No need to monitor pools. Obelisk Q handles allocation decisions autonomously based on market data.", tag: "DeFi participant", icon: "bolt" },
    { title: "RWA Exposure", desc: "USDY is a regulated instrument backed by short-term US Treasuries. Fully transparent and non-custodial.", tag: "Institutional", icon: "account_balance" }
  ];

  return (
    <section className="section-container bg-white/[0.02]" id="archetypes">
      <Reveal>
        <div className="text-center mb-20">
          <span className="tag">User Archetypes</span>
          <h2 className="text-4xl md:text-5xl font-black text-white">Built for <span className="text-primary">everyone</span></h2>
        </div>
      </Reveal>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {archetypes.map((a, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass-card p-10 rounded-[2.5rem] text-center group">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {a.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{a.title}</h3>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">{a.desc}</p>
              <span className="inline-block px-5 py-2 bg-primary text-background rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
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
    <section className="section-container">
      <Reveal>
        <div className="bg-primary rounded-[4rem] p-16 md:p-28 flex flex-col md:flex-row items-center gap-20 overflow-hidden relative group">
          {/* Animated Background Decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-background/20 blur-[80px] rounded-full -ml-32 -mb-32 group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex-1 z-10 text-left">
            <h2 className="text-5xl md:text-7xl font-black text-background mb-8 leading-[0.95] tracking-tighter">
              Autonomous wealth <br/>intelligence.
            </h2>
            <p className="text-xl text-background/70 mb-12 max-w-lg font-medium leading-relaxed">
              Join the first autonomous investment swarm on Mantle. Secure, verified, and high-performance.
            </p>
            <button onClick={onLaunch} className="bg-background text-primary px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl">
              Launch App
            </button>
          </div>
          
          <div className="flex-1 hidden md:flex justify-end z-10">
            <div className="w-64 h-64 border-8 border-background/10 rounded-[3rem] rotate-12 flex items-center justify-center group-hover:rotate-45 transition-transform duration-1000">
               <span className="material-symbols-outlined text-8xl text-background/20">api</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="w-full py-20 px-10 border-t border-white/5 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background">
                <span className="material-symbols-outlined text-sm font-bold">api</span>
              </div>
              <span className="text-lg font-black tracking-tighter text-white">OBELISK Q</span>
            </div>
            <p className="text-[11px] font-bold text-white/30 max-w-xs uppercase tracking-[0.2em] leading-loose">
              Autonomous investment intelligence optimized for Mantle Mainnet. Built on the Antigravity Protocol.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20 text-left">
            {[
              { title: "Platform", links: ["Dashboard", "Protocol", "Features"] },
              { title: "Resources", links: ["Docs", "GitHub", "X"] },
              { title: "Legal", links: ["Terms", "Privacy"] }
            ].map((col, i) => (
              <div key={i} className="flex flex-col gap-6">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{col.title}</span>
                {col.links.map(link => (
                  <a key={link} className="text-[11px] text-white/50 hover:text-primary transition-colors font-bold uppercase tracking-widest" href="#">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
          <p>© 2026 Obelisk Q. Mantle Mainnet - ERC-8004 Sovereign Identity.</p>
          <p className="text-primary/40">Antigravity Protocol Verified</p>
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
      {/* Background System */}
      <div className="bg-mesh" />
      <div className="grid-overlay" />
      
      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {[
          { char: "Σ", top: "10%", left: "5%", size: "text-6xl", delay: "0s" },
          { char: "λ", top: "20%", right: "10%", size: "text-4xl", delay: "-2s" },
          { char: "Δ", bottom: "15%", left: "15%", size: "text-5xl", delay: "-5s" },
          { char: "π", bottom: "25%", right: "20%", size: "text-3xl", delay: "-7s" },
          { char: "∞", top: "50%", left: "50%", size: "text-8xl", delay: "-3s" },
        ].map((s, i) => (
          <span 
            key={i}
            className={`absolute ${s.size} text-white opacity-[0.03] font-mono floating`}
            style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, animationDelay: s.delay }}
          >
            {s.char}
          </span>
        ))}
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
