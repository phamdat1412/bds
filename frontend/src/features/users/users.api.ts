import api from "../../services/api";

export type UserType = "customer" | "staff";
export type UserStatus = "active" | "inactive" | "blocked";

export type UserItem = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: UserType;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt?: string;
  customerProfile: {
    id: string;
    fullName: string;
    source: string | null;
    province: string | null;
  } | null;
  roles: Array<{
    id: string;
    code: string;
    name: string;
  }>;
};

export async function getUsersApi(params?: {
  keyword?: string;
  userType?: UserType;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get("/users", { params });
  return response.data as {
    success: boolean;
    message: string;
    data: {
      items: UserItem[];
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
      };
    };
  };
}

export async function createStaffApi(payload: {
  email?: string;
  phone?: string;
  password: string;
  roleCode: string;
}) {
  const response = await api.post("/users/staff", payload);
  return response.data;
}

export async function updateUserApi(
  userId: string,
  payload: {
    email?: string;
    phone?: string;
    fullName?: string;
    status?: UserStatus;
    roleCode?: string;
    password?: string;
  }
) {
  const response = await api.patch(`/users/${userId}`, payload);
  return response.data;
}

export async function deleteUserApi(userId: string) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}

export type CustomerProfileResponse = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
  roles: string[];
  customerProfile: {
    id: string;
    fullName: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export async function getMyCustomerProfileApi() {
  const response = await api.get("/users/me/profile");
  return response.data as {
    success: boolean;
    message: string;
    data: CustomerProfileResponse;
  };
}

export async function updateMyCustomerProfileApi(payload: {
  fullName?: string;
  email?: string;
  phone?: string;
}) {
  const response = await api.patch("/users/me/profile", payload);
  return response.data as {
    success: boolean;
    message: string;
    data: CustomerProfileResponse;
  };
}