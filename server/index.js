import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRouter     from './routes/auth.js';
import sessionsRouter from './routes/sessions.js';
import filesRouter, { uploadSingleFile, uploadFileHandler } from './routes/files.js';
import activityRouter from './routes/activity.js';
import threatsRouter  from './routes/threats.js';
import agentRouter    from './routes/agent.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('[SecureVault] WARNING: CORS_ORIGIN is not set in production. All cross-origin browser requests will be blocked. Set the CORS_ORIGIN environment variable to the comma-separated list of allowed frontend origins (e.g. https://secure-vault-og.vercel.app).');
}
const defaultCorsOrigins = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:5173';
const allowedOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl/Postman/server-to-server) that do not send Origin.
    // Browser requests must still match explicit allowlisted origins; auth uses bearer tokens, not cookies.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // Emit a clear log so misconfigured CORS_ORIGIN is visible in server logs.
    if (allowedOrigins.length === 0) {
      console.error('[SecureVault] CORS blocked: CORS_ORIGIN is not configured. Set it to the frontend origin.');
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ── Routes ──
app.get('/', (_req, res) => res.send('SecureVault API is running 🚀'));

app.use('/api/auth',     authLimiter, authRouter);
app.use('/api/sessions', apiLimiter,  sessionsRouter);
app.use('/api/files',    apiLimiter,  filesRouter);
app.post('/api/upload',  apiLimiter, authMiddleware, uploadSingleFile, uploadFileHandler);
app.use('/api/activity', apiLimiter,  activityRouter);
app.use('/api/threats',  apiLimiter,  threatsRouter);
app.use('/api/agent',    apiLimiter,  agentRouter);

// ── Health check ──
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error('[SecureVault Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`[SecureVault API] Listening on port ${PORT}`));
