import { Router } from "express";
import {
  getPublicNewsDetailHandler,
  listPublicNewsHandler,
} from "../news/news.controller.js";

const router = Router();

router.get("/news", listPublicNewsHandler);
router.get("/news/:slug", getPublicNewsDetailHandler);

export default router;