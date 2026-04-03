export type CreateStaffInput = {
  email?: string;
  phone?: string;
  password: string;
  roleCode: string;
};

export type UserListQuery = {
  keyword?: string;
  userType?: "customer" | "staff";
  status?: "active" | "inactive" | "blocked";
  page?: number;
  pageSize?: number;
};

export type UpdateUserInput = {
  email?: string;
  phone?: string;
  fullName?: string;
  status?: "active" | "inactive" | "blocked";
  roleCode?: string;
  password?: string;
};

export type UpdateMyCustomerProfileInput = {
  fullName?: string;
  email?: string;
  phone?: string;
};