import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import leadsRoutes from "../modules/leads/leads.routes.js";
import projectsRoutes from "../modules/projects/projects.routes.js";
import propertiesRoutes from "../modules/properties/properties.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import publicProjectsRouter from "../modules/public/public-projects.routes.js";
import newsRouter from "../modules/news/news.routes.js";
import publicNewsRouter from "../modules/public/public-news.routes.js";
import bookmarksRouter from "../modules/bookmarks/bookmarks.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/leads", leadsRoutes);
router.use("/projects", projectsRoutes);
router.use("/properties", propertiesRoutes);
router.use("/media", mediaRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/public", publicProjectsRouter);
router.use("/news", newsRouter);
router.use("/public", publicNewsRouter);
router.use("/bookmarks", bookmarksRouter);

export default router;