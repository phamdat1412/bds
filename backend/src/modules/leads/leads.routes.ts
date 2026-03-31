import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  assignLeadHandler,
  createLeadActivityHandler,
  createLeadHandler,
  deleteLeadHandler,
  getLeadDetailHandler,
  listLeadsHandler,
  updateLeadHandler,
  updateLeadStatusHandler,
} from "./leads.controller.js";
import leadActivitiesRouter from "../lead-activities/lead-activities.routes.js";

const router = Router();

router.use(authMiddleware);
router.use("/:leadId/activities", leadActivitiesRouter);

router.post("/", roleMiddleware("admin", "seller"), createLeadHandler);
router.get("/", roleMiddleware("admin", "seller"), listLeadsHandler);
router.get("/:id", roleMiddleware("admin", "seller"), getLeadDetailHandler);
router.patch("/:id/status", roleMiddleware("admin", "seller"), updateLeadStatusHandler);
router.post("/:id/assign", roleMiddleware("admin"), assignLeadHandler);
router.post("/:id/activities", roleMiddleware("admin", "seller"), createLeadActivityHandler);
router.patch("/:id", roleMiddleware("admin", "seller"), updateLeadHandler);
router.delete("/:id", roleMiddleware("admin"), deleteLeadHandler);

export default router;