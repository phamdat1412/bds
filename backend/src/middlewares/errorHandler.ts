import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  const message =
    error instanceof Error ? error.message : "Internal server error";

  const knownMessages = [
    "Email already exists",
    "Phone already exists",
    "Invalid credentials",
    "User is not active",
    "User not found",
    "Role not found",
    "Lead not found",
    "Project not found",
    "Assigned user not found",
    "Assigned user must be staff",
    "Project slug already exists",
    "Media file not found",
    "Property not found",
    "Property code already exists in project",
    "Unsupported storage driver",
    "S3 storage driver is not implemented yet",
    "Property image not found",
    "Property image already exists",
    "Missing route parameter",
    "Cannot delete project with existing properties",
    "Cannot delete lead with existing assignments or activities",
  ];

  const statusCode = knownMessages.includes(message) ? 400 : 500;

  res.status(statusCode).json({
    success: false,
    message,
  });
}