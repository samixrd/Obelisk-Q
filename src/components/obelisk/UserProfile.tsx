// A clean Web2-style user profile — avatar with monogram, name, plan tier.
// Replaces wallet/address surfacing entirely.
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  name?: string;
  email?: string;
}

export function UserProfile({ name = "Eleanor Vance", email = "eleanor@obelisk.q" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-3"
        aria-label="Open profile menu"
      >
        <span className="hidden md:flex flex-col items-end leading-tight">
          <span className="font-serif text-sm text-foreground">{name}</span>
          <span className="text-[9px] uppercase tracking-luxe text-muted-foreground">
            Private Tier
          </span>
        </span>
        <span className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-metal shadow-dial">
          <span className="font-serif italic text-[13px] text-primary-foreground">{initials}</span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-neon shadow-neon ring-2 ring-background" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-4 w-72 glass-card rounded-sm p-6 z-50"
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-metal shadow-dial">
                <span className="font-serif italic text-base text-primary-foreground">{initials}</span>
              </span>
              <div className="min-w-0">
                <p className="font-serif text-base text-foreground truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
            <div className="hairline mb-4" />
            <div className="space-y-3">
              <Row label="Member since" value="2026" />
              <Row label="Plan" value="Private" />
              <Row label="Concierge" value="Available" accent />
            </div>
            <div className="hairline my-4" />
            <button className="w-full text-left text-[10px] uppercase tracking-luxe text-muted-foreground hover:text-foreground transition-colors duration-500 py-2">
              Account settings
            </button>
            <button className="w-full text-left text-[10px] uppercase tracking-luxe text-muted-foreground hover:text-foreground transition-colors duration-500 py-2">
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-luxe text-muted-foreground">{label}</span>
      <span className={`font-mono-num text-xs ${accent ? "text-neon" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
