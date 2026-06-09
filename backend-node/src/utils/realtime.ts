import { Server } from "socket.io";

let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
}

export function emitAlert(alert: unknown) {
  io?.emit("new-alert", alert);
  io?.emit("alert:new", alert);
}

export function emitEvent(event: unknown) {
  io?.emit("new-event", event);
}

export function emitMetricsUpdate(metrics: unknown) {
  io?.emit("metrics-update", metrics);
}
