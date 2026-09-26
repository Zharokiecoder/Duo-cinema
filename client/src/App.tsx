import { HashRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./hooks/SessionContext";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import InviteWaiting from "./pages/InviteWaiting";
import MovieSelection from "./pages/MovieSelection";
import CinemaRoom from "./pages/CinemaRoom";
import MovieFinished from "./pages/MovieFinished";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/invite" element={<InviteWaiting />} />
            <Route path="/movies" element={<MovieSelection />} />
            <Route path="/room" element={<CinemaRoom />} />
            <Route path="/finished" element={<MovieFinished />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </HashRouter>
    </SessionProvider>
  );
}
