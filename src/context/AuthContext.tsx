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

  setAuthMethod:    (m: AuthMethod) => void;
  setWalletAddress: (a: string | null) => void;
  setSessionToken:  (t: string | null) => void;
  logout:           () => Promise<void>;

  // Display name — shortened wallet address or Guest
  displayName: string;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authMethod,    setAuthMethod]    = useState<AuthMethod>(localStorage.getItem("obelisk_method") as AuthMethod);
  const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem("obelisk_address"));
  const [sessionToken,  setSessionToken]  = useState<string | null>(localStorage.getItem("obelisk_session"));
  const [loading,       setLoading]       = useState(false);

  // Persist session state
  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem("obelisk_session", sessionToken);
      if (walletAddress) localStorage.setItem("obelisk_address", walletAddress);
      if (authMethod) localStorage.setItem("obelisk_method", authMethod);
    } else {
      localStorage.removeItem("obelisk_session");
      localStorage.removeItem("obelisk_address");
      localStorage.removeItem("obelisk_method");
    }
  }, [sessionToken, walletAddress, authMethod]);

  const logout = async () => {
    setAuthMethod(null);
    setWalletAddress(null);
    setSessionToken(null);
    localStorage.removeItem("obelisk_session");
    localStorage.removeItem("obelisk_address");
    localStorage.removeItem("obelisk_method");
    localStorage.removeItem("obelisk_tab");
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
      setAuthMethod,
      setWalletAddress,
      setSessionToken,
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
