import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export type JwtPayload = {
  id: number;
  email: string;
  role: Role;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
