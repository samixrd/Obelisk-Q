import { motion } from "framer-motion";
import { useMemo } from "react";

interface Props {
  seed?: number;
  height?: number;
}

export function StabilityGraph({ seed = 1, height = 120 }: Props) {
  const { path, area, points } = useMemo(() => {
    const w = 800;
    const h = height;
    const n = 60;
    const pts: [number, number][] = [];
    let y = h * 0.55;
    for (let i = 0; i < n; i++) {
      const rand = Math.sin(i * 1.3 + seed * 7) * 0.5 + Math.sin(i * 0.4 + seed) * 0.5;
      y += rand * 3 - (y - h * 0.4) * 0.05;
      y = Math.max(h * 0.15, Math.min(h * 0.85, y));
      pts.push([(i / (n - 1)) * w, y]);
    }
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
    return { path, points: pts };
  }, [seed, height]);

  const last = points[points.length - 1];

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 800 ${height}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`line-${seed}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(0 0% 80%)" />
            <stop offset="70%" stopColor="hsl(0 0% 40%)" />
            <stop offset="100%" stopColor="hsl(0 0% 10%)" />
          </linearGradient>
        </defs>

        {/* Horizontal guide lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            x2="800"
            y1={height * p}
            y2={height * p}
            stroke="hsl(0 0% 10% / 0.04)"
            strokeWidth="1"
          />
        ))}
        <motion.path
          d={path}
          fill="none"
          stroke={`url(#line-${seed})`}
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {/* End-point marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute h-2 w-2 rounded-full bg-neon shadow-neon"
        style={{
          left: `calc(${(last[0] / 800) * 100}% - 4px)`,
          top: `calc(${(last[1] / height) * 100}% - 4px)`,
        }}
      />
    </div>
  );
}
