import { useEffect, useState } from "react";
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
import type { DashboardTab } from "@/components/obelisk/Dashboard";

type AppStage = "landing" | "auth" | "dashboard";

function AppInner() {
  const { user, walletAddress, setWalletAddress, setAuthMethod, logout } = useAuth();

  const [stage,          setStage]          = useState<AppStage>("landing");
  const [walletModal,    setWalletModal]     = useState(false);
  const [sidebarOpen,    setSidebarOpen]     = useState(false);
  const [tourOpen,       setTourOpen]        = useState(false);
  const [activeTab,      setActiveTab]       = useState<DashboardTab>("overview");

  // If Firebase auto-restores a Google session, skip auth screen
  useEffect(() => {
    if (user && stage === "auth") setStage("dashboard");
  }, [user, stage]);

  useEffect(() => {
    if (stage === "dashboard" && shouldShowTour()) {
      const id = setTimeout(() => setTourOpen(true), 800);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const handleAuthenticated = (method: "google" | "wallet") => {
    setAuthMethod(method);
    if (method === "wallet") setWalletAddress("connected");
    setStage("dashboard");
  };

  const needsWallet = !!user && !walletAddress;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#f5f5f8" }}>

      {/* Landing → Auth */}
      <AnimatePresence mode="wait">
        {stage === "landing" && (
          <LandingPage key="landing" onEnter={() => setStage("auth")} />
        )}
        {stage === "auth" && (
          <AuthScreen key="auth" onAuthenticated={handleAuthenticated} />
        )}
      </AnimatePresence>

      {/* Dashboard */}
      <AnimatePresence>
        {stage === "dashboard" && (
          <motion.div key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}>

            <div aria-hidden
              className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay"
              style={{ backgroundImage: "radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />
            <StatePlot className="fixed inset-0 z-0 opacity-[0.55]" />

            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onTourClick={() => setTourOpen(true)}
              needsWallet={needsWallet}
              walletAddress={walletAddress}
              onConnectWallet={() => setWalletModal(true)}
              onSignOut={async () => { await logout(); setStage("landing"); }}
            />

            <Sidebar
              open={sidebarOpen}
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />

            <Dashboard
              activeTab={activeTab}
              onTabChange={setActiveTab}
              walletAddress={walletAddress}
              onConnectWallet={() => setWalletModal(true)}
            />

            <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />

            <WalletConnectModal
              open={walletModal}
              onClose={() => setWalletModal(false)}
              onConnected={(addr) => { setWalletAddress(addr); setWalletModal(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Index = () => (
  <AuthProvider>
    <StabilityProvider>
      <AppInner />
    </StabilityProvider>
  </AuthProvider>
);

export default Index;
