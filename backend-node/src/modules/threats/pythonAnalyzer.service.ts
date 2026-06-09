import { env } from "../../config/env";
import { EventJobPayload } from "../../workers/eventQueue";

export type AnalyzerResult = {
  risk: "low" | "medium" | "high" | "critical";
  score: number;
  reasons: string[];
  model: string;
};

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
