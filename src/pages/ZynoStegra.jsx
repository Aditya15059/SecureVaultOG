import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Zap, ShieldCheck, FileSearch, Archive, RefreshCw, ChevronRight, Cpu, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { TiltCard } from '../components/animations/TiltCard';

/* ─────────── Initial welcome messages ─────────── */
const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'agent',
    text: "Hello, I'm ZynoStegra — your AI-powered vault intelligence agent. I can help you manage files, run steganography operations, detect anomalies, and automate your vault workflows. How can I assist you today?",
  },
];

/* ─────────── Quick action prompts ─────────── */
const QUICK_ACTIONS = [
  { label: 'Scan vault for threats', icon: <ShieldCheck size={14} /> },
  { label: 'Find recent encrypted files', icon: <FileSearch size={14} /> },
  { label: 'Archive old vault data', icon: <Archive size={14} /> },
  { label: 'Run steganography analysis', icon: <Cpu size={14} /> },
];

/* ─────────── Capability cards ─────────── */
const CAPABILITIES = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Threat Detection',
    desc: 'Proactively scans your vault for anomalies and flags suspicious activity in real time.',
    color: 'var(--color-primary)',
  },
  {
    icon: <FileSearch size={20} />,
    title: 'Smart File Retrieval',
    desc: 'Query your files using natural language — "Find my Q3 reports" and ZynoStegra locates them instantly.',
    color: 'var(--color-secondary)',
  },
  {
    icon: <Archive size={20} />,
    title: 'Auto-Archiving',
    desc: 'Automatically archives or purges stale files based on your retention policies.',
    color: 'var(--color-tertiary)',
  },
  {
    icon: <Zap size={20} />,
    title: 'Workflow Automation',
    desc: 'Triggers encryption, steganography, and sharing workflows with a single command.',
    color: 'var(--color-primary)',
  },
];

/* ─────────── Simulated agent responses ─────────── */
function getAgentReply(input) {
  const lower = input.toLowerCase();
  if (lower.includes('scan') || lower.includes('threat'))
    return 'Initiating deep-vault threat scan… No anomalies detected. All 342 secured volumes are clean. ✅';
  if (lower.includes('file') || lower.includes('find') || lower.includes('search'))
    return 'Searching your vault metadata… Found 12 matching files. The most recent was encrypted 2 hours ago. Shall I display the full list?';
  if (lower.includes('archiv'))
    return 'Auto-archive policy is active. 8 files older than 90 days have been flagged. Would you like to archive them to cold storage now?';
  if (lower.includes('stegano') || lower.includes('stego') || lower.includes('analys'))
    return 'Running spectral and LSB analysis across all image assets… Completed. 1 image shows residual noise patterns — flagging for manual review.';
  if (lower.includes('encrypt'))
    return 'Encryption pipeline is healthy. AES-256 modules verified at 00:03:02. Ready to encrypt new payloads on demand.';
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return "Hey there! I'm ZynoStegra, always on-guard for your vault. What would you like to automate today?";
  return "Understood. I'm processing your request through the vault intelligence layer… Stand by for an update. Is there anything else you'd like me to look into?";
}

/* ─────────── Chat Bubble ─────────── */
const ChatBubble = ({ message }) => {
  const isAgent = message.role === 'agent';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        display: 'flex',
        justifyContent: isAgent ? 'flex-start' : 'flex-end',
        marginBottom: '0.875rem',
      }}
    >
      {isAgent && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '0.625rem', marginTop: '2px',
          boxShadow: '0 0 10px var(--color-primary-glow)',
        }}>
          <Bot size={14} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '0.75rem 1rem',
        borderRadius: isAgent ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        background: isAgent
          ? 'var(--color-surface-container-high)'
          : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        border: isAgent ? '1px solid var(--color-outline)' : 'none',
        fontSize: '0.9rem',
        lineHeight: 1.6,
        color: 'var(--color-text)',
        boxShadow: isAgent ? 'none' : '0 4px 14px var(--color-primary-glow)',
      }}>
        {message.text}
      </div>
    </motion.div>
  );
};

