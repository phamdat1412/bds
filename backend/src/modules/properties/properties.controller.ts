import { NextFunction, Request, Response } from "express";
import { parsePagination } from "../../utils/pagination.js";
import {
  createProperty,
  deleteProperty,
  getPropertyDetail,
  listProperties,
  updateInventoryStatus,
  updateProperty,
} from "./properties.service.js";
import {
  validateCreatePropertyInput,
  validateUpdateInventoryStatusInput,
  validateUpdatePropertyInput,
} from "./properties.validators.js";

function getParamAsString(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  throw new Error("Missing route parameter");
}

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  return undefined;
}

export async function createPropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreatePropertyInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const data = await createProperty(req.body);

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deletePropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const propertyId = getParamAsString(req.params.id);
    const data = await deleteProperty(propertyId);

    return res.json({
      success: true,
      message: "Property deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listPropertiesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize } = parsePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const data = await listProperties({
      projectId: getQueryAsString(req.query.projectId),
      keyword: getQueryAsString(req.query.keyword),
      propertyType: getQueryAsString(req.query.propertyType) as
        | "apartment"
        | "shophouse"
        | "townhouse"
        | "villa"
        | "land"
        | undefined,
      inventoryStatus: getQueryAsString(req.query.inventoryStatus) as
        | "available"
        | "reserved"
        | "sold"
        | "hidden"
        | undefined,
      blockName: getQueryAsString(req.query.blockName),
      page,
      pageSize,
    });

    return res.json({
      success: true,
      message: "Properties fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPropertyDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const propertyId = getParamAsString(req.params.id);
    const data = await getPropertyDetail(propertyId);

    return res.json({
      success: true,
      message: "Property detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updatePropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdatePropertyInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const propertyId = getParamAsString(req.params.id);
    const data = await updateProperty(propertyId, req.body);

    return res.json({
      success: true,
      message: "Property updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateInventoryStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdateInventoryStatusInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const propertyId = getParamAsString(req.params.id);
    const data = await updateInventoryStatus(propertyId, req.body);

    return res.json({
      success: true,
      message: "Inventory status updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}