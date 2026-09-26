import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 4001;

// If the built client exists, serve it statically so the entire app runs as a single service
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/socket.io")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => res.send("Duo Cinema signaling server is running."));
}

/**
 * In-memory room store (fine for V1 — no persistence needed for temporary rooms).
 * rooms: Map<roomCode, {
 *   roomName: string,
 *   hostId: string | null,
 *   guestId: string | null,
 *   movie: { title: string, source: 'local' } | null,
 *   createdAt: number
 * }>
 */
const rooms = new Map();

function makeRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

function publicRoomState(room) {
  return {
    roomName: room.roomName,
    hasHost: !!room.hostId,
    hasGuest: !!room.guestId,
    movie: room.movie,
  };
}

io.on("connection", (socket) => {
  socket.data.roomCode = null;
  socket.data.role = null; // 'host' | 'guest'
  socket.data.displayName = null;

  socket.on("create-room", ({ roomName, displayName, requestedCode }, cb) => {
    let code = (requestedCode || "").trim().toUpperCase();
    if (!code || rooms.has(code)) code = makeRoomCode();

    const room = {
      roomName: roomName?.trim() || "Movie Night",
      hostId: socket.id,
      guestId: null,
      movie: null,
      createdAt: Date.now(),
    };
    rooms.set(code, room);

    socket.data.roomCode = code;
    socket.data.role = "host";
    socket.data.displayName = displayName || "Host";
    socket.join(code);

    cb?.({ ok: true, roomCode: code, state: publicRoomState(room) });
  });

  socket.on("join-room", ({ roomCode, displayName }, cb) => {
    const code = (roomCode || "").trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return cb?.({ ok: false, error: "Room not found." });
    if (room.guestId) return cb?.({ ok: false, error: "Room is already full." });

    room.guestId = socket.id;
    socket.data.roomCode = code;
    socket.data.role = "guest";
    socket.data.displayName = displayName || "Guest";
    socket.join(code);

    io.to(code).emit("room-updated", publicRoomState(room));
    cb?.({ ok: true, state: publicRoomState(room) });
    socket.to(code).emit("peer-joined", { displayName: socket.data.displayName });
  });

  socket.on("select-movie", ({ title, source }) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || socket.data.role !== "host") return;
    room.movie = { title, source: source || "local" };
    io.to(code).emit("room-updated", publicRoomState(room));
  });

  // --- WebRTC signaling relay (offer / answer / ICE candidates) ---
  socket.on("webrtc-signal", (payload) => {
    const code = socket.data.roomCode;
    if (!code) return;
    socket.to(code).emit("webrtc-signal", payload);
  });

  socket.on("start-session", () => {
    const code = socket.data.roomCode;
    if (!code || socket.data.role !== "host") return;
    io.to(code).emit("session-started");
  });

  socket.on("end-session", () => {
    const code = socket.data.roomCode;
    if (!code) return;
    io.to(code).emit("session-ended");
  });

  // --- Lightweight playback status (for UI display, e.g. progress bar / "Nimah is watching") ---
  socket.on("playback-status", (status) => {
    const code = socket.data.roomCode;
    if (!code) return;
    socket.to(code).emit("playback-status", status);
  });

  // --- Chat + reactions ---
  socket.on("chat-message", (message) => {
    const code = socket.data.roomCode;
    if (!code) return;
    io.to(code).emit("chat-message", {
      from: socket.data.displayName,
      text: message,
      at: Date.now(),
    });
  });

  socket.on("reaction", (emoji) => {
    const code = socket.data.roomCode;
    if (!code) return;
    io.to(code).emit("reaction", { from: socket.data.displayName, emoji });
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    const room = code && rooms.get(code);
    if (!room) return;

    if (socket.data.role === "host") {
      io.to(code).emit("peer-left", { role: "host" });
      rooms.delete(code); // host leaving ends the room
    } else if (socket.data.role === "guest") {
      room.guestId = null;
      io.to(code).emit("peer-left", { role: "guest" });
      io.to(code).emit("room-updated", publicRoomState(room));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Duo Cinema signaling server listening on port ${PORT}`);
});
