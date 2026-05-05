import { motion, AnimatePresence } from "framer-motion";
import { 
  IconOverview, 
  IconPerformance, 
  IconSafeguards, 
  IconPortfolio, 
  IconLogs, 
  IconPreferences,
  IconClose
} from "./LineIcons";
import { DashboardTab } from "./Dashboard.tsx";
import { Logo } from "./Logo";

interface SidebarProps {
  open: boolean;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onClose: () => void;
}

const MENU_ITEMS = [
  { icon: IconOverview,     label: "Overview",     tab: "overview"     },
  { icon: IconPerformance,  label: "Performance",  tab: "performance"  },
  { icon: IconPortfolio,    label: "Portfolio",    tab: "portfolio"    },
  { icon: IconSafeguards,   label: "Safeguards",   tab: "safeguards"   },
  { icon: IconLogs,         label: "Agent Logs",   tab: "agent-logs"   },
  { icon: IconAssetInfo,    label: "Assets",       tab: "assets"       },
  { icon: IconPreferences,  label: "Preferences",  tab: "preferences"  },
];

export function Sidebar({ open, activeTab, onTabChange, onClose }: SidebarProps) {
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
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-[320px] flex flex-col bg-white border-r border-foreground/5 p-6 md:p-10 shadow-2xl"
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

            {/* Footer info */}
            <div className="mt-auto px-3">
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
