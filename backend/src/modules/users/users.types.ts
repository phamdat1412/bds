export type CreateStaffInput = {
  email?: string;
  phone?: string;
  password: string;
  roleCode: string;
};

// export type UserListQuery = {
//   keyword?: string;
//   userType?: "customer" | "staff";
//   status?: "active" | "inactive" | "blocked";
// };
export type UserListQuery = {
  keyword?: string;
  userType?: "customer" | "staff";
  status?: "active" | "inactive" | "blocked";
  page?: number;
  pageSize?: number;
};