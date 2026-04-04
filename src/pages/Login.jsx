import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, LockKeyholeOpen, Shield, Zap, Eye, EyeOff, Mail, AlertTriangle, XCircle, Lock, Timer } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { TypewriterText } from '../components/animations/TypewriterText';
import { KineticButton } from '../components/animations/KineticButton';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error state
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'credentials' | 'locked' | 'not-found' | 'validation'
  const [shake, setShake] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });

  // Lockout state
  const [lockUntil, setLockUntil] = useState(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  const passwordRef = useRef(null);

  // Email validation
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockUntil) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setLockCountdown(remaining);
      if (remaining <= 0) {
        setLockUntil(null);
        setLockCountdown(0);
        setError('');
        setErrorType('');
        setAttempts(0);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const clearErrors = () => {
    setError('');
    setErrorType('');
    setFieldErrors({ email: false, password: false });
  };

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setFieldErrors(prev => ({ ...prev, email: true }));
      setError('Please enter a valid email address');
      setErrorType('validation');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    clearErrors();

    // If locked out, do nothing
    if (lockUntil && Date.now() < lockUntil) return;

    // --- SCENARIO 5: Empty fields ---
    if (!email && !password) {
      setFieldErrors({ email: true, password: true });
      setError('Email and password are required');
      setErrorType('validation');
      triggerShake();
      return;
    }
    if (!email) {
      setFieldErrors({ email: true, password: false });
      setError('Email address is required');
      setErrorType('validation');
      triggerShake();
      return;
    }
    if (!password) {
      setFieldErrors({ email: false, password: true });
      setError('Password is required');
      setErrorType('validation');
      triggerShake();
      return;
    }

    // --- SCENARIO 6: Invalid email format ---
    if (!isValidEmail(email)) {
      setFieldErrors({ email: true, password: false });
      setError('Please enter a valid email address');
      setErrorType('validation');
      triggerShake();
      return;
    }

    // --- SIMULATE AUTH LOGIC (no backend) ---
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Demo logic: "admin@securevault.io" / "admin123" = success
      // "unknown@test.com" = email not found
      // Anything else = invalid credentials
      if (email === 'admin@securevault.io' && password === 'admin123') {
        // Success path
        clearErrors();
        setAttempts(0);
        navigate('/dashboard');
        return;
      }

      // --- SCENARIO 4: Email not found ---
      if (email === 'unknown@test.com') {
        setFieldErrors({ email: true, password: false });
        setError('No account found with that email address.');
        setErrorType('not-found');
        triggerShake();
        setPassword('');
        return;
      }

      // --- SCENARIO 1/2/3: Wrong credentials (progressive) ---
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword('');
      triggerShake();
      setFieldErrors({ email: true, password: true });

      if (newAttempts >= 5) {
        // --- SCENARIO 3: Account locked ---
        const lockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        setLockUntil(lockTime);
        setError('Account temporarily locked for 15 minutes. Reset your password or wait for unlock.');
        setErrorType('locked');
      } else if (newAttempts >= 3) {
        // --- SCENARIO 2: Warning with remaining attempts ---
        const remaining = 5 - newAttempts;
        setError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before your account is temporarily locked.`);
        setErrorType('credentials-warning');
      } else {
        // --- SCENARIO 1: Standard invalid credentials ---
        setError('Invalid credentials. Please check your email and password.');
        setErrorType('credentials');
      }
    }, 800);
  };

  const isLocked = lockUntil && Date.now() < lockUntil;

  // Determine error banner color scheme
  const getErrorStyles = () => {
    switch (errorType) {
      case 'credentials-warning':
        return { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.4)', icon: <AlertTriangle size={16} />, color: '#f59e0b' };
      case 'locked':
        return { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.4)', icon: <Lock size={16} />, color: '#ef4444' };
      case 'not-found':
        return { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', icon: <XCircle size={16} />, color: '#ef4444' };
      default:
        return { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', icon: <XCircle size={16} />, color: '#ef4444' };
    }
  };

  const errStyle = getErrorStyles();

  return (
    <div className="login-page bg-grid">
      <ParticleBackground particleCount={60} />

      {/* Ambient glow */}
      <div className="login-ambient-glow"></div>

      {/* Title */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="login-header">
        <h1 style={{ fontSize: '3rem', letterSpacing: '0.05em', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          <TypewriterText text="SECURE" showCursor={false} style={{ color: 'var(--color-text)' }} />
          <TypewriterText text="VAULT" delay={600} className="text-neon" />
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: 0.8 }}>
          <Zap size={14} color="var(--color-secondary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-secondary)' }}>Operator Uplink</span>
          <Zap size={14} color="var(--color-secondary)" />
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 1.2, type: 'spring', damping: 25 }}
        className={`glass-panel-elevated login-card ${shake ? 'form-shake' : ''}`}
      >
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="login-error-banner"
              style={{ 
                background: errStyle.bg, 
                borderColor: errStyle.border, 
                color: errStyle.color 
              }}
            >
              <div className="login-error-banner-icon">{errStyle.icon}</div>
              <div className="login-error-banner-content">
                <span>{error}</span>
                {errorType === 'not-found' && (
                  <Link to="/register" className="login-error-suggestion">
                    Did you mean to Register instead?
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lockout Overlay */}
        {isLocked && (
          <div className="login-lockout-overlay">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="login-lockout-content"
            >
              <Lock size={48} className="login-lockout-icon" />
              <h3>Vault Sealed</h3>
              <div className="login-lockout-timer">
                <Timer size={16} />
                <span>Unlocks in {formatTime(lockCountdown)}</span>
              </div>
              <div className="login-lockout-actions">
                <Link to="/forgot-password" className="btn" style={{ fontSize: '0.8rem', padding: '0.7rem 1.5rem' }}>
                  Reset Password
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Attempts warning badge */}
        <AnimatePresence>
          {attempts >= 3 && attempts < 5 && !isLocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="login-attempts-badge"
            >
              <AlertTriangle size={14} />
              <span>{5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} left</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label>Secure Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: fieldErrors.email ? '#ef4444' : 'var(--color-text-dim)', transition: 'color 0.3s' }} />
              <input 
                type="text"
                className={`input-control ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="operator@securevault.io" 
                style={{ paddingLeft: '2.5rem', background: 'rgba(0,0,0,0.3)' }}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) clearErrors(); }}
                onBlur={handleEmailBlur}
                disabled={isLocked}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <label>Master Password</label>
              <Link 
                to="/forgot-password" 
                className={`login-forgot-link ${attempts >= 2 ? 'login-forgot-link--glow' : ''}`}
              >
                Forgot?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <motion.div 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: fieldErrors.password ? '#ef4444' : passwordFocused ? 'var(--color-primary)' : 'var(--color-text-dim)', zIndex: 2 }}
                animate={{ scale: passwordFocused ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {passwordFocused ? <LockKeyholeOpen size={16} className="icon-glow-pulse" /> : <LockKeyhole size={16} />}
              </motion.div>
              <input 
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'} 
                className={`input-control ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••" 
                style={{ paddingLeft: '2.5rem', paddingRight: '3rem', background: 'rgba(0,0,0,0.3)' }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) clearErrors(); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                disabled={isLocked}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} className="icon-cyber" /> : <Eye size={16} className="icon-cyber" />}
              </button>
            </div>
          </div>

          <KineticButton type="submit" loading={loading} disabled={isLocked} style={{ 
            width: '100%', padding: '1.1rem', fontSize: '1.05rem', letterSpacing: '0.05em'
          }}>
            <Zap size={18} fill="currentColor" /> Initialize Session
          </KineticButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-dim)' }}>
            Unregistered operator? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: '1px solid' }}>Deploy new vault</Link>
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2 }} style={{ 
        marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
        fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', position: 'relative', zIndex: 10
      }}>
        <Shield size={14} className="text-neon" />
        <span>CYBERPUNK PROTOCOL v3.0 ACTIVE</span>
      </motion.div>
    </div>
  );
};

export default Login;
