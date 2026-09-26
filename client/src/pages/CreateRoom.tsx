import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";

export default function CreateRoom() {
  const nav = useNavigate();
  const { displayName, setDisplayName, createRoom } = useSession();
  const [roomName, setRoomName] = useState("");
  const [requestedCode, setRequestedCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setBusy(true);
    setError("");
    const res = await createRoom(roomName || "Movie Night", requestedCode);
    setBusy(false);
    if (res.ok) {
      nav("/invite");
    } else {
      setError(res.error || "Could not create room.");
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => nav(-1)}>
          ←
        </button>
        <h1>Create Cinema</h1>
      </div>

      <label className="field-label">Your Profile</label>
      <div className="card">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <label className="field-label">Room Name</label>
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="e.g. Lukman & Nimah"
      />

      <label className="field-label">Room Code (optional)</label>
      <input
        value={requestedCode}
        onChange={(e) => setRequestedCode(e.target.value)}
        placeholder="e.g. LKM-4821"
      />
      <p className="center-note" style={{ textAlign: "left" }}>
        Leave empty for auto-generate
      </p>

      {error && <p style={{ color: "var(--pink)" }}>{error}</p>}

      <div style={{ height: 20 }} />
      <button className="btn btn-primary" disabled={busy} onClick={handleCreate}>
        {busy ? "Creating…" : "Create Room"}
      </button>

      <p className="center-note">🔒 Your room will be private — only people with the code or link can join.</p>
    </div>
  );
}
