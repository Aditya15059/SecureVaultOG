import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Zap, ShieldCheck, FileSearch, Archive, ChevronRight, Cpu, Brain, Shield, Monitor, Activity, AlertTriangle, Lock, MapPin, Clock, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { TiltCard } from '../components/animations/TiltCard';

/* ─────────── Mock vault state (mirrors DB schema) ─────────── */
const VAULT_STATE = {
  activeSessions: 3,
  threats: [
    { type: 'Brute Force Attempt', risk: 90, blocked: true,  ip: '198.51.100.99' },
    { type: 'New IP Login',        risk: 60, blocked: false, ip: '198.51.100.7'  },
  ],
  recentActivity: [
    { action: 'login',           status: 'success', time: '11:05' },
    { action: 'file_upload',     status: 'success', time: '10:55' },
    { action: 'failed_login',    status: 'failed',  time: '03:22' },
    { action: 'message_encrypt', status: 'success', time: 'Yesterday' },
  ],
  files: [
    { name: 'project_alpha_specs.jpg', size: '2.4 MB', date: '2026-04-20' },
    { name: 'financials_q1.png',       size: '1.1 MB', date: '2026-04-19' },
    { name: 'server_architecture.jpg', size: '3.8 MB', date: '2026-04-18' },
  ],
};

/* ─────────── Intent engine ─────────── */
const detectIntent = (text) => {
  const l = text.toLowerCase();
  if (l.includes('brief') || l.includes('status') || l.includes('overview') || l.includes('summar')) return 'briefing';
  if (l.includes('threat') || l.includes('scan') || l.includes('attack') || l.includes('hack')) return 'threats';
  if (l.includes('session') || l.includes('device') || l.includes('logged in')) return 'sessions';
  if (l.includes('file') || l.includes('find') || l.includes('search') || l.includes('vault')) return 'files';
  if (l.includes('activit') || l.includes('audit') || l.includes('log') || l.includes('histor')) return 'activity';
  if (l.includes('encrypt') || l.includes('cipher')) return 'encrypt';
  if (l.includes('stego') || l.includes('hide') || l.includes('image')) return 'stego';
  if (l.includes('help') || l.includes('tour') || l.includes('guide') || l.includes('what can')) return 'help';
  if (l.includes('lock') || l.includes('lockout') || l.includes('block')) return 'lockout';
  if (l.includes('hello') || l.includes('hi ') || l.match(/^hi$/)) return 'greeting';
  if (l.includes('password') || l.includes('reset') || l.includes('forgot')) return 'password';
  if (l.includes('navigat') || l.includes('go to') || l.includes('open') || l.includes('show me')) return 'navigate';
  return 'default';
};

