import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createLogSource, listLogSources } from "./logSources.controller";

export const logSourcesRoutes = Router();

logSourcesRoutes.use(requireAuth);
logSourcesRoutes.get("/", asyncHandler(listLogSources));
logSourcesRoutes.post("/", requireRole(Role.ADMIN, Role.ANALYST), asyncHandler(createLogSource));
