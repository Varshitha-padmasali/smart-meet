# SmartMeet Deployment

This guide targets a hackathon-friendly production deployment:

- Frontend on Vercel.
- Backend on Render.
- Database on MongoDB Atlas.

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow network access from your backend host.
4. Copy the connection string into `MONGO_URI`.

## Backend on Render

Create a Web Service with:

```text
Root Directory: smartmeet-backend
Build Command: npm install
Start Command: npm start
```

Environment variables:

```bash
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-smartmeet-frontend.vercel.app
```

## Frontend on Vercel

Create a Vercel project with:

```text
Root Directory: smartmeet-frontend
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```bash
VITE_API_BASE_URL=https://your-smartmeet-backend.onrender.com/api
VITE_SOCKET_URL=https://your-smartmeet-backend.onrender.com
```

## Production Notes

- Use HTTPS URLs for both frontend and backend.
- Add TURN servers for reliable WebRTC connectivity beyond simple demos.
- Keep `JWT_SECRET` private and rotate it if exposed.
- Confirm Render CORS `CLIENT_URL` matches the deployed Vercel domain exactly.
