import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/components/obelisk/LandingPage";
import { AuthScreen } from "@/components/obelisk/AuthScreen";
import { Header } from "@/components/obelisk/Header";
import { Sidebar } from "@/components/obelisk/Sidebar";
import { Dashboard } from "@/components/obelisk/Dashboard";
import { GuidedTour, shouldShowTour } from "@/components/obelisk/GuidedTour";
import { WalletConnectModal } from "@/components/obelisk/WalletConnectModal";
import { StatePlot } from "@/components/obelisk/StatePlot";
import { StabilityProvider } from "@/components/obelisk/StabilityContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AgentDataProvider } from "@/hooks/useAgentData";
import type { DashboardTab } from "@/components/obelisk/Dashboard";

type AppStage = "landing" | "auth" | "dashboard";

function AppInner() {
  const { walletAddress, setWalletAddress, setAuthMethod, logout } = useAuth();

  const [stage, setStage] = useState<AppStage>(() => {
    const savedToken = localStorage.getItem("obelisk_session");
    const savedAddr = localStorage.getItem("obelisk_address");
    return (savedToken && savedAddr) ? "dashboard" : "landing";
  });
  
  const [walletModal,    setWalletModal]     = useState(false);
  const [sidebarOpen,    setSidebarOpen]     = useState(false);
  const [tourOpen,       setTourOpen]        = useState(false);
  const [activeTab,      setActiveTab]       = useState<DashboardTab>(() => {
    return (localStorage.getItem("obelisk_tab") as DashboardTab) || "earn";
  });
  
  // Persist active tab
  useEffect(() => {
    localStorage.setItem("obelisk_tab", activeTab);
  }, [activeTab]);

  // Handle stage transitions
  useEffect(() => {
    const hasSession = !!localStorage.getItem("obelisk_session");
    const hasWallet = !!walletAddress;

    if (hasSession && hasWallet) {
      if (stage !== "dashboard") setStage("dashboard");
    } else if (stage === "dashboard") {
      setStage("landing");
    }
  }, [walletAddress, stage]);

  // Global scroll restoration: snap to top on tab or stage change
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab, stage]);

  useEffect(() => {
    if (stage === "dashboard" && shouldShowTour()) {
      const id = setTimeout(() => setTourOpen(true), 800);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const handleAuthenticated = () => {
    setAuthMethod("wallet");
    setStage("dashboard");
  };

  const needsWallet = !walletAddress;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#f5f5f8" }}>

      <AnimatePresence mode="wait">
        {stage === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <LandingPage onEnter={() => {
              const hasSession = !!localStorage.getItem("obelisk_session");
              const hasWallet = !!walletAddress;
              if (hasSession && hasWallet) {
                setStage("dashboard");
              } else {
                setStage("auth");
              }
            }} />
          </motion.div>
        )}
        
        {stage === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <AuthScreen onAuthenticated={handleAuthenticated} />
          </motion.div>
        )}

        {stage === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay"
              style={{
                backgroundImage: "radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)",
                backgroundSize: "3px 3px",
              }}
            />
            <StatePlot className="fixed inset-0 z-0 opacity-[0.55]" />

            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onLogoClick={() => setStage("landing")}
              onTourClick={() => setTourOpen(true)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              needsWallet={needsWallet}
              walletAddress={walletAddress}
              onConnectWallet={() => setWalletModal(true)}
              onSignOut={async () => {
                await logout();
                setStage("landing");
              }}
            />

            <Sidebar
              open={sidebarOpen}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }}
              onClose={() => setSidebarOpen(false)}
            />

            <Dashboard
              key={activeTab}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              walletAddress={walletAddress}
              onConnectWallet={() => setWalletModal(true)}
            />

            <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />

            <WalletConnectModal
              open={walletModal}
              onClose={() => setWalletModal(false)}
              onConnected={(addr) => {
                setWalletAddress(addr);
                setWalletModal(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Index = () => (
  <AuthProvider>
    <AgentDataProvider>
      <StabilityProvider>
        <AppInner />
      </StabilityProvider>
    </AgentDataProvider>
  </AuthProvider>
);

export default Index;
