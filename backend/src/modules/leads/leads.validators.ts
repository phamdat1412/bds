import {
  AssignLeadInput,
  CreateLeadActivityInput,
  CreateLeadInput,
  UpdateLeadStatusInput,
} from "./leads.types.js";

export function validateCreateLeadInput(input: CreateLeadInput) {
  const errors: string[] = [];

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.push("fullName must be at least 2 characters");
  }

  if (!input.phone || input.phone.trim().length < 8) {
    errors.push("phone is required");
  }

  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push("email is invalid");
  }

  return errors;
}

export function validateUpdateLeadStatusInput(input: UpdateLeadStatusInput) {
  const errors: string[] = [];
  const allowed = ["new", "contacted", "qualified", "unqualified", "converted", "lost"];

  if (!input.status || !allowed.includes(input.status)) {
    errors.push("status is invalid");
  }

  return errors;
}

export function validateAssignLeadInput(input: AssignLeadInput) {
  const errors: string[] = [];

  if (!input.assignedToUserId) {
    errors.push("assignedToUserId is required");
  }

  return errors;
}

export function validateCreateLeadActivityInput(input: CreateLeadActivityInput) {
  const errors: string[] = [];
  const allowed = ["call", "meeting", "note", "sms", "email", "zalo", "visit"];

  if (!input.activityType || !allowed.includes(input.activityType)) {
    errors.push("activityType is invalid");
  }

  if (!input.content || input.content.trim().length < 2) {
    errors.push("content must be at least 2 characters");
  }

  return errors;
}
import { UpdateLeadInput } from "./leads.types.js";

export function validateUpdateLeadInput(input: UpdateLeadInput) {
  const errors: string[] = [];
  const allowed = ["new", "contacted", "qualified", "unqualified", "converted", "lost"];

  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.push("email is invalid");
  }

  if (input.status && !allowed.includes(input.status)) {
    errors.push("status is invalid");
  }

  return errors;
}