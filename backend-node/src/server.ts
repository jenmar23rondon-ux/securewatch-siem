import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { setSocketServer } from "./utils/realtime";
import { startAnalyzerTrainingLoop } from "./workers/analyzerTraining";
import { startEventWorker } from "./workers/eventQueue";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.frontendOrigin }
});

setSocketServer(io);
startEventWorker();
startAnalyzerTrainingLoop();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

server.listen(env.port, () => {
  console.log(`SecureWatch SIEM API running on http://localhost:${env.port}`);
});
