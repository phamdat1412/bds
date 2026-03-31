import { NextFunction, Request, Response } from "express";
import {
  addPropertyImage,
  deletePropertyImage,
  listPropertyImages,
  updatePropertyImage,
} from "./property-images.service.js";
import {
  validateAddPropertyImageInput,
  validateUpdatePropertyImageInput,
} from "./property-images.validators.js";

function getParamAsString(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  throw new Error("Missing route parameter");
}

export async function listPropertyImagesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const propertyId = getParamAsString(req.params.propertyId);
    const data = await listPropertyImages(propertyId);

    return res.json({
      success: true,
      message: "Property images fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function addPropertyImageHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateAddPropertyImageInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const propertyId = getParamAsString(req.params.propertyId);
    const data = await addPropertyImage(propertyId, req.body);

    return res.status(201).json({
      success: true,
      message: "Property image added successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updatePropertyImageHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdatePropertyImageInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const propertyId = getParamAsString(req.params.propertyId);
    const imageId = getParamAsString(req.params.imageId);
    const data = await updatePropertyImage(propertyId, imageId, req.body);

    return res.json({
      success: true,
      message: "Property image updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deletePropertyImageHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const propertyId = getParamAsString(req.params.propertyId);
    const imageId = getParamAsString(req.params.imageId);
    const data = await deletePropertyImage(propertyId, imageId);

    return res.json({
      success: true,
      message: "Property image deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}