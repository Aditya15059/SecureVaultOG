import React from 'react';
import { Download, Cloud, Lock, Eye, Trash2 } from 'lucide-react';

const Files = () => {
  const files = [
    { id: 1, name: 'project_alpha_specs.jpg', date: '2026-04-02', status: 'Stego', size: '2.4 MB', type: 'image/jpeg' },
    { id: 2, name: 'financials_q1.png', date: '2026-04-01', status: 'Encrypted', size: '1.1 MB', type: 'image/png' },
    { id: 3, name: 'server_architecture.jpg', date: '2026-03-28', status: 'Clean', size: '3.8 MB', type: 'image/jpeg' },
    { id: 4, name: 'agent_dossier.png', date: '2026-03-25', status: 'Stego', size: '4.2 MB', type: 'image/png' },
  ];

  return (
    <div style={{ padding: '2.5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Secured Vault</h1>
          <p className="text-dim">Manage your encrypted files and stego-images stored on AWS S3.</p>
        </div>
        <div style={{ background: 'var(--color-bg-light)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Cloud size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 500 }}>S3 Connected</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {files.map(file => (
          <div key={file.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--color-bg-border)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 25px rgba(0,0,0,0.5)'}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px 0 rgba(0, 0, 0, 0.37)'}}>
            
            {/* Image Placeholder */}
            <div style={{ height: '160px', background: 'rgba(15, 23, 42, 0.5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-bg-border)' }}>
              <Eye size={32} color="var(--color-text-dim)" opacity={0.5} />
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, background: file.status === 'Stego' ? 'rgba(239, 68, 68, 0.2)' : file.status === 'Encrypted' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: file.status === 'Stego' ? 'var(--color-danger)' : file.status === 'Encrypted' ? 'var(--color-primary)' : 'var(--color-text-dim)', border: `1px solid ${file.status === 'Stego' ? 'rgba(239, 68, 68, 0.4)' : file.status === 'Encrypted' ? 'rgba(57, 255, 20, 0.4)' : 'rgba(148, 163, 184, 0.4)'}` }}>
                {file.status}
              </div>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-all', fontSize: '1.125rem' }}>{file.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <span>{file.date}</span>
                <span>{file.size}</span>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}>
                  <Download size={16} /> Download
                </button>
                <button className="btn-icon" style={{ color: 'var(--color-danger)', padding: '0.5rem 1rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Files;
