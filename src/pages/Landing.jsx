import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Image, Cpu, Cloud, Lock, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid var(--color-bg-border)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--color-primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px var(--color-primary-dim)' }}>
            <Lock size={18} color="#000" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}><span className="text-neon">Secure</span>Vault</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>Log In</Link>
          <Link to="/register" className="btn">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Abstract shapes for background */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '300px', height: '300px', background: '#3b82f6', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }}></div>

        <div style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(57, 255, 20, 0.1)', borderRadius: '99px', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Shield size={16} /> Enterprise-Grade Security
        </div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', maxWidth: '800px', lineHeight: 1.1 }}>
          Secure. Hide. <span className="text-neon">Protect.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-dim)', maxWidth: '600px', marginBottom: '3rem' }}>
          The ultimate platform to encrypt your messages, hide them within images using advanced steganography, and detect hidden data with AI.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/register" className="btn" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Start Securing Data <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 5%', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid var(--color-bg-border)' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>Powerful Capabilities</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: <Lock size={32} color="var(--color-primary)" />, title: 'AES + AWS KMS', desc: 'Military-grade message encryption backed by cloud key management systems.' },
            { icon: <Image size={32} color="var(--color-primary)" />, title: 'Steganography', desc: 'Hide your encrypted messages inside ordinary looking images invisibly.' },
            { icon: <Cpu size={32} color="var(--color-primary)" />, title: 'AI Detection', desc: 'Scan images with our advanced AI to detect hidden steganographic data.' },
            { icon: <Cloud size={32} color="var(--color-primary)" />, title: 'Secure Cloud Storage', desc: 'Safely store and manage your files in our encrypted AWS S3 vaults.' }
          ].map((feature, i) => (
            <div key={i} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', transition: 'transform 0.3s ease' }} onMouseEnter={(e)=>e.currentTarget.style.transform='translateY(-5px)'} onMouseLeave={(e)=>e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ background: 'var(--color-primary-dim)', padding: '1rem', borderRadius: '12px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0 0 0' }}>{feature.title}</h3>
              <p style={{ color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 5%', textAlign: 'center', color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-bg-border)' }}>
        <p>&copy; 2026 SecureVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
