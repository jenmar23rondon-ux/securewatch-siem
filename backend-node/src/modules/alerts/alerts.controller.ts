import { AlertStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const updateStatusSchema = z.object({
  status: z.nativeEnum(AlertStatus)
});

export async function listAlerts(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    include: { event: { include: { source: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return res.json(alerts);
}

export async function updateAlertStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = updateStatusSchema.parse(req.body);
  const alert = await prisma.alert.update({ where: { id }, data });
  return res.json(alert);
}
