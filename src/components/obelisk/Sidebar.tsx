import { motion, AnimatePresence } from "framer-motion";
import { 
  IconSafeguards, 
  IconPortfolio, 
  IconLogs, 
  IconPreferences,
  IconClose,
  IconArrowUpRight
} from "./LineIcons";
import { DashboardTab } from "./Dashboard.tsx";
import { Logo } from "./Logo";
import { useTheme } from "@/hooks/useTheme";

interface SidebarProps {
  open: boolean;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onClose: () => void;
}

const MENU_ITEMS = [
  { icon: IconArrowUpRight, label: "Earn",         tab: "earn"         },
  { icon: IconPortfolio,    label: "Portfolio",    tab: "portfolio"    },
  { icon: IconSafeguards,   label: "Safeguards",   tab: "safeguards"   },
  { icon: IconLogs,         label: "Agent Logs",   tab: "agent-logs"   },
  { icon: IconPreferences,  label: "Preferences",  tab: "preferences"  },
];

export function Sidebar({ open, activeTab, onTabChange, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-[320px] flex flex-col bg-card border-r border-foreground/5 p-6 md:p-10 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconClose size={20} />
            </button>

            {/* Brand area */}
            <div className="mb-14 px-2">
              <div className="flex items-center gap-3 mb-2">
                <Logo size={40} className="text-foreground" />
                <span className="text-xl font-semibold tracking-tight text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Obelisk Q
                </span>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    onTabChange(item.tab as DashboardTab);
                    onClose();
                  }}
                  className="group relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300"
                >
                  {/* Active background indicator */}
                  {activeTab === item.tab && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}

                  {/* Icon */}
                  <div className={`relative z-10 transition-colors duration-300 ${
                    activeTab === item.tab ? "text-foreground" : "text-muted-foreground/40 group-hover:text-foreground/60"
                  }`}>
                    <item.icon size={18} />
                  </div>

                  {/* Label */}
                  <span
                    className={`relative z-10 text-sm capitalize transition-colors duration-300 ${
                      activeTab === item.tab ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground/70"
                    }`}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Dot indicator */}
                  {activeTab === item.tab && (
                    <motion.div
                      layoutId="active-dot"
                      className="relative z-10 ml-auto h-1 w-1 rounded-full bg-foreground"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Footer info & Theme Toggle */}
            <div className="mt-auto px-3">
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-4 w-full px-3 py-3 mb-6 rounded-xl border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all"
              >
                <div className="text-muted-foreground">
                  {theme === 'light' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground capitalize">{theme} Mode</span>
              </button>

              <div className="hairline mb-6 opacity-30" />
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                <span className="text-[10px] uppercase text-muted-foreground/40 tracking-[0.2em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Engine v1.02.4
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
