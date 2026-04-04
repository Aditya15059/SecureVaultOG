import React, { useState, useRef, useEffect, createRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ShieldCheck, ArrowLeft, Eye, EyeOff, Check, AlertTriangle, Lock } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { KineticButton } from '../components/animations/KineticButton';
import { motion, AnimatePresence } from 'framer-motion';
import './ForgotPassword.css';

// ===== EMAIL MASKING =====
function maskEmail(email) {
  const [user, domain] = email.split('@');
  const masked = user.slice(0, 3) + '***';
  return `${masked}@${domain}`;
}

// ===== PASSWORD STRENGTH =====
function getPasswordStrength(pw) {
  let score = 0;
  const checks = { length: false, upper: false, number: false, special: false };
  if (pw.length >= 8) { score++; checks.length = true; }
  if (/[A-Z]/.test(pw)) { score++; checks.upper = true; }
  if (/[0-9]/.test(pw)) { score++; checks.number = true; }
  if (/[^A-Za-z0-9]/.test(pw)) { score++; checks.special = true; }
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
  return { score, label: labels[Math.max(0, score - 1)] || 'Weak', color: colors[Math.max(0, score - 1)] || '#ef4444', checks };
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0=email, 1=otp, 2=reset
  const [direction, setDirection] = useState(1); // 1=forward, -1=back

  // Step 1 state
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2 state
  const [otp, setOtp] = useState(Array(6).fill(''));
  const otpRefs = useRef(Array.from({ length: 6 }, () => createRef()));
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  // Step 3 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  const steps = ['Email', 'Verify Code', 'New Password'];

  // Resend timer countdown
  useEffect(() => {
    if (currentStep !== 1 || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, currentStep]);

  // Redirect countdown
  useEffect(() => {
    if (!resetSuccess) return;
    if (redirectCount <= 0) {
      navigate('/login');
      return;
    }
    const t = setTimeout(() => setRedirectCount(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resetSuccess, redirectCount, navigate]);

  const goToStep = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  // ===== STEP 1: Send email =====
  const handleSendEmail = (e) => {
    e.preventDefault();
    setEmailError('');
    if (!email) { setEmailError('Email address is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address'); return; }

    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      // Always succeed (security pattern: don't reveal if email exists)
      goToStep(1);
      setResendTimer(60);
    }, 1200);
  };

  // ===== STEP 2: OTP Input =====
  const handleOtpChange = (val, idx) => {
    setOtpError('');
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      otpRefs.current[idx + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const padded = [...digits, ...Array(6).fill('')].slice(0, 6);
    setOtp(padded);
    const focusIdx = Math.min(digits.length, 5);
    otpRefs.current[focusIdx].current?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      // Demo: "123456" is valid code
      if (code === '123456') {
        setOtpSuccess(true);
        setTimeout(() => {
          goToStep(2);
          setOtpSuccess(false);
        }, 1000);
      } else {
        setOtpError('Invalid verification code. Please try again.');
        setOtp(Array(6).fill(''));
        setOtpShake(true);
        setTimeout(() => setOtpShake(false), 600);
        otpRefs.current[0].current?.focus();
      }
    }, 1000);
  };

  const handleResend = () => {
    if (resendTimer > 0 || resendCount >= 3) return;
    setResendCount(c => c + 1);
    setResendTimer(60);
    setOtp(Array(6).fill(''));
    setOtpError('');
  };

  // ===== STEP 3: Reset Password =====
  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (strength.score < 2) return;
    if (!passwordsMatch) return;

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
    }, 1500);
  };

  // Animation variants
  const stepVariants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="forgot-page bg-grid">
      <ParticleBackground particleCount={50} />
      <div className="forgot-ambient-glow"></div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ type: 'spring', damping: 25 }}
        className="glass-panel-elevated forgot-card"
      >
        {/* Step Indicator */}
        <div className="forgot-stepper">
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="forgot-step-item">
                <div className={`forgot-step-circle ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`}>
                  {i < currentStep ? <Check size={14} /> : i + 1}
                </div>
                <span className={`forgot-step-label ${i <= currentStep ? 'active' : ''}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`forgot-step-line ${i < currentStep ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="forgot-step-content">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ===== STEP 1: ENTER EMAIL ===== */}
            {currentStep === 0 && (
              <motion.div 
                key="step-email"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="forgot-step-header">
                  <KeyRound size={28} className="forgot-step-icon" />
                  <h2>Reset Access</h2>
                  <p className="text-dim">Enter your registered email to receive a reset code.</p>
                </div>

                <form onSubmit={handleSendEmail}>
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Secure Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: emailError ? '#ef4444' : 'var(--color-text-dim)' }} />
                      <input 
                        type="text"
                        className={`input-control ${emailError ? 'input-error' : ''}`}
                        placeholder="operator@securevault.io"
                        style={{ paddingLeft: '2.5rem', background: 'rgba(0,0,0,0.3)' }}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      />
                    </div>
                    {emailError && <span className="forgot-field-error">{emailError}</span>}
                  </div>

                  <KineticButton type="submit" loading={emailLoading} style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}>
                    Send Reset Code →
                  </KineticButton>
                </form>

                <div className="forgot-info-note">
                  <ShieldCheck size={14} />
                  <span>If this email exists, a code will be sent.</span>
                </div>

                <Link to="/login" className="forgot-back-link">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </motion.div>
            )}

            {/* ===== STEP 2: VERIFY OTP ===== */}
            {currentStep === 1 && (
              <motion.div 
                key="step-otp"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="forgot-step-header">
                  <Mail size={28} className="forgot-step-icon" />
                  <h2>Check Your Email</h2>
                  <p className="text-dim">We sent a 6-digit code to <strong style={{ color: 'var(--color-primary)' }}>{maskEmail(email)}</strong></p>
                </div>

                <div className={`otp-container ${otpShake ? 'form-shake' : ''}`}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs.current[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-box ${digit ? 'filled' : ''} ${otpError ? 'otp-error' : ''} ${otpSuccess ? 'otp-success' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value.replace(/\D/, ''), idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {otpError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="forgot-field-error" 
                    style={{ textAlign: 'center', marginTop: '0.75rem' }}
                  >
                    {otpError}
                  </motion.p>
                )}

                <div className="otp-resend">
                  {resendCount >= 3 ? (
                    <span className="otp-resend-blocked">Too many attempts. Try again in 10 mins.</span>
                  ) : resendTimer > 0 ? (
                    <span className="otp-resend-wait">Resend in 00:{resendTimer.toString().padStart(2, '0')}</span>
                  ) : (
                    <button className="otp-resend-btn" onClick={handleResend}>Resend Code →</button>
                  )}
                </div>

                <KineticButton 
                  onClick={handleVerifyOtp} 
                  loading={otpLoading}
                  success={otpSuccess}
                  disabled={otp.join('').length < 6}
                  style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', marginTop: '0.75rem' }}
                >
                  Verify Code
                </KineticButton>

                <button className="forgot-back-link" onClick={() => goToStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', width: '100%' }}>
                  <ArrowLeft size={14} /> Use a different email
                </button>
              </motion.div>
            )}

            {/* ===== STEP 3: SET NEW PASSWORD ===== */}
            {currentStep === 2 && (
              <motion.div 
                key="step-reset"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {resetSuccess ? (
                  <div className="forgot-success-container">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: 'spring', damping: 12 }}
                      className="forgot-success-check"
                    >
                      <Check size={40} />
                    </motion.div>
                    <h2>Password Updated</h2>
                    <p className="text-dim">Your vault password has been reset successfully.</p>
                    <div className="forgot-redirect-badge">
                      Redirecting in {redirectCount}...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="forgot-step-header">
                      <Lock size={28} className="forgot-step-icon" />
                      <h2>Create New Master Password</h2>
                    </div>

                    <form onSubmit={handleResetPassword}>
                      {/* New Password */}
                      <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showNewPw ? 'text' : 'password'}
                            className="input-control"
                            placeholder="••••••••"
                            style={{ paddingRight: '3rem', background: 'rgba(0,0,0,0.3)' }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button 
                            type="button" onClick={() => setShowNewPw(!showNewPw)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}
                          >
                            {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Strength Bar */}
                      {newPassword && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pw-strength-section">
                          <div className="pw-strength-bar-track">
                            <motion.div 
                              className="pw-strength-bar-fill" 
                              initial={{ width: 0 }}
                              animate={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                          <div className="pw-checks">
                            <span className={strength.checks.length ? 'check-pass' : ''}>✓ 8+ chars</span>
                            <span className={strength.checks.upper ? 'check-pass' : ''}>✓ uppercase</span>
                            <span className={strength.checks.number ? 'check-pass' : ''}>✓ number</span>
                            <span className={strength.checks.special ? 'check-pass' : ''}>✓ special</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Confirm Password */}
                      <div className="input-group" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                        <label>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showConfirmPw ? 'text' : 'password'}
                            className={`input-control ${confirmPassword && !passwordsMatch ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            style={{ paddingRight: '3rem', background: 'rgba(0,0,0,0.3)' }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button 
                            type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}
                          >
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {confirmPassword && (
                          <span className={`pw-match-indicator ${passwordsMatch ? 'match' : 'no-match'}`}>
                            {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </span>
                        )}
                      </div>

                      <KineticButton 
                        type="submit" 
                        loading={resetLoading}
                        disabled={strength.score < 2 || !passwordsMatch}
                        style={{ width: '100%', padding: '1rem', fontSize: '0.95rem' }}
                      >
                        Update Vault Password
                      </KineticButton>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
