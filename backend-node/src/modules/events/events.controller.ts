import { EventType } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { enqueueSecurityEvent, listSecurityEvents } from "./events.service";

const createEventSchema = z.object({
  type: z.nativeEnum(EventType),
  sourceId: z.number().int().positive(),
  ip: z.string().min(3),
  payload: z.string().optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  port: z.number().int().optional(),
  requestCount: z.number().int().min(0).optional(),
  failedAttempts: z.number().int().min(0).optional()
});

export async function listEvents(_req: Request, res: Response) {
  const events = await listSecurityEvents();
  return res.json(events);
}

export async function createEvent(req: Request, res: Response) {
  const data = createEventSchema.parse(req.body);
  const result = await enqueueSecurityEvent(data);
  return res.status(result.queued ? 202 : 201).json(result);
}
