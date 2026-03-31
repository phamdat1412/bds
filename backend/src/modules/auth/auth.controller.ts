import { NextFunction, Request, Response } from "express";
import { getMe, login, register } from "./auth.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: string;
    roles?: string[];
  };
};

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await register(req.body);

    return res.status(201).json({
      success: true,
      message: "Register successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await login(req.body);

    return res.json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function meHandler(
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

    const data = await getMe(req.user.userId);

    return res.json({
      success: true,
      message: "Current user fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}