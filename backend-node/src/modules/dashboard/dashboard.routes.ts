import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { getDashboard } from "./dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/", asyncHandler(getDashboard));
