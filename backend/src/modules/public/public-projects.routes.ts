import { Router } from "express";
import {
  getPublicProjectDetailHandler,
  listPublicProjectsHandler,
} from "./public-projects.controller.js";

const router = Router();

router.get("/projects", listPublicProjectsHandler);
router.get("/projects/:slug", getPublicProjectDetailHandler);

export default router;