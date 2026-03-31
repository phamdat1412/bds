import { NextFunction, Request, Response } from "express";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: string;
    roles?: string[];
  };
};

export function roleMiddleware(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    const allowed = userRoles.some((role) => allowedRoles.includes(role));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  };
}