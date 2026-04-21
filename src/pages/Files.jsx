import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Cloud, Eye, Trash2, HardDrive, UploadCloud, RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config/api';

const API_BASE = API_URL;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().slice(0, 10);
};

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('securevault_token') || localStorage.getItem('token') || '';

  const totalUsedBytes = useMemo(
    () => files.reduce((sum, file) => sum + (Number(file.file_size) || 0), 0),
    [files]
  );

  const loadFiles = useCallback(async (silent = false) => {
    if (!token) {
      setError('No active session found. Sign in and store JWT in localStorage (securevault_token).');
      setLoading(false);
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to fetch files');
      setFiles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to fetch files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFiles((prev) => [data, ...prev]);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Secured Vault</h1>
          <p className="text-dim">Upload encrypted files to S3 and track metadata in RDS.</p>
        </div>
        <div className="card" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Cloud size={18} color="var(--color-primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>S3 Connected</span>
          <div className="status-orb status-orb--active"></div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <HardDrive size={20} color="var(--color-primary)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)' }}>Storage Used</span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-dim)' }}>{formatSize(totalUsedBytes)}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>{files.length} object(s) registered</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)' }}>Upload to S3</label>
          <input
            type="file"
            className="input-control"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            style={{ fontSize: '0.8rem', padding: '0.6rem' }}
          />
          <button className="btn" onClick={handleUpload} disabled={!selectedFile || uploading || !token}>
            <UploadCloud size={14} /> {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Vault Files</h3>
        <button className="btn btn-secondary" onClick={() => loadFiles(true)} disabled={refreshing || loading || !token}>
          <RefreshCcw size={14} className={refreshing ? 'icon-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1rem', border: '1px solid rgba(255,180,171,0.4)', background: 'rgba(255,180,171,0.07)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <AlertTriangle size={16} color="var(--color-danger)" />
          <span style={{ color: 'var(--color-danger)' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center' }}>Loading files...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {files.map((file) => (
            <div key={file.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
              <div style={{ height: '140px', background: 'var(--color-surface-container-lowest)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={26} color="var(--color-text-dim)" opacity={0.35} />
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: file.is_encrypted ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: file.is_encrypted ? 'var(--color-primary)' : 'var(--color-danger)', border: `1px solid ${file.is_encrypted ? 'rgba(57,255,20,0.2)' : 'rgba(255,180,171,0.4)'}` }}>
                  {file.is_encrypted ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={12} /> Encrypted</span> : 'Raw'}
                </div>
              </div>

              <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-word', fontSize: '1rem' }}>{file.file_name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-dim)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'monospace' }}>{formatDate(file.created_at)}</span>
                  <span>{formatSize(Number(file.file_size))}</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <a className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem', textDecoration: 'none', justifyContent: 'center' }} href={file.file_url} target="_blank" rel="noreferrer">
                    <Download size={14} /> Open
                  </a>
                  <button className="btn-icon" style={{ color: 'var(--color-danger)', padding: '0.5rem 0.75rem' }} onClick={() => handleDelete(file.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;
