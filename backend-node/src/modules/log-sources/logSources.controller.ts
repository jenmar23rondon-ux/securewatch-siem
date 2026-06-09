import { LogSourceType } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const createLogSourceSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(LogSourceType),
  description: z.string().optional()
});

export async function listLogSources(_req: Request, res: Response) {
  const sources = await prisma.logSource.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(sources);
}

export async function createLogSource(req: Request, res: Response) {
  const data = createLogSourceSchema.parse(req.body);
  const source = await prisma.logSource.create({ data });
  return res.status(201).json(source);
}
