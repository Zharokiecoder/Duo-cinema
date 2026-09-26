import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface RecentMovie {
  title: string;
  withUser: string;
  when: string;
  poster: string;
}

const RECENT_MOVIES: RecentMovie[] = [
  {
    title: "The Dark Knight",
    withUser: "with Nimah",
    when: "2 days ago",
    poster: "/assets/poster_dark_knight.jpg",
  },
  {
    title: "Spider-Man",
    withUser: "with Nimah",
    when: "5 days ago",
    poster: "/assets/poster_spiderman.jpg",
  },
  {
    title: "Love & Hip Hop",
    withUser: "with Nimah",
    when: "1 week ago",
    poster: "/assets/poster_love_hiphop.jpg",
  },
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="home-screen">
      {/* Ambient background with smooth downward fade */}
      <div className="home-hero-bg" aria-hidden="true" />

      {/* Top Status Bar (iOS style) */}
      <div className="status-bar" aria-hidden="true">
        <span className="status-time">9:41</span>
        <div className="status-icons">
          {/* Cellular Signal (4 bars) */}
          <svg className="status-icon" viewBox="0 0 18 12" fill="currentColor">
            <rect x="0" y="8.5" width="2.5" height="3.5" rx="0.8" />
            <rect x="4.5" y="6" width="2.5" height="6" rx="0.8" />
            <rect x="9" y="3.5" width="2.5" height="8.5" rx="0.8" />
            <rect x="13.5" y="0.5" width="2.5" height="11.5" rx="0.8" />
          </svg>
          {/* Wi-Fi Icon */}
          <svg className="status-icon" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-3.24a6 6 0 0 1 8.48 0 .8.8 0 0 1-1.13 1.13 4.4 4.4 0 0 0-6.22 0 .8.8 0 0 1-1.13-1.13zm-2.83-2.83a10 10 0 0 1 14.14 0 .8.8 0 1 1-1.13 1.13 8.4 8.4 0 0 0-11.88 0 .8.8 0 1 1-1.13-1.13z" />
          </svg>
          {/* Battery Icon */}
          <div className="battery-icon">
            <div className="battery-level" />
          </div>
        </div>
      </div>

      <div className="home-content">
        {/* Brand Header */}
        <header className="home-header">
          {/* Glowing Camera / Filmstrip with Heart */}
          <div className="brand-emblem-wrap">
            <svg
              className="brand-emblem"
              viewBox="0 0 72 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4da0" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Outer camera body */}
              <rect
                x="8"
                y="10"
                width="56"
                height="40"
                rx="10"
                fill="url(#brandGrad)"
                filter="url(#glow)"
              />
              {/* Top flash / lens accent */}
              <rect x="26" y="4" width="20" height="8" rx="4" fill="url(#brandGrad)" />
              {/* Left sprocket dots */}
              <rect x="12" y="16" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              <rect x="12" y="27" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              <rect x="12" y="38" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              {/* Right sprocket dots */}
              <rect x="55.5" y="16" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              <rect x="55.5" y="27" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              <rect x="55.5" y="38" width="4.5" height="5" rx="1.5" fill="#0c0e1a" />
              {/* Center Heart cutout */}
              <path
                d="M36 41s-11-7.2-11-13.5c0-3.5 2.8-5.5 5.5-5.5 2.5 0 4.5 1.8 5.5 3.3 1-1.5 3-3.3 5.5-3.3 2.7 0 5.5 2 5.5 5.5C47 33.8 36 41 36 41z"
                fill="#0c0e1a"
              />
            </svg>
          </div>

          <h1 className="brand-title">
            <span className="brand-duo">Duo</span> <span className="brand-cinema">Cinema</span>
          </h1>

          <p className="brand-tagline">
            Same movie. Same moment.
            <br />
            No matter the distance. <span className="tagline-heart">❤️</span>
          </p>
        </header>

        {/* Primary CTA Buttons */}
        <section className="home-actions" aria-label="Room Actions">
          <button className="action-btn action-create" onClick={() => nav("/create")}>
            <div className="action-icon-wrap play-icon-wrap">
              <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4.5V19.5L19 12L7 4.5Z" />
              </svg>
            </div>
            <div className="action-text">
              <div className="action-title">Create Cinema</div>
              <div className="action-subtitle">Start a new movie night</div>
            </div>
          </button>

          <button className="action-btn action-join" onClick={() => nav("/join")}>
            <div className="action-icon-wrap link-icon-wrap">
              <svg
                className="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div className="action-text">
              <div className="action-title">Join Cinema</div>
              <div className="action-subtitle">Enter a room code or link</div>
            </div>
          </button>
        </section>

        {/* Recent Movie Nights Section */}
        <section className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Movie Nights</h2>
            <button className="see-all-btn" onClick={() => nav("/profile?tab=history")}>
              See all
            </button>
          </div>

          <div className="recent-cards-row">
            {RECENT_MOVIES.map((movie) => (
              <div className="recent-card" key={movie.title}>
                <div className="card-poster-wrap">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="card-poster-img"
                    loading="lazy"
                  />
                </div>
                <div className="card-info">
                  <div className="card-title" title={movie.title}>
                    {movie.title}
                  </div>
                  <div className="card-with">{movie.withUser}</div>
                  <div className="card-when">{movie.when}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
