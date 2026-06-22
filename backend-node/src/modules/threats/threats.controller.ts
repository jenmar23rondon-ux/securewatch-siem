import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { getPythonAnalyzerStatus, trainPythonAnalyzerFromDatabase } from "./pythonAnalyzer.service";

export async function listThreats(_req: Request, res: Response) {
  const threats = await prisma.threat.findMany({
    include: { event: { include: { source: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return res.json(threats);
}

export async function getAnalyzerStatus(_req: Request, res: Response) {
  const status = await getPythonAnalyzerStatus();
  if (!status) {
    return res.status(503).json({ error: "Python analyzer is unavailable" });
  }

  return res.json(status);
}

export async function trainAnalyzer(_req: Request, res: Response) {
  const status = await trainPythonAnalyzerFromDatabase();
  if (!status) {
    return res.status(503).json({ error: "Python analyzer training failed or service is unavailable" });
  }

  return res.json(status);
}
