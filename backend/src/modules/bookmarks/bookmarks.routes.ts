import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  getProjectBookmarkStatusHandler,
  listMyProjectBookmarksHandler,
  toggleProjectBookmarkHandler,
} from "./bookmarks.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("customer"));

router.get("/projects", listMyProjectBookmarksHandler);
router.get("/projects/:projectId/status", getProjectBookmarkStatusHandler);
router.post("/projects/:projectId/toggle", toggleProjectBookmarkHandler);

export default router;