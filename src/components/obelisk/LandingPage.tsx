/**
 * LandingPage — Cinematic entry. Pure SVG + CSS keyframes.
 *
 * Phase 1 (0.6s → 1.4s)  : White beam strokes in from the left, hits prism.
 * Phase 2 (1.4s → 1.7s)  : Beam fades out instantly on contact.
 * Phase 3 (1.7s → ∞)     : Rainbow rays emerge and flow continuously using
 *                           stroke-dashoffset CSS keyframes — real light physics.
 *
 * No Three.js. No WebGL. 60fps on a decade-old laptop.
 */

import { motion } from "framer-motion";

// ─── Animation constants ──────────────────────────────────────────────────────

// Triangle vertices (within 800×520 SVG viewport, centred at 400,260)
const APEX   = { x: 400, y:  62 };
const BL     = { x: 148, y: 420 };
const BR     = { x: 652, y: 420 };

// Where the beam hits the left face (midpoint of left edge)
const HIT_X  = (APEX.x + BL.x) / 2;   // ≈ 274
const HIT_Y  = (APEX.y + BL.y) / 2;   // ≈ 241

// Where rainbow exits the right face (slightly lower midpoint)
const EXIT_X = (APEX.x + BR.x) / 2 + 14; // ≈ 540
const EXIT_Y = (APEX.y + BR.y) / 2 + 6;  // ≈ 247

// Rainbow spectrum — 7 rays, fanning out from the right face
const RAYS = [
  { color: "#ff1a4e", angleDeg: -26, dashLen: 380, speed: 2.8 },
  { color: "#ff6a00", angleDeg: -17, dashLen: 360, speed: 2.5 },
  { color: "#ffe600", angleDeg:  -9, dashLen: 420, speed: 3.1 },
  { color: "#44ff66", angleDeg:   0, dashLen: 400, speed: 2.7 },
  { color: "#00aaff", angleDeg:   9, dashLen: 390, speed: 3.3 },
  { color: "#5533ff", angleDeg:  17, dashLen: 370, speed: 2.4 },
  { color: "#cc00ff", angleDeg:  26, dashLen: 410, speed: 2.9 },
] as const;

function rayEndpoint(angleDeg: number, length = 420) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: EXIT_X + Math.cos(rad) * length,
    y: EXIT_Y + Math.sin(rad) * length,
  };
}

// ─── Embedded CSS keyframes ───────────────────────────────────────────────────

const STYLES = `
  /* Phase 1 — beam draws itself in, left → right */
  @keyframes beam-draw {
    from { stroke-dashoffset: 380; opacity: 1; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  /* Phase 2 — beam vanishes on contact */
  @keyframes beam-vanish {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  /* Phase 3 — continuous flowing light through each ray */
  @keyframes ray-flow {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -140; }
  }
  /* Prism inner glow pulse */
  @keyframes prism-breathe {
    0%, 100% { opacity: 0.18; }
    50%       { opacity: 0.38; }
  }
  /* Prism edge shimmer */
  @keyframes edge-shimmer {
    0%   { stroke-opacity: 0.22; }
    50%  { stroke-opacity: 0.52; }
    100% { stroke-opacity: 0.22; }
  }
  /* Refraction bloom at hit point */
  @keyframes bloom-appear {
    0%   { r: 0;  opacity: 0;   }
    40%  { r: 18; opacity: 0.55; }
    100% { r: 24; opacity: 0;   }
  }

  .beam-core {
    stroke-dasharray: 380;
    stroke-dashoffset: 380;
    animation:
      beam-draw   0.72s cubic-bezier(0.22,1,0.36,1) 0.65s forwards,
      beam-vanish 0.18s ease-in                     1.37s forwards;
  }
  .beam-glow {
    stroke-dasharray: 380;
    stroke-dashoffset: 380;
    animation:
      beam-draw   0.72s cubic-bezier(0.22,1,0.36,1) 0.60s forwards,
      beam-vanish 0.22s ease-in                     1.34s forwards;
  }
  .prism-fill {
    animation: prism-breathe 4.2s ease-in-out infinite 1.8s;
  }
  .prism-edge {
    animation: edge-shimmer 5s ease-in-out infinite 2s;
  }
  .bloom {
    animation: bloom-appear 0.55s ease-out 1.42s forwards;
  }
`;

// ─── Prism SVG ────────────────────────────────────────────────────────────────

