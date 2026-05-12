// Obelisk Q — ambient System Stability state-space plot.
// Renders a minimalist Lissajous/Nyquist-style closed curve with a faint
// orbital trace and an axis cross. Gently pulses to indicate the AI agent
// is alive and observing. Pure SVG, 1px lines, monochrome.

import { useEffect, useState } from "react";

interface Props {
  className?: string;
}

const W = 1200;
const H = 1200;
const CX = W / 2;
const CY = H / 2;

// Generate a Lissajous-like state-space curve. Smooth, closed, organic.
function buildCurve(a: number, b: number, delta: number, rx: number, ry: number, steps = 480) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = CX + rx * Math.sin(a * t + delta);
    const y = CY + ry * Math.sin(b * t);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return "M" + pts.join(" L") + " Z";
}

export function StatePlot({ className }: Props) {
  // Slowly drift the phase of the inner trace so the curve "breathes".
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      setPhase(((now - start) / 18000) * Math.PI * 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Three nested curves: an outer envelope, a primary state trajectory,
  // and a small inner orbit. Slight phase drift on the primary trace.
  const outer = buildCurve(3, 2, Math.PI / 2, 480, 320);
  const primary = buildCurve(5, 4, phase, 360, 360);
  const inner = buildCurve(2, 3, -phase * 0.5, 180, 240);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className ?? ""}`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-[140%] h-[140%] max-w-none -translate-y-[4%]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Radial fade so curves dissolve at the edges */}
          <radialGradient id="state-fade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="hsl(0 0% 100%)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="state-fade-faint" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.22" />
            <stop offset="70%" stopColor="hsl(0 0% 100%)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
          </radialGradient>
          <mask id="state-mask">
            <rect width={W} height={H} fill="url(#state-fade)" />
          </mask>
          <mask id="state-mask-faint">
            <rect width={W} height={H} fill="url(#state-fade-faint)" />
          </mask>
        </defs>

        {/* Axis cross — the "Re/Im" grid spine */}
        <g mask="url(#state-mask-faint)" stroke="hsl(0 0% 100%)" strokeWidth="1">
          <line x1={CX} y1={CY - 520} x2={CX} y2={CY + 520} opacity="0.18" />
          <line x1={CX - 520} y1={CY} x2={CX + 520} y2={CY} opacity="0.18" />
          {/* Concentric reference circles */}
          {[120, 240, 360, 480].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" opacity="0.10" />
          ))}
          {/* Tick marks along the real axis */}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
            <line
              key={`tx-${i}`}
              x1={CX + i * 120}
              x2={CX + i * 120}
              y1={CY - 6}
              y2={CY + 6}
              opacity="0.22"
            />
          ))}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
            <line
              key={`ty-${i}`}
              y1={CY + i * 120}
              y2={CY + i * 120}
              x1={CX - 6}
              x2={CX + 6}
              opacity="0.22"
            />
          ))}
        </g>

        {/* Outer envelope — static, ghosted */}
        <g mask="url(#state-mask-faint)">
          <path
            d={outer}
            fill="none"
            stroke="hsl(0 0% 100%)"
            strokeWidth="1"
            opacity="0.18"
            className="animate-pulse-slow"
          />
        </g>

        {/* Primary state trajectory — pulses to show agent activity */}
        <g mask="url(#state-mask)" className="animate-state-breathe">
          <path
            d={primary}
            fill="none"
            stroke="hsl(0 0% 100%)"
            strokeWidth="1"
            opacity="0.45"
          />
        </g>

        {/* Inner orbit */}
        <g mask="url(#state-mask)">
          <path
            d={inner}
            fill="none"
            stroke="hsl(0 0% 100%)"
            strokeWidth="1"
            opacity="0.30"
            className="animate-state-breathe"
            style={{ animationDelay: "1.6s" }}
          />
        </g>

        {/* Origin point — the agent's centroid */}
        <circle cx={CX} cy={CY} r="2" fill="hsl(104 100% 78%)" opacity="0.7">
          <animate
            attributeName="opacity"
            values="0.4;0.9;0.4"
            dur="3.6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
