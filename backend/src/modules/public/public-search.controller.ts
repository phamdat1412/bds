import { NextFunction, Request, Response } from "express";
import { getPublicSearchSuggestions } from "./public-search.service.js";

function getQueryAsString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  return undefined;
}

export async function getPublicSearchSuggestionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const keyword = getQueryAsString(req.query.q) || "";
    const data = await getPublicSearchSuggestions(keyword);

    return res.json({
      success: true,
      message: "Search suggestions fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}