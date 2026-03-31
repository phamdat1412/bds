import { NextFunction, Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service.js";

export async function getDashboardSummaryHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getDashboardSummary();

    return res.json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}