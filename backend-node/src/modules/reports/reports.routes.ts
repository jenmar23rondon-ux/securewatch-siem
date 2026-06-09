import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { exportAlertsCsv, exportAlertsPdf } from "./reports.controller";

export const reportsRoutes = Router();

reportsRoutes.use(requireAuth);
reportsRoutes.get("/alerts.csv", asyncHandler(exportAlertsCsv));
reportsRoutes.get("/alerts.pdf", asyncHandler(exportAlertsPdf));
