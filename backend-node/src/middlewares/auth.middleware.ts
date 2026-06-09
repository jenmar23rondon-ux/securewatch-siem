import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = verifyToken(header.replace("Bearer ", ""));
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
