import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", details: err.flatten() });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
