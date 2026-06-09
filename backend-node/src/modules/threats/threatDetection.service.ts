import { EventType, Severity } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type Detection = {
  name: string;
  rule: string;
  severity: Severity;
  score: number;
  alertTitle: string;
  alertMessage: string;
};

function hasSqlInjection(payload?: string | null) {
  if (!payload) return false;
  const normalized = payload.toLowerCase();
  return (
    normalized.includes("' or 1=1") ||
    normalized.includes('" or "1"="1') ||
    normalized.includes("union select") ||
    normalized.includes("drop table")
  );
}

export async function detectThreats(input: {
  type: EventType;
  ip: string;
  payload?: string | null;
  failedAttempts?: number;
  requestCount?: number;
  port?: number | null;
}) {
  const detections: Detection[] = [];

  if (hasSqlInjection(input.payload) || input.type === EventType.SQL_INJECTION_ATTEMPT) {
    detections.push({
      name: "SQL Injection Attempt",
      rule: "payload_contains_sql_injection_pattern",
      severity: Severity.HIGH,
      score: 85,
      alertTitle: "SQL injection attempt detected",
      alertMessage: `Suspicious SQL payload detected from IP ${input.ip}`
    });
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const failedLoginCount = await prisma.securityEvent.count({
    where: {
      ip: input.ip,
      type: EventType.LOGIN_FAILED,
      createdAt: { gte: fiveMinutesAgo }
    }
  });

  if (
    input.type === EventType.LOGIN_FAILED &&
    failedLoginCount + (input.failedAttempts || 1) >= 10
  ) {
    detections.push({
      name: "Brute Force Login",
      rule: "10_failed_logins_in_5_minutes",
      severity: Severity.CRITICAL,
      score: 95,
      alertTitle: "Possible brute force attack",
      alertMessage: `IP ${input.ip} reached 10 or more failed login attempts in 5 minutes`
    });
  }

  if ((input.requestCount || 0) >= 100 || input.type === EventType.DDOS_ATTEMPT) {
    detections.push({
      name: "Possible DDoS",
      rule: "100_requests_per_minute",
      severity: Severity.HIGH,
      score: 88,
      alertTitle: "Possible DDoS activity",
      alertMessage: `High request volume detected from IP ${input.ip}`
    });
  }

  if (input.type === EventType.PORT_SCAN) {
    detections.push({
      name: "Port Scan",
      rule: "multiple_ports_from_same_ip",
      severity: Severity.MEDIUM,
      score: 70,
      alertTitle: "Port scan detected",
      alertMessage: `Port scan signal detected from IP ${input.ip}`
    });
  }

  return detections;
}
