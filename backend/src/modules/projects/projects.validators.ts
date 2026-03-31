import { CreateProjectInput, UpdateProjectInput } from "./projects.types.js";

const ALLOWED_STATUS = ["draft", "published", "hidden"];

function isValidSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

export function validateCreateProjectInput(input: CreateProjectInput) {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < 2) {
    errors.push("name must be at least 2 characters");
  }

  if (!input.slug || input.slug.trim().length < 2) {
    errors.push("slug is required");
  } else if (!isValidSlug(input.slug.trim())) {
    errors.push("slug is invalid");
  }

  if (input.status && !ALLOWED_STATUS.includes(input.status)) {
    errors.push("status is invalid");
  }

  return errors;
}

export function validateUpdateProjectInput(input: UpdateProjectInput) {
  const errors: string[] = [];

  if (input.slug && !isValidSlug(input.slug.trim())) {
    errors.push("slug is invalid");
  }

  if (input.status && !ALLOWED_STATUS.includes(input.status)) {
    errors.push("status is invalid");
  }

  return errors;
}