import { CreateStaffInput } from "./users.types.js";

export function validateCreateStaffInput(input: CreateStaffInput) {
  const errors: string[] = [];

  if (!input.email && !input.phone) {
    errors.push("email or phone is required");
  }

  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push("email is invalid");
  }

  if (!input.password || input.password.length < 6) {
    errors.push("password must be at least 6 characters");
  }

  if (!input.roleCode || input.roleCode.trim().length === 0) {
    errors.push("roleCode is required");
  }

  return errors;
}