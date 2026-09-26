import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";

export default function JoinRoom() {
  const nav = useNavigate();
  const { displayName, setDisplayName, joinRoom } = useSession();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    setBusy(true);
    setError("");
    const res = await joinRoom(code);
    setBusy(false);
    if (res.ok) {
      nav("/movies");
    } else {
      setError(res.error || "Could not join room.");
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => nav(-1)}>
          ←
        </button>
        <h1>Join Cinema</h1>
      </div>

      <label className="field-label">Your Name</label>
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />

      <label className="field-label">Room Code</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="e.g. LKM-4821"
      />

      {error && <p style={{ color: "var(--pink)" }}>{error}</p>}

      <div style={{ height: 20 }} />
      <button className="btn btn-primary" disabled={busy || !code} onClick={handleJoin}>
        {busy ? "Joining…" : "Join Room"}
      </button>
    </div>
  );
}
