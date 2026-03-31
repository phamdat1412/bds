import { NextFunction, Request, Response } from "express";
import {
  createProject,
  getProjectDetail,
  deleteProject,
  listProjects,
  updateProject,
} from "./projects.service.js";
import {
  validateCreateProjectInput,
  validateUpdateProjectInput,
} from "./projects.validators.js";
import { parsePagination } from "../../utils/pagination.js";
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

export async function createProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateCreateProjectInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const data = await createProject(req.body);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
export async function deleteProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = getParamAsString(req.params.id);
    const data = await deleteProject(projectId);

    return res.json({
      success: true,
      message: "Project deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
// export async function listProjectsHandler(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const data = await listProjects({
//       keyword: getQueryAsString(req.query.keyword),
//       status: getQueryAsString(req.query.status) as
//         | "draft"
//         | "published"
//         | "hidden"
//         | undefined,
//       city: getQueryAsString(req.query.city),
//       district: getQueryAsString(req.query.district),
//     });

//     return res.json({
//       success: true,
//       message: "Projects fetched successfully",
//       data,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }
export async function listProjectsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize } = parsePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const data = await listProjects({
      keyword: getQueryAsString(req.query.keyword),
      status: getQueryAsString(req.query.status) as
        | "draft"
        | "published"
        | "hidden"
        | undefined,
      city: getQueryAsString(req.query.city),
      district: getQueryAsString(req.query.district),
      page,
      pageSize,
    });

    return res.json({
      success: true,
      message: "Projects fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getProjectDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = getParamAsString(req.params.id);
    const data = await getProjectDetail(projectId);

    return res.json({
      success: true,
      message: "Project detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const errors = validateUpdateProjectInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const projectId = getParamAsString(req.params.id);
    const data = await updateProject(projectId, req.body);

    return res.json({
      success: true,
      message: "Project updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}