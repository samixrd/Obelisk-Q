/**
 * LandingPage — Cinematic 3D entry. Pure SVG + CSS keyframes. Full physics loop.
 * Features:
 *  - 3D CSS container for continuous rotating/floating movement towards the screen.
 *  - Pure liquid glass prism aesthetic.
 *  - Zigzag, tapered incoming white beam.
 *  - Zigzag rainbow dispersion rays.
 */

import { motion } from "framer-motion";

// ─── Geometry ─────────────────────────────────────────────────────────────────

const APEX  = { x: 400, y:  58 };
const BL    = { x: 144, y: 422 };
const BR    = { x: 656, y: 422 };

// Beam hits the left face at ~55% down from apex
const HIT_X = APEX.x + (BL.x - APEX.x) * 0.54;   // ≈ 273
const HIT_Y = APEX.y + (BL.y - APEX.y) * 0.54;   // ≈ 249

// Rainbow exits the right face at ~55% down
const EXIT_X = APEX.x + (BR.x - APEX.x) * 0.54;  // ≈ 527
const EXIT_Y = APEX.y + (BR.y - APEX.y) * 0.54;  // ≈ 249

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

// Generate a zigzag path between two points
function getZigzagPath(x1: number, y1: number, x2: number, y2: number, segments: number, variance: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  
  let path = `M ${x1},${y1}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    
    const isLast = i === segments;
    const v = isLast ? 0 : (i % 2 === 0 ? variance : -variance);
    
    const vx = px + Math.cos(angle + Math.PI/2) * v;
    const vy = py + Math.sin(angle + Math.PI/2) * v;
    
    path += ` L ${vx},${vy}`;
  }
  return path;
}

const BEAM_START_X = -50;
const BEAM_LEN = 450; // Approximated length for zigzag dashoffset
const ZIGZAG_BEAM_PATH = getZigzagPath(BEAM_START_X, HIT_Y, HIT_X, HIT_Y, 8, 18);

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
    animation: physics-float 12s ease-in-out infinite;
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

  /* ── PRISM inner glow breathe ─────────────────────────────── */
  @keyframes prism-breathe {
    0%, 100% { opacity: 0.15; }
    50%      { opacity: 0.40; }
  }
  /* ── PRISM edge shimmer ───────────────────────────────────── */
  @keyframes edge-shimmer {
    0%, 100% { stroke-opacity: 0.65; }
    50%      { stroke-opacity: 1.0; }
  }
  
  /* ── LIQUID GLASS WOBBLE ───────────────────────────────────── */
  @keyframes liquid-wobble {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.1; }
    50%      { transform: translateY(-4px) scale(1.01); opacity: 0.2; }
  }

  .beam-layer {
    stroke-dasharray: ${BEAM_LEN};
    animation: beam-loop ${CYCLE} cubic-bezier(0.4,0,0.2,1) infinite;
  }
  .ray-opacity { animation: ray-opacity-loop ${CYCLE} linear infinite; }
  .prism-inner-glow { animation: prism-breathe 4s ease-in-out infinite; }
  .prism-left-edge  { animation: edge-shimmer 5s ease-in-out infinite; }
  .liquid-layer { animation: liquid-wobble 6s ease-in-out infinite; }
`;

// ─── Sparkle burst (8 rays + 2 rings + scatter dots) ─────────────────────────

function SparkBurst() {
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const len = 24;

  return (
    <g>
      <circle cx={HIT_X} cy={HIT_Y} r={0} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2"
        style={{ animation: \`spark-ring \${CYCLE} linear infinite\` }} />
      <circle cx={HIT_X} cy={HIT_Y} r={0} fill="rgba(255,255,255,0.25)"
        style={{ animation: \`spark-ring2 \${CYCLE} linear infinite\` }} />

      {rayAngles.map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const x2 = HIT_X + Math.cos(r) * len;
        const y2 = HIT_Y + Math.sin(r) * len;
        return (
          <line key={i} x1={HIT_X} y1={HIT_Y} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round"
            style={{
              strokeDasharray: len,
              animation: \`spark-ray \${CYCLE} linear infinite\`,
              animationDelay: \`\${i * 0.018}s\`,
            }} />
        );
      })}

      {[20, 80, 145, 200, 260, 320].map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const dist = 18 + (i % 3) * 6;
        return (
          <circle key={i} cx={HIT_X + Math.cos(r) * dist} cy={HIT_Y + Math.sin(r) * dist} r="1.5" fill="white"
            style={{
              animation: \`spark-dot \${CYCLE} linear infinite\`,
              animationDelay: \`\${0.04 + i * 0.022}s\`,
            }} />
        );
      })}
    </g>
  );
}

// ─── Main SVG ─────────────────────────────────────────────────────────────────

function PrismSVG() {
  const pts = \`${APEX.x},${APEX.y} ${BL.x},${BL.y} ${BR.x},${BR.y}\`;

  return (
    <svg viewBox="-50 0 850 500" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full physics-container"
      style={{ overflow: "visible" }} aria-hidden>
      <defs>
        {/* ── Pure Liquid Glass Gradients ── */}
        <linearGradient id="prismGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="35%"  stopColor="#e8f0ff" stopOpacity="0.1" />
          <stop offset="70%"  stopColor="#b8c8f5" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id="prismFrost" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%"  stopColor="#90a8e0" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="leftSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.6"  />
          <stop offset="25%"  stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>

        <radialGradient id="apexGlow" cx="50%" cy="10%" r="25%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0"  />
        </radialGradient>

        <radialGradient id="innerShimmer" cx="40%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="60%"  stopColor="#a0b8f0" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0"  />
        </radialGradient>

        {/* Filters */}
        <filter id="groundShadow" x="-20%" y="-10%" width="140%" height="150%">
          <feDropShadow dx="0" dy="25" stdDeviation="30" floodColor="#000000" floodOpacity="0.7" />
        </filter>
        <filter id="prismGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="10" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="beamBlur"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="beamMid"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="rayGlow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="raySoft"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>

      {/* ── PRISM ──────────────────────────────────────────────────────────── */}
      {/* Drop shadow */}
      <polygon points={pts} fill="rgba(0,0,0,0.4)" transform="translate(0,20)" filter="url(#groundShadow)" />

      {/* Outer halo */}
      <polygon points={pts} fill="rgba(200,220,255,0.12)" filter="url(#prismGlow)" />

      {/* Base translucent glass body */}
      <polygon points={pts} fill="url(#prismGlass)" />

      {/* Liquid Wobble Inner Layer */}
      <polygon points={pts} fill="url(#innerShimmer)" className="liquid-layer" />

      {/* Frost overlay */}
      <polygon points={pts} fill="url(#prismFrost)" />

      {/* Left face specular catch */}
      <polygon points={pts} fill="url(#leftSpecular)" />

      {/* Apex light concentration */}
      <polygon points={pts} fill="url(#apexGlow)" />

      {/* Refractive inner shimmer */}
      <polygon points={pts} fill="url(#innerShimmer)" className="prism-inner-glow" />

      {/* Base reflection line */}
      <line x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Edges */}
      <line x1={APEX.x} y1={APEX.y} x2={BL.x} y2={BL.y} stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" className="prism-left-edge" />
      <line x1={APEX.x} y1={APEX.y} x2={BR.x} y2={BR.y} stroke="rgba(200,220,255,0.4)" strokeWidth="1.0" style={{ animation: "edge-shimmer 5s ease-in-out 2.5s infinite" }} />
      <line x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y} stroke="rgba(200,220,255,0.25)" strokeWidth="0.8" />
      <line x1={APEX.x} y1={APEX.y} x2={APEX.x - 6} y2={APEX.y + 14} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── INCOMING ZIGZAG TAPERED BEAM ──────────────────────────────────── */}
      {/* Soft outer glow */}
      <path d={ZIGZAG_BEAM_PATH} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" filter="url(#beamBlur)" className="beam-layer" />
      
      {/* Mid halo — thick at start, simulating taper through overlapping layers */}
      <path d={ZIGZAG_BEAM_PATH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#beamMid)" className="beam-layer" />
      
      {/* Sharp core */}
      <path d={ZIGZAG_BEAM_PATH} fill="none" stroke="rgba(255,255,255,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="beam-layer" />

      {/* ── SPARKLE BURST at hit point ────────────────────────────────────── */}
      <SparkBurst />

      {/* ── RAINBOW ZIGZAG DISPERSION RAYS ─────────────────────────────────── */}
      {RAYS.map((ray, i) => {
        const end = rayEnd(ray.angleDeg, ray.len);
        // Variance for zigzags spreads them out nicely
        const rayPath = getZigzagPath(EXIT_X, EXIT_Y, end.x, end.y, 10, 12);
        const dash = "26 12";

        return (
          <g key={i} className="ray-opacity" style={{ animationDelay: \`\${i * 0.05}s\` }}>
            {/* Soft outer aura */}
            <path d={rayPath} fill="none" stroke={ray.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#raySoft)"
              style={{ strokeDasharray: dash, animation: \`ray-flow \${ray.flowSpeed} linear infinite\` }} />
            {/* Mid glow */}
            <path d={rayPath} fill="none" stroke={ray.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#rayGlow)"
              style={{ strokeDasharray: dash, animation: \`ray-flow \${ray.flowSpeed} linear infinite\` }} />
            {/* Sharp core */}
            <path d={rayPath} fill="none" stroke={ray.color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: dash, animation: \`ray-flow \${ray.flowSpeed} linear infinite\` }} />
          </g>
        );
      })}

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
          backgroundImage: "url(\\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\\")",
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
