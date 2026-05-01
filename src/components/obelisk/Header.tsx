import { motion } from "framer-motion";
import { IconMenu } from "./LineIcons";
import { UserProfile } from "./UserProfile";

interface HeaderProps {
  onMenuClick: () => void;
  onTourClick?: () => void;
}

export function Header({ onMenuClick, onTourClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-14 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            <IconMenu size={16} />
          </button>
          <div className="h-4 w-px bg-border-strong/60" />
          <h1 className="font-serif text-[26px] leading-none tracking-tightest text-foreground">
            Obelisk <span className="italic font-light">Q</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <span className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-luxe text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-neon shadow-neon" />
            Mantle Network
          </span>
          {onTourClick && (
            <button
              onClick={onTourClick}
              className="hidden md:inline-block text-[10px] uppercase tracking-luxe text-muted-foreground hover:text-foreground transition-colors duration-500"
            >
              Guided tour
            </button>
          )}
          <UserProfile />
        </div>
      </div>
      <div className="hairline" />
    </motion.header>
  );
}

