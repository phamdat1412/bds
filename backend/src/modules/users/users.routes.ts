import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createStaffHandler,
  listUsersHandler,
  getMyCustomerProfileHandler,
  updateMyCustomerProfileHandler,
} from "./users.controller.js";

const router = Router();

// customer routes
router.get(
  "/me/profile",
  authMiddleware,
  roleMiddleware("customer"),
  getMyCustomerProfileHandler
);

router.patch(
  "/me/profile",
  authMiddleware,
  roleMiddleware("customer"),
  updateMyCustomerProfileHandler
);

// admin routes
router.post(
  "/staff",
  authMiddleware,
  roleMiddleware("admin"),
  createStaffHandler
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  listUsersHandler
);

export default router;