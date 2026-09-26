import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";
import { useWebRTC } from "../hooks/useWebRTC";
import ChatPanel from "../components/ChatPanel";

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function CinemaRoom() {
  const nav = useNavigate();
  const { role, roomCode, roomState, peerConnected, selectedFile, endSession } = useSession();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [hostVideoReady, setHostVideoReady] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const isHost = role === "host";
  const readyToStart = isHost ? hostVideoReady : peerConnected;
  useWebRTC(role, roomCode, readyToStart, localVideoRef, remoteVideoRef, () => setNeedsTapToPlay(true));

  // Host: load chosen local file into its own <video> element.
  useEffect(() => {
    if (role === "host" && selectedFile && localVideoRef.current) {
      const url = URL.createObjectURL(selectedFile);
      const v = localVideoRef.current;
      v.src = url;
      const onLoaded = () => setHostVideoReady(true);
      v.addEventListener("loadedmetadata", onLoaded);
      return () => {
        v.removeEventListener("loadedmetadata", onLoaded);
        URL.revokeObjectURL(url);
      };
    }
  }, [role, selectedFile]);

  function tapToPlay() {
    remoteVideoRef.current?.play();
    setNeedsTapToPlay(false);
  }

  const togglePlay = useCallback(() => {
    const v = localVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    const v = localVideoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
  }, []);

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const newTime = parseFloat(e.target.value);
    const v = localVideoRef.current;
    if (!v) return;
    v.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function handleEnd() {
    endSession();
    nav("/finished");
  }

  const toggleFullscreen = useCallback(() => {
    const el = playerWrapRef.current as any;
    if (!el) return;
    const doc = document as any;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    if (!isFs) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    function onFsChange() {
      const doc = document as any;
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isFs);
      setControlsVisible(true);
    }

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  // Keyboard shortcuts (F for fullscreen, Space for play/pause, Arrows for seek)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in chat input
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === " " && isHost) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" && isHost) {
        e.preventDefault();
        skip(-10);
      } else if (e.key === "ArrowRight" && isHost) {
        e.preventDefault();
        skip(10);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen, togglePlay, skip, isHost]);

  // Handle overlay auto-hide in fullscreen or on hover
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isFullscreen) {
        setControlsVisible(false);
      }
    }, 2800);
  };

  const videoRef = isHost ? localVideoRef : remoteVideoRef;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => nav(-1)}>
          ←
        </button>
        <div>
          <div style={{ fontWeight: 700 }}>{roomState?.movie?.title || "Movie Night"}</div>
          <div className="status-dim">with {peerConnected ? "partner" : "…"}</div>
        </div>
      </div>

      <div
        className={`player-wrap ${isFullscreen ? "is-fullscreen" : ""}`}
        ref={playerWrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isFullscreen && setControlsVisible(false)}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost}
          onTimeUpdate={(e) => isHost && setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => isHost && setDuration(e.currentTarget.duration)}
          onDoubleClick={toggleFullscreen}
          onClick={isHost ? togglePlay : undefined}
        />

        {!isHost && needsTapToPlay && (
          <button onClick={tapToPlay} className="tap-to-play-overlay">
            ▶ Tap to Start Watching
          </button>
        )}

        {/* Fullscreen top header overlay */}
        {isFullscreen && (
          <div className={`fs-top-bar ${controlsVisible ? "visible" : ""}`}>
            <div className="fs-title-wrap">
              <span className="fs-movie-title">{roomState?.movie?.title || "Movie Night"}</span>
              <span className="fs-status-pill">{peerConnected ? "● Partner Connected" : "○ Waiting for partner..."}</span>
            </div>
            <button className="fs-exit-btn" onClick={toggleFullscreen} title="Exit fullscreen (Esc or F)">
              ✕ Exit Fullscreen
            </button>
          </div>
        )}

        {/* Floating controls in fullscreen */}
        {isFullscreen && (
          <div className={`fs-controls-overlay ${controlsVisible ? "visible" : ""}`}>
            {isHost && duration > 0 && (
              <div className="fs-progress-wrap">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="fs-scrubber"
                  aria-label="Seek video"
                />
              </div>
            )}
            <div className="fs-bottom-row">
              <div className="fs-bottom-left">
                {isHost && (
                  <>
                    <button className="fs-ctrl-btn" onClick={() => skip(-10)} title="Rewind 10s">
                      ⏪ 10s
                    </button>
                    <button className="fs-ctrl-btn fs-ctrl-main" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
                      {playing ? "⏸" : "▶"}
                    </button>
                    <button className="fs-ctrl-btn" onClick={() => skip(10)} title="Fast forward 10s">
                      10s ⏩
                    </button>
                  </>
                )}
                {isHost ? (
                  <span className="fs-time-text">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                ) : (
                  <span className="fs-time-text">🎬 Watching Live Stream</span>
                )}
              </div>

              <div className="fs-bottom-right">
                <button
                  className="fullscreen-btn"
                  onClick={toggleFullscreen}
                  aria-label="Exit fullscreen"
                  title="Exit fullscreen (F)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular in-page fullscreen toggle button (when not in fullscreen) */}
        {!isFullscreen && (
          <button
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label="Enter fullscreen"
            title="Fullscreen (F)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>
        )}
      </div>

      {isHost ? (
        <>
          <div className="player-controls">
            <button className="control-btn" onClick={() => skip(-10)} title="Rewind 10s">
              ⏪10
            </button>
            <button className="control-btn main" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="control-btn" onClick={() => skip(10)} title="Forward 10s">
              10⏩
            </button>
          </div>
          <p className="center-note">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </>
      ) : (
        <p className="center-note">Watching live from your host's device 🎬</p>
      )}

      <button className="btn btn-secondary" onClick={() => setShowChat((s) => !s)}>
        {showChat ? "Hide Chat" : "💬 Show Chat"}
      </button>

      {showChat && (
        <div className="card" style={{ marginTop: 12 }}>
          <ChatPanel />
        </div>
      )}

      <div style={{ height: 16 }} />
      <button className="btn btn-secondary" onClick={handleEnd}>
        End Session
      </button>
    </div>
  );
}