function PrismSVG() {
  const pts = `${APEX.x},${APEX.y} ${BL.x},${BL.y} ${BR.x},${BR.y}`;
  const beamStartX = 10;
  const beamStartY = HIT_Y;

  return (
    <svg
      viewBox="0 0 800 520"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        {/* ── Prism fill — liquid glass mercury ── */}
        <linearGradient id="prismGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1a1a28" stopOpacity="0.96" />
          <stop offset="35%"  stopColor="#0d0d16" stopOpacity="0.99" />
          <stop offset="65%"  stopColor="#14141f" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#0a0a12" stopOpacity="1"    />
        </linearGradient>

        {/* Left-face refractive highlight */}
        <linearGradient id="leftFaceHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8899cc" stopOpacity="0" />
          <stop offset="40%"  stopColor="#aabbee" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff"  stopOpacity="0.06" />
        </linearGradient>

        {/* Inner glow — refractive index shimmer */}
        <radialGradient id="innerGlow" cx="42%" cy="48%" r="44%">
          <stop offset="0%"   stopColor="#6677bb" stopOpacity="0.22" />
          <stop offset="60%"  stopColor="#3344aa" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#3344aa" stopOpacity="0"    />
        </radialGradient>

        {/* Apex highlight — where light gathers */}
        <radialGradient id="apexGlow" cx="50%" cy="15%" r="30%">
          <stop offset="0%"   stopColor="#99aadd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#99aadd" stopOpacity="0"    />
        </radialGradient>

        {/* Beam glow blur */}
        <filter id="beamBlur" x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="beamCoreBlur" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>

        {/* Ray glow blur */}
        <filter id="rayGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rayGlowSoft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* Prism shadow */}
        <filter id="prismShadow" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="20" floodColor="#000000" floodOpacity="0.65" />
        </filter>

        {/* Clipping mask — keep rays within right half */}
        <clipPath id="rightHalf">
          <rect x={EXIT_X} y="0" width="800" height="520" />
        </clipPath>
      </defs>

      {/* ══ PRISM BODY ══════════════════════════════════════════════════════════ */}

      {/* Drop shadow */}
      <polygon
        points={pts}
        fill="#000000"
        opacity="0.45"
        transform="translate(0,6)"
        filter="url(#prismShadow)"
      />

      {/* Main fill — dark liquid glass */}
      <polygon points={pts} fill="url(#prismGlass)" />

      {/* Refractive inner glow — pulsing */}
      <polygon
        points={pts}
        fill="url(#innerGlow)"
        className="prism-fill"
      />

      {/* Apex light gather */}
      <polygon points={pts} fill="url(#apexGlow)" opacity="0.6" />

      {/* Left-face refractive surface highlight */}
      <polygon points={pts} fill="url(#leftFaceHighlight)" />

      {/* Edge outlines — hairline shimmer */}
      <line
        x1={APEX.x} y1={APEX.y} x2={BL.x} y2={BL.y}
        stroke="rgba(200,210,240,0.28)" strokeWidth="0.8"
        className="prism-edge"
      />
      <line
        x1={APEX.x} y1={APEX.y} x2={BR.x} y2={BR.y}
        stroke="rgba(200,210,240,0.18)" strokeWidth="0.8"
        className="prism-edge"
        style={{ animationDelay: "2.6s" }}
      />
      <line
        x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y}
        stroke="rgba(200,210,240,0.10)" strokeWidth="0.6"
      />

      {/* Subtle bevel — top-left face catch */}
      <line
        x1={APEX.x} y1={APEX.y}
        x2={APEX.x - 8} y2={APEX.y + 18}
        stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* ── Q mark — brand logo ── */}
      <g transform={`translate(${BR.x - 72}, ${BR.y - 82})`} opacity="0.82">
        {/* Circle of Q */}
        <circle cx="18" cy="16" r="12"
          fill="none"
          stroke="rgba(255,255,255,0.70)"
          strokeWidth="2.5"
        />
        {/* Tail of Q */}
        <line x1="26" y1="24" x2="32" y2="30"
          stroke="rgba(255,255,255,0.70)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* ══ PHASE 1 — INCOMING WHITE BEAM ══════════════════════════════════════ */}

      {/* Outer glow — wider, blurred */}
      <line
        x1={beamStartX} y1={beamStartY}
        x2={HIT_X}      y2={HIT_Y}
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#beamBlur)"
        className="beam-glow"
      />
      {/* Mid halo */}
      <line
        x1={beamStartX} y1={beamStartY}
        x2={HIT_X}      y2={HIT_Y}
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#beamCoreBlur)"
        className="beam-core"
      />
      {/* Sharp surgical core */}
      <line
        x1={beamStartX} y1={beamStartY}
        x2={HIT_X}      y2={HIT_Y}
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="0.7"
        strokeLinecap="round"
        className="beam-core"
      />

      {/* ══ PHASE 2 — REFRACTION BLOOM ════════════════════════════════════════ */}
      <circle
        cx={HIT_X} cy={HIT_Y}
        r="0"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1"
        className="bloom"
      />
      <circle
        cx={HIT_X} cy={HIT_Y}
        r="0"
        fill="rgba(160,180,255,0.25)"
        className="bloom"
        style={{ animationDelay: "1.44s" }}
      />

      {/* ══ PHASE 3 — RAINBOW DISPERSION RAYS ════════════════════════════════ */}
      {RAYS.map((ray, i) => {
        const end = rayEndpoint(ray.angleDeg, ray.dashLen);
        const dashArray = `28 10`;   // dash + gap — creates the flowing segments
        const delay     = `${1.72 + i * 0.06}s`;
        const dur       = `${ray.speed}s`;

        return (
          <g key={i}>
            {/* Soft outer glow */}
            <line
              x1={EXIT_X} y1={EXIT_Y}
              x2={end.x}  y2={end.y}
              stroke={ray.color}
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#rayGlowSoft)"
              opacity="0"
              style={{
                strokeDasharray: dashArray,
                animation: `ray-flow ${dur} linear ${delay} infinite`,
                animationFillMode: "forwards",
              }}
            >
              <animate attributeName="opacity" from="0" to="0.18"
                dur="0.4s" begin={delay} fill="freeze" />
            </line>

            {/* Mid glow */}
            <line
              x1={EXIT_X} y1={EXIT_Y}
              x2={end.x}  y2={end.y}
              stroke={ray.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#rayGlow)"
              opacity="0"
              style={{
                strokeDasharray: dashArray,
                animation: `ray-flow ${dur} linear ${delay} infinite`,
                animationFillMode: "forwards",
              }}
            >
              <animate attributeName="opacity" from="0" to="0.60"
                dur="0.4s" begin={delay} fill="freeze" />
            </line>

            {/* Sharp core */}
            <line
              x1={EXIT_X} y1={EXIT_Y}
              x2={end.x}  y2={end.y}
              stroke={ray.color}
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0"
              style={{
                strokeDasharray: dashArray,
                animation: `ray-flow ${dur} linear ${delay} infinite`,
                animationFillMode: "forwards",
              }}
            >
              <animate attributeName="opacity" from="0" to="0.88"
                dur="0.35s" begin={delay} fill="freeze" />
            </line>
          </g>
        );
      })}

      {/* Exit point scatter — small burst where rainbow leaves glass */}
      <circle
        cx={EXIT_X} cy={EXIT_Y} r="4"
        fill="rgba(255,255,255,0.0)"
        opacity="0"
      >
        <animate attributeName="fill-opacity" values="0;0.35;0.12" dur="0.8s"
          begin="1.72s" repeatCount="indefinite"/>
        <animate attributeName="r" values="2;6;4" dur="2.5s"
          begin="1.72s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0" to="1"
          dur="0.3s" begin="1.72s" fill="freeze"/>
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
        scale: 8,
        opacity: 0,
        transition: { duration: 0.85, ease: [0.55, 0, 1, 0.45] },
      }}
    >
      {/* Embedded CSS */}
      <style>{STYLES}</style>

      {/* Fine grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          opacity: 0.5,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top wordmark */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="text-[9px] uppercase tracking-[0.5em] text-white/28"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Mantle Network · ERC-8004
        </p>
      </motion.div>

      {/* ── Central light theater ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[820px] px-4"
        style={{ height: "380px" }}
      >
        <PrismSVG />
      </motion.div>

      {/* ── Headline ── */}
      <motion.div
        className="relative z-20 text-center -mt-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-[50px] leading-none tracking-[-0.04em] text-white"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Obelisk <span className="italic" style={{ fontWeight: 300 }}>Q</span>
        </h1>
        <p
          className="mt-3 text-[9px] uppercase tracking-[0.38em] text-white/30"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Autonomous Investment Intelligence
        </p>
      </motion.div>

      {/* ── Enter button — centred, hover glow ── */}
      <motion.div
        className="relative z-20 mt-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative px-10 py-3 overflow-hidden"
          style={{
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.18)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 28px rgba(255,255,255,0.08), inset 0 0 20px rgba(255,255,255,0.03)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%)",
            }}
          />
          <span
            className="relative text-[11px] uppercase tracking-[0.36em] text-white/65 group-hover:text-white/92 transition-colors duration-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Enter
          </span>
        </motion.button>

        <p
          className="text-[8px] uppercase tracking-[0.4em] text-white/16"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Private · Secure · Non-custodial
        </p>
      </motion.div>

      {/* Bottom network indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.8 }}
      >
        <span
          className="h-1 w-1 rounded-full bg-white/22"
          style={{ animation: "prism-breathe 3.5s ease-in-out infinite" }}
        />
        <span
          className="text-[8px] uppercase tracking-[0.4em] text-white/18"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          v 1.0 · Mantle L2
        </span>
        <span
          className="h-1 w-1 rounded-full bg-white/22"
          style={{ animation: "prism-breathe 3.5s ease-in-out infinite 1.75s" }}
        />
      </motion.div>
    </motion.div>
  );
}
