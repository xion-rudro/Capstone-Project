import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDirectory = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value with at least 32 characters.');
}

app.disable('x-powered-by');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'API route not found.' }));
app.use(errorHandler);

const port = Number(process.env.PORT || 8000);
await mkdir(uploadDirectory, { recursive: true });
await connectDB();
app.listen(port, () => console.log(`Learning Assistant backend listening on port ${port}`));
