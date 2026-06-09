import { EventType, Severity } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { emitAlert, emitEvent, emitMetricsUpdate } from "../../utils/realtime";
import { eventQueue, EventJobPayload } from "../../workers/eventQueue";
import { getDashboardMetrics } from "../dashboard/dashboard.service";
import { analyzeWithPython } from "../threats/pythonAnalyzer.service";
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

function severityFromRisk(risk: string): Severity {
  if (risk === "critical") return Severity.CRITICAL;
  if (risk === "high") return Severity.HIGH;
  if (risk === "medium") return Severity.MEDIUM;
  return Severity.LOW;
}

async function createAlertAndThreat(eventId: number, detection: {
  name: string;
  rule: string;
  severity: Severity;
  score: number;
  alertTitle: string;
  alertMessage: string;
}) {
  await prisma.threat.create({
    data: {
      eventId,
      name: detection.name,
      rule: detection.rule,
      severity: detection.severity,
      score: detection.score
    }
  });

  const alert = await prisma.alert.create({
    data: {
      eventId,
      title: detection.alertTitle,
      message: detection.alertMessage,
      severity: detection.severity
    },
    include: { event: true }
  });

  emitAlert(alert);
  return alert;
}

async function correlateEvents(event: { id: number; ip: string; sourceId: number }) {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const related = await prisma.securityEvent.findMany({
    where: {
      ip: event.ip,
      createdAt: { gte: tenMinutesAgo }
    },
    select: { sourceId: true }
  });

  const uniqueSources = new Set(related.map((item) => item.sourceId));
  if (uniqueSources.size < 2 || related.length < 3) return null;

  return createAlertAndThreat(event.id, {
    name: "Correlated Suspicious Activity",
    rule: "same_ip_multiple_sources_10m",
    severity: Severity.CRITICAL,
    score: 98,
    alertTitle: "Critical correlated activity",
    alertMessage: `IP ${event.ip} appeared across ${uniqueSources.size} log sources in 10 minutes`
  });
}

export async function enqueueSecurityEvent(data: EventJobPayload) {
  try {
    const job = await eventQueue.add(data);
    return { queued: true, jobId: job.id };
  } catch {
    const event = await processSecurityEvent(data);
    return { queued: false, event };
  }
}

export async function processSecurityEvent(data: EventJobPayload) {
  const detections = await detectThreats(data);
  const analyzer = await analyzeWithPython(data);

  if (analyzer && analyzer.score >= 50) {
    const severity = severityFromRisk(analyzer.risk);
    detections.push({
      name: "ML Anomaly Detection",
      rule: analyzer.model,
      severity,
      score: analyzer.score,
      alertTitle: "Machine-learning anomaly detected",
      alertMessage: analyzer.reasons.length
        ? analyzer.reasons.join("; ")
        : `Python analyzer marked event from ${data.ip} as ${analyzer.risk}`
    });
  }

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
    await createAlertAndThreat(event.id, detection);
  }

  await correlateEvents(event);

  const finalEvent = await prisma.securityEvent.findUnique({
    where: { id: event.id },
    include: { source: true, threats: true, alerts: true }
  });

  emitEvent(finalEvent);
  emitMetricsUpdate(await getDashboardMetrics());
  return finalEvent;
}

export async function listSecurityEvents() {
  return prisma.securityEvent.findMany({
    include: { source: true, threats: true, alerts: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
