/**
 * LandingPage — Cinematic 3D entry. Pure SVG + CSS keyframes. Full physics loop.
 * Features:
 *  - 3D CSS container for continuous rotating/floating movement towards the screen.
 *  - High-res 3D liquid glass torus shape.
 *  - Smooth, straight incoming white beam.
 *  - Smooth, straight rainbow dispersion rays.
 */

import { motion } from "framer-motion";

// ─── Geometry ─────────────────────────────────────────────────────────────────

const APEX  = { x: 400, y:  58 };
const BL    = { x: 144, y: 422 };
const BR    = { x: 656, y: 422 };

// Beam hits the left side of the torus at these coordinates
const HIT_X = 220;
const HIT_Y = 249;

// Rainbow exits the right side of the torus at these coordinates
const EXIT_X = 580;
const EXIT_Y = 249;

// Tight rainbow: ±12° total spread, 7 rays → 4° apart
const RAYS = [
  { color: "#ff1a4e", angleDeg: -12, len: 360, flowSpeed: "2.6s" },
  { color: "#ff6a00", angleDeg:  -8, len: 360, flowSpeed: "2.9s" },
  { color: "#ffe200", angleDeg:  -4, len: 380, flowSpeed: "2.4s" },
  { color: "#44ff66", angleDeg:   0, len: 390, flowSpeed: "3.0s" },
  { color: "#00aaff", angleDeg:   4, len: 375, flowSpeed: "2.7s" },
  { color: "#5533ff", angleDeg:   8, len: 360, flowSpeed: "2.5s" },
  { color: "#cc00ff", angleDeg:  12, len: 355, flowSpeed: "3.1s" },
] as const;

function rayEnd(angleDeg: number, len: number) {
  const r = (angleDeg * Math.PI) / 180;
  return { x: EXIT_X + Math.cos(r) * len, y: EXIT_Y + Math.sin(r) * len };
}

const BEAM_START_X = -50;
const BEAM_LEN = HIT_X - BEAM_START_X; 

// ─── Loop cycle = 6 s ────────────────────────────────────────────────────────
const CYCLE = "6s";

const STYLES = `
  /* ── 3D Container Physics Loop ────────────────────────────── */
  @keyframes physics-float {
    0%   { transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
    25%  { transform: perspective(1200px) rotateX(6deg) rotateY(-5deg) translateZ(50px); }
    50%  { transform: perspective(1200px) rotateX(-4deg) rotateY(6deg) translateZ(120px); }
    75%  { transform: perspective(1200px) rotateX(3deg) rotateY(3deg) translateZ(60px); }
    100% { transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
  }

  .physics-container {
    transform-style: preserve-3d;
    animation: physics-float 16s ease-in-out infinite;
  }

  /* ── BEAM loop ────────────────────────────────────────────── */
  @keyframes beam-loop {
    0%   { stroke-dashoffset: ${BEAM_LEN}; opacity: 0; }
    2%   { stroke-dashoffset: ${BEAM_LEN}; opacity: 1; }
    14%  { stroke-dashoffset: 0;           opacity: 1; }
    20%  { stroke-dashoffset: 0;           opacity: 0; }
    21%  { stroke-dashoffset: ${BEAM_LEN}; opacity: 0; }
    100% { stroke-dashoffset: ${BEAM_LEN}; opacity: 0; }
  }

  /* ── RAINBOW opacity loop ──────────────────────────────────── */
  @keyframes ray-opacity-loop {
    0%   { opacity: 0; }
    20%  { opacity: 0; }
    27%  { opacity: 1; }
    84%  { opacity: 1; }
    96%  { opacity: 0; }
    100% { opacity: 0; }
  }

  /* ── RAINBOW continuous flow — runs at its own speed ──────── */
  @keyframes ray-flow {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -120; }
  }

  /* ── SPARKLE — 8-point burst at hit point ────────────────── */
  @keyframes spark-ring {
    0%   { r: 0;  opacity: 0;    stroke-opacity: 0; }
    16%  { r: 0;  opacity: 0;    stroke-opacity: 0; }
    20%  { r: 6;  opacity: 1;    stroke-opacity: 0.9; }
    30%  { r: 35; opacity: 0;    stroke-opacity: 0; }
    100% { r: 35; opacity: 0;    stroke-opacity: 0; }
  }
  @keyframes spark-ring2 {
    0%   { r: 0;  opacity: 0; }
    17%  { r: 0;  opacity: 0; }
    22%  { r: 12;  opacity: 0.65; }
    32%  { r: 45; opacity: 0; }
    100% { r: 45; opacity: 0; }
  }
  @keyframes spark-ray {
    0%   { stroke-dashoffset: 20; opacity: 0; }
    16%  { stroke-dashoffset: 20; opacity: 0; }
    20%  { stroke-dashoffset: 20; opacity: 1; }
    28%  { stroke-dashoffset: 0;  opacity: 0.9; }
    36%  { stroke-dashoffset: -8; opacity: 0; }
    100% { stroke-dashoffset: -8; opacity: 0; }
  }
  @keyframes spark-dot {
    0%   { opacity: 0; transform: translate(0,0); }
    18%  { opacity: 0; transform: translate(0,0); }
    22%  { opacity: 1; }
    34%  { opacity: 0; }
    100% { opacity: 0; }
  }

  .beam-layer {
    stroke-dasharray: ${BEAM_LEN};
    animation: beam-loop ${CYCLE} cubic-bezier(0.4,0,0.2,1) infinite;
  }
  .ray-opacity { animation: ray-opacity-loop ${CYCLE} linear infinite; }
`;

