import { NextFunction, Request, Response } from "express";
import {
  getProjectBookmarkStatus,
  listMyProjectBookmarks,
  toggleProjectBookmark,
} from "./bookmarks.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: string;
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

export async function listMyProjectBookmarksHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await listMyProjectBookmarks(req.user.userId);

    return res.json({
      success: true,
      message: "Bookmarks fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function toggleProjectBookmarkHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const projectId = getParamAsString(req.params.projectId);
    const data = await toggleProjectBookmark(req.user.userId, projectId);

    return res.json({
      success: true,
      message: "Bookmark toggled successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProjectBookmarkStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const projectId = getParamAsString(req.params.projectId);
    const data = await getProjectBookmarkStatus(req.user.userId, projectId);

    return res.json({
      success: true,
      message: "Bookmark status fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}