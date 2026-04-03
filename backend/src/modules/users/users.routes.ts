import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createStaffHandler,
  deleteUserByAdminHandler,
  getMyCustomerProfileHandler,
  listUsersHandler,
  updateMyCustomerProfileHandler,
  updateUserByAdminHandler,
} from "./users.controller.js";

const router = Router();

// customer routes
router.get(
  "/me/profile",
  authMiddleware,
  
  getMyCustomerProfileHandler
);

router.patch(
  "/me/profile",
  authMiddleware,
  
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

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserByAdminHandler
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUserByAdminHandler
);

export default router;