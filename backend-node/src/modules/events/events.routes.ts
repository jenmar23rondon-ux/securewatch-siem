import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createEvent, listEvents } from "./events.controller";

export const eventsRoutes = Router();

eventsRoutes.use(requireAuth);
eventsRoutes.get("/", asyncHandler(listEvents));
eventsRoutes.post("/", requireRole(Role.ADMIN, Role.ANALYST), asyncHandler(createEvent));
