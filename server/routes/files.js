import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteFromS3, uploadToS3 } from '../s3.js';

const router = express.Router();
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB) > 0 ? Number(process.env.MAX_UPLOAD_MB) : 10;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

router.use(authMiddleware);

/* ── List files for the current user ── */
router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, file_name, file_size, mime_type, file_path AS file_url, encrypted_key, created_at
     FROM files
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  const files = rows.map((row) => {
    let encryption = null;
    if (row.encrypted_key) {
      try {
        encryption = JSON.parse(row.encrypted_key);
      } catch {
        encryption = null;
      }
    }

    return {
      id: row.id,
      file_name: row.file_name,
      file_size: row.file_size,
      mime_type: row.mime_type,
      file_url: row.file_url,
      created_at: row.created_at,
      is_encrypted: Boolean(encryption?.encrypted),
    };
  });

  res.json(files);
});

/* ── Register a new file (metadata after external upload) ── */
router.post('/', async (req, res) => {
  const { file_name, file_path, encrypted_key, file_size, mime_type } = req.body;
  const [result] = await db.query(
    'INSERT INTO files (user_id, file_name, file_path, encrypted_key, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, file_name, file_path, encrypted_key || null, file_size, mime_type]
  );
  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, device_info, status) VALUES (?, 'file_upload', ?, ?, 'success')",
    [req.user.id, req.ip, req.headers['user-agent']]
  );
  res.status(201).json({ message: 'File registered', fileId: result.insertId });
});

/* ── Upload directly to S3 and store metadata in RDS ── */
const uploadSingleFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File exceeds ${maxUploadMb}MB upload limit` });
    }
    if (error) return next(error);
    return next();
  });
};

const uploadFileHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { fileUrl, encryptedMetadata } = await uploadToS3(req.file, req.user.id);
    const [result] = await db.query(
      'INSERT INTO files (user_id, file_name, file_path, encrypted_key, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.file.originalname,
        fileUrl,
        encryptedMetadata ? JSON.stringify(encryptedMetadata) : null,
        req.file.size,
        req.file.mimetype || 'application/octet-stream',
      ]
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, ip_address, device_info, status) VALUES (?, 'file_upload', ?, ?, 'success')",
      [req.user.id, req.ip, req.headers['user-agent']]
    );

    return res.status(201).json({
      id: result.insertId,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype || 'application/octet-stream',
      file_url: fileUrl,
      is_encrypted: Boolean(encryptedMetadata),
      created_at: new Date().toISOString(),
      message: 'File uploaded successfully',
    });
  } catch (error) {
    return next(error);
  }
};

router.post('/upload', uploadSingleFile, uploadFileHandler);

/* ── Delete a file ── */
router.delete('/:fileId', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, file_path FROM files WHERE id = ? AND user_id = ?',
    [req.params.fileId, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'File not found' });

  await db.query('DELETE FROM files WHERE id = ?', [req.params.fileId]);

  try {
    await deleteFromS3(rows[0].file_path);
  } catch (error) {
    console.warn('[SecureVault] Unable to remove object from S3:', error?.message || error);
  }

  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, status) VALUES (?, 'file_delete', ?, 'success')",
    [req.user.id, req.ip]
  );
  res.json({ message: 'File deleted' });
});

export default router;
export { uploadSingleFile, uploadFileHandler };
