import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  loginHandler,
  meHandler,
  registerHandler,
} from "./auth.controller.js";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", authMiddleware, meHandler);

export default router;