import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export async function listThreats(_req: Request, res: Response) {
  const threats = await prisma.threat.findMany({
    include: { event: { include: { source: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return res.json(threats);
}
