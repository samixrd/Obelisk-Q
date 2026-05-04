import { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 28, ...props }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Black Triangle */}
      <path 
        d="M50 5 L98 95 L2 95 Z" 
        fill="currentColor" 
      />
      {/* White 'Q' Cutout */}
      <g transform="translate(70, 75)">
        {/* Ring */}
        <circle 
          cx="0" 
          cy="0" 
          r="10" 
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
        />
        {/* Gap and Tail */}
        <path 
          d="M7 7 L14 14" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </g>
    </svg>
  );
}
