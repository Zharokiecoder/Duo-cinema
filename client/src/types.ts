export type Role = "host" | "guest";

export interface RoomState {
  roomName: string;
  hasHost: boolean;
  hasGuest: boolean;
  movie: { title: string; source: "local" } | null;
}

export interface ChatMessage {
  from: string;
  text: string;
  at: number;
}

export interface Reaction {
  from: string;
  emoji: string;
}
