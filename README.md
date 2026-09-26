# Duo Cinema — V1

Private two-person movie-night app. Only the host needs the movie file — the
host's device plays it and streams the live screen output to the guest over
WebRTC (`HTMLVideoElement.captureStream()`), so nothing is ever uploaded to a
server.

## What's built (V1)

- Room create / join with a shareable code
- Host picks a local video file from their phone/computer
- Live host → guest video streaming via WebRTC (no file transfer, no codec-matching issues)
- Play / pause / seek controls on the host (guest just watches the live feed)
- In-room chat + quick reactions
- Session end + rating screen
- Profile / history screen (mock data for now — hook up real persistence later)

**Not built yet (by design — matches the V1 scope in the project doc):**
- MovieBox / external source integration (UI stub only, marked "coming soon")
- Real chat/watch history persistence (currently mock data on the Profile screen)
- TURN server for restrictive mobile networks (see note in `useWebRTC.ts`)

## Running it locally

You need two terminals.

**1. Start the signaling server**
```
cd server
npm install
npm start
```
Runs on `http://localhost:4001`.

**2. Start the client**
```
cd client
npm install
npm run dev
```
Runs on `http://localhost:5174`.

To test host + guest on two separate phones on the same Wi-Fi network, set
`VITE_SERVER_URL` in `client/.env` to your computer's LAN IP (not
`localhost`), e.g. `VITE_SERVER_URL=http://192.168.1.20:4001`, and open the
Vite dev URL from both phones' browsers.

## Project structure

```
duo-cinema/
  server/           Node + Socket.IO signaling server (rooms, chat, WebRTC relay)
  client/            Vite + React + TypeScript frontend
    src/
      pages/          One file per screen (Home, CreateRoom, CinemaRoom, etc.)
      components/     Shared UI (BottomNav, ChatPanel)
      hooks/          SessionContext (room/chat state) + useWebRTC (the streaming core)
```

## The one piece to test first

Everything except the actual video streaming is standard React + Socket.IO.
The part worth validating on real phones early is `useWebRTC.ts` — specifically
whether `captureStream()` behaves reliably on the phones you and your partner
actually use, especially on iOS Safari, before building further on top of it.

## Next steps

- Add a TURN server (e.g. via a provider like Twilio or a self-hosted coturn)
  for reliable connections over mobile data
- Persist room/chat/rating history somewhere (a small database) instead of
  mock data
- Wire up MovieBox as a real second source once you've confirmed what its
  API/embedding permits
