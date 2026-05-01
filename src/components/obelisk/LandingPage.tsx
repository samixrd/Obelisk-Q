import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

// ─── Triangular Glass Prism (Pink Floyd geometry) ───────────────────────────

function PrismMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  // Triangular prism: CylinderGeometry with 3 radial segments
  const prismGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.6, 1.6, 0.55, 3);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Slow meditative rotation — the prism "breathes"
      meshRef.current.rotation.z = t * 0.04;
      meshRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.12) * 0.03;
    }
    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 1.2) * 0.02;
    }
  });

  return (
    <group>
      {/* Inner glow volume */}
      <mesh ref={innerGlowRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 0.57, 3]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Main glass prism */}
      <mesh ref={meshRef} geometry={prismGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color="#050510"
          transmission={0.92}
          thickness={1.8}
          roughness={0.015}
          metalness={0.0}
          ior={1.9}
          clearcoat={1}
          clearcoatRoughness={0.01}
          attenuationColor="#c8d8ff"
          attenuationDistance={0.8}
          envMapIntensity={2.8}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Edge highlight */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 0.57, 3]} />
        <meshBasicMaterial color="#4466aa" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ─── Rainbow SVG Overlay ─────────────────────────────────────────────────────

const RAINBOW = [
  { color: "#ff0040", angle: -22, delay: 0.0 },
  { color: "#ff6600", angle: -14, delay: 0.08 },
  { color: "#ffe000", angle: -7,  delay: 0.16 },
  { color: "#44ff44", angle:  0,  delay: 0.24 },
  { color: "#00aaff", angle:  7,  delay: 0.32 },
  { color: "#6644ff", angle: 14,  delay: 0.40 },
  { color: "#cc00ff", angle: 22,  delay: 0.48 },
];

function RainbowOverlay({ pulse }: { pulse: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* White beam gradient */}
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Beam diffusion glow */}
        <filter id="beamBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="rainbowGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Entry beam scatter */}
        <radialGradient id="prismGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6688ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6688ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Incoming white beam ── */}
      <motion.line
        x1="0" y1="350" x2="490" y2="350"
        stroke="url(#beamGrad)"
        strokeWidth="1.5"
        filter="url(#beamBlur)"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.8 }}
      />
      {/* Thin surgical core */}
      <motion.line
        x1="120" y1="350" x2="490" y2="350"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.9"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.0, delay: 1.0 }}
      />

      {/* ── Prism entry glow ── */}
      <motion.ellipse
        cx="510" cy="350" rx="40" ry="24"
        fill="url(#prismGlow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
      />

      {/* ── Rainbow dispersion rays ── */}
      {RAINBOW.map((ray, i) => {
        const angleRad = (ray.angle * Math.PI) / 180;
        const length = 420;
        const startX = 700;
        const startY = 350;
        const endX = startX + Math.cos(angleRad) * length;
        const endY = startY + Math.sin(angleRad) * length;

        return (
          <g key={i} filter="url(#rainbowGlow)">
            {/* Soft glow trail */}
            <motion.line
              x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={ray.color}
              strokeWidth="4"
              opacity="0.18"
              filter="url(#softBlur)"
              initial={{ opacity: 0 }}
              animate={pulse ? {
                opacity: [0.08, 0.22, 0.08],
              } : { opacity: 0.12 }}
              transition={{
                duration: 3.8,
                delay: 1.4 + ray.delay,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 0.2,
              }}
            />
            {/* Sharp core ray */}
            <motion.line
              x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={ray.color}
              strokeWidth="1.5"
              initial={{ opacity: 0 }}
              animate={pulse ? {
                opacity: [0.5, 1.0, 0.5],
              } : { opacity: 0.7 }}
              transition={{
                duration: 3.8,
                delay: 1.4 + ray.delay,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 0.2,
              }}
            />
          </g>
        );
      })}

      {/* ── Exit point scatter ── */}
      <motion.ellipse
        cx="700" cy="350" rx="12" ry="30"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.15"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.05, 0.18, 0.05] }}
        transition={{ duration: 4, delay: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────

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
      {/* Fine grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          opacity: 0.55,
          mixBlendMode: "overlay",
        }}
      />

      {/* Top wordmark */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="text-[9px] uppercase tracking-[0.5em] text-white/30"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Mantle Network · ERC-8004
        </p>
      </motion.div>

      {/* ── Central light theater ── */}
      <div className="relative w-[700px] max-w-[95vw] h-[420px] flex items-center justify-center">

        {/* Rainbow SVG layer — behind the prism */}
        <RainbowOverlay pulse />

        {/* Three.js Prism Canvas */}
        <motion.div
          className="relative z-10 w-[260px] h-[260px]"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.15} />
              <directionalLight position={[-6, 0, 3]} intensity={2.2} color="#ffffff" />
              <directionalLight position={[3, 0, 3]} intensity={0.8} color="#aaccff" />
              <pointLight position={[0, 0, 4]} intensity={1.0} color="#ffffff" />
              <Environment preset="night" />
              <PrismMesh />
            </Suspense>
          </Canvas>
        </motion.div>

      </div>

      {/* ── Headline ── */}
      <motion.div
        className="relative z-20 text-center mt-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-[52px] leading-none tracking-[-0.04em] text-white"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Obelisk <span className="italic font-light">Q</span>
        </h1>
        <p
          className="mt-3 text-[9px] uppercase tracking-[0.38em] text-white/35"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Autonomous Investment Intelligence
        </p>
      </motion.div>

      {/* ── Enter button ── */}
      <motion.div
        className="relative z-20 mt-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative px-10 py-3 overflow-hidden"
          style={{
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* Hover shimmer */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
            }}
          />
          <span
            className="relative text-[11px] uppercase tracking-[0.36em] text-white/70 group-hover:text-white/95 transition-colors duration-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Enter
          </span>
        </motion.button>

        <p
          className="text-[8px] uppercase tracking-[0.4em] text-white/18"
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
        transition={{ duration: 1.0, delay: 2.0 }}
      >
        <span
          className="h-1 w-1 rounded-full bg-white/25 animate-pulse"
          style={{ animationDuration: "3.2s" }}
        />
        <span
          className="text-[8px] uppercase tracking-[0.4em] text-white/20"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          v 1.0 · Mantle L2
        </span>
        <span
          className="h-1 w-1 rounded-full bg-white/25 animate-pulse"
          style={{ animationDuration: "3.2s", animationDelay: "1.6s" }}
        />
      </motion.div>
    </motion.div>
  );
}
