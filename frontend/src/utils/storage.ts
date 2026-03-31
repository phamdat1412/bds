import type { AuthUser } from "../features/auth/auth.api";

const ACCESS_TOKEN_KEY = "sgroup_access_token";
const AUTH_USER_KEY = "sgroup_auth_user";
const AUTH_ROLES_KEY = "sgroup_auth_roles";
const AUTH_REDIRECT_KEY = "sgroup_auth_redirect_to";

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function saveCurrentUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}
export function getCurrentUser(): (AuthUser & { roles?: string[] }) | null {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  const rawRoles = localStorage.getItem(AUTH_ROLES_KEY);
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as AuthUser;
    const roles = rawRoles ? (JSON.parse(rawRoles) as string[]) : [];
    return { ...user, roles };
  } catch {
    return null;
  }
}
export function removeCurrentUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function saveRoles(roles: string[]) {
  localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(roles));
}
export function getRoles(): string[] {
  const raw = localStorage.getItem(AUTH_ROLES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
export function removeRoles() {
  localStorage.removeItem(AUTH_ROLES_KEY);
}

export function saveRedirectTo(path: string) {
  localStorage.setItem(AUTH_REDIRECT_KEY, path);
}
export function getRedirectTo() {
  return localStorage.getItem(AUTH_REDIRECT_KEY);
}
export function removeRedirectTo() {
  localStorage.removeItem(AUTH_REDIRECT_KEY);
}

export function clearAuthStorage() {
  removeAccessToken();
  removeCurrentUser();
  removeRoles();
  removeRedirectTo();
}