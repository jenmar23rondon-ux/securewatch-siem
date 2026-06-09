import { io } from "socket.io-client";
import { API_URL } from "../services/api";

export const alertsSocket = io(API_URL, {
  autoConnect: false
});
