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
  const [authMethod,    setAuthMethod]    = useState<AuthMethod>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionToken,  setSessionToken]  = useState<string | null>(localStorage.getItem("obelisk_session"));
  const [loading,       setLoading]       = useState(false); // No longer loading firebase

  // Persist session token
  useEffect(() => {
    if (sessionToken) localStorage.setItem("obelisk_session", sessionToken);
    else localStorage.removeItem("obelisk_session");
  }, [sessionToken]);

  // If we have a session token but no wallet address, we might need to re-fetch or clear
  // For now, if session exists, we assume wallet was linked or is being tracked elsewhere

  const logout = async () => {
    setAuthMethod(null);
    setWalletAddress(null);
    setSessionToken(null);
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