// ─── Sparkle burst (8 rays + 2 rings + scatter dots) ─────────────────────────

function SparkBurst() {
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const len = 24;

  return (
    <g>
      <circle cx={HIT_X} cy={HIT_Y} r={0} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2"
        style={{ animation: `spark-ring ${CYCLE} linear infinite` }} />
      <circle cx={HIT_X} cy={HIT_Y} r={0} fill="rgba(255,255,255,0.25)"
        style={{ animation: `spark-ring2 ${CYCLE} linear infinite` }} />

      {rayAngles.map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const x2 = HIT_X + Math.cos(r) * len;
        const y2 = HIT_Y + Math.sin(r) * len;
        return (
          <line key={i} x1={HIT_X} y1={HIT_Y} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round"
            style={{
              strokeDasharray: len,
              animation: `spark-ray ${CYCLE} linear infinite`,
              animationDelay: `${i * 0.018}s`,
            }} />
        );
      })}

      {[20, 80, 145, 200, 260, 320].map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const dist = 18 + (i % 3) * 6;
        return (
          <circle key={i} cx={HIT_X + Math.cos(r) * dist} cy={HIT_Y + Math.sin(r) * dist} r="1.5" fill="white"
            style={{
              animation: `spark-dot ${CYCLE} linear infinite`,
              animationDelay: `${0.04 + i * 0.022}s`,
            }} />
        );
      })}
    </g>
  );
}

// ─── Main SVG ─────────────────────────────────────────────────────────────────

