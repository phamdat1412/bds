import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import { getDashboardSummaryHandler } from "./dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", roleMiddleware("admin", "seller"), getDashboardSummaryHandler);

export default router;