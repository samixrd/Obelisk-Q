/**
 * LandingPage — Classic Dark Side Prism
 * Features:
 *  - Cyan glowing edge prism with dark interior.
 *  - Internal refraction ray.
 *  - Continuous flowing animation loops for all beams.
 */

import { motion } from "framer-motion";

// ─── Geometry ─────────────────────────────────────────────────────────────────

const APEX  = { x: 400, y:  80 };
const BL    = { x: 200, y: 420 };
const BR    = { x: 600, y: 420 };

// Beam entry (left face)
const HIT_X = 290;
const HIT_Y = 267;

// Beam exit (right face)
const EXIT_X = 510;
const EXIT_Y = 267;

// Incoming beam starting point
const BEAM_START_X = -100;
const BEAM_START_Y = 308; // angled slightly up to hit (290, 267)

// Continuous spreading rainbow (angles downwards)
const RAYS = [
  { color: "#ff1a4e", angleDeg: 2,  len: 400, speed: "1.2s" },
  { color: "#ff6a00", angleDeg: 5,  len: 400, speed: "1.3s" },
  { color: "#ffe200", angleDeg: 8,  len: 400, speed: "1.4s" },
  { color: "#44ff66", angleDeg: 11, len: 400, speed: "1.5s" },
  { color: "#00aaff", angleDeg: 14, len: 400, speed: "1.6s" },
  { color: "#5533ff", angleDeg: 17, len: 400, speed: "1.7s" },
  { color: "#cc00ff", angleDeg: 20, len: 400, speed: "1.8s" },
] as const;

function rayEnd(angleDeg: number, len: number) {
  const r = (angleDeg * Math.PI) / 180;
  return { x: EXIT_X + Math.cos(r) * len, y: EXIT_Y + Math.sin(r) * len };
}

const STYLES = `
  /* ── 3D Container Physics Loop ────────────────────────────── */
  @keyframes physics-float {
    0%   { transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
    25%  { transform: perspective(1200px) rotateX(4deg) rotateY(-3deg) translateZ(30px); }
    50%  { transform: perspective(1200px) rotateX(-2deg) rotateY(4deg) translateZ(60px); }
    75%  { transform: perspective(1200px) rotateX(2deg) rotateY(2deg) translateZ(30px); }
    100% { transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
  }

  .physics-container {
    transform-style: preserve-3d;
    animation: physics-float 16s ease-in-out infinite;
  }

  /* ── CONTINUOUS FLOW ANIMATION ────────────────────────────── */
  @keyframes continuous-flow {
    from { stroke-dashoffset: 90; }
    to   { stroke-dashoffset: 0; }
  }

  /* ── PRISM EDGE PULSE ─────────────────────────────────────── */
  @keyframes prism-pulse {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(96, 224, 255, 0.4)); stroke-opacity: 0.7; }
    50%      { filter: drop-shadow(0 0 25px rgba(96, 224, 255, 0.9)); stroke-opacity: 1.0; }
  }
`;

// ─── Main SVG ─────────────────────────────────────────────────────────────────

function PrismSVG() {
  const pts = `${APEX.x},${APEX.y} ${BL.x},${BL.y} ${BR.x},${BR.y}`;
  const dashPattern = "60 30"; // length 60, gap 30

  return (
    <svg viewBox="-150 0 1100 500" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full physics-container"
      style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="beamGlow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rayGlow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        
        {/* Prism Interior Gradient */}
        <linearGradient id="prismFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0a1a2a" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* ── PRISM ──────────────────────────────────────────────────────────── */}
      {/* Background fill */}
      <polygon points={pts} fill="url(#prismFill)" />
      
      {/* Cyan Glowing Edges */}
      <polygon points={pts} fill="none" stroke="#60e0ff" strokeWidth="6" strokeLinejoin="round"
        filter="url(#cyanGlow)" style={{ animation: "prism-pulse 4s ease-in-out infinite" }} />
      <polygon points={pts} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />

      {/* ── INTERNAL REFRACTION BEAM ──────────────────────────────────────── */}
      {/* Flowing internal line */}
      <line x1={HIT_X} y1={HIT_Y} x2={EXIT_X} y2={EXIT_Y} stroke="rgba(255,255,255,0.4)" strokeWidth="3"
        style={{ strokeDasharray: dashPattern, animation: "continuous-flow 1.5s linear infinite" }} />
      <line x1={HIT_X} y1={HIT_Y} x2={EXIT_X} y2={EXIT_Y} stroke="rgba(255,255,255,0.8)" strokeWidth="1"
        style={{ strokeDasharray: dashPattern, animation: "continuous-flow 1.5s linear infinite" }} />

      {/* ── INCOMING WHITE BEAM ───────────────────────────────────────────── */}
      <line x1={BEAM_START_X} y1={BEAM_START_Y} x2={HIT_X} y2={HIT_Y} stroke="rgba(255,255,255,0.6)" strokeWidth="6" strokeLinecap="round" filter="url(#beamGlow)"
        style={{ strokeDasharray: dashPattern, animation: "continuous-flow 1.0s linear infinite" }} />
      <line x1={BEAM_START_X} y1={BEAM_START_Y} x2={HIT_X} y2={HIT_Y} stroke="rgba(255,255,255,1)" strokeWidth="2" strokeLinecap="round"
        style={{ strokeDasharray: dashPattern, animation: "continuous-flow 1.0s linear infinite" }} />

      {/* Collision Sparkle at Entry */}
      <circle cx={HIT_X} cy={HIT_Y} r="4" fill="#ffffff" filter="url(#beamGlow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* ── RAINBOW DISPERSION RAYS ────────────────────────────────────────── */}
      {RAYS.map((ray, i) => {
        const end = rayEnd(ray.angleDeg, ray.len);

        return (
          <g key={i}>
            {/* Glow */}
            <line x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="6" strokeLinecap="round" filter="url(#rayGlow)"
              style={{ strokeDasharray: dashPattern, animation: `continuous-flow ${ray.speed} linear infinite` }} />
            {/* Core */}
            <line x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="1.5" strokeLinecap="round"
              style={{ strokeDasharray: dashPattern, animation: `continuous-flow ${ray.speed} linear infinite` }} />
          </g>
        );
      })}

      {/* Exit Sparkle */}
      <circle cx={EXIT_X} cy={EXIT_Y} r="3" fill="#ffffff" filter="url(#rayGlow)">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" />
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
          whileHover={{ scale: 1.04, boxShadow: "0 0 35px rgba(96,224,255,0.2), inset 0 0 25px rgba(96,224,255,0.05)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative px-12 py-3.5 overflow-hidden rounded-sm"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(96,224,255,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: "linear-gradient(90deg, transparent, rgba(96,224,255,0.1), transparent)" }} />
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
        <span className="h-1 w-1 rounded-full bg-[#60e0ff]/40" style={{ animation: "prism-pulse 3.8s ease-in-out infinite" }} />
        <span className="text-[8.5px] uppercase tracking-[0.4em] text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          v 1.0 · Mantle L2
        </span>
        <span className="h-1 w-1 rounded-full bg-[#60e0ff]/40" style={{ animation: "prism-pulse 3.8s ease-in-out 1.9s infinite" }} />
      </motion.div>
    </motion.div>
  );
}
