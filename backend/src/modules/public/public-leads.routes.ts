import { Router } from "express";
import { createPublicLeadHandler } from "../leads/leads.controller.js";

const router = Router();

router.post("/leads", createPublicLeadHandler);

export default router;