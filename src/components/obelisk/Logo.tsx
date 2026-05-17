import { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 28, ...props }: LogoProps) {
  // Generate radiating rays dynamically for high-precision rendering
  const tlRays = [];
  for (let i = 0; i <= 11; i++) {
    const angle = 180 + (i * 8.18); // Spread across the top-left quadrant (180 to 270 deg)
    const rad = (angle * Math.PI) / 180;
    const x2 = 50 + Math.cos(rad) * 44;
    const y2 = 50 + Math.sin(rad) * 44;
    tlRays.push(
      <line 
        key={`tl-${i}`} 
        x1="50" 
        y1="50" 
        x2={x2} 
        y2={y2} 
        stroke="#7bf1be" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    );
  }

  const brRays = [];
  for (let i = 0; i <= 11; i++) {
    const angle = i * 8.18; // Spread across the bottom-right quadrant (0 to 90 deg)
    const rad = (angle * Math.PI) / 180;
    const x2 = 50 + Math.cos(rad) * 44;
    const y2 = 50 + Math.sin(rad) * 44;
    brRays.push(
      <line 
        key={`br-${i}`} 
        x1="50" 
        y1="50" 
        x2={x2} 
        y2={y2} 
        stroke="#7bf1be" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-xl shadow-md ${props.className || ""}`}
      {...props}
    >
      {/* Background with brand deep forest green */}
      <rect width="100" height="100" rx="22" fill="#043224" />

      {/* Top-Right Quadrant: Solid Rounded Block */}
      <path 
        d="M 52 48 L 82 48 C 85 48, 86 47, 86 44 L 86 18 C 86 15, 83 14, 68 14 C 54 14, 52 16, 52 24 Z" 
        fill="#7bf1be" 
        stroke="#7bf1be"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Bottom-Left Quadrant: Solid Rounded Block */}
      <path 
        d="M 48 52 L 18 52 C 15 52, 14 53, 14 56 L 14 82 C 14 85, 17 86, 32 86 C 46 86, 48 84, 48 76 Z" 
        fill="#7bf1be" 
        stroke="#7bf1be"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Top-Left Quadrant: Radiating Rays */}
      {tlRays}

      {/* Bottom-Right Quadrant: Radiating Rays */}
      {brRays}

      {/* Center connector accent */}
      <circle cx="50" cy="50" r="2.5" fill="#7bf1be" />
    </svg>
  );
}
