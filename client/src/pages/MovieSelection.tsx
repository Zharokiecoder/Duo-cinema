import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";

export default function MovieSelection() {
  const nav = useNavigate();
  const { role, selectMovie, startSession, setSelectedFile, selectedFile, sessionStarted } = useSession();

  useEffect(() => {
    if (role !== "host" && sessionStarted) nav("/room");
  }, [role, sessionStarted]);
  const [tab, setTab] = useState<"phone" | "moviebox" | "search">("phone");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    selectMovie(file.name.replace(/\.[^/.]+$/, ""));
  }

  function handleStart() {
    startSession();
    nav("/room");
  }

  if (role !== "host") {
    return (
      <div className="screen">
        <p className="center-note">Waiting for the host to choose a movie…</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => nav(-1)}>
          ←
        </button>
        <h1>Choose Your Movie</h1>
      </div>

      <div className="tab-row">
        <div className={`tab ${tab === "phone" ? "active" : ""}`} onClick={() => setTab("phone")}>
          📱 My Phone
        </div>
        <div className={`tab ${tab === "moviebox" ? "active" : ""}`} onClick={() => setTab("moviebox")}>
          MovieBox
        </div>
        <div className={`tab ${tab === "search" ? "active" : ""}`} onClick={() => setTab("search")}>
          🔍 Search
        </div>
      </div>

      {tab === "phone" && (
        <div className="card">
          <p>Pick a video file already on your phone.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={handleFileChosen}
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            {selectedFile ? `✔ ${selectedFile.name}` : "Choose a video file"}
          </button>
          <p className="center-note" style={{ textAlign: "left" }}>
            The file stays on your device the whole time — it's never uploaded anywhere. Your partner
            sees a live stream of what's playing on your screen.
          </p>
        </div>
      )}

      {tab === "moviebox" && (
        <div className="card">
          <p className="status-dim">MovieBox integration — coming soon.</p>
          <p className="center-note" style={{ textAlign: "left" }}>
            External sources will only use playback methods the provider officially supports.
          </p>
        </div>
      )}

      {tab === "search" && (
        <div className="card">
          <input placeholder="Search your movies…" disabled />
          <p className="center-note" style={{ textAlign: "left" }}>
            Search across sources — coming soon.
          </p>
        </div>
      )}

      <div style={{ height: 20 }} />
      <button className="btn btn-primary" disabled={!selectedFile} onClick={handleStart}>
        Start Movie Night
      </button>
    </div>
  );
}
