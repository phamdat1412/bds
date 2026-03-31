import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createLeadActivityHandler,
  listLeadActivitiesHandler,
} from "./lead-activities.controller.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(roleMiddleware("admin", "seller"));

router.get("/", listLeadActivitiesHandler);
router.post("/", createLeadActivityHandler);

export default router;