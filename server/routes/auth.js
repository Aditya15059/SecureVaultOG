import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';
const JWT_EXPIRES = '7d';
const OTP_EXPIRES_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ─── Per-route rate limiters ─────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests, please try again later.' },
});

// ─── Helper: create JWT ──────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ─── Helper: send OTP email ──────────────────────────────────────────────────
async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SecureVault" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'SecureVault — Your Password Reset Code',
    html: `
      <div style="font-family:monospace;background:#0a0a0a;color:#00ff88;padding:32px;border-radius:8px;max-width:480px">
        <h2 style="color:#00ff88;letter-spacing:0.1em">PASSWORD RESET CODE</h2>
        <p style="color:#aaa">Use the following 6-digit code to reset your SecureVault password. It expires in <strong style="color:#fff">10 minutes</strong>.</p>
        <div style="font-size:2.5rem;letter-spacing:0.3em;background:#111;padding:24px;border-radius:6px;text-align:center;margin:24px 0;border:1px solid #00ff8840">${otp}</div>
        <p style="color:#555;font-size:0.8rem">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const user = new User({ email: email.toLowerCase(), password, username });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ type: 'not-found', message: 'No account found with that email address.' });
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockUntil = user.lockUntil.getTime();
      return res.status(423).json({ type: 'locked', message: 'Account temporarily locked.', lockUntil });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.loginAttempts = 0;
        await user.save();
        return res.status(423).json({
          type: 'locked',
          message: 'Account temporarily locked for 15 minutes.',
          lockUntil: user.lockUntil.getTime(),
        });
      }
      await user.save();
      const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return res.status(401).json({
        type: remaining <= 2 ? 'credentials-warning' : 'credentials',
        message: remaining <= 2
          ? `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before your account is temporarily locked.`
          : 'Invalid credentials. Please check your email and password.',
        attempts: user.loginAttempts,
      });
    }

    // Success — reset counters
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/send-otp ─────────────────────────────────────────────────
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // Always respond with 200 for security (don't reveal whether email exists)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      if ((user.resetAttempts || 0) >= 3) {
        return res.json({ message: 'If that email exists, a code was sent.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.resetOtp = hashedOtp;
      user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRES_MS);
      user.resetAttempts = (user.resetAttempts || 0) + 1;
      await user.save();

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await sendOtpEmail(email, otp);
        } catch (emailErr) {
          console.error('Email send error:', emailErr);
        }
      } else {
        // Dev mode: log OTP to console
        console.log(`[DEV] OTP for ${email}: ${otp}`);
      }
    }

    res.json({ message: 'If that email exists, a code was sent.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
router.post('/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    // Issue a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetToken = hashedToken;
    user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
    user.resetAttempts = 0;
    await user.save();

    res.json({ resetToken });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: hashedToken,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset session. Please start over.' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

export default router;
