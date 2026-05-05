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
      {/* Left Brace { */}
      <path 
        d="M 36 20 L 26 20 Q 18 20 18 28 L 18 42 Q 18 50 10 50 Q 18 50 18 58 L 18 72 Q 18 80 26 80 L 36 80" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Right Brace } */}
      <path 
        d="M 64 20 L 74 20 Q 82 20 82 28 L 82 42 Q 82 50 90 50 Q 82 50 82 58 L 82 72 Q 82 80 74 80 L 64 80" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Capital Q */}
      <circle 
        cx="50" 
        cy="50" 
        r="15" 
        stroke="currentColor" 
        strokeWidth="7" 
        fill="none" 
      />
      {/* Q Tail */}
      <path 
        d="M 58 58 L 66 66" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
