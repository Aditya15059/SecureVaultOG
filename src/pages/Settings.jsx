import React from 'react';
import { Key, Shield, User, LogOut, Terminal } from 'lucide-react';

const Settings = () => {
  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Preferences</h1>
        <p className="text-dim">Configure your security algorithms, access keys, and user profile.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Settings */}
        <section className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '1rem' }}>
            <User color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Operator Profile</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Codename / Username</label>
              <input type="text" className="input-control" defaultValue="Agent007" />
            </div>
            <div className="input-group">
              <label>Contact Endpoint (Email)</label>
              <input type="email" className="input-control" defaultValue="agent@secure.sys" />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Update Master Password</label>
              <input type="password" className="input-control" placeholder="Enter new master password" />
            </div>
          </div>
          
          <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
             <button className="btn">Save Profile Changes</button>
          </div>
        </section>

        {/* Security & KMS */}
        <section className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '1rem' }}>
            <Shield color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cryptography & Infrastructure</h2>
          </div>
          
          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AWS KMS Target ARN</span>
              <span style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>Verified</span>
            </label>
            <input type="text" className="input-control" defaultValue="arn:aws:kms:us-east-1:123456789012:key/mrk-8e2b..." readOnly style={{ fontFamily: 'monospace', color: 'var(--color-text-dim)' }} />
          </div>

          <div className="input-group">
            <label>API Access Key</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="password" className="input-control" defaultValue="sk_live_1234567890abcdef" readOnly style={{ fontFamily: 'monospace', flex: 1 }} />
              <button className="btn btn-secondary">Regenerate</button>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--color-danger)', margin: '0 0 0.5rem 0' }}>Danger Zone</h4>
            <p className="text-dim" style={{ fontSize: '0.875rem', margin: '0 0 1rem 0' }}>Revoke all active sessions and purge local cache.</p>
            <button className="btn" style={{ background: 'var(--color-danger)', color: '#fff', border: 'none' }}>Emergency Purge</button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
