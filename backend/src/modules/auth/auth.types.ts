export type RegisterCustomerInput = {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  source?: string;
  province?: string;
  note?: string;
};

export type LoginInput = {
  email?: string;
  phone?: string;
  password: string;
};