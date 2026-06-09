import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { listThreats } from "./threats.controller";

export const threatsRoutes = Router();

threatsRoutes.use(requireAuth);
threatsRoutes.get("/", asyncHandler(listThreats));
