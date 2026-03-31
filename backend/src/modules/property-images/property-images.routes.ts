import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  addPropertyImageHandler,
  deletePropertyImageHandler,
  listPropertyImagesHandler,
  updatePropertyImageHandler,
} from "./property-images.controller.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", roleMiddleware("admin", "seller"), listPropertyImagesHandler);
router.post("/", roleMiddleware("admin"), addPropertyImageHandler);
router.patch("/:imageId", roleMiddleware("admin"), updatePropertyImageHandler);
router.delete("/:imageId", roleMiddleware("admin"), deletePropertyImageHandler);

export default router;