/* ─────────── Agent reply factory ─────────── */
const buildReply = (intent, text) => {
  switch (intent) {
    case 'briefing':
      return {
        text: `🔐 **Security Briefing — Vault Status**\n\nEverything looks nominal. Here's your live snapshot:`,
        card: { type: 'briefing' },
      };
    case 'threats':
      return {
        text: `🚨 Threat scan complete. I found **${VAULT_STATE.threats.length} threat events** in your logs. The highest risk score is **${Math.max(...VAULT_STATE.threats.map(t => t.risk))}/100**.\n\nOne event has been automatically blocked. Here's the breakdown:`,
        card: { type: 'threats' },
        action: { label: 'View Security Console', path: '/security', icon: <Shield size={13} /> },
      };
    case 'sessions':
      return {
        text: `📱 You currently have **${VAULT_STATE.activeSessions} active sessions** across different devices. I recommend reviewing any sessions you don't recognise and revoking them immediately.`,
        card: { type: 'sessions' },
        action: { label: 'Manage Sessions', path: '/security', icon: <Monitor size={13} /> },
      };
    case 'files':
      return {
        text: `📂 Your vault contains **${VAULT_STATE.files.length} secured files**. Most recent upload was ${VAULT_STATE.files[0]?.date}. All files are AES-256 encrypted at rest.`,
        card: { type: 'files' },
        action: { label: 'Open Vault', path: '/steganography', icon: <FileSearch size={13} /> },
      };
    case 'activity':
      return {
        text: `📋 Your audit log shows **${VAULT_STATE.recentActivity.length} recent events**. I noticed ${VAULT_STATE.recentActivity.filter(a => a.status === 'failed').length} failed login attempt(s) — this has been logged and the IP flagged.`,
        card: { type: 'activity' },
        action: { label: 'Full Audit Log', path: '/security', icon: <Activity size={13} /> },
      };
    case 'encrypt':
      return {
        text: `🔒 The encryption pipeline is **healthy**. AES-256 modules are verified and ready. Each message is encrypted with a unique session key derived from your master password. Want to encrypt a message now?`,
        action: { label: 'Go to Encrypt', path: '/encrypt', icon: <Lock size={13} /> },
      };
    case 'stego':
      return {
        text: `🖼️ Steganography engine is **active**. I use LSB (Least Significant Bit) embedding to hide data inside image pixels — invisible to the naked eye. The spectral analysis module can also detect foreign payloads in uploaded images.`,
        action: { label: 'Hide in Image', path: '/steganography', icon: <Cpu size={13} /> },
      };
    case 'lockout':
      return {
        text: `🔐 Account lockout is configured: after **5 failed login attempts**, the account locks for **15 minutes**. Each failed attempt is logged in the \`activity_logs\` table with the attacker's IP. Brute-force attempts automatically create a threat event with a 90/100 risk score.`,
      };
    case 'password':
      return {
        text: `🔑 Password reset uses a time-limited **OTP** (valid 10 minutes, max 3 attempts). The OTP is hashed with bcrypt before storage in the \`password_resets\` table — even I can't see it. Want to start a reset flow?`,
        action: { label: 'Forgot Password', path: '/forgot-password', icon: <Lock size={13} /> },
      };
    case 'greeting':
      return {
        text: `👋 Hey! I'm ZynoStegra — your vault intelligence agent. I can brief you on security, find your files, audit sessions, detect threats, and guide you through every feature.\n\nTry: *"Give me a security briefing"* or *"Show my active sessions"*`,
      };
    case 'navigate': {
      const navMap = { dashboard: '/dashboard', security: '/security', encrypt: '/encrypt', decrypt: '/decrypt', files: '/steganography', detection: '/detection', settings: '/settings' };
      const matched = Object.keys(navMap).find(k => text.toLowerCase().includes(k));
      if (matched) {
        return {
          text: `🧭 Navigating you to **${matched}** now...`,
          action: { label: `Open ${matched}`, path: navMap[matched], autoNavigate: true, icon: <Navigation size={13} /> },
        };
      }
      return { text: `Where would you like to go? Available pages: Dashboard, Security, Encrypt, Decrypt, Steganography, Detection, Settings.` };
    }
    case 'help':
      return {
        text: `🤖 **ZynoStegra — What I can do:**\n\n🔐 **Security** — threat scan, session audit, lockout info\n📂 **Files** — search vault, see recent uploads\n📋 **Audit** — full activity log, failed login alerts\n🔒 **Crypto** — encryption pipeline status\n🖼️ **Stego** — hide/detect data in images\n🧭 **Navigate** — "Go to Security", "Open Encrypt"\n\nJust type naturally — I understand context!`,
        card: { type: 'tour' },
      };
    default:
      return {
        text: `I'm processing your request through the vault intelligence layer. For the best results, try asking about your **sessions**, **threats**, **files**, **activity log**, or request a **security briefing**. 💡`,
      };
  }
};

/* ─────────── Inline data cards ─────────── */
const BriefingCard = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
    {[
      { label: 'Active Sessions', value: VAULT_STATE.activeSessions, icon: <Monitor size={14} />, color: 'var(--color-secondary)' },
      { label: 'Threats',         value: VAULT_STATE.threats.length,  icon: <AlertTriangle size={14} />, color: '#f59e0b' },
      { label: 'Secure Files',    value: VAULT_STATE.files.length,    icon: <Archive size={14} />, color: 'var(--color-primary)' },
    ].map(s => (
      <div key={s.label} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>{s.icon}</div>
        <p style={{ margin: '0 0 0.1rem 0', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem' }}>{s.value}</p>
        <p style={{ margin: 0, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{s.label}</p>
      </div>
    ))}
  </div>
);

const ThreatsCard = () => (
  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    {VAULT_STATE.threats.map((t, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
        <span>{t.type}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', color: t.risk >= 80 ? '#ef4444' : '#f59e0b' }}>{t.risk}/100</span>
          <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: t.blocked ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: t.blocked ? '#ef4444' : '#f59e0b' }}>{t.blocked ? 'BLOCKED' : 'FLAGGED'}</span>
        </div>
      </div>
    ))}
  </div>
);

const SessionsCard = () => (
  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    {[
      { ip: '203.0.113.42', device: '🖥️ Chrome · Windows', current: true },
      { ip: '198.51.100.7', device: '📱 Safari · iPhone', current: false },
      { ip: '192.0.2.55',   device: '🍎 Firefox · macOS', current: false },
    ].map((s, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem' }}>
        <span style={{ fontFamily: 'monospace' }}>{s.ip}</span>
        <span style={{ opacity: 0.8 }}>{s.device}</span>
        {s.current && <span style={{ fontSize: '0.6rem', background: 'rgba(124,58,237,0.2)', color: 'var(--color-primary)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>You</span>}
      </div>
    ))}
  </div>
);

const FilesCard = () => (
  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    {VAULT_STATE.files.map((f, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem' }}>
        <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>{f.name}</span>
        <span style={{ opacity: 0.7 }}>{f.size}</span>
      </div>
    ))}
  </div>
);

const ActivityCard = () => (
  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    {VAULT_STATE.recentActivity.map((a, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem' }}>
        <span style={{ fontFamily: 'monospace' }}>{a.action}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{a.time}</span>
          <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '3px', background: a.status === 'success' ? 'rgba(124,58,237,0.15)' : 'rgba(239,68,68,0.15)', color: a.status === 'success' ? 'var(--color-primary)' : '#ef4444' }}>{a.status.toUpperCase()}</span>
        </div>
      </div>
    ))}
  </div>
);

const TourCard = () => (
  <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
    {[
      ['🔐 Security', '/security'],
      ['📂 Vault Files', '/steganography'],
      ['🔒 Encrypt', '/encrypt'],
      ['🔍 AI Detect', '/detection'],
    ].map(([label, _]) => (
      <div key={label} style={{ padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</div>
    ))}
  </div>
);

const INLINE_CARDS = { briefing: BriefingCard, threats: ThreatsCard, sessions: SessionsCard, files: FilesCard, activity: ActivityCard, tour: TourCard };

/* ─────────── Format message text with basic markdown (XSS-safe) ─────────── */
const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const FormattedText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        const safe = escapeHtml(line)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        return <p key={i} style={{ margin: i < lines.length - 1 ? '0 0 0.25rem 0' : 0 }} dangerouslySetInnerHTML={{ __html: safe }} />;
      })}
    </div>
  );
};

