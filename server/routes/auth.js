import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const SALT_ROUNDS = 12;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/* ── Register ── */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email.toLowerCase().trim(), hash]
    );
    res.status(201).json({ message: 'Account created', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    throw err;
  }
});

/* ── Login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const device = req.headers['user-agent'] || 'Unknown Device';

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!rows.length) {
    await db.query(
      "INSERT INTO activity_logs (action, ip_address, device_info, status) VALUES ('login_attempt', ?, ?, 'failed')",
      [ip, device]
    );
    return res.status(401).json({ error: 'No account found with that email' });
  }

  const user = rows[0];

  // Lockout check
  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    return res.status(403).json({
      error: 'Account temporarily locked',
      lock_until: user.lock_until,
    });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const newAttempts = user.login_attempts + 1;
    let lockUntil = null;
    if (newAttempts >= MAX_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
    }
    await db.query(
      'UPDATE users SET login_attempts = ?, lock_until = ? WHERE id = ?',
      [newAttempts, lockUntil, user.id]
    );
    await db.query(
      "INSERT INTO activity_logs (user_id, action, ip_address, device_info, status) VALUES (?, 'failed_login', ?, ?, 'failed')",
      [user.id, ip, device]
    );
    if (lockUntil) {
      await db.query(
        "INSERT INTO threat_logs (user_id, threat_type, risk_score, blocked, ip_address) VALUES (?, 'Brute Force Attempt', 90, TRUE, ?)",
        [user.id, ip]
      );
      return res.status(403).json({ error: 'Account locked after too many failed attempts', lock_until: lockUntil });
    }
    return res.status(401).json({ error: 'Invalid credentials', attempts_remaining: MAX_ATTEMPTS - newAttempts });
  }

  // Detect new IP
  if (user.last_login_ip && user.last_login_ip !== ip) {
    await db.query(
      "INSERT INTO threat_logs (user_id, threat_type, risk_score, ip_address) VALUES (?, 'New IP Login', 60, ?)",
      [user.id, ip]
    );
  }

  // Reset attempts, update last login
  await db.query(
    'UPDATE users SET login_attempts = 0, lock_until = NULL, last_login_ip = ?, last_login_device = ? WHERE id = ?',
    [ip, device, user.id]
  );

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

  // Store session
  const [sessionResult] = await db.query(
    'INSERT INTO sessions (user_id, token, ip_address, device_info) VALUES (?, ?, ?, ?)',
    [user.id, token, ip, device]
  );

  await db.query(
    "INSERT INTO activity_logs (user_id, action, ip_address, device_info, status) VALUES (?, 'login', ?, ?, 'success')",
    [user.id, ip, device]
  );

  res.json({ token, session_id: sessionResult.insertId, user: { id: user.id, email: user.email, role: user.role } });
});

/* ── Logout (revoke session) ── */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(204).end();
  const token = authHeader.slice(7);
  await db.query('UPDATE sessions SET is_active = FALSE WHERE token = ?', [token]);
  res.status(204).end();
});

/* ── Request OTP for password reset ── */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email?.toLowerCase().trim()]);
  if (!rows.length) return res.status(404).json({ error: 'Email not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + 10 * 60_000); // 10 min

  await db.query(
    'INSERT INTO password_resets (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
    [rows[0].id, hash, expires]
  );

  // In production: send OTP via email. Here we return it for demo.
  res.json({ message: 'OTP sent', otp_demo: otp });
});

const getLatestResetRecord = async (email) => {
  const [userRows] = await db.query('SELECT id FROM users WHERE email = ?', [email?.toLowerCase().trim()]);
  if (!userRows.length) return { error: { status: 404, message: 'Email not found' } };

  const userId = userRows[0].id;
  const [resetRows] = await db.query(
    'SELECT * FROM password_resets WHERE user_id = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  if (!resetRows.length) return { error: { status: 400, message: 'No valid OTP found or OTP expired' } };

  const record = resetRows[0];
  if (record.attempts >= 3) return { error: { status: 429, message: 'Too many OTP attempts' } };
  return { userId, record };
};

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const latestReset = await getLatestResetRecord(email);
  if (latestReset.error) {
    return res.status(latestReset.error.status).json({ error: latestReset.error.message });
  }

  const { record } = latestReset;
  const valid = await bcrypt.compare(String(otp || ''), record.otp_hash);
  if (!valid) {
    await db.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  return res.json({ message: 'OTP verified' });
});

/* ── Verify OTP & reset password ── */
router.post('/reset-password', async (req, res) => {
  const { email, otp, new_password } = req.body;
  const latestReset = await getLatestResetRecord(email);
  if (latestReset.error) {
    return res.status(latestReset.error.status).json({ error: latestReset.error.message });
  }

  const { userId, record } = latestReset;
  const valid = await bcrypt.compare(String(otp || ''), record.otp_hash);
  if (!valid) {
    await db.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  const hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await db.query('UPDATE users SET password_hash = ?, login_attempts = 0, lock_until = NULL WHERE id = ?', [hash, userId]);
  await db.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);

  res.json({ message: 'Password reset successfully' });
});

export default router;
