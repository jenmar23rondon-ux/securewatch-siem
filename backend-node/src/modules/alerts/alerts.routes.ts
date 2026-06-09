import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { listAlerts, updateAlertStatus } from "./alerts.controller";

export const alertsRoutes = Router();

alertsRoutes.use(requireAuth);
alertsRoutes.get("/", asyncHandler(listAlerts));
alertsRoutes.patch("/:id/status", requireRole(Role.ADMIN, Role.ANALYST), asyncHandler(updateAlertStatus));
