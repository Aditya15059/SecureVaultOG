import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ── Get activity log for the current user ── */
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const [rows] = await db.query(
    'SELECT id, action, ip_address, device_info, status, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [req.user.id, limit]
  );
  res.json(rows);
});

export default router;
