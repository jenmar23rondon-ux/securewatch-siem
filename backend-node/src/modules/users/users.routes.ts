import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/roles.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUser, listUsers } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.use(requireAuth);
usersRoutes.get("/", requireRole(Role.ADMIN, Role.ANALYST), asyncHandler(listUsers));
usersRoutes.post("/", requireRole(Role.ADMIN), asyncHandler(createUser));
