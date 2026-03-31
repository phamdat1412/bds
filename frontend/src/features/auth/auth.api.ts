import api from "../../services/api";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
};

export type AuthResponseData = {
  accessToken: string;
  user: AuthUser;
  roles: string[];
  redirectTo: string;
};

export async function loginApi(payload: {
  email?: string;
  phone?: string;
  password: string;
}) {
  const response = await api.post("/auth/login", payload);
  return response.data as {
    success: boolean;
    message: string;
    data: AuthResponseData;
  };
}

export async function getMeApi() {
  const response = await api.get("/auth/me");
  return response.data as {
    success: boolean;
    message: string;
    data: Omit<AuthResponseData, "accessToken">;
  };
}
export async function registerApi(payload: {
  email?: string;
  phone?: string;
  password: string;
  fullName?: string;
}) {
  const response = await api.post("/auth/register", payload);
  return response.data as {
    success: boolean;
    message: string;
    data: AuthResponseData;
  };
}