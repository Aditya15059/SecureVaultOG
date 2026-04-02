import React, { useState } from 'react';
import { Upload, Cpu, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Detection = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // 'normal', 'stego'

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
      setResult(null);
    }
  };

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      // Randomly mock result for demonstration
      setResult(Math.random() > 0.5 ? 'normal' : 'stego');
    }, 2500);
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', background: 'var(--color-primary-dim)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 15px var(--color-primary-dim)' }}>
          <Cpu size={32} color="var(--color-primary)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Scan & Detect</h1>
        <p className="text-dim">Analyze image files to detect hidden steganographic payloads using our proprietary deep learning models.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--color-bg-border)' }}>
        
        <div style={{ border: '2px dashed var(--color-bg-border)', padding: '3rem 2rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative', marginBottom: '2rem', transition: 'all 0.2s', background: 'rgba(15, 23, 42, 0.3)' }} onMouseEnter={(e)=>e.currentTarget.style.borderColor='var(--color-primary)'} onMouseLeave={(e)=>e.currentTarget.style.borderColor='var(--color-bg-border)'}>
           <input type="file" accept="image/*" onChange={handleUpload} style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', opacity: 0, cursor: 'pointer' }} />
           {file ? (
              <img src={file} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', margin: '0 auto' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-dim)' }}>
                <Upload size={48} opacity={0.5} />
                <p style={{ fontSize: '1.125rem' }}>Drop image here or click to browse</p>
              </div>
            )}
        </div>

        <button className="btn" onClick={handleScan} disabled={scanning || !file} style={{ width: '100%', fontSize: '1.125rem', padding: '1rem', opacity: scanning || !file ? 0.7 : 1 }}>
          {scanning ? 'Initializing Neural Nodes...' : 'Execute Deep Scan'} <Search size={20} />
        </button>

        {/* Scan Progress Bar */}
        {scanning && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              <span>Analyzing LSB patterns...</span>
              <span>Scanning</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--color-primary)', width: '100%', animation: 'loading 2.5s ease-in-out' }}></div>
            </div>
            <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
            {result === 'normal' ? (
              <div style={{ border: '1px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <CheckCircle2 size={32} color="var(--color-success)" style={{ flexShrink: 0 }} />
                <div style={{ width: '100%' }}>
                  <h3 style={{ color: 'var(--color-success)', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Clean Image</h3>
                  <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-dim)' }}>No steganographic activity detected. Image structure is standard.</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                     <span>Confidence Score</span>
                     <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>98.4%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-success)', width: '98.4%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--color-danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <AlertTriangle size={32} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                <div style={{ width: '100%' }}>
                  <h3 style={{ color: 'var(--color-danger)', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Steganography Detected!</h3>
                  <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-dim)' }}>Anomalous data bits detected in image channels. Encrypted payload likely present.</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                     <span>Confidence Score</span>
                     <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>95.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-danger)', width: '95.2%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Detection;
