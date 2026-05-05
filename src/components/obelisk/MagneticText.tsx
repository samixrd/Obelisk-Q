import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export function MagneticText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={className} style={{ display: "inline-flex", flexWrap: "wrap", columnGap: "0.25em" }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((char, i) => (
            <MagneticChar key={i} char={char} mousePos={mousePos} />
          ))}
        </span>
      ))}
    </div>
  );
}

function MagneticChar({ char, mousePos }: { char: string; mousePos: { x: number; y: number } }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const charX = rect.left + rect.width / 2;
    const charY = rect.top + rect.height / 2;

    const dx = mousePos.x - charX;
    const dy = mousePos.y - charY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const threshold = 120;
    if (dist < threshold) {
      const power = (threshold - dist) / threshold;
      setPosition({ x: dx * power * 0.25, y: dy * power * 0.25 });
      setScale(1 + power * 0.3);
    } else {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  }, [mousePos]);

  return (
    <motion.span
      ref={ref}
      style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
      animate={{ x: position.x, y: position.y, scale }}
      transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.8 }}
    >
      {char}
    </motion.span>
  );
}
