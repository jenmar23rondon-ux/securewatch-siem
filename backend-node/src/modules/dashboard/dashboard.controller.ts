import { Request, Response } from "express";
import { getDashboardMetrics } from "./dashboard.service";

export async function getDashboard(_req: Request, res: Response) {
  return res.json(await getDashboardMetrics());
}
