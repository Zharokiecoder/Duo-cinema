import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/SessionContext";

export default function MovieFinished() {
  const nav = useNavigate();
  const { roomState } = useSession();
  const [rating, setRating] = useState(4.5);

  return (
    <div className="screen" style={{ textAlign: "center" }}>
      <h2 style={{ color: "var(--pink)" }}>Movie Night Complete! 🎉</h2>
      <p className="status-dim">Another movie watched together ❤️</p>

      <div className="card">
        <div className="thumb" style={{ margin: "0 auto", width: 120, height: 120, fontSize: 48 }}>
          🎬
        </div>
        <h3>{roomState?.movie?.title || "Your Movie"}</h3>
        <p>Your Rating</p>
        <div style={{ fontSize: 24 }}>
          {"★".repeat(Math.round(rating))}
          {"☆".repeat(5 - Math.round(rating))}
        </div>
        <p>{rating.toFixed(1)}/5</p>
      </div>

      <button className="btn btn-primary" onClick={() => nav("/movies")}>
        Watch Another Movie
      </button>
      <div style={{ height: 10 }} />
      <button className="btn btn-secondary" onClick={() => nav("/profile")}>
        View Session History
      </button>

      <p className="center-note" style={{ marginTop: 30, fontStyle: "italic" }}>
        Same screen. Different locations. Still us. 💕
      </p>
    </div>
  );
}
