import React from 'react';
import { Lock, FileLock2, ShieldAlert, Activity, Zap, Shield, Cloud, Binary, AudioWaveform, BrainCircuit, Monitor, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TiltCard } from '../components/animations/TiltCard';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Encrypted Messages', value: '1,248', icon: <Lock size={24} color="var(--color-primary)" />, trend: '+12% this week', trendColor: 'var(--color-primary)' },
    { title: 'Secured Volumes', value: '342', icon: <FileLock2 size={24} color="var(--color-secondary)" />, trend: '+5% this week', trendColor: 'var(--color-primary)' },
    { title: 'AI Scans Run', value: '89', icon: <ShieldAlert size={24} color="var(--color-danger)" />, trend: '2 threats detected', trendColor: 'var(--color-danger)' },
  ];

  const securityStats = [
    { label: 'Active Sessions', value: '3',  icon: <Monitor size={16} />,       color: 'var(--color-secondary)', path: '/security' },
    { label: 'Threats Blocked', value: '1',  icon: <Shield size={16} />,         color: 'var(--color-primary)',   path: '/security' },
    { label: 'Audit Events',    value: '8',  icon: <Activity size={16} />,       color: 'var(--color-tertiary)',  path: '/security' },
    { label: 'Failed Logins',   value: '2',  icon: <AlertTriangle size={16} />,  color: '#f59e0b',                path: '/security' },
  ];

  const activities = [
    { action: 'Steganography payload generated', target: 'confidential_q3.png', time: '2 hours ago', status: 'Success' },
    { action: 'Message encrypted via KMS', target: 'Project Alpha Details', time: '5 hours ago', status: 'Success' },
    { action: 'AI Scan detected anomaly', target: 'suspicious_file.jpg', time: '1 day ago', status: 'Flagged' },
    { action: 'New vault access authorized', target: 'Agent Smith', time: '2 days ago', status: 'Success' },
  ];

  const featureCards = [
    { 
      label: 'LSB Steganography', 
      value: 'Active', 
      desc: 'Least-significant-bit pixel embedding.', 
      icon: <Binary size={22} />,
      color: 'var(--color-primary)',
      hoverClass: 'icon-glow-pulse',
    },
    { 
      label: 'Spectral Analysis', 
      value: 'Online', 
      desc: 'Frequency-domain waveform scanning.', 
      icon: <AudioWaveform size={22} />,
      color: 'var(--color-secondary)',
      hoverClass: 'icon-glow-pulse',
    },
    { 
      label: 'Neural Detector', 
      value: 'Trained', 
      desc: 'Deep learning stego-detection model.', 
      icon: <BrainCircuit size={22} />,
      color: 'var(--color-success)',
      hoverClass: 'icon-glow-pulse',
    },
  ];

  const staggerSettings = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Operator Console</h1>
          <p className="text-dim">Global vault synchronization complete.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(57,255,20,0.15)' }}>
          <div className="status-orb status-orb--active"></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System: Optimal</span>
        </motion.div>
      </header>

      {/* Security Metrics Strip */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {securityStats.map((s, i) => (
          <button key={i} onClick={() => navigate(s.path)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-lowest)', border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'border-color 0.25s', ':hover': { borderColor: s.color } }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${s.color}25`}
            >
              <div style={{ color: s.color, width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="icon-glow-pulse">
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-dim)' }}>{s.label}</p>
              </div>
            </div>
          </button>
        ))}
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={staggerSettings} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariant}>
            <SpotlightCard glowColor="purple" customSize={true} width="100%" className="h-full" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{stat.title}</p>
                  <h3 style={{ fontSize: '2.25rem', margin: 0, fontFamily: 'var(--font-display)' }}>{stat.value}</h3>
                </div>
                <div className="icon-cyber" style={{ background: 'var(--color-surface-container-lowest)', padding: '0.85rem', borderRadius: 'var(--radius-lg)' }}>
                  {stat.icon}
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: stat.trendColor, margin: 0, fontWeight: 500 }}>
                {stat.trend}
              </p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.section>

      {/* Layout Grid for Activity and Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Activity Timeline */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card h-full">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <Activity color="var(--color-primary)" size={20} className="icon-cyber" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Vault Activity</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activities.map((act, i) => (
              <SpotlightCard key={i} glowColor="blue" size="sm" customSize={true} width="100%" style={{ marginBottom: i !== activities.length - 1 ? '1rem' : 0, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div className={`status-orb ${act.status === 'Flagged' ? 'status-orb--danger' : 'status-orb--active'}`} style={{ marginTop: '6px' }}></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500, fontSize: '0.9375rem' }}>{act.action}</p>
                    <p className="text-dim" style={{ fontSize: '0.8125rem', margin: 0 }}>
                      Target: <span style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{act.target}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="text-dim" style={{ fontSize: '0.8125rem', margin: '0 0 0.25rem 0' }}>{act.time}</p>
                    <span style={{
                      fontSize: '0.6875rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: act.status === 'Flagged' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                      color: act.status === 'Flagged' ? 'var(--color-danger)' : 'var(--color-success)',
                    }}>
                      {act.status}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </motion.section>

        {/* Feature Cards - Each with Unique Icon */}
        <motion.section initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {featureCards.map((m, i) => (
              <TiltCard key={i} tiltStrength={5}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div className={m.hoverClass} style={{ 
                     marginTop: '4px', color: m.color,
                     width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                     background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                     border: `1px solid ${m.color}30`, flexShrink: 0,
                   }}>
                     {m.icon}
                   </div>
                   <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 600, color: m.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{m.label}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>{m.value}</p>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
                   </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default Dashboard;
