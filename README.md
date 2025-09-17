# MERN Multi-App: Tasks, Notes, Weather

This repository contains a MERN stack application with three features under one auth domain:

- Task Manager: add, edit, delete, mark complete
- Notes App: markdown notes with search and tags
- Weather Dashboard: search city weather (OpenWeather) + save favorite cities per user

Tech: MongoDB, Express, React (Vite), Node.js. JWT for authentication.

## Quick Start (Windows PowerShell)

1. Create environment files from examples and fill values:
   - `server/.env` from `server/.env.example`
   - `client/.env` from `client/.env.example`

2. Install dependencies in both apps:

```powershell
npm --version > $null 2>&1; if (!$?) { Write-Error "Node.js & npm required" }

npm install --prefix server; npm install --prefix client
```

3. Run both apps (two terminals):

```powershell
# Terminal 1
npm run dev --prefix server

# Terminal 2
npm run dev --prefix client
```

Server runs on http://localhost:4000, client on http://localhost:5173 by default.

## Hosting guide

This project now uses Appwrite for authentication and Tasks data from the client. You can choose to:

- Host only the React client (recommended), and keep Weather/Notes/Favorites either migrated to Appwrite or temporarily proxied to the existing Express API.
- Or host both the client and the Express server.

### 1) Host the React client

Option A — Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite
- Environment variables (Project Settings → Environment Variables):
   - `VITE_APPWRITE_ENDPOINT` = your Appwrite endpoint (e.g. https://cloud.appwrite.io/v1)
   - `VITE_APPWRITE_PROJECT_ID`, `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_COLLECTION_TASKS_ID`
   - Remove `VITE_API_BASE` unless you still call the Express server for weather/notes/favorites; if you do, point it to your hosted API base.
- SPA routing: Vercel handles this automatically for Vite when using the framework preset.

Option B — Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add the same `VITE_*` environment variables.
- SPA routing: we added `client/public/_redirects` with `/* /index.html 200`.

Local check before deploy:
- From `client/`, run `npm run build` and ensure `dist/` is created.

### 2) Host the Express server (optional)

If you still use the server for weather/notes/favorites:

Option A — Render
- Create a new Web Service from the `server/` folder.
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
   - `PORT` = 4000 (Render will set its own; ensure your app reads `process.env.PORT`)
   - `MONGO_URI` = your MongoDB connection string (e.g. MongoDB Atlas)
   - `JWT_SECRET` = a strong secret if you still use JWT based routes
   - `OPENWEATHER_API_KEY` = for `/api/weather`
   - `CORS_ORIGIN` = the URL of your client (e.g. https://your-app.vercel.app)

Option B — Railway/Fly.io/Heroku (similar)
- Ensure `server/src/index.js` uses `process.env.PORT` (it does).
- Set the same environment variables.

### 3) Appwrite setup

In your Appwrite project:
- Enable Email/Password authentication.
- Create a Database and a `tasks` collection with attributes:
   - `title` (string), `completed` (boolean), `userId` (string)
- Give collection Create permission to Role:users.
- The client code creates per-document permissions for the current user.
- Set the `VITE_APPWRITE_*` variables in your client host provider to match.

Optional next steps:
- Migrate Notes and Favorites to Appwrite and remove the Express server entirely.
- Or keep Weather on the server or implement an Appwrite Function to proxy OpenWeather.

### 4) Connect client to server (if kept)

If you keep the server, set `VITE_API_BASE` in the client host to your server’s URL, e.g. `https://your-api.onrender.com/api`. The client’s Weather/Notes/Favorites pages still call those endpoints until migrated.

## Environment

server/.env
- MONGO_URI=mongodb://localhost:27017/mern_multi
- JWT_SECRET=change_me
- PORT=4000
- OPENWEATHER_API_KEY=your_api_key
- CORS_ORIGIN=http://localhost:5173

client/.env
- VITE_API_BASE=http://localhost:4000/api

## Scripts

- server: `npm run dev` (nodemon), `npm test` (placeholder)
- client: `npm run dev`, `npm run build`, `npm run preview`

## Notes
- Use a local MongoDB instance or Atlas connection string.
- Get a free OpenWeather API key at openweathermap.org and set OPENWEATHER_API_KEY.