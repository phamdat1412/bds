import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  createPropertyHandler,
  deletePropertyHandler,
  getPropertyDetailHandler,
  getPublicPropertyDetailHandler,
  listPropertiesHandler,
  updateInventoryStatusHandler,
  updatePropertyHandler,
} from "./properties.controller.js";
import propertyImagesRouter from "../property-images/property-images.routes.js";

const router = Router();

// PUBLIC ROUTE
router.get("/public/properties/:id", getPublicPropertyDetailHandler);

// PRIVATE ROUTES
router.use(authMiddleware);
router.use("/:propertyId/images", propertyImagesRouter);

router.post("/", roleMiddleware("admin"), createPropertyHandler);
router.get("/", roleMiddleware("admin", "seller"), listPropertiesHandler);
router.get("/:id", roleMiddleware("admin", "seller"), getPropertyDetailHandler);
router.patch("/:id", roleMiddleware("admin"), updatePropertyHandler);
router.patch(
  "/:id/inventory-status",
  roleMiddleware("admin"),
  updateInventoryStatusHandler
);
router.delete("/:id", roleMiddleware("admin"), deletePropertyHandler);

export default router;