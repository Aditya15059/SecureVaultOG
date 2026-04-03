import React, { useState } from 'react';
import { Unlock, Key, Copy, CheckCircle2 } from 'lucide-react';

const Decrypt = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecrypt = () => {
    if (!inputText) return;
    setDecrypting(true);
    // Simulate decryption
    setTimeout(() => {
      setOutputText('The quick brown fox jumps over the lazy dog. Mission coordinates confirmed.');
      setDecrypting(false);
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Decrypt Payload</h1>
        <p className="text-dim">Decrypt your ciphertext messages using AES-256 and AWS KMS key management.</p>
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

      {/* Decryption Form */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label>Encrypted Ciphertext</label>
          <textarea 
            className="input-control" 
            rows={5} 
            placeholder="Paste your ciphertext here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'monospace' }}
          ></textarea>
        </div>

        <button className="btn" onClick={handleDecrypt} disabled={decrypting || !inputText} style={{ width: '100%', marginBottom: '2rem', opacity: decrypting || !inputText ? 0.7 : 1 }}>
          {decrypting ? 'Decrypting Payload...' : 'Decrypt with KMS'} {!decrypting && <Unlock size={18} />}
        </button>

        {outputText && (
          <div className="input-group" style={{ animation: 'fadeIn 0.5s ease' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Decrypted Output
              <button 
                onClick={copyToClipboard}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontFamily: 'var(--font-main)' }}
              >
                {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Plaintext</>}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea 
                className="input-control" 
                rows={4} 
                value={outputText}
                readOnly
                style={{ color: 'var(--color-primary)', background: 'rgba(0,0,0,0.3)', resize: 'none', border: '1px solid var(--color-primary-dim)' }}
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Decrypt;
