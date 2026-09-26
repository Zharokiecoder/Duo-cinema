import BottomNav from "../components/BottomNav";
import { useSession } from "../hooks/SessionContext";

const HISTORY = [
  { title: "The Dark Knight", with: "Nimah", when: "2 days ago", rating: 4.5 },
  { title: "Spider-Man: No Way Home", with: "Nimah", when: "5 days ago", rating: 5.0 },
  { title: "Love & Basketball", with: "Nimah", when: "1 week ago", rating: 4.0 },
  { title: "Interstellar", with: "Nimah", when: "2 weeks ago", rating: 4.5 },
];

export default function Profile() {
  const { displayName } = useSession();

  return (
    <div className="screen">
      <div className="topbar">
        <div className="thumb" style={{ borderRadius: "50%" }}>
          👤
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{displayName}</div>
          <div className="status-dim">Always better with you ❤️</div>
        </div>
      </div>

      <div className="tab-row">
        <div className="tab active">Movie History</div>
        <div className="tab">Settings</div>
      </div>

      <div className="card">
        {HISTORY.map((h) => (
          <div className="movie-row" key={h.title}>
            <div className="thumb">🎬</div>
            <div style={{ flex: 1 }}>
              <div>{h.title}</div>
              <div className="status-dim">with {h.with}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="status-dim">{h.when}</div>
              <div>{h.rating.toFixed(1)} ★</div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
