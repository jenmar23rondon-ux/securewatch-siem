import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || "dev_securewatch_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  analyzerUrl: process.env.ANALYZER_URL || "http://localhost:8000",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
};
