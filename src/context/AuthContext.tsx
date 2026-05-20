/**
 * AuthContext — global authentication state
 * Tracks wallet address and session token across the entire app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type AuthMethod = "wallet" | null;

interface AuthState {
  authMethod:    AuthMethod;
  walletAddress: string | null;
  sessionToken:  string | null;
  loading:       boolean;
  isEmbeddedWallet: boolean;

  setAuthMethod:    (m: AuthMethod) => void;
  setWalletAddress: (a: string | null) => void;
  setSessionToken:  (t: string | null) => void;
  setIsEmbeddedWallet: (v: boolean) => void;
  logout:           () => Promise<void>;

  // Display name — shortened wallet address or Guest
  displayName: string;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authMethod,    setAuthMethod]    = useState<AuthMethod>(localStorage.getItem("obelisk_method") as AuthMethod);
  const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem("obelisk_address"));
  const [sessionToken,  setSessionToken]  = useState<string | null>(sessionStorage.getItem("obelisk_session"));
  const [loading,       setLoading]       = useState(false);
  const [isEmbeddedWallet, setIsEmbeddedWallet] = useState(localStorage.getItem("obelisk_embedded") === "true");

  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Persist session state
  useEffect(() => {
    if (sessionToken) {
      sessionStorage.setItem("obelisk_session", sessionToken);
      if (walletAddress) localStorage.setItem("obelisk_address", walletAddress);
      if (authMethod) localStorage.setItem("obelisk_method", authMethod);
      localStorage.setItem("obelisk_embedded", isEmbeddedWallet ? "true" : "false");
      localStorage.setItem("obelisk_last_activity", Date.now().toString());
    } else {
      sessionStorage.removeItem("obelisk_session");
      localStorage.removeItem("obelisk_address");
      localStorage.removeItem("obelisk_method");
      localStorage.removeItem("obelisk_last_activity");
      localStorage.removeItem("obelisk_embedded");
    }
  }, [sessionToken, walletAddress, authMethod, isEmbeddedWallet]);

  // Inactivity detection
  useEffect(() => {
    if (!sessionToken) return;

    const checkInactivity = () => {
      const last = parseInt(localStorage.getItem("obelisk_last_activity") || "0");
      if (Date.now() - last > TIMEOUT_MS) {
        logout();
      }
    };

    const updateActivity = () => {
      localStorage.setItem("obelisk_last_activity", Date.now().toString());
    };

    const interval = setInterval(checkInactivity, 30000); // Check every 30s
    
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
    };
  }, [sessionToken]);

  const logout = async () => {
    setAuthMethod(null);
    setWalletAddress(null);
    setSessionToken(null);
    setIsEmbeddedWallet(false);
    sessionStorage.removeItem("obelisk_session");
    localStorage.removeItem("obelisk_session"); // Legacy
    localStorage.removeItem("obelisk_address");
    localStorage.removeItem("obelisk_method");
    localStorage.removeItem("obelisk_tab");
    localStorage.removeItem("obelisk_stage");
    localStorage.removeItem("obelisk_last_activity");
    localStorage.removeItem("obelisk_embedded");
  };

  const displayName = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Guest Identity";

  return (
    <Ctx.Provider value={{
      authMethod,
      walletAddress,
      sessionToken,
      loading,
      isEmbeddedWallet,
      setAuthMethod,
      setWalletAddress,
      setSessionToken,
      setIsEmbeddedWallet,
      logout,
      displayName,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
