import { Router } from "express";
import { getPublicSearchSuggestionsHandler } from "./public-search.controller.js";

const router = Router();

router.get("/search/suggestions", getPublicSearchSuggestionsHandler);

export default router;