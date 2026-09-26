import { io, Socket } from "socket.io-client";

// Point this at your deployed signaling server.
// In local dev with Vite: defaults to http://localhost:4001.
// In production or full-stack deploy: automatically uses the current origin.
const isViteDev = typeof window !== "undefined" && ["5173", "5174", "5175"].includes(window.location.port);
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (!isViteDev && typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:4001");

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
