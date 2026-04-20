import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ─── MongoDB connection ───────────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Serve React build ────────────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// For any non-API route, return the React app (supports HashRouter)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SecureVault server running on port ${PORT}`);
});
