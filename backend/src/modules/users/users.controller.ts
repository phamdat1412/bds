import { NextFunction, Request, Response } from "express";
import {
  createStaff,
  deleteUserByAdmin,
  getMyCustomerProfile,
  listUsers,
  updateMyCustomerProfile,
  updateUserByAdmin,
} from "./users.service.js";
import {
  validateCreateStaffInput,
  validateUpdateUserInput,
} from "./users.validators.js";
import { parsePagination } from "../../utils/pagination.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string | null;
    userType: string;
    roles?: string[];
  };
};

function getSingleParam(value: string | string[] | undefined, fieldName: string) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  throw new Error(`${fieldName} is required`);
}

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

export async function updateUserByAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdateUserInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const userId = getSingleParam(req.params.id, "id");
    const data = await updateUserByAdmin(userId, req.body);

    return res.json({
      success: true,
      message: "User updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserByAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getSingleParam(req.params.id, "id");
    const data = await deleteUserByAdmin(userId);

    return res.json({
      success: true,
      message: "User blocked successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

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