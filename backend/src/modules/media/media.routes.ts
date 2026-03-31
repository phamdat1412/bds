import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import {
  deleteMediaHandler,
  listMediaHandler,
  uploadMediaHandler,
} from "./media.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.use(authMiddleware);

router.post(
  "/upload",
  roleMiddleware("admin", "seller"),
  upload.single("file"),
  uploadMediaHandler
);

router.get(
  "/",
  roleMiddleware("admin", "seller"),
  listMediaHandler
);

router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteMediaHandler
);

export default router;