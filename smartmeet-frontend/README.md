# SmartMeet Frontend

React/Vite frontend for SmartMeet.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Environment

Create `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Main Areas

- `src/pages`: route-level screens.
- `src/components`: reusable UI components.
- `src/hooks`: auth, WebRTC, focus detection, and speech-to-text hooks.
- `src/services`: Axios and Socket.io service wrappers.
 
