import React from 'react';
import { Lock, Image as ImageIcon, ShieldAlert, Activity } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Encrypted Messages', value: '1,248', icon: <Lock size={24} color="var(--color-primary)" />, trend: '+12% this week' },
    { title: 'Secured Images', value: '342', icon: <ImageIcon size={24} color="#3b82f6" />, trend: '+5% this week' },
    { title: 'AI Scans Run', value: '89', icon: <ShieldAlert size={24} color="var(--color-danger)" />, trend: '2 threats detected' },
  ];

  const activities = [
    { action: 'Steganography payload generated', target: 'confidential_q3.png', time: '2 hours ago', status: 'Success' },
    { action: 'Message encrypted via KMS', target: 'Project Alpha Details', time: '5 hours ago', status: 'Success' },
    { action: 'AI Scan detected anomaly', target: 'suspicious_file.jpg', time: '1 day ago', status: 'Flagged' },
    { action: 'New vault access authorized', target: 'Agent Smith', time: '2 days ago', status: 'Success' },
  ];

  return (
    <div style={{ padding: '2.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, Agent</h1>
        <p className="text-dim">Here is the status of your secure vault.</p>
      </header>

      {/* Stats Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--color-bg-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p className="text-dim" style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.title}</p>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{stat.value}</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: stat.trend.includes('threat') ? 'var(--color-danger)' : 'var(--color-success)', margin: 0 }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </section>

      {/* Activity Timeline */}
      <section className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Activity color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Activity</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: i !== activities.length - 1 ? '1px solid var(--color-bg-border)' : 'none' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: act.status === 'Flagged' ? 'var(--color-danger)' : 'var(--color-primary)', marginTop: '6px', boxShadow: `0 0 8px ${act.status === 'Flagged' ? 'var(--color-danger)' : 'var(--color-primary)'}` }}></div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500 }}>{act.action}</p>
                <p className="text-dim" style={{ fontSize: '0.875rem', margin: 0 }}>Target: <span style={{ color: 'var(--color-text)' }}>{act.target}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="text-dim" style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{act.time}</p>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: act.status === 'Flagged' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: act.status === 'Flagged' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
