import { useEffect, useRef } from "react";
import { socket } from "./socket";
import type { Role } from "../types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

/**
 * Core streaming mechanism for Duo Cinema.
 *
 * Instead of transferring the movie file itself, the HOST captures the live
 * output of its own <video> element (HTMLVideoElement.captureStream()) and
 * sends that as a normal WebRTC media stream — the same way a video call
 * would send a camera feed. The GUEST just receives it and displays it.
 *
 * Two things this hook has to get right, both learned the hard way:
 *  1. Tracks must be added to the RTCPeerConnection BEFORE the offer is
 *     created — if the host's video hasn't loaded yet when this hook first
 *     runs, the offer goes out with no video track and the guest never gets
 *     a picture (no automatic renegotiation is wired up). The caller is
 *     responsible for delaying `readyToStart` until the host's <video> has
 *     fired `loadedmetadata`.
 *  2. Browsers refuse to autoplay video WITH sound unless the user already
 *     interacted with the page. The guest's incoming stream has audio, so
 *     the first `play()` call can be silently rejected, leaving the video
 *     stuck on a black frame. `onRemoteNeedsTap` lets the UI show a manual
 *     "tap to start" button in that case (which itself counts as the user
 *     gesture needed to unlock playback).
 */
export function useWebRTC(
  role: Role | null,
  roomCode: string | null,
  readyToStart: boolean,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>,
  onRemoteNeedsTap?: () => void
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!role || !roomCode || !readyToStart) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-signal", { type: "ice-candidate", candidate: event.candidate });
      }
    };

    if (role === "host") {
      const videoEl = localVideoRef.current as (HTMLVideoElement & { captureStream?: () => MediaStream }) | null;

      if (videoEl?.captureStream) {
        const stream = videoEl.captureStream();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      // Tracks are added above, so this offer will correctly include them.
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("webrtc-signal", { type: "offer", sdp: pc.localDescription });
        });

      return () => {
        pc.close();
        pcRef.current = null;
      };
    }

    if (role === "guest") {
      pc.ontrack = (event) => {
        const el = remoteVideoRef.current;
        if (!el) return;
        el.srcObject = event.streams[0];
        el.play().catch(() => {
          // Autoplay-with-sound was blocked — surface a manual play control.
          onRemoteNeedsTap?.();
        });
      };

      return () => {
        pc.close();
        pcRef.current = null;
      };
    }
  }, [role, roomCode, readyToStart]);

  useEffect(() => {
    const onSignal = async (payload: any) => {
      const pc = pcRef.current;
      if (!pc) return;

      if (payload.type === "offer" && role === "guest") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-signal", { type: "answer", sdp: pc.localDescription });
      } else if (payload.type === "answer" && role === "host") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } else if (payload.type === "ice-candidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // Ignore late/duplicate candidates.
        }
      }
    };

    socket.on("webrtc-signal", onSignal);
    return () => {
      socket.off("webrtc-signal", onSignal);
    };
  }, [role]);
}
