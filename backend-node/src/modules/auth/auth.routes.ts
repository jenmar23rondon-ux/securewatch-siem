import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { login, register } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", asyncHandler(login));
authRoutes.post("/register", asyncHandler(register));
