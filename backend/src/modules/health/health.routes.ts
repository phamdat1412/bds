import { Router } from "express";
import { getHealth, testDatabase } from "./health.controller.js";

const router = Router();

router.get("/health", getHealth);
router.get("/test-db", testDatabase);

export default router;