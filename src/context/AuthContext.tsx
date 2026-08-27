import { createContext, useContext, useState, type ReactNode } from "react";
import { setAuthToken } from "../api/apiClient";

type User = { id: number; name: string; role: "admin" | "student" };
type StoredSession = { token: string; user: User };
type AuthContextType = { isLoggedIn: boolean; user: User | null; token: string | null; login: (token: string, user: User) => void; logout: () => void };

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = "ai-employee-session";

function readSession(): StoredSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) as StoredSession : null;
    } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<StoredSession | null>(readSession);
    const token = session?.token ?? null;
    const user = session?.user ?? null;

    function login(newToken: string, newUser: User) {
        const next = { token: newToken, user: newUser };
        setSession(next);
        setAuthToken(newToken);
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }

    function logout() {
        setSession(null);
        setAuthToken(null);
        localStorage.removeItem(SESSION_KEY);
    }

    if (token) setAuthToken(token);

    return <AuthContext.Provider value={{ isLoggedIn: token !== null, user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error("useAuth must be used inside AuthProvider");
    return auth;
}