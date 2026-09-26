import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import type { ChatMessage, Reaction, RoomState, Role } from "../types";

interface SessionValue {
  displayName: string;
  setDisplayName: (n: string) => void;
  role: Role | null;
  roomCode: string | null;
  roomState: RoomState | null;
  messages: ChatMessage[];
  lastReaction: Reaction | null;
  peerConnected: boolean;
  sessionStarted: boolean;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;

  createRoom: (roomName: string, requestedCode?: string) => Promise<{ ok: boolean; roomCode?: string; error?: string }>;
  joinRoom: (roomCode: string) => Promise<{ ok: boolean; error?: string }>;
  selectMovie: (title: string) => void;
  startSession: () => void;
  endSession: () => void;
  sendChat: (text: string) => void;
  sendReaction: (emoji: string) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState("You");
  const [role, setRole] = useState<Role | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastReaction, setLastReaction] = useState<Reaction | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const roleRef = useRef<Role | null>(null);

  useEffect(() => {
    const onRoomUpdated = (state: RoomState) => {
      setRoomState(state);
      if (roleRef.current === "host") setPeerConnected(state.hasGuest);
      else setPeerConnected(state.hasHost);
    };
    const onPeerJoined = () => setPeerConnected(true);
    const onPeerLeft = () => {
      setPeerConnected(false);
      setSessionStarted(false);
    };
    const onSessionStarted = () => setSessionStarted(true);
    const onSessionEnded = () => setSessionStarted(false);
    const onChat = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);
    const onReaction = (r: Reaction) => setLastReaction(r);

    socket.on("room-updated", onRoomUpdated);
    socket.on("peer-joined", onPeerJoined);
    socket.on("peer-left", onPeerLeft);
    socket.on("session-started", onSessionStarted);
    socket.on("session-ended", onSessionEnded);
    socket.on("chat-message", onChat);
    socket.on("reaction", onReaction);

    return () => {
      socket.off("room-updated", onRoomUpdated);
      socket.off("peer-joined", onPeerJoined);
      socket.off("peer-left", onPeerLeft);
      socket.off("session-started", onSessionStarted);
      socket.off("session-ended", onSessionEnded);
      socket.off("chat-message", onChat);
      socket.off("reaction", onReaction);
    };
  }, []);

  function createRoom(roomName: string, requestedCode?: string) {
    return new Promise<{ ok: boolean; roomCode?: string; error?: string }>((resolve) => {
      socket.emit(
        "create-room",
        { roomName, displayName, requestedCode },
        (res: { ok: boolean; roomCode?: string; state?: RoomState; error?: string }) => {
          if (res.ok) {
            setRole("host");
            roleRef.current = "host";
            setRoomCode(res.roomCode!);
            setRoomState(res.state!);
          }
          resolve(res);
        }
      );
    });
  }

  function joinRoom(code: string) {
    return new Promise<{ ok: boolean; error?: string }>((resolve) => {
      socket.emit(
        "join-room",
        { roomCode: code, displayName },
        (res: { ok: boolean; state?: RoomState; error?: string }) => {
          if (res.ok) {
            setRole("guest");
            roleRef.current = "guest";
            setRoomCode(code.toUpperCase());
            setRoomState(res.state!);
            setPeerConnected(true);
          }
          resolve(res);
        }
      );
    });
  }

  function selectMovie(title: string) {
    socket.emit("select-movie", { title, source: "local" });
  }

  function startSession() {
    socket.emit("start-session");
    setSessionStarted(true);
  }

  function endSession() {
    socket.emit("end-session");
    setSessionStarted(false);
  }

  function sendChat(text: string) {
    if (!text.trim()) return;
    socket.emit("chat-message", text);
  }

  function sendReaction(emoji: string) {
    socket.emit("reaction", emoji);
  }

  return (
    <SessionContext.Provider
      value={{
        displayName,
        setDisplayName,
        role,
        roomCode,
        roomState,
        messages,
        lastReaction,
        peerConnected,
        sessionStarted,
        selectedFile,
        setSelectedFile,
        createRoom,
        joinRoom,
        selectMovie,
        startSession,
        endSession,
        sendChat,
        sendReaction,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
