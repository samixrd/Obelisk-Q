import { AnimatePresence, motion } from "framer-motion";
import {
  IconClose,
  IconOverview,
  IconPerformance,
  IconPortfolio,
  IconSafeguards,
  IconAgent,
  IconPreferences,
} from "./LineIcons";
import type { DashboardTab } from "./Dashboard";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab?: DashboardTab;
  onNavigate?: (tab: DashboardTab) => void;
}

const items: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  tab?: DashboardTab;
}[] = [
  { icon: IconOverview, label: "Overview", tab: "overview" },
  { icon: IconPerformance, label: "Performance", tab: "performance" },
  { icon: IconPortfolio, label: "Portfolio", tab: "overview" },
  { icon: IconSafeguards, label: "Safeguards", tab: "safeguards" },
  { icon: IconAgent, label: "Agent Logs" },
  { icon: IconPreferences, label: "Preferences" },
];

export function Sidebar({ open, onClose, activeTab, onNavigate }: SidebarProps) {
  const handleItemClick = (tab?: DashboardTab) => {
    if (tab && onNavigate) {
      onNavigate(tab);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[360px] glass-card border-r border-border-strong/40 p-10"
          >
            <div className="flex items-center justify-between mb-16">
              <span
                className="text-[10px] uppercase text-muted-foreground"
                style={{ letterSpacing: "0.28em" }}
              >
                Navigation
              </span>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconClose size={16} />
              </button>
            </div>

            <nav className="space-y-1">
              {items.map((item, i) => {
                const isActive = item.tab && activeTab === item.tab;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.05,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => handleItemClick(item.tab)}
                    className="group w-full flex items-center gap-4 py-4 text-left border-b border-border/40 hover:border-border-strong transition-all duration-500"
                    style={{
                      borderBottomColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : undefined,
                    }}
                  >
                    <item.icon
                      size={14}
                      className={`transition-colors duration-500 ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span
                      className={`text-xl transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-foreground/90 group-hover:text-foreground"
                      }`}
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        letterSpacing: item.tab === activeTab ? "-0.03em" : "-0.02em",
                      }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="ml-auto h-1 w-1 rounded-full"
                        style={{
                          background: "hsl(104 100% 68%)",
                          boxShadow: "0 0 5px hsl(104 100% 68% / 0.7)",
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="absolute bottom-10 left-10 right-10">
              <div className="hairline mb-6" />
              <p
                className="text-[10px] uppercase text-muted-foreground mb-2"
                style={{ letterSpacing: "0.28em" }}
              >
                Protocol
              </p>
              <p
                className="text-sm text-foreground/80"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Mantle Network · L2
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
