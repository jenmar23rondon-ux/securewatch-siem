import { EventType, Severity } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { emitAlert } from "../../utils/realtime";
import { detectThreats } from "../threats/threatDetection.service";

function maxSeverity(current: Severity, next: Severity) {
  const weight: Record<Severity, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };
  return weight[next] > weight[current] ? next : current;
}

export async function createSecurityEvent(data: {
  type: EventType;
  sourceId: number;
  ip: string;
  payload?: string;
  path?: string;
  method?: string;
  port?: number;
  requestCount?: number;
  failedAttempts?: number;
}) {
  const detections = await detectThreats(data);
  let severity: Severity = Severity.LOW;
  for (const detection of detections) {
    severity = maxSeverity(severity, detection.severity);
  }

  const event = await prisma.securityEvent.create({
    data: {
      ...data,
      severity
    },
    include: { source: true }
  });

  for (const detection of detections) {
    await prisma.threat.create({
      data: {
        eventId: event.id,
        name: detection.name,
        rule: detection.rule,
        severity: detection.severity,
        score: detection.score
      }
    });

    const alert = await prisma.alert.create({
      data: {
        eventId: event.id,
        title: detection.alertTitle,
        message: detection.alertMessage,
        severity: detection.severity
      },
      include: { event: true }
    });

    emitAlert(alert);
  }

  return prisma.securityEvent.findUnique({
    where: { id: event.id },
    include: { source: true, threats: true, alerts: true }
  });
}

export async function listSecurityEvents() {
  return prisma.securityEvent.findMany({
    include: { source: true, threats: true, alerts: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