function PrismSVG() {
  return (
    <svg viewBox="-50 0 850 500" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full physics-container"
      style={{ overflow: "visible" }} aria-hidden>
      <defs>
        {/* Filters */}
        <filter id="beamBlur"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="beamMid"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="rayGlow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="raySoft"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>

      {/* ── 3D LIQUID TORUS SHAPE ──────────────────────────────────────────── */}
      {/* We use the liquid torus image embedded inside the SVG. 
          mix-blend-mode: screen makes the black background transparent,
          leaving only the beautifully rendered luminous liquid glass. */}
      <image 
        href="/liquid-torus.png" 
        x="150" 
        y="0" 
        width="500" 
        height="500" 
        style={{ mixBlendMode: "screen", opacity: 0.95 }} 
      />

      {/* ── INCOMING STRAIGHT TAPERED BEAM ──────────────────────────────────── */}
      {/* Soft outer glow */}
      <line x1={BEAM_START_X} y1={HIT_Y} x2={HIT_X} y2={HIT_Y} stroke="rgba(255,255,255,0.15)" strokeWidth="16" strokeLinecap="round" filter="url(#beamBlur)" className="beam-layer" />
      
      {/* Mid halo */}
      <line x1={BEAM_START_X} y1={HIT_Y} x2={HIT_X} y2={HIT_Y} stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" filter="url(#beamMid)" className="beam-layer" />
      
      {/* Sharp core */}
      <line x1={BEAM_START_X} y1={HIT_Y} x2={HIT_X} y2={HIT_Y} stroke="rgba(255,255,255,1)" strokeWidth="2" strokeLinecap="round" className="beam-layer" />

      {/* ── SPARKLE BURST at hit point ────────────────────────────────────── */}
      <SparkBurst />

      {/* ── RAINBOW STRAIGHT DISPERSION RAYS ─────────────────────────────────── */}
      {RAYS.map((ray, i) => {
        const end = rayEnd(ray.angleDeg, ray.len);
        const dash = "26 12";

        return (
          <g key={i} className="ray-opacity" style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Soft outer aura */}
            <line x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="8" strokeLinecap="round" filter="url(#raySoft)"
              style={{ strokeDasharray: dash, animation: `ray-flow ${ray.flowSpeed} linear infinite` }} />
            {/* Mid glow */}
            <line x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="3" strokeLinecap="round" filter="url(#rayGlow)"
              style={{ strokeDasharray: dash, animation: `ray-flow ${ray.flowSpeed} linear infinite` }} />
            {/* Sharp core */}
            <line x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="1" strokeLinecap="round"
              style={{ strokeDasharray: dash, animation: `ray-flow ${ray.flowSpeed} linear infinite` }} />
          </g>
        );
      })}

      {/* Exit point sparkle */}
      <circle cx={EXIT_X} cy={EXIT_Y} r="5" fill="white" opacity="0" className="ray-opacity">
        <animate attributeName="r" values="3;7;4" dur="2s" repeatCount="indefinite" begin="1.2s"/>
        <animate attributeName="opacity" values="0;0.7;0.3" dur="2s" repeatCount="indefinite" begin="1.2s"/>
      </circle>
    </svg>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(12px)", transition: { duration: 0.55, ease: [0.4, 0, 1, 1] } }}
    >
      <style>{STYLES}</style>

      {/* Fine grain texture */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          opacity: 0.45,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top wordmark */}
      <motion.div
        className="absolute top-10 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-4">
          <p className="text-[9px] uppercase tracking-[0.46em] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mantle Network</p>
          <span className="h-3 w-px bg-white/20" />
          <p className="text-[9px] uppercase tracking-[0.46em] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ERC-8004</p>
        </div>
      </motion.div>

      {/* Central light theater — with perspective wrapper */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[900px] px-4 flex justify-center"
        style={{ height: "400px", perspective: "1000px" }}
      >
        <PrismSVG />
      </motion.div>

      {/* Headline */}
      <motion.div
        className="relative z-20 text-center"
        style={{ marginTop: "-20px" }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[54px] leading-none tracking-[-0.04em] text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}>
          Obelisk <span className="italic" style={{ fontWeight: 300 }}>Q</span>
        </h1>
        <p className="mt-4 text-[10px] uppercase tracking-[0.38em] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Autonomous Investment Intelligence
        </p>
      </motion.div>

      {/* Enter button */}
      <motion.div
        className="relative z-20 mt-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.04, boxShadow: "0 0 35px rgba(255,255,255,0.1), inset 0 0 25px rgba(255,255,255,0.04)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative px-12 py-3.5 overflow-hidden rounded-sm"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <span className="relative text-[11px] font-medium uppercase tracking-[0.36em] text-white/70 group-hover:text-white transition-colors duration-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>Enter</span>
        </motion.button>
        <p className="text-[8.5px] uppercase tracking-[0.4em] text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Private · Secure · Non-custodial
        </p>
      </motion.div>

      {/* Bottom version line */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 1.6 }}
      >
        <span className="h-1 w-1 rounded-full bg-white/30" style={{ animation: "prism-breathe 3.8s ease-in-out infinite" }} />
        <span className="text-[8.5px] uppercase tracking-[0.4em] text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          v 1.0 · Mantle L2
        </span>
        <span className="h-1 w-1 rounded-full bg-white/30" style={{ animation: "prism-breathe 3.8s ease-in-out 1.9s infinite" }} />
      </motion.div>
    </motion.div>
  );
}
