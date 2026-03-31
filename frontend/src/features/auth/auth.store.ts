import { create } from "zustand";
import {
  clearAuthStorage,
  getAccessToken,
  getCurrentUser,
  saveAccessToken,
  saveCurrentUser,
  saveRoles,
  saveRedirectTo,
} from "../../utils/storage";
import { getMeApi, loginApi, type AuthUser } from "./auth.api";

type StoredAuthUser = AuthUser & { roles?: string[] };

type AuthState = {
  accessToken: string | null;
  user: StoredAuthUser | null;
  isLoading: boolean;
  login: (payload: { email?: string; phone?: string; password: string }) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getAccessToken(),
  user: getCurrentUser() as StoredAuthUser | null,
  isLoading: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const result = await loginApi(payload);

      const { accessToken, user, roles, redirectTo } = result.data;

      saveAccessToken(accessToken);
      saveCurrentUser(user);
      saveRoles(roles);
      if (redirectTo) saveRedirectTo(redirectTo);

      set({
        accessToken,
        user: { ...user, roles },
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchMe: async () => {
    try {
      const result = await getMeApi();
      const { user, roles } = result.data;

      saveCurrentUser(user);
      saveRoles(roles);

      set({
        user: { ...user, roles },
      });
    } catch {
      clearAuthStorage();
      set({ accessToken: null, user: null });
    }
  },

  logout: () => {
    clearAuthStorage();
    set({ accessToken: null, user: null });
  },
}));