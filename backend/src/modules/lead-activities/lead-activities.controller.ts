import { NextFunction, Request, Response } from "express";
import {
  createLeadActivity,
  listLeadActivities,
} from "./lead-activities.service.js";

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

export async function listLeadActivitiesHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = getParamAsString(req.params.leadId);
    const data = await listLeadActivities(leadId);

    return res.json({
      success: true,
      message: "Lead activities fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createLeadActivityHandler(
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

    const leadId = getParamAsString(req.params.leadId);
    const data = await createLeadActivity(leadId, req.user.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Lead activity created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}