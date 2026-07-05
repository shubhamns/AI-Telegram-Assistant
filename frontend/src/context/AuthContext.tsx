import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { register as registerApi, login as loginApi, fetchMe, refreshAuthSession, logoutApi, storeAuthSession } from "@/api/authApi";
import { clearStoredTokens, getStoredRefreshToken, getStoredToken } from "@/api/axios";
import type { AuthSession, User, Workspace } from "@/types/auth";
type AuthContextValue = {
  user: User | null;
  workspace: Workspace | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setSession: (session: AuthSession) => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const applySession = (session: AuthSession) => {
    storeAuthSession(session);
    setUser(session.user);
    setWorkspace(session.workspace);
  };
  const refresh = async () => {
    if (!getStoredToken() && getStoredRefreshToken()) {
      try {
        const session = await refreshAuthSession();
        if (session) {
          applySession(session);
          return;
        }
      } catch {
        clearStoredTokens();
        setUser(null);
        setWorkspace(null);
        return;
      }
    }
    if (!getStoredToken()) {
      setUser(null);
      setWorkspace(null);
      return;
    }
    try {
      const data = await fetchMe();
      setUser(data.user);
      setWorkspace(data.workspace);
    } catch {
      setUser(null);
      setWorkspace(null);
    }
  };
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    workspace,
    loading,
    login: async (email, password) => applySession(await loginApi({ email, password })),
    register: async (name, email, password) => { await registerApi({ name, email, password }); },
    logout: async () => {
      await logoutApi();
      setUser(null);
      setWorkspace(null);
    },
    refresh,
    setSession: applySession,
  }), [user, workspace, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
