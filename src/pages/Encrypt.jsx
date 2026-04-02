import React, { useState } from 'react';
import { Lock, Key, Copy, CheckCircle2 } from 'lucide-react';

const Encrypt = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = () => {
    if (!inputText) return;
    setEncrypting(true);
    // Simulate encryption
    setTimeout(() => {
      setOutputText('U2FsdGVkX19B/Kx9Z1z8aHlA8nQ1W2E4R6T8Y0U2I4O6P8A0S2D4F6G8H0J2K4L6Z8X0C2V4B6N8M0+w==');
      setEncrypting(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Encrypt Payload</h1>
        <p className="text-dim">Secure your plaintext messages using AES-256 and AWS KMS key management.</p>
      </header>

      {/* KMS Status */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
            <Key size={20} color="var(--color-success)" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>AWS KMS Connected</p>
            <p className="text-dim" style={{ fontSize: '0.875rem', margin: 0 }}>Key ID: alias/securevault-master</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 500, fontSize: '0.875rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></div>
          Active
        </div>
      </div>

      {/* Encryption Form */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label>Secret Message</label>
          <textarea 
            className="input-control" 
            rows={5} 
            placeholder="Type your sensitive information here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <button className="btn" onClick={handleEncrypt} disabled={encrypting || !inputText} style={{ width: '100%', marginBottom: '2rem', opacity: encrypting || !inputText ? 0.7 : 1 }}>
          {encrypting ? 'Encrypting Payload...' : 'Encrypt with KMS'} {!encrypting && <Lock size={18} />}
        </button>

        {outputText && (
          <div className="input-group" style={{ animation: 'fadeIn 0.5s ease' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Encrypted Output
              <button 
                onClick={copyToClipboard}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontFamily: 'var(--font-main)' }}
              >
                {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Ciphertext</>}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea 
                className="input-control" 
                rows={4} 
                value={outputText}
                readOnly
                style={{ fontFamily: 'monospace', color: 'var(--color-primary)', background: 'rgba(0,0,0,0.3)', resize: 'none', border: '1px solid var(--color-primary-dim)' }}
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Encrypt;
