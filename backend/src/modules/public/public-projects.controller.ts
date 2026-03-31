import { NextFunction, Request, Response } from "express";
import {
  getPublicProjectDetail,
  listPublicProjects,
} from "./public-projects.service.js";

type ProjectSlugParams = {
  slug: string;
};

export async function listPublicProjectsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listPublicProjects();

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