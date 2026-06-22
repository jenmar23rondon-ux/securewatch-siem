import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { getAnalyzerStatus, listThreats, trainAnalyzer } from "./threats.controller";

export const threatsRoutes = Router();

threatsRoutes.use(requireAuth);
threatsRoutes.get("/", asyncHandler(listThreats));
threatsRoutes.get("/analyzer/status", asyncHandler(getAnalyzerStatus));
threatsRoutes.post(
  "/analyzer/train",
  requireRole(Role.ADMIN, Role.ANALYST),
  asyncHandler(trainAnalyzer)
);
