import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ── Get threat log for the current user ── */
router.get('/', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, threat_type, risk_score, blocked, ip_address, created_at FROM threat_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
    [req.user.id]
  );
  res.json(rows);
});

/* ── Admin: get all threats ── */
router.get('/all', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const [rows] = await db.query(
    'SELECT t.*, u.email FROM threat_logs t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 200'
  );
  res.json(rows);
});

export default router;
