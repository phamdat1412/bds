import { LoginInput, RegisterCustomerInput } from "./auth.types.js";

export function validateRegisterCustomerInput(input: RegisterCustomerInput) {
  const errors: string[] = [];

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.push("fullName must be at least 2 characters");
  }

  if (!input.password || input.password.length < 6) {
    errors.push("password must be at least 6 characters");
  }

  if (!input.email && !input.phone) {
    errors.push("email or phone is required");
  }

  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push("email is invalid");
  }

  return errors;
}

export function validateLoginInput(input: LoginInput) {
  const errors: string[] = [];

  if (!input.password) {
    errors.push("password is required");
  }

  if (!input.email && !input.phone) {
    errors.push("email or phone is required");
  }

  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push("email is invalid");
  }

  return errors;
}