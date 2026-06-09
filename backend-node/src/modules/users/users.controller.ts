import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { registerUser } from "../auth/auth.service";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role)
});

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);
  const user = await registerUser(data);
  return res.status(201).json(user);
}
