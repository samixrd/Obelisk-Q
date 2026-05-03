/**
 * UserProfile — avatar dropdown with:
 *  • Fully opaque background (no bleed-through)
 *  • NFT profile picture picker (Mantle ecosystem)
 *  • Smooth AnimatePresence transitions
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ─── Mock Mantle NFT collection data ─────────────────────────────────────────
// In production, fetch from the Mantle NFT indexer / user's wallet
const MANTLE_NFTS = [
  { id: "1", collection: "Mantle Genesis",  tokenId: "#0042", color: ["#1a1a2e", "#16213e"], accent: "#4a9eff" },
  { id: "2", collection: "Obelisk Sigil",   tokenId: "#0017", color: ["#0d0d0d", "#1a0a0a"], accent: "#ff4a6e" },
  { id: "3", collection: "MNT Cartography", tokenId: "#0231", color: ["#0a100a", "#0d1a0d"], accent: "#44ff88" },
  { id: "4", collection: "Void Protocol",   tokenId: "#0008", color: ["#100a1a", "#150d22"], accent: "#cc88ff" },
  { id: "5", collection: "Mantle Genesis",  tokenId: "#0103", color: ["#1a1000", "#221500"], accent: "#ffcc44" },
  { id: "6", collection: "Drift Series",    tokenId: "#0055", color: ["#0a1010", "#0d1a1a"], accent: "#44ddff" },
];

// ─── NFT avatar visual — abstract generative art per token ───────────────────
function NftAvatar({
  nft,
  size = 48,
  selected = false,
  onClick,
}: {
  nft: typeof MANTLE_NFTS[number];
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r  = s * 0.38;

  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 transition-all duration-400"
      style={{
        width: s, height: s,
        outline: selected ? `1px solid ${nft.accent}` : "1px solid transparent",
        outlineOffset: "2px",
        transition: "outline 0.3s ease",
      }}
      title={`${nft.collection} ${nft.tokenId}`}
    >
      <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
        <defs>
          <linearGradient id={`ng-${nft.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={nft.color[0]} />
            <stop offset="100%" stopColor={nft.color[1]} />
          </linearGradient>
          <radialGradient id={`nr-${nft.id}`} cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor={nft.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={nft.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width={s} height={s} fill={`url(#ng-${nft.id})`} />
        {/* Accent bloom */}
        <rect width={s} height={s} fill={`url(#nr-${nft.id})`} />
        {/* Abstract mark */}
        <polygon
          points={`${cx},${cy - r} ${cx + r * 0.87},${cy + r * 0.5} ${cx - r * 0.87},${cy + r * 0.5}`}
          fill="none"
          stroke={nft.accent}
          strokeWidth="0.8"
          strokeOpacity="0.65"
        />
        <circle cx={cx} cy={cy} r={r * 0.38} fill={nft.accent} fillOpacity="0.18" />
        <circle cx={cx} cy={cy} r={r * 0.14} fill={nft.accent} fillOpacity="0.55" />
        {/* Collection initial */}
        <text
          x={cx} y={cy + 3.5}
          textAnchor="middle"
          fontSize={s * 0.22}
          fontFamily="'Cormorant Garamond', serif"
          fontStyle="italic"
          fill={nft.accent}
          fillOpacity="0.80"
        >
          {nft.collection[0]}
        </text>
      </svg>
      {selected && (
        <span
          className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full flex items-center justify-center"
          style={{ background: nft.accent, boxShadow: `0 0 6px ${nft.accent}` }}
        >
          <svg viewBox="0 0 8 8" width="6" height="6"><path d="M1.5 4l2 2 3-3" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </span>
      )}
    </button>
  );
}

