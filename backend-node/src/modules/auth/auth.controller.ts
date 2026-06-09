import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "./auth.service";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const user = await registerUser(data);
  return res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data.email, data.password);

  if (!result) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json(result);
}
