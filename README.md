# SmartMeet

SmartMeet is an AI-powered video conferencing hackathon MVP with secure meetings, authenticated users, real-time chat, WebRTC signaling, focus analytics, and abuse detection.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Context API, Socket.io client, MediaPipe Face Mesh.
- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, Socket.io.
- Real-time: Socket.io for chat, participants, host controls, and WebRTC signaling.

## Completed Features

- Signup, login, logout, protected routes, and persistent JWT login.
- User profiles with usernames for private invitations.
- Meeting creation, scheduling, listing, details, and host-owned rooms.
- Username-based invitations with pending invitation notifications.
- Real-time chat with persisted message history.
- Toxic chat filtering, warning events, and violation logs.
- Browser speech-to-text captions and voice toxicity warnings.
- WebRTC signaling, peer connection setup, audio/video controls, and screen sharing.
- Participant list, host mute/unmute/remove controls, and multi-user room shell.
- MediaPipe Face Mesh focus detection with attention score reporting.
- Host analytics for engagement, focus, distracted users, and violations.

## Project Structure

```text
smartmeet/
  smartmeet-frontend/   React/Vite frontend
  smartmeet-backend/    Express/MongoDB/Socket.io backend
```

## Environment Variables

Create `smartmeet-backend/.env`:

```bash
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `smartmeet-frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Local Development

Install dependencies:

```bash
cd smartmeet-backend
npm install

cd ../smartmeet-frontend
npm install
```

Run backend:

```bash
cd smartmeet-backend
npm run dev
```

Run frontend:

```bash
cd smartmeet-frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Verification Commands

```bash
cd smartmeet-frontend
npm run build
npm run lint

cd ../smartmeet-backend
node --check src/server.js
```

## Known Limitations

- Production deployment still needs final environment setup and hosting configuration.
- WebRTC uses public STUN servers only; production reliability should add TURN.
- Toxicity detection currently uses simple pattern matching for hackathon speed.
- Speech-to-text uses browser Web Speech API support, which varies by browser.
- MongoDB must be reachable through `MONGO_URI` for backend runtime verification.
