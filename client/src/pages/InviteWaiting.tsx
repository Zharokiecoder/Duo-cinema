import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";

export default function InviteWaiting() {
  const nav = useNavigate();
  const { roomCode, peerConnected } = useSession();

  useEffect(() => {
    if (peerConnected) nav("/movies");
  }, [peerConnected]);

  const link = `${window.location.origin}/join?code=${roomCode}`;

  function copyLink() {
    navigator.clipboard?.writeText(link);
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: "Duo Cinema", text: "Join my movie room!", url: link });
    } else {
      copyLink();
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <div className="logo">
          <span className="duo">Duo</span> Cinema
        </div>
      </div>

      <p style={{ textAlign: "center" }}>Your room is ready!</p>
      <div className="card">
        <div className="room-code">{roomCode}</div>
        <p className="center-note">Share this code with your partner</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={copyLink}>
            🔗 Copy Link
          </button>
          <button className="btn btn-secondary" onClick={share}>
            ↗ Share
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 60, margin: "20px 0" }}>📱💗📱</div>

      <p style={{ textAlign: "center", fontWeight: 700 }}>Waiting for your partner…</p>
      <p className="center-note">They'll join soon. You can also share the code or link with them.</p>

      <div className="card">
        <div>🟢 Room created ✔</div>
        <div className="status-dim">◌ Waiting for partner…</div>
        <div className="status-dim">◌ Connection will start automatically</div>
      </div>
    </div>
  );
}
