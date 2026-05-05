import { useState } from "react";

const SYMBOLS = ["+", "−", "=", "~", "×", "÷", "∑", "∞", "Δ", "π", "√", "∫"];

export function FloatingSymbols() {
  const [symbols] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      char: SYMBOLS[i % SYMBOLS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 22,
      opacity: 0.04 + Math.random() * 0.06,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * -20,
    }))
  );

  return (
    <div className="landing-symbols" aria-hidden>
      {symbols.map((s, i) => (
        <span
          key={i}
          className="landing-symbol"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}
