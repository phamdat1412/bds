import { Router } from "express";
import { getPublicPropertyDetailHandler } from "../properties/properties.controller.js";

const router = Router();

router.get("/properties/:id", getPublicPropertyDetailHandler);

export default router;