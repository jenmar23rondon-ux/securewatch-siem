import { Server } from "socket.io";

let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
}

export function emitAlert(alert: unknown) {
  io?.emit("alert:new", alert);
}
