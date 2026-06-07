# SmartMeet Backend

Node.js, Express.js, MongoDB, Mongoose, and JWT backend for SmartMeet.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Update `MONGO_URI` and `JWT_SECRET` in `.env`.

4. Start the development server:

```bash
npm run dev
```

## API Routes

- `POST /api/auth/signup` creates a user and returns a JWT.
- `POST /api/auth/login` logs in a user and returns a JWT.
- `GET /api/auth/me` returns the authenticated user profile when a valid bearer token is provided.
