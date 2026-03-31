import { NextFunction, Request, Response } from "express";
import { createStaff, listUsers } from "./users.service.js";
import { validateCreateStaffInput } from "./users.validators.js";
import { parsePagination } from "../../utils/pagination.js";
import {
  
  getMyCustomerProfile,
  updateMyCustomerProfile,
} from "./users.service.js";
export async function createStaffHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreateStaffInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const data = await createStaff(req.body);

    return res.status(201).json({
      success: true,
      message: "Staff user created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

// export async function listUsersHandler(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const data = await listUsers({
//       keyword: req.query.keyword as string | undefined,
//       userType: req.query.userType as "customer" | "staff" | undefined,
//       status: req.query.status as "active" | "inactive" | "blocked" | undefined,
//     });

//     return res.json({
//       success: true,
//       message: "Users fetched successfully",
//       data,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }
export async function listUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize } = parsePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const data = await listUsers({
      keyword: req.query.keyword as string | undefined,
      userType: req.query.userType as "customer" | "staff" | undefined,
      status: req.query.status as "active" | "inactive" | "blocked" | undefined,
      page,
      pageSize,
    });

    return res.json({
      success: true,
      message: "Users fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: string;
    roles?: string[];
  };
};

export async function getMyCustomerProfileHandler(
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

    const data = await getMyCustomerProfile(req.user.userId);

    return res.json({
      success: true,
      message: "Customer profile fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyCustomerProfileHandler(
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

    const data = await updateMyCustomerProfile(req.user.userId, req.body);

    return res.json({
      success: true,
      message: "Customer profile updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}