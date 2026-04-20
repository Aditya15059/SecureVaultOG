import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRouter     from './routes/auth.js';
import sessionsRouter from './routes/sessions.js';
import filesRouter    from './routes/files.js';
import activityRouter from './routes/activity.js';
import threatsRouter  from './routes/threats.js';
import agentRouter    from './routes/agent.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── Routes ──
app.use('/api/auth',     authLimiter, authRouter);
app.use('/api/sessions', apiLimiter,  sessionsRouter);
app.use('/api/files',    apiLimiter,  filesRouter);
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
