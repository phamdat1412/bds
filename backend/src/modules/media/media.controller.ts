import { NextFunction, Request, Response } from "express";
import { createMedia, deleteMedia, listMedia } from "./media.service.js";
import { validateUploadFile } from "./media.validators.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: "customer" | "staff";
    roles?: string[];
  };
};

function getParamAsString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  throw new Error("Missing route parameter");
}

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return undefined;
}

export async function uploadMediaHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const errors = validateUploadFile(req.file);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const data = await createMedia(req.file!, req.user.userId);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listMediaHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listMedia({
      uploadedByUserId: getQueryAsString(req.query.uploadedByUserId),
      mimeType: getQueryAsString(req.query.mimeType),
      keyword: getQueryAsString(req.query.keyword),
    });

    return res.json({
      success: true,
      message: "Media fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMediaHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const mediaId = getParamAsString(req.params.id);
    const data = await deleteMedia(mediaId);

    return res.json({
      success: true,
      message: "Media deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}