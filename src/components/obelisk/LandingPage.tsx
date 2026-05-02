/**
 * LandingPage — Cinematic entry. Pure SVG + CSS keyframes. Full physics loop.
 *
 * Cycle (6s, infinite):
 *   0.0 – 0.9s  : white beam draws in from left
 *   0.9 – 1.1s  : beam vanishes on contact + sparkle burst at hit point
 *   1.1 – 5.2s  : rainbow rays emerge, flow continuously (tight ±12° fan)
 *   5.2 – 6.0s  : rainbow fades, resets → loop
 *
 * Changes from v4:
 *   • Q mark removed
 *   • Triangle is fully white (liquid glass, not dark)
 *   • Rainbow fan tightened to ±12° (compact, not spread)
 *   • Full 6s infinite loop — beam → touch → rainbow → reset → repeat
 *   • Sparkle burst (8-point star + scatter dots) at the hit point
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

// Beam length from screen-left to hit point
const BEAM_START_X = 0;
const BEAM_LEN = HIT_X - BEAM_START_X + 8; // ≈ 281

// ─── Loop cycle = 6 s ────────────────────────────────────────────────────────
//  0%  – 15% : beam draws in         (0.0 – 0.9s)
//  15% – 20% : beam fades + sparkle  (0.9 – 1.2s)
//  20% – 86% : rainbow visible       (1.2 – 5.2s)
//  86% – 100%: rainbow fades, reset  (5.2 – 6.0s)

const CYCLE = "6s";

const STYLES = `
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
    20%  { r: 4;  opacity: 1;    stroke-opacity: 0.9; }
    30%  { r: 22; opacity: 0;    stroke-opacity: 0; }
    100% { r: 22; opacity: 0;    stroke-opacity: 0; }
  }
  @keyframes spark-ring2 {
    0%   { r: 0;  opacity: 0; }
    17%  { r: 0;  opacity: 0; }
    22%  { r: 8;  opacity: 0.55; }
    32%  { r: 30; opacity: 0; }
    100% { r: 30; opacity: 0; }
  }
  /* Individual spark rays burst outward */
  @keyframes spark-ray {
    0%   { stroke-dashoffset: 20; opacity: 0; }
    16%  { stroke-dashoffset: 20; opacity: 0; }
    20%  { stroke-dashoffset: 20; opacity: 1; }
    28%  { stroke-dashoffset: 0;  opacity: 0.9; }
    36%  { stroke-dashoffset: -8; opacity: 0; }
    100% { stroke-dashoffset: -8; opacity: 0; }
  }
  /* Scatter dots */
  @keyframes spark-dot {
    0%   { opacity: 0; transform: translate(0,0); }
    18%  { opacity: 0; transform: translate(0,0); }
    22%  { opacity: 1; }
    34%  { opacity: 0; }
    100% { opacity: 0; }
  }

  /* ── PRISM inner glow breathe ─────────────────────────────── */
  @keyframes prism-breathe {
    0%, 100% { opacity: 0.10; }
    50%       { opacity: 0.28; }
  }
  /* ── PRISM edge shimmer ───────────────────────────────────── */
  @keyframes edge-shimmer {
    0%, 100% { stroke-opacity: 0.55; }
    50%       { stroke-opacity: 0.90; }
  }

  .beam-layer {
    stroke-dasharray: ${BEAM_LEN};
    animation: beam-loop ${CYCLE} cubic-bezier(0.4,0,0.2,1) infinite;
  }
  .ray-opacity { animation: ray-opacity-loop ${CYCLE} linear infinite; }
  .prism-inner-glow { animation: prism-breathe 4s ease-in-out infinite; }
  .prism-left-edge  { animation: edge-shimmer 5s ease-in-out infinite; }