// ─── NFT Picker panel ─────────────────────────────────────────────────────────
function NftPickerPanel({
  selectedId,
  onSelect,
  onClose,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[9px] uppercase text-muted-foreground"
            style={{ letterSpacing: "0.3em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Mantle NFTs
          </p>
          <button
            onClick={onClose}
            className="text-[9px] uppercase text-muted-foreground hover:text-foreground transition-colors"
            style={{ letterSpacing: "0.22em", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MANTLE_NFTS.map((nft) => (
            <div key={nft.id} className="flex flex-col items-center gap-1.5">
              <NftAvatar
                nft={nft}
                size={64}
                selected={selectedId === nft.id}
                onClick={() => onSelect(nft.id)}
              />
              <p
                className="text-[8px] text-muted-foreground/55 text-center leading-tight"
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}
              >
                {nft.tokenId}
              </p>
            </div>
          ))}
        </div>

        <p
          className="mt-3 text-[9px] text-muted-foreground/35 text-center leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.01em" }}
        >
          NFTs from your connected Mantle wallet
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  onSignOut?: () => void;
}

export function UserProfile({ onSignOut }: Props) {
  const { displayName, avatarUrl, user } = useAuth();
  const email = user?.email ?? "guest@obelisk.q";

  const [open,          setOpen]          = useState(false);
  const [showNftPicker, setShowNftPicker] = useState(false);
  const [selectedNft,   setSelectedNft]  = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNftPicker(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "EV";
  const activeNft = selectedNft ? MANTLE_NFTS.find((n) => n.id === selectedNft) : null;

  const handleSelectNft = (id: string) => {
    setSelectedNft(id);
    setShowNftPicker(false);
  };

  return (
    <div className="relative" ref={ref}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen((v) => !v); setShowNftPicker(false); }}
        className="group flex items-center gap-3"
        aria-label="Open profile menu"
      >
        <span className="hidden md:flex flex-col items-end leading-tight">
          <span className="font-serif text-sm text-foreground">{displayName}</span>
          <span className="text-[9px] uppercase tracking-luxe text-muted-foreground">
            Private Tier
          </span>
        </span>

        {/* Avatar — shows Google photo, NFT, or initials */}
        <span className="relative inline-flex items-center justify-center h-10 w-10 rounded-full overflow-hidden shadow-dial">
          {activeNft ? (
            <NftAvatar nft={activeNft} size={40} />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt={displayName}
              className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="w-full h-full inline-flex items-center justify-center bg-gradient-metal">
              <span className="font-serif italic text-[13px] text-primary-foreground">{initials}</span>
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-neon shadow-neon ring-2 ring-background" />
        </span>
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-4 w-80 z-50"
            style={{
              /* Fully opaque — no background bleed */
              background: "rgb(10, 10, 14)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 32px 64px -16px rgba(0,0,0,0.98), 0 8px 24px -8px rgba(0,0,0,0.9)",
            }}
          >
            {/* Top accent line */}
            <div className="h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }} />

            <div className="p-6">
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-5">
                {/* Large avatar */}
                <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 shadow-dial"
                  style={{
                    background: activeNft
                      ? `linear-gradient(135deg, ${activeNft.color[0]}, ${activeNft.color[1]})`
                      : undefined,
                  }}
                >
                  {activeNft ? (
                    <NftAvatar nft={activeNft} size={48} />
                  ) : (
                    <span className="w-full h-full inline-flex items-center justify-center bg-gradient-metal">
                      <span className="font-serif italic text-base text-primary-foreground">{initials}</span>
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-base text-foreground truncate">{displayName}</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}>
                    {email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="h-1 w-1 rounded-full"
                      style={{ background: "hsl(104 100% 68%)", boxShadow: "0 0 4px hsl(104 100% 68% / 0.6)" }} />
                    <span
                      className="text-[8px] uppercase text-muted-foreground/60"
                      style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      ERC-8004 · Q-Agent
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="h-px mb-4"
                style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="space-y-2.5 mb-4">
                <Row label="Member since" value="2026" />
                <Row label="Plan"         value="Private" />
                <Row label="Concierge"    value="Available" accent />
              </div>

              {/* NFT profile option */}
              <div className="h-px mb-4"
                style={{ background: "rgba(255,255,255,0.07)" }} />

              <button
                onClick={() => setShowNftPicker((v) => !v)}
                className="group w-full flex items-center justify-between py-2.5 px-3 transition-colors duration-400"
                style={{
                  background: showNftPicker ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  border: "0.5px solid rgba(255,255,255,0.09)",
                  transition: "all 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = showNftPicker
                    ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                }}
              >
                <div className="flex items-center gap-2.5">
                  {/* NFT icon */}
                  <svg viewBox="0 0 14 14" width="12" height="12" fill="none"
                    className="text-muted-foreground group-hover:text-foreground/70 transition-colors">
                    <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                    <path d="M1 9.5l3-3 2.5 2.5 2-2 3.5 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="4.5" cy="4.5" r="1" fill="currentColor" fillOpacity="0.6"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[11px] text-foreground/75 group-hover:text-foreground transition-colors"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
                      NFT profile picture
                    </p>
                    <p className="text-[8px] text-muted-foreground/50 mt-0.5"
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em" }}>
                      {selectedNft
                        ? `${activeNft?.collection} ${activeNft?.tokenId}`
                        : "Use a Mantle ecosystem NFT"}
                    </p>
                  </div>
                </div>
                <svg viewBox="0 0 10 10" width="8" height="8" fill="none"
                  className="text-muted-foreground/40 flex-shrink-0 transition-transform duration-300"
                  style={{ transform: showNftPicker ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Collapsible NFT picker */}
              <AnimatePresence>
                {showNftPicker && (
                  <NftPickerPanel
                    selectedId={selectedNft}
                    onSelect={handleSelectNft}
                    onClose={() => setShowNftPicker(false)}
                  />
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="h-px mt-4 mb-3"
                style={{ background: "rgba(255,255,255,0.07)" }} />
              <button
                className="w-full text-left text-[9px] uppercase text-muted-foreground hover:text-foreground transition-colors duration-400 py-2"
                style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
              >
                Account settings
              </button>
              <button
                onClick={() => { setOpen(false); onSignOut?.(); }}
                className="w-full text-left text-[9px] uppercase text-muted-foreground hover:text-foreground transition-colors duration-400 py-2"
                style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[9px] uppercase text-muted-foreground"
        style={{ letterSpacing: "0.28em", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </span>
      <span
        className="text-[11px]"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: accent ? "hsl(104 100% 68%)" : "rgba(255,255,255,0.75)",
          textShadow: accent ? "0 0 8px hsl(104 100% 68% / 0.4)" : "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}
