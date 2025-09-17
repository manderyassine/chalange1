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

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
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