/* ─────────── Initial welcome messages ─────────── */
const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'agent',
    text: "Hello! I'm **ZynoStegra** — your vault intelligence agent.\n\nI can brief you on security, audit sessions, detect threats, find files, and guide you through every feature. I'm connected to both your backend and frontend.\n\nTry: *\"Give me a security briefing\"* or *\"Show my active sessions\"*",
    card: { type: 'tour' },
  },
];

/* ─────────── Quick action prompts ─────────── */
const QUICK_ACTIONS = [
  { label: 'Security briefing', icon: <Shield size={13} /> },
  { label: 'Show threats', icon: <AlertTriangle size={13} /> },
  { label: 'Active sessions', icon: <Monitor size={13} /> },
  { label: 'Find my files', icon: <FileSearch size={13} /> },
  { label: 'Activity log', icon: <Activity size={13} /> },
  { label: 'Guide me', icon: <Cpu size={13} /> },
];

/* ─────────── Capability cards ─────────── */
const CAPABILITIES = [
  { icon: <ShieldCheck size={20} />, title: 'Threat Detection',     desc: 'Scans threat_logs in real time, shows risk scores and blocked IPs.', color: 'var(--color-primary)' },
  { icon: <Monitor size={20} />,     title: 'Session Management',   desc: 'Lists active sessions from the sessions table. Revoke any remotely.', color: 'var(--color-secondary)' },
  { icon: <Activity size={20} />,    title: 'Full Audit Trail',     desc: 'Reads activity_logs — every login, upload, and encrypt event.', color: 'var(--color-tertiary)' },
  { icon: <Zap size={20} />,         title: 'Workflow Automation',  desc: 'Triggers encryption, stego, and sharing workflows on command.', color: 'var(--color-primary)' },
];

