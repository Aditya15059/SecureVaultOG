import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ── List active sessions for the current user ── */
router.get('/', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, ip_address, device_info, created_at FROM sessions WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

/* ── Revoke a specific session ── */
router.delete('/:sessionId', async (req, res) => {
  await db.query(
    'UPDATE sessions SET is_active = FALSE WHERE id = ? AND user_id = ?',
    [req.params.sessionId, req.user.id]
  );
  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, status) VALUES (?, 'session_revoked', ?, 'success')",
    [req.user.id, req.ip]
  );
  res.json({ message: 'Session revoked' });
});

/* ── Revoke all other sessions (keep current) ── */
router.delete('/', async (req, res) => {
  const currentToken = req.headers.authorization?.slice(7);
  await db.query(
    'UPDATE sessions SET is_active = FALSE WHERE user_id = ? AND token != ?',
    [req.user.id, currentToken]
  );
  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, status) VALUES (?, 'all_sessions_revoked', ?, 'success')",
    [req.user.id, req.ip]
  );
  res.json({ message: 'All other sessions revoked' });
});

export default router;
