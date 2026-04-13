import { NextFunction, Request, Response } from "express";
import {
  getPublicProjectDetail,
  getPublicProjectLocations,
  listPublicProjects,
} from "./public-projects.service.js";

type ProjectSlugParams = {
  slug: string;
};

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  return undefined;
}

function getQueryAsNumber(value: unknown): number | undefined {
  const raw = getQueryAsString(value);

  if (!raw) return undefined;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function listPublicProjectsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listPublicProjects({
      keyword: getQueryAsString(req.query.keyword),
      city: getQueryAsString(req.query.city),
      district: getQueryAsString(req.query.district),
      minPrice: getQueryAsNumber(req.query.minPrice),
      maxPrice: getQueryAsNumber(req.query.maxPrice),
      minArea: getQueryAsNumber(req.query.minArea),
      maxArea: getQueryAsNumber(req.query.maxArea),
      page: getQueryAsNumber(req.query.page),
      pageSize: getQueryAsNumber(req.query.pageSize),
    });

    return res.json({
      success: true,
      message: "Public projects fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicProjectDetailHandler(
  req: Request<ProjectSlugParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Project slug is required",
      });
    }

    const data = await getPublicProjectDetail(slug);

    return res.json({
      success: true,
      message: "Public project detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicLocationsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getPublicProjectLocations();

    return res.json({
      success: true,
      message: "Public locations fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}