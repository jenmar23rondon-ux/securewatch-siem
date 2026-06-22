import { env } from "../../config/env";
import { EventJobPayload } from "../../workers/eventQueue";
import { prisma } from "../../config/prisma";
import { Severity } from "@prisma/client";

export type AnalyzerResult = {
  risk: "low" | "medium" | "high" | "critical";
  score: number;
  reasons: string[];
  model: string;
};

type TrainingSample = {
  failedAttempts: number;
  requestCount: number;
  uniquePorts: number;
  payloadRisk: number;
};

export type TrainingStatus = {
  trained: boolean;
  samples: number;
  model: string;
  message: string;
};

function payloadRisk(payload?: string | null) {
  if (!payload) return 0;
  const normalized = payload.toLowerCase();
  return ["' or 1=1", "union select", "drop table", "--", "sleep("].some((pattern) =>
    normalized.includes(pattern)
  )
    ? 1
    : 0;
}

export async function analyzeWithPython(event: EventJobPayload): Promise<AnalyzerResult | null> {
  try {
    const response = await fetch(`${env.analyzerUrl}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: event.type,
        ip: event.ip,
        payload: event.payload,
        failedAttempts: event.failedAttempts || 0,
        requestCount: event.requestCount || 0,
        uniquePorts: event.port ? 1 : 0
      })
    });

    if (!response.ok) return null;
    return (await response.json()) as AnalyzerResult;
  } catch {
    return null;
  }
}

export async function trainPythonAnalyzerFromDatabase(): Promise<TrainingStatus | null> {
  try {
    const events = await prisma.securityEvent.findMany({
      where: { severity: Severity.LOW },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        failedAttempts: true,
        requestCount: true,
        port: true,
        payload: true
      }
    });

    const samples: TrainingSample[] = events.map((event) => ({
      failedAttempts: event.failedAttempts,
      requestCount: event.requestCount,
      uniquePorts: event.port ? 1 : 0,
      payloadRisk: payloadRisk(event.payload)
    }));

    const response = await fetch(`${env.analyzerUrl}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples })
    });

    if (!response.ok) return null;
    return (await response.json()) as TrainingStatus;
  } catch {
    return null;
  }
}

export async function getPythonAnalyzerStatus(): Promise<TrainingStatus | null> {
  try {
    const response = await fetch(`${env.analyzerUrl}/model/status`);
    if (!response.ok) return null;
    return (await response.json()) as TrainingStatus;
  } catch {
    return null;
  }
}
