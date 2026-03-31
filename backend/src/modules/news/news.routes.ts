import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createNewsHandler,
  deleteNewsHandler,
  getNewsDetailHandler,
  listNewsHandler,
  updateNewsHandler,
} from "./news.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listNewsHandler);
router.get("/:id", getNewsDetailHandler);
router.post("/", roleMiddleware("admin"), createNewsHandler);
router.patch("/:id", roleMiddleware("admin"), updateNewsHandler);
router.delete("/:id", roleMiddleware("admin"), deleteNewsHandler);

export default router;