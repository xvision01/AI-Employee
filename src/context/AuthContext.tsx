import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setAuthToken } from "../api/apiClient";

type User = { id: number; name: string; role: "admin" | "student" };
type Session = { token: string; user: User };
type AuthContextValue = Session & { logout: () => void };

const SESSION_KEY = "ai-employee-session";
const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): Session | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) as Session : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  useEffect(() => {
    setAuthToken(session?.token ?? null);
  }, [session]);

  function logout() {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }

  if (!session) {
    return <AuthContext.Provider value={{ token: "", user: null as never, logout }}>{children}</AuthContext.Provider>;
  }

  return <AuthContext.Provider value={{ ...session, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
