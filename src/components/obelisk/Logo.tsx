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
      {/* Braces { } */}
      <path 
        d="M30 20 C20 20 20 30 20 40 L20 45 C20 50 15 50 15 50 C15 50 20 50 20 55 L20 60 C20 70 20 80 30 80" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M70 20 C80 20 80 30 80 40 L80 45 C80 50 85 50 85 50 C85 50 80 50 80 55 L80 60 C80 70 80 80 70 80" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Capital Q */}
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        d="M62 62 L70 70" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
