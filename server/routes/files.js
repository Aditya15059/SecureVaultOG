import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ── List files for the current user ── */
router.get('/', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, file_name, file_size, mime_type, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

/* ── Register a new file (metadata after S3 upload) ── */
router.post('/', async (req, res) => {
  const { file_name, file_path, encrypted_key, file_size, mime_type } = req.body;
  const [result] = await db.query(
    'INSERT INTO files (user_id, file_name, file_path, encrypted_key, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, file_name, file_path, encrypted_key, file_size, mime_type]
  );
  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, device_info, status) VALUES (?, 'file_upload', ?, ?, 'success')",
    [req.user.id, req.ip, req.headers['user-agent']]
  );
  res.status(201).json({ message: 'File registered', fileId: result.insertId });
});

/* ── Delete a file ── */
router.delete('/:fileId', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id FROM files WHERE id = ? AND user_id = ?',
    [req.params.fileId, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'File not found' });

  await db.query('DELETE FROM files WHERE id = ?', [req.params.fileId]);
  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, status) VALUES (?, 'file_delete', ?, 'success')",
    [req.user.id, req.ip]
  );
  res.json({ message: 'File deleted' });
});

export default router;
