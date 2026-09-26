import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();

  const isHome = loc.pathname === "/";
  const isHistory = loc.pathname === "/profile" && loc.search === "?tab=history";
  const isProfile = loc.pathname === "/profile" && loc.search !== "?tab=history";

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <button
        className={`nav-item ${isHome ? "active" : ""}`}
        onClick={() => nav("/")}
        aria-label="Home"
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill={isHome ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isHome ? "0" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10.25L12 3l9 7.25V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.75z" />
        </svg>
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${isHistory ? "active" : ""}`}
        onClick={() => nav("/profile?tab=history")}
        aria-label="History"
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
          <path d="M3.05 11a9 9 0 0 1 .5-2m-.5 2H6m-2.95 0L4.5 9" />
        </svg>
        <span>History</span>
      </button>

      <button
        className={`nav-item ${isProfile ? "active" : ""}`}
        onClick={() => nav("/profile")}
        aria-label="Profile"
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Profile</span>
      </button>
    </nav>
  );
}
