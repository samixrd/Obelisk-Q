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
import type { DashboardTab } from "@/components/obelisk/Dashboard";

type AppStage = "landing" | "auth" | "dashboard";
type AuthMethod = "google" | "wallet" | null;

const Index = () => {
  const [stage, setStage]               = useState<AppStage>("landing");
  const [authMethod, setAuthMethod]     = useState<AuthMethod>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [tourOpen, setTourOpen]         = useState(false);
  const [activeTab, setActiveTab]       = useState<DashboardTab>("overview");

  useEffect(() => {
    if (stage === "dashboard" && shouldShowTour()) {
      const id = setTimeout(() => setTourOpen(true), 800);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const handleAuthenticated = (method: AuthMethod) => {
    setAuthMethod(method);
    // If wallet auth, treat address as connected immediately
    if (method === "wallet") setWalletAddress("0x4f3a…c12e");
    setStage("dashboard");
  };

  // Google user has no wallet yet
  const needsWallet = authMethod === "google" && !walletAddress;

  return (
    <StabilityProvider>
      <div className="relative min-h-screen bg-background overflow-x-hidden">

        {/* Landing → Auth */}
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <LandingPage key="landing" onEnter={() => setStage("auth")} />
          )}
          {stage === "auth" && (
            <AuthScreen
              key="auth"
              onAuthenticated={handleAuthenticated}
            />
          )}
        </AnimatePresence>

        {/* Dashboard */}
        <AnimatePresence>
          {stage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
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
              <div
                aria-hidden
                className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-[42%] h-[500px] w-[800px] rounded-full opacity-25"
                style={{ background: "radial-gradient(ellipse, hsl(104 100% 78% / 0.05), transparent 60%)" }}
              />

              <Header
                onMenuClick={() => setSidebarOpen(true)}
                onTourClick={() => setTourOpen(true)}
                needsWallet={needsWallet}
                walletAddress={walletAddress}
                onConnectWallet={() => setWalletModalOpen(true)}
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
                walletAddress={walletAddress}
                onConnectWallet={() => setWalletModalOpen(true)}
              />

              <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />

              <WalletConnectModal
                open={walletModalOpen}
                onClose={() => setWalletModalOpen(false)}
                onConnected={(addr) => {
                  setWalletAddress(addr);
                  setWalletModalOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StabilityProvider>
  );
};

export default Index;
