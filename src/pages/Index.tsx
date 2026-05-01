import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/components/obelisk/LandingPage";
import { AuthScreen } from "@/components/obelisk/AuthScreen";
import { Header } from "@/components/obelisk/Header";
import { Sidebar } from "@/components/obelisk/Sidebar";
import { Dashboard } from "@/components/obelisk/Dashboard";
import { GuidedTour, shouldShowTour } from "@/components/obelisk/GuidedTour";
import { StatePlot } from "@/components/obelisk/StatePlot";
import { StabilityProvider } from "@/components/obelisk/StabilityContext";
import type { DashboardTab } from "@/components/obelisk/Dashboard";

type AppStage = "landing" | "auth" | "dashboard";

const Index = () => {
  const [stage, setStage] = useState<AppStage>("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  useEffect(() => {
    if (stage === "dashboard" && shouldShowTour()) {
      const id = setTimeout(() => setTourOpen(true), 800);
      return () => clearTimeout(id);
    }
  }, [stage]);

  return (
    <StabilityProvider>
      <div className="relative min-h-screen bg-background overflow-x-hidden">

        {/* ── Cinematic Landing Page ── */}
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <LandingPage key="landing" onEnter={() => setStage("auth")} />
          )}
        </AnimatePresence>

        {/* ── Auth Screen ── */}
        <AnimatePresence mode="wait">
          {stage === "auth" && (
            <AuthScreen key="auth" onAuthenticated={() => setStage("dashboard")} />
          )}
        </AnimatePresence>

        {/* ── Dashboard ── */}
        <AnimatePresence>
          {stage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Ambient grain */}
              <div
                aria-hidden
                className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)",
                  backgroundSize: "3px 3px",
                }}
              />

              {/* State-space stability plot */}
              <StatePlot className="fixed inset-0 z-0 opacity-[0.55]" />

              {/* Subtle floor glow */}
              <div
                aria-hidden
                className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-[42%] h-[500px] w-[800px] rounded-full opacity-25"
                style={{
                  background:
                    "radial-gradient(ellipse, hsl(104 100% 78% / 0.05), transparent 60%)",
                }}
              />

              <Header
                onMenuClick={() => setSidebarOpen(true)}
                onTourClick={() => setTourOpen(true)}
              />

              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeTab={activeTab}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
              />

              <Dashboard
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StabilityProvider>
  );
};

export default Index;
