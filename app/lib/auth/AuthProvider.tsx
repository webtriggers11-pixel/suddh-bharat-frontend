"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi, type AuthResult, type AuthUser } from "../api/auth";
import { setUnauthorizedHandler } from "./session";

// NOTE: tokens are kept in localStorage for now. Production should move refresh
// tokens to httpOnly secure cookies (ADR-0008 revisit trigger).
const ACCESS_KEY = "shuddha.access";
const REFRESH_KEY = "shuddha.refresh";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  applyResult: (result: AuthResult) => void;
  logout: () => Promise<void>;
  /** Replace the current user in place (e.g. after a profile edit). */
  setUser: (user: AuthUser) => void;
  /** Current access token (from storage), or null when signed out. */
  getToken: () => string | null;
}

const AuthContext = createContext<AuthState | null>(null);

function readTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem(ACCESS_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const store = useCallback((result: AuthResult) => {
    localStorage.setItem(ACCESS_KEY, result.accessToken);
    localStorage.setItem(REFRESH_KEY, result.refreshToken);
    setUser(result.user);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }, []);

  // Restore session on mount: try access token, fall back to refresh rotation.
  useEffect(() => {
    let active = true;
    (async () => {
      const { access, refresh } = readTokens();
      try {
        if (access) {
          const me = await authApi.me(access);
          if (active) setUser(me);
          return;
        }
        if (refresh) {
          const result = await authApi.refresh(refresh);
          if (active) store(result);
          return;
        }
      } catch {
        if (refresh) {
          try {
            const result = await authApi.refresh(refresh);
            if (active) store(result);
            return;
          } catch {
            /* fall through to clear */
          }
        }
        if (active) clear();
      } finally {
        if (active) setLoading(false);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [store, clear]);

  const login = useCallback(
    async (email: string, password: string) => store(await authApi.login({ email, password })),
    [store],
  );
  const register = useCallback(
    async (email: string, password: string, name?: string) =>
      store(await authApi.register({ email, password, name })),
    [store],
  );
  const verifyOtp = useCallback(
    async (phone: string, code: string) => store(await authApi.verifyOtp(phone, code)),
    [store],
  );

  const logout = useCallback(async () => {
    const { refresh } = readTokens();
    if (refresh) await authApi.logout(refresh).catch(() => undefined);
    clear();
  }, [clear]);

  const getToken = useCallback(() => readTokens().access, []);

  // Forced logout: any authenticated call that 401s (expired/revoked token)
  // clears the session and hard-navigates to the public home page. A full
  // reload also discards all in-memory state and cached data so the next
  // visitor on this browser starts clean (T15).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        // Deliberate HARD navigation, not router.push: a forced logout must
        // purge the previous user's in-memory state (React Query cache,
        // provider state) so the next visitor on this browser starts clean.
        // Client-side routing would keep that memory around.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
        window.location.assign("/");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        applyResult: store,
        logout,
        setUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
