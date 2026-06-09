import { AlertStatus, Severity } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export async function getDashboard(_req: Request, res: Response) {
  const [
    totalEvents,
    openAlerts,
    criticalThreats,
    eventsBySeverity,
    topIps,
    eventsByHour
  ] = await Promise.all([
    prisma.securityEvent.count(),
    prisma.alert.count({ where: { status: AlertStatus.OPEN } }),
    prisma.threat.count({ where: { severity: Severity.CRITICAL } }),
    prisma.securityEvent.groupBy({
      by: ["severity"],
      _count: { severity: true }
    }),
    prisma.securityEvent.groupBy({
      by: ["ip"],
      _count: { ip: true },
      orderBy: { _count: { ip: "desc" } },
      take: 5
    }),
    prisma.$queryRaw<Array<{ hour: Date; count: bigint }>>`
      SELECT date_trunc('hour', "createdAt") AS hour, count(*) AS count
      FROM "SecurityEvent"
      GROUP BY hour
      ORDER BY hour DESC
      LIMIT 12
    `
  ]);

  return res.json({
    totalEvents,
    openAlerts,
    criticalThreats,
    eventsBySeverity: eventsBySeverity.map((item) => ({
      severity: item.severity,
      count: item._count.severity
    })),
    topIps: topIps.map((item) => ({ ip: item.ip, count: item._count.ip })),
    eventsByHour: eventsByHour.map((item) => ({
      hour: item.hour,
      count: Number(item.count)
    }))
  });
}
