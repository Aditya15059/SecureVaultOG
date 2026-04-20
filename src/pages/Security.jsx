import React, { useState } from 'react';
import { Shield, Monitor, MapPin, Clock, Trash2, AlertTriangle, Activity, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { GlowCardGrid } from '../components/ui/GlowCardGrid';

/* ── Mock data matching the DB schema ── */
const MOCK_SESSIONS = [
  { id: 1, ip_address: '203.0.113.42', device_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124', created_at: '2026-04-20T11:05:00Z', is_current: true },
  { id: 2, ip_address: '198.51.100.7', device_info: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604', created_at: '2026-04-19T08:30:00Z', is_current: false },
  { id: 3, ip_address: '192.0.2.55',   device_info: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) Firefox/120', created_at: '2026-04-18T22:14:00Z', is_current: false },
];

const MOCK_ACTIVITY = [
  { id: 1, action: 'login',             ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-20T11:05:00Z' },
  { id: 2, action: 'file_upload',       ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-20T10:55:00Z' },
  { id: 3, action: 'stego_embed',       ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-20T10:40:00Z' },
  { id: 4, action: 'failed_login',      ip_address: '198.51.100.99', status: 'failed',  device_info: 'Python-requests/2.31', created_at: '2026-04-19T03:22:00Z' },
  { id: 5, action: 'failed_login',      ip_address: '198.51.100.99', status: 'failed',  device_info: 'Python-requests/2.31', created_at: '2026-04-19T03:21:00Z' },
  { id: 6, action: 'ai_scan',           ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-19T08:35:00Z' },
  { id: 7, action: 'session_revoked',   ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-18T23:10:00Z' },
  { id: 8, action: 'message_encrypt',   ip_address: '203.0.113.42', status: 'success', device_info: 'Chrome/124 Windows',   created_at: '2026-04-18T22:58:00Z' },
];

const MOCK_THREATS = [
  { id: 1, threat_type: 'Brute Force Attempt', risk_score: 90, blocked: true,  ip_address: '198.51.100.99', created_at: '2026-04-19T03:22:00Z' },
  { id: 2, threat_type: 'New IP Login',        risk_score: 60, blocked: false, ip_address: '198.51.100.7',  created_at: '2026-04-19T08:30:00Z' },
  { id: 3, threat_type: 'Anomalous Upload',    risk_score: 45, blocked: false, ip_address: '203.0.113.42',  created_at: '2026-04-18T22:20:00Z' },
];

/* ── Helpers ── */
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const parseDevice = (ua = '') => {
  if (ua.includes('iPhone') || ua.includes('Android')) return '📱 Mobile';
  if (ua.includes('Windows')) return '🖥️ Windows';
  if (ua.includes('Macintosh')) return '🍎 macOS';
  if (ua.includes('Python') || ua.includes('curl')) return '⚠️ Script/Bot';
  return '🖥️ Desktop';
};

const RiskBadge = ({ score }) => {
  const color = score >= 80 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#7c3aed';
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', background: `${color}18`, color, border: `1px solid ${color}40`, fontFamily: 'monospace' }}>
      {score}/100
    </span>
  );
};

/* ─────────────────────────────────────────────
   Security Console Page
───────────────────────────────────────────── */
const Security = () => {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const visibleActivity = activityExpanded ? MOCK_ACTIVITY : MOCK_ACTIVITY.slice(0, 5);

  const revokeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id || s.is_current));
  };

  const statCards = [
    { label: 'Active Sessions',   value: sessions.length,              icon: <Monitor size={20} />, color: 'var(--color-secondary)' },
    { label: 'Threats Blocked',   value: MOCK_THREATS.filter(t => t.blocked).length, icon: <Shield size={20} />,  color: 'var(--color-primary)' },
    { label: 'Audit Events',      value: MOCK_ACTIVITY.length,         icon: <Activity size={20} />, color: 'var(--color-tertiary)' },
    { label: 'Failed Logins',     value: MOCK_ACTIVITY.filter(a => a.action === 'failed_login').length, icon: <AlertTriangle size={20} />, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '2.5rem' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-display)' }}>
              Security <span className="text-neon">Console</span>
            </h1>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', background: 'rgba(57,255,20,0.08)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124,58,237,0.3)' }}>
              Zero Trust
            </span>
          </div>
          <p className="text-dim" style={{ maxWidth: '540px' }}>
            Full audit visibility — active sessions, threat intelligence, and complete activity logs powered by the production database schema.
          </p>
        </motion.div>
      </header>

      {/* ── Stat Strip ── */}
      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        initial="hidden" animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}
      >
        {statCards.map((s, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' } } }}>
            <SpotlightCard glowColor="purple" customSize width="100%" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }} className="icon-glow-pulse">
                  {s.icon}
                </div>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '0 0 0.25rem 0' }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-dim)', margin: 0 }}>{s.label}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* ── Active Sessions ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Monitor color="var(--color-secondary)" size={18} className="icon-cyber" />
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Active Sessions</h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>device · ip · time</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <AnimatePresence>
                {sessions.map((s) => (
                  <motion.div key={s.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-lowest)', border: `1px solid ${s.is_current ? 'rgba(124,58,237,0.3)' : 'var(--color-outline)'}` }}
                  >
                    <div style={{ fontSize: '1.3rem' }}>{parseDevice(s.device_info).split(' ')[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'monospace' }}>{s.ip_address}</p>
                        {s.is_current && <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.1rem 0.4rem', background: 'rgba(124,58,237,0.12)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>Current</span>}
                      </div>
                      <p className="text-dim" style={{ margin: 0, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parseDevice(s.device_info)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-dim)', fontSize: '0.75rem', flexShrink: 0 }}>
                      <Clock size={12} />
                      <span style={{ fontFamily: 'monospace' }}>{formatTime(s.created_at)}</span>
                    </div>
                    {!s.is_current && (
                      <button onClick={() => revokeSession(s.id)} className="btn-icon" title="Revoke session" style={{ color: 'var(--color-danger)', padding: '0.35rem', flexShrink: 0 }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Threat Intelligence ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertTriangle color="#f59e0b" size={18} className="icon-cyber" />
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Threat Intelligence</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_THREATS.map((t) => (
                <div key={t.id} style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-lowest)', border: `1px solid ${t.blocked ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{t.threat_type}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                      <RiskBadge score={t.risk_score} />
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: t.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: t.blocked ? '#ef4444' : '#f59e0b', textTransform: 'uppercase' }}>
                        {t.blocked ? 'Blocked' : 'Flagged'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} /> {t.ip_address}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {formatTime(t.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Activity Log ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity color="var(--color-primary)" size={18} className="icon-cyber" />
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Audit Activity Log</h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>action · ip · status · time</span>
          </div>

          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline)' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '1rem', padding: '0.6rem 1.25rem', background: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline)' }}>
              {['Action', 'IP Address', 'Status', 'Time'].map(h => (
                <p key={h} style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dim)' }}>{h}</p>
              ))}
            </div>

            <AnimatePresence>
              {visibleActivity.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: i < visibleActivity.length - 1 ? '1px solid var(--color-outline)' : 'none', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flexShrink: 0 }}>
                      {log.status === 'success' ? <CheckCircle2 size={14} color="var(--color-primary)" /> : <XCircle size={14} color="#ef4444" />}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: 'monospace' }}>{log.action}</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-text-dim)' }}>{log.ip_address}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: log.status === 'success' ? 'rgba(124,58,237,0.1)' : 'rgba(239,68,68,0.1)', color: log.status === 'success' ? 'var(--color-primary)' : '#ef4444', width: 'fit-content' }}>
                    {log.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-dim)' }}>{formatTime(log.created_at)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {MOCK_ACTIVITY.length > 5 && (
            <button onClick={() => setActivityExpanded(v => !v)} className="btn-icon" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
              {activityExpanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {MOCK_ACTIVITY.length} events</>}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── DB Schema Note ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginTop: '2rem' }}>
        <GlowCardGrid columns={3}>
          {[
            { title: 'users table', desc: 'Stores credentials, lockout state, last login IP & device fingerprint', icon: '👤' },
            { title: 'sessions table', desc: 'Zero Trust — every token tied to IP + device. Supports remote revocation.', icon: '🔐' },
            { title: 'activity_logs table', desc: 'Full audit trail for every action: login, upload, encrypt, scan, revoke.', icon: '📋' },
          ].map((item, i) => (
            <SpotlightCard key={i} glowColor="purple" className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h4 style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{item.title}</h4>
              <p className="text-dim" style={{ fontSize: '0.8125rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </SpotlightCard>
          ))}
        </GlowCardGrid>
      </motion.div>

    </div>
  );
};

export default Security;
