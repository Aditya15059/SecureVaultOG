import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/* ─────────────────────────────────────────────
   ZynoStegra — Intelligent Vault Agent API
   POST /api/agent/chat
   Body: { message: string }
   Returns: { reply: string, action?: object }
───────────────────────────────────────────── */
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const lower = message.toLowerCase();
  const userId = req.user.id;

  // ── Security Briefing ──
  if (lower.includes('brief') || lower.includes('status') || lower.includes('overview')) {
    const [[{ activeSessionCount }]] = await db.query(
      'SELECT COUNT(*) AS activeSessionCount FROM sessions WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    const [[{ threatCount }]] = await db.query(
      'SELECT COUNT(*) AS threatCount FROM threat_logs WHERE user_id = ?',
      [userId]
    );
    const [[{ fileCount }]] = await db.query(
      'SELECT COUNT(*) AS fileCount FROM files WHERE user_id = ?',
      [userId]
    );
    return res.json({
      reply: `🔐 Vault Security Briefing:\n• Active Sessions: ${activeSessionCount}\n• Threats Logged: ${threatCount}\n• Secured Files: ${fileCount}\n\nAll systems are nominal. Would you like to drill into any area?`,
      action: { type: 'briefing', data: { activeSessionCount, threatCount, fileCount } },
    });
  }

  // ── Threats / Scan ──
  if (lower.includes('threat') || lower.includes('scan') || lower.includes('anomal')) {
    const [threats] = await db.query(
      'SELECT threat_type, risk_score, blocked, ip_address, created_at FROM threat_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    if (!threats.length) {
      return res.json({ reply: '✅ No threats detected for your account. Your vault is clean.', action: { type: 'none' } });
    }
    const summary = threats.map(t => `• [${t.risk_score}/100] ${t.threat_type} from ${t.ip_address} — ${t.blocked ? 'Blocked' : 'Flagged'}`).join('\n');
    return res.json({ reply: `🚨 Recent Threats:\n${summary}`, action: { type: 'navigate', path: '/security' } });
  }

  // ── Sessions ──
  if (lower.includes('session') || lower.includes('device') || lower.includes('login')) {
    const [sessions] = await db.query(
      'SELECT ip_address, device_info, created_at FROM sessions WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    if (!sessions.length) return res.json({ reply: 'No active sessions found.', action: { type: 'none' } });
    const summary = sessions.map(s => `• ${s.ip_address} — ${(s.device_info || 'Unknown').slice(0, 60)}`).join('\n');
    return res.json({ reply: `📱 Active Sessions:\n${summary}\n\nWant to revoke any suspicious sessions?`, action: { type: 'navigate', path: '/security' } });
  }

  // ── Files ──
  if (lower.includes('file') || lower.includes('vault') || lower.includes('find') || lower.includes('search')) {
    const [files] = await db.query(
      'SELECT file_name, file_size, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    if (!files.length) return res.json({ reply: 'No files found in your vault. Upload your first encrypted file to get started.', action: { type: 'navigate', path: '/steganography' } });
    const summary = files.map(f => `• ${f.file_name} (${((f.file_size || 0) / 1024).toFixed(1)} KB)`).join('\n');
    return res.json({ reply: `📂 Recent Vault Files:\n${summary}`, action: { type: 'navigate', path: '/files' } });
  }

  // ── Activity log ──
  if (lower.includes('activit') || lower.includes('audit') || lower.includes('log')) {
    const [logs] = await db.query(
      "SELECT action, status, ip_address, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    if (!logs.length) return res.json({ reply: 'No activity logged yet.', action: { type: 'none' } });
    const summary = logs.map(l => `• [${l.status.toUpperCase()}] ${l.action} from ${l.ip_address}`).join('\n');
    return res.json({ reply: `📋 Recent Activity:\n${summary}`, action: { type: 'navigate', path: '/security' } });
  }

  // ── Help / Tour ──
  if (lower.includes('help') || lower.includes('tour') || lower.includes('guide') || lower.includes('what can')) {
    return res.json({
      reply: "I'm ZynoStegra, your vault intelligence agent. Here's what I can do:\n\n🔐 Security: threat scan, session audit, activity log\n📂 Files: find, search, archive vault files\n🔒 Auth: explain lockout, device tracking\n📊 Analytics: security briefing, risk scores\n\nTry: 'Show me my threats' or 'Give me a security briefing'",
      action: { type: 'tour' },
    });
  }

  // ── Default ──
  return res.json({
    reply: "I'm processing your request through the vault intelligence layer. Could you be more specific? Try asking about your sessions, files, threats, or request a full security briefing.",
    action: { type: 'none' },
  });
});

export default router;
