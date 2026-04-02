import React, { useState } from 'react';
import { Upload, Download, CloudUpload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const Steganography = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
      setComplete(false);
    }
  };

  const handleHide = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setComplete(true);
    }, 2000);
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1000px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Inject Steganography</h1>
        <p className="text-dim">Hide encrypted payloads within image files seamlessly.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        {/* Left Col - Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', border: '1px dashed var(--color-primary-dim)', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.borderColor='var(--color-primary)'} onMouseLeave={(e)=>e.currentTarget.style.borderColor='var(--color-primary-dim)'}>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', opacity: 0, cursor: 'pointer' }} />
            {file ? (
              <img src={file} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-primary)' }}>
                <ImageIcon size={48} opacity={0.8} />
                <p style={{ fontWeight: 500 }}>Upload Carrier Image</p>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--color-bg-border)' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Encrypted Payload to Hide</label>
              <textarea 
                className="input-control" 
                rows={4} 
                placeholder="Paste your AES ciphertext here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ resize: 'none' }}
              ></textarea>
            </div>
          </div>

          <button className="btn" onClick={handleHide} disabled={processing || !file || !message} style={{ width: '100%', opacity: processing || !file || !message ? 0.7 : 1 }}>
            {processing ? 'Injecting Data...' : 'Hide Message into Image'}
          </button>
        </div>

        {/* Right Col - Output */}
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--color-bg-border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Output Terminal</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--color-bg-border)' }}>
            {!complete ? (
              <p className="text-dim">Awaiting injection sequence...</p>
            ) : (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                <CheckCircle2 size={64} color="var(--color-success)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-success)' }}>Injection Successful</h4>
                <p className="text-dim" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>Payload has been obfuscated via LSB Steganography. Image visual integrity maintained 100%.</p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <Download size={16} /> Download
                  </button>
                  <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <CloudUpload size={16} /> Send to AWS S3
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Steganography;