/* ─────────── Main Page ─────────── */
const ZynoStegra = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    const trimmed = (text || inputValue).trim();
    if (!trimmed) return;
    setInputValue('');

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply = { id: Date.now() + 1, role: 'agent', text: getAgentReply(trimmed) };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '0.2rem 0.6rem',
              background: 'var(--color-primary-dim)', color: 'var(--color-primary)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary-glow)',
            }}>
              AI Agent
            </span>
          </div>
          <p className="text-dim" style={{ maxWidth: '520px' }}>
            Your intelligent vault companion — automating security workflows, surfacing insights, and keeping your data fortress in perfect order.
          </p>
        </motion.div>
      </header>

      {/* ── Hero Agent Tile + Chat ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'start' }}>

        {/* Agent Identity Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <SpotlightCard glowColor="purple" customSize={true} width="100%" className="card" style={{ padding: '2rem', textAlign: 'center' }}>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 40px var(--color-primary-glow), 0 0 80px rgba(124,58,237,0.2)',
                }}>
                  <Brain size={44} color="#fff" />
                </div>
                {/* Online indicator */}
                <div style={{
                  position: 'absolute', bottom: '4px', right: '4px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className="status-orb status-orb--active" style={{ width: '10px', height: '10px' }}></div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>ZynoStegra</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Vault Intelligence Agent
            </p>
            <p className="text-dim" style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Powered by an advanced neural layer, ZynoStegra monitors your vault, automates security workflows, and responds to natural language commands — 24/7.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-outline)' }}>
              {[
                { value: '24/7', label: 'Uptime' },
                { value: CAPABILITIES.length, label: 'Automations' },
                { value: '99%', label: 'Accuracy' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--color-primary)' }}>{s.value}</p>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-dim)', margin: 0 }}>{s.label}</p>
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
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '460px', padding: 0, overflow: 'hidden' }}>

            {/* Chat header */}
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-outline)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0,
            }}>
              <div className="icon-glow-pulse" style={{ color: 'var(--color-primary)', display: 'flex' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>Chat with ZynoStegra</p>
                <p className="text-dim" style={{ margin: 0, fontSize: '0.75rem' }}>AI-powered vault assistant</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div className="status-orb status-orb--active"></div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 10px var(--color-primary-glow)',
                    }}>
                      <Bot size={14} color="#fff" />
                    </div>
                    <div style={{
                      padding: '0.625rem 1rem', background: 'var(--color-surface-container-high)',
                      border: '1px solid var(--color-outline)', borderRadius: '4px 12px 12px 12px',
                      display: 'flex', gap: '4px', alignItems: 'center',
                    }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: 'var(--color-primary)',
                          display: 'inline-block',
                          animation: `iconGlowPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div style={{
              padding: '0.625rem 1.25rem', borderTop: '1px solid var(--color-outline)',
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0,
            }}>
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => sendMessage(qa.label)}
                  className="btn-icon"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {qa.icon}
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '0.875rem 1.25rem', borderTop: '1px solid var(--color-outline)',
              display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0,
            }}>
              <input
                type="text"
                className="input-control"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ZynoStegra anything…"
                style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-md)', borderBottom: '2px solid var(--color-outline-variant)' }}
              />
              <button
                className="btn"
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isTyping}
                style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
              >
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <TiltCard tiltStrength={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                    background: `${cap.color}15`, border: `1px solid ${cap.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cap.color,
                  }} className="icon-glow-pulse">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: '2.5rem' }}
      >
        <SpotlightCard glowColor="purple" customSize={true} width="100%" className="card" style={{
          padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.05) 100%)',
          border: '1px solid var(--color-primary-glow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="icon-glow-pulse" style={{ color: 'var(--color-primary)' }}>
              <Zap size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>Activate Full Automation Suite</h3>
              <p className="text-dim" style={{ margin: 0, fontSize: '0.875rem' }}>
                Let ZynoStegra run scheduled scans, auto-archive, and proactive threat alerts — hands free.
              </p>
            </div>
          </div>
          <button className="btn" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Enable Automation <ChevronRight size={16} />
          </button>
        </SpotlightCard>
      </motion.div>

    </div>
  );
};

export default ZynoStegra;
