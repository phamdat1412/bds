import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectDetailHandler,
  listProjectsHandler,
  updateProjectHandler,
} from "./projects.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", roleMiddleware("admin"), createProjectHandler);
router.get("/", roleMiddleware("admin", "seller"), listProjectsHandler);
router.get("/:id", roleMiddleware("admin", "seller"), getProjectDetailHandler);
router.patch("/:id", roleMiddleware("admin"), updateProjectHandler);
router.delete("/:id", roleMiddleware("admin"), deleteProjectHandler);

export default router;