// Obelisk Q — custom monochrome 1px line icons.
// All icons share a uniform 24×24 viewBox, currentColor stroke, 1px width,
// rounded caps. Designed to feel architectural and instrument-like rather
// than UI-conventional.

import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: IconProps) => ({
  width: p.size ?? 16,
  height: p.size ?? 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

// Menu — three perfectly even hairlines
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="16" x2="14" y2="16" />
  </svg>
);

// Close — fine cross
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

// Arrow right — minimal vector
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="3" y1="12" x2="20" y2="12" />
    <polyline points="14,6 20,12 14,18" />
  </svg>
);

// Arrow up-right (positive delta)
export const IconArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="6" y1="18" x2="18" y2="6" />
    <polyline points="9,6 18,6 18,15" />
  </svg>
);

// Arrow down-right (negative delta)
export const IconArrowDownRight = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <polyline points="18,9 18,18 9,18" />
  </svg>
);

// Overview — quartered grid
export const IconOverview = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="7" height="7" />
    <rect x="13" y="4" width="7" height="7" />
    <rect x="4" y="13" width="7" height="7" />
    <rect x="13" y="13" width="7" height="7" />
  </svg>
);

// Performance — rising line through axes
export const IconPerformance = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="4,4 4,20 20,20" />
    <polyline points="6,16 10,12 14,14 19,7" />
  </svg>
);

// Portfolio — stacked horizontal layers (vault drawers)
export const IconPortfolio = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="16" height="4" />
    <rect x="4" y="11" width="16" height="3" />
    <rect x="4" y="16" width="16" height="3" />
  </svg>
);

// Safeguards — tall thin shield
export const IconSafeguards = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 L19 6 V12 C19 16.5 15.5 19.5 12 21 C8.5 19.5 5 16.5 5 12 V6 Z" />
  </svg>
);

// Agent — single eye with concentric ring
export const IconAgent = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </svg>
);

// Preferences — two horizontal sliders
export const IconPreferences = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <circle cx="9" cy="9" r="2" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <circle cx="15" cy="15" r="2" />
  </svg>
);

// Logs — four simple hairlines (list)
export const IconLogs = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="5" y1="7" x2="19" y2="7" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <line x1="5" y1="17" x2="15" y2="17" />
  </svg>
);
