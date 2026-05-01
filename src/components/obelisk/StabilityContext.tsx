// Shared stability state — drives the obelisk glow intensity and any
// other "agent vitality" cues across the app.
import { createContext, useContext, useState, ReactNode } from "react";

interface StabilityState {
  score: number; // 0–100
  setScore: (n: number) => void;
}

const Ctx = createContext<StabilityState | null>(null);

export function StabilityProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState(98);
  return <Ctx.Provider value={{ score, setScore }}>{children}</Ctx.Provider>;
}

export function useStability() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStability must be used within StabilityProvider");
  return v;
}
