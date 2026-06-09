import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function exportAlertsCsv(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 500
  });

  const rows = [
    ["id", "title", "severity", "status", "ip", "eventType", "createdAt"],
    ...alerts.map((alert) => [
      alert.id,
      alert.title,
      alert.severity,
      alert.status,
      alert.event.ip,
      alert.event.type,
      alert.createdAt.toISOString()
    ])
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=securewatch-alerts.csv");
  return res.send(csv);
}