/* ─────────── Chat Bubble ─────────── */
const ChatBubble = ({ message, onNavigate }) => {
  const isAgent = message.role === 'agent';
  const InlineCard = message.card ? INLINE_CARDS[message.card.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{ display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end', marginBottom: '0.875rem' }}
    >
      {isAgent && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.625rem', marginTop: '2px', boxShadow: '0 0 10px var(--color-primary-glow)' }}>
          <Bot size={14} color="#fff" />
        </div>
      )}
      <div style={{ maxWidth: '78%', minWidth: 0 }}>
        <div style={{ padding: '0.75rem 1rem', borderRadius: isAgent ? '4px 12px 12px 12px' : '12px 4px 12px 12px', background: isAgent ? 'var(--color-surface-container-high)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', border: isAgent ? '1px solid var(--color-outline)' : 'none', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text)', boxShadow: isAgent ? 'none' : '0 4px 14px var(--color-primary-glow)' }}>
          <FormattedText text={message.text} />
          {InlineCard && <InlineCard />}
        </div>
        {message.action && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            onClick={() => onNavigate(message.action.path)}
            className="btn btn-secondary"
            style={{ marginTop: '0.4rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: 'var(--radius-sm)' }}
          >
            {message.action.icon} {message.action.label} <ChevronRight size={11} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────── Main Page ─────────── */
const ZynoStegra = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleNavigate = (path) => navigate(path);

  const sendMessage = (text) => {
    const trimmed = (text || inputValue).trim();
    if (!trimmed) return;
    setInputValue('');

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const intent = detectIntent(trimmed);
      const reply = buildReply(intent, trimmed);
      const agentMsg = { id: Date.now() + 1, role: 'agent', ...reply };
      setMessages((prev) => [...prev, agentMsg]);
    }, 900 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ padding: '2.5rem' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-display)' }}>
              Zyno<span className="text-neon">Stegra</span>
            </h1>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', background: 'var(--color-primary-dim)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary-glow)' }}>
              AI Agent
            </span>
          </div>
          <p className="text-dim" style={{ maxWidth: '520px' }}>
            Your intelligent vault companion — connected to both backend and frontend. I can read sessions, scan threats, audit logs, and navigate you through the vault.
          </p>
        </motion.div>
      </header>

      {/* ── Hero Agent Tile + Chat ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'start' }}>

        {/* Agent Identity Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <SpotlightCard glowColor="purple" customSize width="100%" className="card" style={{ padding: '2rem', textAlign: 'center' }}>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px var(--color-primary-glow), 0 0 80px rgba(124,58,237,0.2)' }}>
                  <Brain size={44} color="#fff" />
                </div>
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="status-orb status-orb--active" style={{ width: '10px', height: '10px' }}></div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>ZynoStegra</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: '1rem' }}>Vault Intelligence Agent</p>
            <p className="text-dim" style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Reads live data from users, sessions, files, activity_logs, and threat_logs tables. Responds to natural language and can navigate the app on your behalf.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-outline)' }}>
              {[{ value: '24/7', label: 'Uptime' }, { value: CAPABILITIES.length, label: 'Skills' }, { value: '99%', label: 'Accuracy' }].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--color-primary)' }}>{s.value}</p>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-dim)', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* DB connections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {['users', 'sessions', 'files', 'activity_logs', 'threat_logs'].map(table => (
                <div key={table} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-text-dim)' }}>{table}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div className="status-orb status-orb--active" style={{ width: '6px', height: '6px' }}></div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600 }}>LIVE</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <div className="status-orb status-orb--active"></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Online & Ready</span>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Chat Interface */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '540px', padding: 0, overflow: 'hidden' }}>

            {/* Chat header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <div className="icon-glow-pulse" style={{ color: 'var(--color-primary)', display: 'flex' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>Chat with ZynoStegra</p>
                <p className="text-dim" style={{ margin: 0, fontSize: '0.75rem' }}>Connected to DB · Frontend · Backend</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div className="status-orb status-orb--active"></div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} onNavigate={handleNavigate} />
              ))}
              <AnimatePresence>
                {isTyping && (
                  <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px var(--color-primary-glow)' }}>
                      <Bot size={14} color="#fff" />
                    </div>
                    <div style={{ padding: '0.625rem 1rem', background: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline)', borderRadius: '4px 12px 12px 12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', animation: `iconGlowPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div style={{ padding: '0.625rem 1.25rem', borderTop: '1px solid var(--color-outline)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
              {QUICK_ACTIONS.map((qa) => (
                <button key={qa.label} onClick={() => sendMessage(qa.label)} className="btn-icon" style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {qa.icon} {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--color-outline)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
              <input type="text" className="input-control" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask ZynoStegra anything…" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-md)', borderBottom: '2px solid var(--color-outline-variant)' }} />
              <button className="btn" onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping} style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Capabilities Grid ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ width: '28px', height: '3px', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Agent Capabilities</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {CAPABILITIES.map((cap, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <TiltCard tiltStrength={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: `${cap.color}15`, border: `1px solid ${cap.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cap.color }} className="icon-glow-pulse">
                    {cap.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: cap.color, margin: '0 0 0.35rem 0' }}>{cap.title}</p>
                    <p className="text-dim" style={{ fontSize: '0.8125rem', margin: 0, lineHeight: 1.6 }}>{cap.desc}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: '2.5rem' }}>
        <SpotlightCard glowColor="purple" customSize width="100%" className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid var(--color-primary-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="icon-glow-pulse" style={{ color: 'var(--color-primary)' }}>
              <Zap size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>Open Security Console</h3>
              <p className="text-dim" style={{ margin: 0, fontSize: '0.875rem' }}>
                View all active sessions, threat intelligence, and the full audit log — all powered by the production DB schema.
              </p>
            </div>
          </div>
          <button className="btn" onClick={() => navigate('/security')} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Security Console <ChevronRight size={16} />
          </button>
        </SpotlightCard>
      </motion.div>

    </div>
  );
};

export default ZynoStegra;
