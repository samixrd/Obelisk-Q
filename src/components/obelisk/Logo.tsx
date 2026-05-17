import { ImgHTMLAttributes } from "react";
import logoSvg from "./logo.svg";

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function Logo({ size = 28, ...props }: LogoProps) {
  return (
    <img 
      src={logoSvg} 
      alt="Obelisk Logo" 
      width={size} 
      height={size} 
      style={{ 
        width: size, 
        height: size, 
        objectFit: "contain",
        borderRadius: "20%" // subtle premium rounded corners matching the original brand asset
      }}
      className={`select-none shrink-0 ${props.className || ""}`}
      {...props}
    />
  );
}
