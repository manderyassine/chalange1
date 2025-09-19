import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import noteRoutes from './routes/notes.js';
import weatherRoutes from './routes/weather.js';
import favoriteRoutes from './routes/favorites.js';

dotenv.config();

const app = express();

// Support multiple origins (comma separated) and proper credentials handling
const originsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = originsEnv.split(',').map(o => o.trim()).filter(Boolean);
const allowAll = allowedOrigins.includes('*');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (no origin) such as curl / server-to-server
    if (!origin) return callback(null, true);
    if (allowAll || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
};

// Optional CORS debug
if (process.env.DEBUG_CORS === 'true') {
  app.use((req, _res, next) => {
    const origin = req.headers.origin;
    const isAllowed = allowAll || allowedOrigins.includes(origin);
    if (req.method === 'OPTIONS' || req.path.startsWith('/api/')) {
      console.log(`[CORS] origin=${origin} allowed=${isAllowed} method=${req.method} path=${req.path}`);
    }
    next();
  });
}

app.use(cors(corsOptions));
// Explicitly handle preflight
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve meta.json file from the root directory
app.get('/meta.json', (req, res) => {
  res.sendFile('meta.json', { root: process.cwd() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoriteRoutes);

export default app;