`;

// ─── Sparkle burst (8 rays + 2 rings + scatter dots) ─────────────────────────

function SparkBurst() {
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const len = 18;

  return (
    <g>
      {/* Expanding ring 1 */}
      <circle
        cx={HIT_X} cy={HIT_Y}
        r={0}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="0.8"
        style={{ animation: `spark-ring ${CYCLE} linear infinite` }}
      />
      {/* Expanding ring 2 — softer */}
      <circle
        cx={HIT_X} cy={HIT_Y}
        r={0}
        fill="rgba(220,235,255,0.15)"
        style={{ animation: `spark-ring2 ${CYCLE} linear infinite` }}
      />

      {/* 8 radiating spark lines */}
      {rayAngles.map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const x2 = HIT_X + Math.cos(r) * len;
        const y2 = HIT_Y + Math.sin(r) * len;
        return (
          <line
            key={i}
            x1={HIT_X} y1={HIT_Y}
            x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.90)"
            strokeWidth="0.9"
            strokeLinecap="round"
            style={{
              strokeDasharray: len,
              animation: `spark-ray ${CYCLE} linear infinite`,
              animationDelay: `${i * 0.018}s`,
            }}
          />
        );
      })}

      {/* Scatter dots — 6 small dots flung out */}
      {[20, 80, 145, 200, 260, 320].map((angle, i) => {
        const r = (angle * Math.PI) / 180;
        const dist = 14 + (i % 3) * 5;
        return (
          <circle
            key={i}
            cx={HIT_X + Math.cos(r) * dist}
            cy={HIT_Y + Math.sin(r) * dist}
            r="1.2"
            fill="white"
            style={{
              animation: `spark-dot ${CYCLE} linear infinite`,
              animationDelay: `${0.04 + i * 0.022}s`,
            }}
          />
        );
      })}
    </g>
  );
}

// ─── Main SVG ─────────────────────────────────────────────────────────────────

function PrismSVG() {
  const pts = `${APEX.x},${APEX.y} ${BL.x},${BL.y} ${BR.x},${BR.y}`;

  return (
    <svg
      viewBox="0 0 800 500"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        {/* ── Liquid glass: semi-transparent frosted fill ── */}
        <linearGradient id="prismGlass" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%"   stopColor="#c8d8f8" stopOpacity="0.22" />
          <stop offset="28%"  stopColor="#a0b8e8" stopOpacity="0.14" />
          <stop offset="60%"  stopColor="#7090cc" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#4060a8" stopOpacity="0.18" />
        </linearGradient>

        {/* Frosted body — the main translucency layer */}
        <linearGradient id="prismFrost" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="#e8f0ff" stopOpacity="0.18" />
          <stop offset="45%"  stopColor="#c0cef5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8098d8" stopOpacity="0.12" />
        </linearGradient>

        {/* Left face specular — receives the incoming beam */}
        <linearGradient id="leftSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.0"  />
          <stop offset="30%"  stopColor="#ddeeff" stopOpacity="0.28" />
          <stop offset="65%"  stopColor="#bbccff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#9aaaee" stopOpacity="0.04" />
        </linearGradient>

        {/* Right face subtle darkening — transmission side */}
        <linearGradient id="rightFace" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#000010" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000010" stopOpacity="0.22" />
        </linearGradient>

        {/* Apex concentration — light gathers at the tip */}
        <radialGradient id="apexGlow" cx="50%" cy="10%" r="22%">
          <stop offset="0%"   stopColor="#ddeeff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ddeeff" stopOpacity="0.0"  />
        </radialGradient>

        {/* Refractive inner shimmer — pulsing */}
        <radialGradient id="innerShimmer" cx="38%" cy="42%" r="46%">
          <stop offset="0%"   stopColor="#a8c0f8" stopOpacity="0.18" />
          <stop offset="55%"  stopColor="#7090d0" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#7090d0" stopOpacity="0.0"  />
        </radialGradient>

        {/* Bottom base: faint reflection line */}
        <linearGradient id="baseReflect" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.0"  />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0"  />
        </linearGradient>

        {/* Ground shadow */}
        <filter id="groundShadow" x="-10%" y="-5%" width="120%" height="130%">
          <feDropShadow dx="0" dy="14" stdDeviation="22"
            floodColor="#000000" floodOpacity="0.55" />
        </filter>

        {/* Prism overall soft glow */}
        <filter id="prismGlow" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Beam soft glow */}
        <filter id="beamBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="beamMid">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>

        {/* Ray glow */}
        <filter id="rayGlow">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="raySoft">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ── PRISM ──────────────────────────────────────────────────────────── */}

      {/* Drop shadow */}
      <polygon points={pts} fill="rgba(0,0,0,0.35)"
        transform="translate(0,12)" filter="url(#groundShadow)" />

      {/* Outer soft glow halo — gives the glass that lit-from-within quality */}
      <polygon points={pts} fill="rgba(160,190,255,0.06)"
        filter="url(#prismGlow)" />

      {/* Base translucent glass body */}
      <polygon points={pts} fill="url(#prismGlass)" />

      {/* Frost overlay — adds the milky/cloudy glass depth */}
      <polygon points={pts} fill="url(#prismFrost)" />

      {/* Left face specular catch */}
      <polygon points={pts} fill="url(#leftSpecular)" />

      {/* Right face subtle shadow — transmission darkening */}
      <polygon points={pts} fill="url(#rightFace)" />

      {/* Apex light concentration */}
      <polygon points={pts} fill="url(#apexGlow)" />

      {/* Refractive inner shimmer — pulsing */}
      <polygon points={pts} fill="url(#innerShimmer)"
        className="prism-inner-glow" />

      {/* Base reflection line */}
      <line x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y}
        stroke="url(#baseReflect)" strokeWidth="1.2" />

      {/* Edges — hairline crystal strokes */}
      <line x1={APEX.x} y1={APEX.y} x2={BL.x} y2={BL.y}
        stroke="rgba(180,200,240,0.55)" strokeWidth="0.7"
        className="prism-left-edge" />
      <line x1={APEX.x} y1={APEX.y} x2={BR.x} y2={BR.y}
        stroke="rgba(160,185,230,0.30)" strokeWidth="0.7"
        style={{ animation: "edge-shimmer 5s ease-in-out 2.5s infinite" }} />
      <line x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y}
        stroke="rgba(160,185,230,0.18)" strokeWidth="0.6" />

      {/* Apex crystal tip catch */}
      <line
        x1={APEX.x} y1={APEX.y}
        x2={APEX.x - 6} y2={APEX.y + 14}
        stroke="rgba(255,255,255,0.50)" strokeWidth="1.0"
        strokeLinecap="round"
      />

      {/* ── INCOMING WHITE BEAM ───────────────────────────────────────────── */}

      {/* Soft outer glow */}
      <line
        x1={BEAM_START_X} y1={HIT_Y}
        x2={HIT_X} y2={HIT_Y}
        stroke="rgba(255,255,255,0.18)" strokeWidth="10"
        strokeLinecap="round"
        filter="url(#beamBlur)"
        className="beam-layer"
      />
      {/* Mid halo */}
      <line
        x1={BEAM_START_X} y1={HIT_Y}
        x2={HIT_X} y2={HIT_Y}
        stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#beamMid)"
        className="beam-layer"
      />
      {/* Sharp surgical core */}
      <line
        x1={BEAM_START_X} y1={HIT_Y}
        x2={HIT_X} y2={HIT_Y}
        stroke="rgba(255,255,255,0.95)" strokeWidth="0.65"
        strokeLinecap="round"
        className="beam-layer"
      />

      {/* ── SPARKLE BURST at hit point ────────────────────────────────────── */}
      <SparkBurst />

      {/* ── RAINBOW DISPERSION RAYS ──────────────────────────────────────── */}
      {RAYS.map((ray, i) => {
        const end = rayEnd(ray.angleDeg, ray.len);
        const dash = "22 8";   // dash + gap — gives flowing segments

        return (
          <g key={i} className="ray-opacity"
            style={{ animationDelay: `${i * 0.05}s` }}>

            {/* Soft outer aura */}
            <line
              x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y}
              stroke={ray.color} strokeWidth="7"
              strokeLinecap="round"
              filter="url(#raySoft)"
              style={{
                strokeDasharray: dash,
                animation: `ray-flow ${ray.flowSpeed} linear infinite`,
              }}
            />
            {/* Mid glow */}
            <line
              x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y}
              stroke={ray.color} strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#rayGlow)"
              style={{
                strokeDasharray: dash,
                animation: `ray-flow ${ray.flowSpeed} linear infinite`,
              }}
            />
            {/* Sharp core */}
            <line
              x1={EXIT_X} y1={EXIT_Y} x2={end.x} y2={end.y}
              stroke={ray.color} strokeWidth="0.85"
              strokeLinecap="round"
              style={{
                strokeDasharray: dash,
                animation: `ray-flow ${ray.flowSpeed} linear infinite`,
              }}
            />
          </g>
        );
      })}

      {/* Exit point glow — where rainbow leaves the prism */}
      <circle cx={EXIT_X} cy={EXIT_Y} r="4"
        fill="white" opacity="0" className="ray-opacity">
        <animate attributeName="r" values="2;5;3"
          dur="2s" repeatCount="indefinite" begin="1.2s"/>
        <animate attributeName="opacity" values="0;0.5;0.2"
          dur="2s" repeatCount="indefinite" begin="1.2s"/>
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
      exit={{
        opacity: 0,
        scale: 1.06,
        filter: "blur(12px)",
        transition: { duration: 0.55, ease: [0.4, 0, 1, 1] },
      }}
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

      {/* Top wordmark — perfectly centred */}
      <motion.div
        className="absolute top-10 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-4">
          <p className="text-[9px] uppercase tracking-[0.46em] text-white/30"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Mantle Network
          </p>
          <span className="h-3 w-px bg-white/15" />
          <p className="text-[9px] uppercase tracking-[0.46em] text-white/30"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ERC-8004
          </p>
        </div>
      </motion.div>

      {/* Central light theater */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[800px] px-4"
        style={{ height: "360px" }}
      >
        <PrismSVG />
      </motion.div>

      {/* Headline */}
      <motion.div
        className="relative z-20 text-center"
        style={{ marginTop: "-4px" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[50px] leading-none tracking-[-0.04em] text-white"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}>
          Obelisk <span className="italic" style={{ fontWeight: 300 }}>Q</span>
        </h1>
        <p className="mt-3 text-[9px] uppercase tracking-[0.38em] text-white/30"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Autonomous Investment Intelligence
        </p>
      </motion.div>

      {/* Enter button */}
      <motion.div
        className="relative z-20 mt-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative px-10 py-3 overflow-hidden"
          style={{
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.18)",
            transition: "box-shadow 0.5s ease, border-color 0.5s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = "0 0 30px rgba(255,255,255,0.07), inset 0 0 20px rgba(255,255,255,0.025)";
            el.style.borderColor = "rgba(255,255,255,0.32)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = "none";
            el.style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          <span aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
            }}
          />
          <span
            className="relative text-[11px] uppercase tracking-[0.36em] text-white/60 group-hover:text-white/90 transition-colors duration-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Enter
          </span>
        </motion.button>

        <p className="text-[8px] uppercase tracking-[0.4em] text-white/16"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Private · Secure · Non-custodial
        </p>
      </motion.div>

      {/* Bottom version line */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.6 }}
      >
        <span className="h-1 w-1 rounded-full bg-white/20"
          style={{ animation: "prism-breathe 3.8s ease-in-out infinite" }} />
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/18"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          v 1.0 · Mantle L2
        </span>
        <span className="h-1 w-1 rounded-full bg-white/20"
          style={{ animation: "prism-breathe 3.8s ease-in-out 1.9s infinite" }} />
      </motion.div>
    </motion.div>
  );
}
