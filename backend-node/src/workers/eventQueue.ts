import Queue from "bull";
import { EventType } from "@prisma/client";
import { env } from "../config/env";
import { processSecurityEvent } from "../modules/events/events.service";

export type EventJobPayload = {
  type: EventType;
  sourceId: number;
  ip: string;
  payload?: string;
  path?: string;
  method?: string;
  port?: number;
  requestCount?: number;
  failedAttempts?: number;
};

export const eventQueue = new Queue<EventJobPayload>("events", env.redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 100
  }
});

export function startEventWorker() {
  eventQueue.process(async (job) => {
    await processSecurityEvent(job.data);
  });

  eventQueue.on("failed", (job, error) => {
    console.error(`Event job ${job.id} failed:`, error.message);
  });
}
