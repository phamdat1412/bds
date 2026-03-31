import { NextFunction, Request, Response } from "express";
import { parsePagination } from "../../utils/pagination.js";
import {
  createNews,
  deleteNews,
  getNewsDetail,
  getPublicNewsDetail,
  listNews,
  listPublicNews,
  updateNews,
} from "./news.service.js";

function getParamAsString(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  throw new Error("Missing route parameter");
}

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return undefined;
}

export async function createNewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await createNews(req.body);

    return res.status(201).json({
      success: true,
      message: "News created successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listNewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize } = parsePagination({
      page: req.query.page,
      pageSize: req.query.pageSize,
    });

    const data = await listNews({
      keyword: getQueryAsString(req.query.keyword),
      status: getQueryAsString(req.query.status) as
        | "draft"
        | "published"
        | "hidden"
        | undefined,
      page,
      pageSize,
    });

    return res.json({
      success: true,
      message: "News fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNewsDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newsId = getParamAsString(req.params.id);
    const data = await getNewsDetail(newsId);

    return res.json({
      success: true,
      message: "News detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateNewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newsId = getParamAsString(req.params.id);
    const data = await updateNews(newsId, req.body);

    return res.json({
      success: true,
      message: "News updated successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteNewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const newsId = getParamAsString(req.params.id);
    const data = await deleteNews(newsId);

    return res.json({
      success: true,
      message: "News deleted successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listPublicNewsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await listPublicNews();

    return res.json({
      success: true,
      message: "Public news fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicNewsDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = getParamAsString(req.params.slug);
    const data = await getPublicNewsDetail(slug);

    return res.json({
      success: true,
      message: "Public news detail fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}