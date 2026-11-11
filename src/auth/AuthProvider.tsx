import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  getMe,
  getProgressRequest,
  loginRequest,
  logoutRequest,
  putProgressRequest,
  signupRequest,
  updateProfileRequest,
  type User,
} from "@/lib/api";
import { mergeProgress } from "@/lib/progressSync";
import { progressSnapshot, useProgressStore } from "@/store/useProgressStore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** false when /api is not reachable (e.g. static GitHub Pages build). */
  apiReady: boolean;
  googleEnabled: boolean;
  signup: (email: string, password: string, name?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: { name?: string | null; avatar?: string | null }) => Promise<User>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const userRef = useRef<User | null>(null);
  const hydratingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const hydrateFromServer = useCallback(async (nextUser: User) => {
    hydratingRef.current = true;
    try {
      let remoteState: unknown = null;
      try {
        const remote = await getProgressRequest<unknown>();
        remoteState = remote.state;
      } catch {
        // Offline or first login: local progress is still valid.
      }
      const local = progressSnapshot(useProgressStore.getState());
      const merged = remoteState ? mergeProgress(local, remoteState) : local;
      useProgressStore.getState().importProgress(merged);
      try {
        await putProgressRequest(merged);
      } catch {
        // The debounced sync will retry on the next change.
      }
    } finally {
      window.setTimeout(() => {
        hydratingRef.current = false;
      }, 0);
    }
  }, []);

  const applySession = useCallback(
    async (nextUser: User) => {
      setUser(nextUser);
      userRef.current = nextUser;
      setApiReady(true);
      await hydrateFromServer(nextUser);
    },
    [hydrateFromServer],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setApiReady(true);
        setGoogleEnabled(Boolean(me.googleEnabled));
        if (me.user) {
          setUser(me.user);
          userRef.current = me.user;
          await hydrateFromServer(me.user);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setApiReady(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateFromServer]);

  // Debounced push of every progress change once the visitor is authenticated.
  useEffect(() => {
    const unsubscribe = useProgressStore.subscribe(() => {
      if (!userRef.current || hydratingRef.current) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        if (!userRef.current) return;
        putProgressRequest(progressSnapshot(useProgressStore.getState())).catch(() => {
          // Silent: the next interaction retries.
        });
      }, 1200);
    });
    return () => {
      unsubscribe();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await signupRequest({ email, password, name });
      await applySession(result.user);
      return result.user;
    },
    [applySession],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest({ email, password });
      await applySession(result.user);
      return result.user;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear the local session even if the network fails.
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    useProgressStore.getState().resetProgress();
    userRef.current = null;
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: { name?: string | null; avatar?: string | null }) => {
      const result = await updateProfileRequest(patch);
      setUser(result.user);
      userRef.current = result.user;
      return result.user;
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const me = await getMe();
      setApiReady(true);
      setGoogleEnabled(Boolean(me.googleEnabled));
      setUser(me.user);
      userRef.current = me.user;
      if (me.user) await hydrateFromServer(me.user);
    } catch {
      setApiReady(false);
    }
  }, [hydrateFromServer]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      apiReady,
      googleEnabled,
      signup,
      login,
      logout,
      updateProfile,
      refresh,
    }),
    [user, loading, apiReady, googleEnabled, signup, login, logout, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
