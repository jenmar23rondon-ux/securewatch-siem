import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { alertsRoutes } from "./modules/alerts/alerts.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { eventsRoutes } from "./modules/events/events.routes";
import { logSourcesRoutes } from "./modules/log-sources/logSources.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { threatsRoutes } from "./modules/threats/threats.routes";
import { usersRoutes } from "./modules/users/users.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ name: "SecureWatch SIEM API", status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/log-sources", logSourcesRoutes);
app.use("/events", eventsRoutes);
app.use("/threats", threatsRoutes);
app.use("/alerts", alertsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reports", reportsRoutes);

app.use(errorMiddleware);
