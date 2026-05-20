import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/components/obelisk/LandingPage";
import { AuthScreen } from "@/components/obelisk/AuthScreen";
import { Header } from "@/components/obelisk/Header";
import { Sidebar } from "@/components/obelisk/Sidebar";
import { Dashboard } from "@/components/obelisk/Dashboard";
import { GuidedTour, shouldShowTour } from "@/components/obelisk/GuidedTour";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { StatePlot } from "@/components/obelisk/StatePlot";
import { StabilityProvider } from "@/components/obelisk/StabilityContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AgentDataProvider } from "@/hooks/useAgentData";
import type { DashboardTab } from "@/components/obelisk/Dashboard";

type AppStage = "landing" | "auth" | "dashboard";

function AppInner() {
  const { walletAddress, setWalletAddress, setAuthMethod, sessionToken, logout } = useAuth();
  const { toast } = useToast();

  const [stage, setStage] = useState<AppStage>(() => {
    // Check if stage was explicitly saved (e.g. from a reload or guest navigation)
    const savedStage = localStorage.getItem("obelisk_stage") as AppStage | null;
    if (savedStage === "dashboard" || savedStage === "auth" || savedStage === "landing") {
      return savedStage;
    }
    // Check both session and persistent storage for initial state fallback
    const savedToken = sessionStorage.getItem("obelisk_session") || localStorage.getItem("obelisk_session");
    const savedAddr = localStorage.getItem("obelisk_address");
    return (savedToken && savedAddr) ? "dashboard" : "landing";
  });
  
  const { login, authenticated, user, logout: privyLogout, ready } = usePrivy();
  const { wallets } = useWallets();
  const [signing, setSigning] = useState(false);

  // Sync Privy login back to session validation if sessionToken is missing but user is authenticated
  useEffect(() => {
    if (authenticated && user?.wallet?.address && wallets.length > 0 && !sessionToken && !signing) {
      const runSign = async () => {
        setSigning(true);
        try {
          const activeWallet = wallets[0];
          const address = user.wallet.address;
          const message = `Antigravity Protocol Login\n\nSession Duration: 5 Minutes\nWallet: ${address}\nTimestamp: ${Date.now()}`;
          const ethProvider = await activeWallet.getEthereumProvider();
          const browserProvider = new BrowserProvider(ethProvider);
          const signer = await browserProvider.getSigner();
          const signature = await signer.signMessage(message);

          const API_URL = import.meta.env.VITE_API_URL || "";
          const resp = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, signature, message }),
          });

          if (!resp.ok) throw new Error("Cloud validation failed.");
          const { token } = await resp.json();
          setWalletAddress(address);
          setSessionToken(token);
          localStorage.setItem("obelisk_session_token", token);
          setAuthMethod("wallet");
          setStage("dashboard");
        } catch (e) {
          console.error("Auto-auth signing failed", e);
          await privyLogout();
          await logout();
        } finally {
          setSigning(false);
        }
      };
      runSign();
    }
  }, [authenticated, user, wallets, sessionToken, signing]);

  const [sidebarOpen,    setSidebarOpen]     = useState(false);
  const [tourOpen,       setTourOpen]        = useState(false);
  const [activeTab,      setActiveTab]       = useState<DashboardTab>(() => {
    return (localStorage.getItem("obelisk_tab") as DashboardTab) || "earn";
  });
  
  // Persist active tab
  useEffect(() => {
    localStorage.setItem("obelisk_tab", activeTab);
  }, [activeTab]);

  // Persist stage to prevent redirecting to landing page on page refresh
  useEffect(() => {
    localStorage.setItem("obelisk_stage", stage);
  }, [stage]);

  // Handle logout transition
  // NOTE: Guest mode enabled. We no longer force landing if session/wallet is missing.
  // This allows users to explore the dashboard before connecting.

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

  const handleConnectWallet = () => {
    if (!ready) {
      toast({
        title: "Privy SDK is not ready",
        description: "Please check your browser console. Ensure that you have set VITE_PRIVY_APP_ID in your .env.local file and configured allowed origins in your Privy developer dashboard.",
        variant: "destructive"
      });
      return;
    }
    login();
  };

  const needsWallet = !walletAddress;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#f5f5f8" }}>

      <AnimatePresence>
        {stage === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <LandingPage onEnter={() => {
              const hasSession = !!sessionToken || !!sessionStorage.getItem("obelisk_session") || !!localStorage.getItem("obelisk_session");
              const hasWallet = !!walletAddress;
              if (hasSession && hasWallet) {
                setStage("dashboard");
              } else {
                setStage("dashboard");
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
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -8 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              onConnectWallet={handleConnectWallet}
              onSignOut={async () => {
                await privyLogout();
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
              onConnectWallet={handleConnectWallet}
            />

            <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
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
