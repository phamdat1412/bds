import {
  CreatePropertyInput,
  UpdateInventoryStatusInput,
  UpdatePropertyInput,
} from "./properties.types.js";

const ALLOWED_PROPERTY_TYPES = [
  "apartment",
  "shophouse",
  "townhouse",
  "villa",
  "land",
];

const ALLOWED_INVENTORY_STATUS = ["available", "reserved", "sold", "hidden"];

export function validateCreatePropertyInput(input: CreatePropertyInput) {
  const errors: string[] = [];

  if (!input.projectId) {
    errors.push("projectId is required");
  }

  if (!input.code || input.code.trim().length < 1) {
    errors.push("code is required");
  }

  if (!input.title || input.title.trim().length < 2) {
    errors.push("title must be at least 2 characters");
  }

  if (!input.propertyType || !ALLOWED_PROPERTY_TYPES.includes(input.propertyType)) {
    errors.push("propertyType is invalid");
  }

  if (
    input.inventoryStatus &&
    !ALLOWED_INVENTORY_STATUS.includes(input.inventoryStatus)
  ) {
    errors.push("inventoryStatus is invalid");
  }

  return errors;
}

export function validateUpdatePropertyInput(input: UpdatePropertyInput) {
  const errors: string[] = [];

  if (
    input.propertyType &&
    !ALLOWED_PROPERTY_TYPES.includes(input.propertyType)
  ) {
    errors.push("propertyType is invalid");
  }

  if (
    input.inventoryStatus &&
    !ALLOWED_INVENTORY_STATUS.includes(input.inventoryStatus)
  ) {
    errors.push("inventoryStatus is invalid");
  }

  return errors;
}

export function validateUpdateInventoryStatusInput(
  input: UpdateInventoryStatusInput
) {
  const errors: string[] = [];

  if (
    !input.inventoryStatus ||
    !ALLOWED_INVENTORY_STATUS.includes(input.inventoryStatus)
  ) {
    errors.push("inventoryStatus is invalid");
  }

  return errors;
}