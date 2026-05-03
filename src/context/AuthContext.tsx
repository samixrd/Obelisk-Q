/**
 * AuthContext — global authentication state
 * Tracks Google user + wallet address across the entire app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { type User } from "firebase/auth";
import { onAuthChange, signOutUser } from "@/lib/firebase";

export type AuthMethod = "google" | "wallet" | null;

interface AuthState {
  user:          User | null;          // Firebase Google user
  authMethod:    AuthMethod;
  walletAddress: string | null;
  loading:       boolean;

  setAuthMethod:    (m: AuthMethod) => void;
  setWalletAddress: (a: string | null) => void;
  logout:           () => Promise<void>;

  // Display name — Google name or shortened wallet address
  displayName: string;
  avatarUrl:   string | null;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,          setUser]          = useState<User | null>(null);
  const [authMethod,    setAuthMethod]    = useState<AuthMethod>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading,       setLoading]       = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) setAuthMethod("google");
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setAuthMethod(null);
    setWalletAddress(null);
  };

  const displayName =
    user?.displayName ??
    (walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "Guest");

  const avatarUrl = user?.photoURL ?? null;

  return (
    <Ctx.Provider value={{
      user,
      authMethod,
      walletAddress,
      loading,
      setAuthMethod,
      setWalletAddress,
      logout,
      displayName,
      avatarUrl,
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
