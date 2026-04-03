import { Router } from "express";
import {
  getPublicProjectDetailHandler,
  listPublicProjectsHandler,
  getPublicLocationsHandler
} from "./public-projects.controller.js";

const router = Router();

router.get("/projects", listPublicProjectsHandler);
router.get("/projects/locations", getPublicLocationsHandler);
router.get("/projects/:slug", getPublicProjectDetailHandler);

export default router;