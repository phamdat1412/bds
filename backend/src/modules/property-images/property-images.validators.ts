import type {
  AddPropertyImageInput,
  UpdatePropertyImageInput,
} from "./property-images.types.js";

export function validateAddPropertyImageInput(input: AddPropertyImageInput) {
  const errors: string[] = [];

  if (!input.mediaFileId || typeof input.mediaFileId !== "string") {
    errors.push("mediaFileId is required");
  }

  if (input.sortOrder !== undefined && typeof input.sortOrder !== "number") {
    errors.push("sortOrder must be a number");
  }

  if (input.isPrimary !== undefined && typeof input.isPrimary !== "boolean") {
    errors.push("isPrimary must be a boolean");
  }

  return errors;
}

export function validateUpdatePropertyImageInput(
  input: UpdatePropertyImageInput
) {
  const errors: string[] = [];

  if (input.sortOrder !== undefined && typeof input.sortOrder !== "number") {
    errors.push("sortOrder must be a number");
  }

  if (input.isPrimary !== undefined && typeof input.isPrimary !== "boolean") {
    errors.push("isPrimary must be a boolean");
  }

  return errors;
}