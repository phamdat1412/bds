import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser } from "../features/auth/auth.api";
import { getMeApi } from "../features/auth/auth.api";
import {
  clearAuthStorage,
  getAccessToken,
  getCurrentUser,
  saveAccessToken,
  saveCurrentUser,
  saveRedirectTo,
  saveRoles,
} from "../utils/storage";

type AuthPayload = {
  accessToken: string;
  user: AuthUser;
  roles: string[];
  redirectTo: string;
};

type AuthState = {
  user: (AuthUser & { roles?: string[] }) | null;
  roles: string[];
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  refreshMe: () => Promise<void>;
  setAuthData: (payload: AuthPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialUser = getCurrentUser();

  const [user, setUser] = useState<(AuthUser & { roles?: string[] }) | null>(
    initialUser
  );
  const [roles, setRoles] = useState<string[]>(initialUser?.roles || []);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  async function refreshMe() {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setRoles([]);
      setIsBootstrapping(false);
      return;
    }

    try {
      const result = await getMeApi();
      const nextUser = {
        ...result.data.user,
        roles: result.data.roles,
      };

      saveCurrentUser(result.data.user);
      saveRoles(result.data.roles);
      saveRedirectTo(result.data.redirectTo);

      setUser(nextUser);
      setRoles(result.data.roles);
    } catch {
      clearAuthStorage();
      setUser(null);
      setRoles([]);
    } finally {
      setIsBootstrapping(false);
    }
  }

  function setAuthData(payload: AuthPayload) {
    saveAccessToken(payload.accessToken);
    saveCurrentUser(payload.user);
    saveRoles(payload.roles);
    saveRedirectTo(payload.redirectTo);

    setUser({
      ...payload.user,
      roles: payload.roles,
    });
    setRoles(payload.roles);
    setIsBootstrapping(false);
  }

  function logout() {
    clearAuthStorage();
    setUser(null);
    setRoles([]);
    setIsBootstrapping(false);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      roles,
      isAuthenticated: Boolean(user && getAccessToken()),
      isBootstrapping,
      refreshMe,
      setAuthData,
      logout,
    }),
    [user, roles, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}