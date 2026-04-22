import nodemailer from 'nodemailer';

/**
 * Creates a reusable transporter from environment variables.
 * Supports any SMTP provider (Gmail, Outlook, SendGrid, etc.).
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your environment.
 */
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[SecureVault Mailer] SMTP_USER or SMTP_PASS not set — emails will not be sent.');
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM_ADDRESS = `"SecureVault" <${process.env.SMTP_USER || 'noreply@securevault.io'}>`;

/* ── Welcome email after successful registration ── */
export const sendWelcomeEmail = async (email, username) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const displayName = username || email.split('@')[0];

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: '🔐 Welcome to SecureVault — Your Vault is Ready',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to SecureVault</title>
        </head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;border:1px solid #2d1b69;overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2d1b69 0%,#1e1b4b 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:2px;color:#a78bfa;">
                        🔐 SECURE<span style="color:#c4b5fd;">VAULT</span>
                      </h1>
                      <p style="margin:8px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7c6dab;">
                        Zero-Trust Encrypted Storage
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <h2 style="margin:0 0 16px;font-size:22px;color:#f1f5f9;">
                        Welcome aboard, <span style="color:#a78bfa;">${displayName}</span>! 🎉
                      </h2>
                      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#94a3b8;">
                        Your SecureVault account has been successfully created. You now have access to a 
                        <strong style="color:#c4b5fd;">military-grade encrypted vault</strong> designed to keep 
                        your most sensitive files, credentials, and data safe from prying eyes.
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#94a3b8;">
                        SecureVault uses <strong style="color:#c4b5fd;">AES-256 encryption</strong>, 
                        zero-trust architecture, and real-time threat detection — so you stay protected 24/7.
                      </p>

                      <!-- Feature highlights -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td style="background:#1e293b;border-radius:10px;padding:20px 24px;border-left:3px solid #7c3aed;">
                            <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;">What you can do</p>
                            <p style="margin:4px 0;font-size:14px;color:#cbd5e1;">🔒 &nbsp;Encrypt &amp; securely store files</p>
                            <p style="margin:4px 0;font-size:14px;color:#cbd5e1;">🛡️ &nbsp;Real-time threat monitoring</p>
                            <p style="margin:4px 0;font-size:14px;color:#cbd5e1;">🕵️ &nbsp;Steganography &amp; AI-powered detection</p>
                            <p style="margin:4px 0;font-size:14px;color:#cbd5e1;">📊 &nbsp;Full audit trail &amp; session management</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
                        If you didn't create this account, please ignore this email or contact support immediately.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
                      <p style="margin:0;font-size:12px;color:#475569;">
                        © ${new Date().getFullYear()} SecureVault &nbsp;·&nbsp; Zero-Trust Security Platform
                      </p>
                      <p style="margin:6px 0 0;font-size:11px;color:#334155;">
                        This is an automated message — please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Welcome to SecureVault, ${displayName}!\n\nYour vault has been created successfully.\n\nSecureVault provides AES-256 encrypted storage, zero-trust architecture, and real-time threat detection to keep your data safe.\n\n© ${new Date().getFullYear()} SecureVault`,
  });
};

/* ── OTP email for password reset ── */
export const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: '🔑 SecureVault — Your Password Reset Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset OTP</title>
        </head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;border:1px solid #2d1b69;overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2d1b69 0%,#1e1b4b 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:2px;color:#a78bfa;">
                        🔐 SECURE<span style="color:#c4b5fd;">VAULT</span>
                      </h1>
                      <p style="margin:8px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7c6dab;">
                        Password Reset Request
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94a3b8;">
                        We received a request to reset the password for your SecureVault account. 
                        Use the verification code below to proceed:
                      </p>

                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td align="center">
                            <div style="display:inline-block;background:#1e1b4b;border:2px solid #7c3aed;border-radius:12px;padding:20px 40px;text-align:center;">
                              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7c6dab;">
                                Your One-Time Code
                              </p>
                              <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;color:#a78bfa;font-family:'Courier New',monospace;">
                                ${otp}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                          <td style="background:#1e293b;border-radius:10px;padding:16px 20px;border-left:3px solid #ef4444;">
                            <p style="margin:0;font-size:13px;color:#fca5a5;">
                              ⚠️ &nbsp;This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;font-size:14px;color:#64748b;">
                        If you did not request a password reset, you can safely ignore this email. 
                        Your account remains secure.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
                      <p style="margin:0;font-size:12px;color:#475569;">
                        © ${new Date().getFullYear()} SecureVault &nbsp;·&nbsp; Zero-Trust Security Platform
                      </p>
                      <p style="margin:6px 0 0;font-size:11px;color:#334155;">
                        This is an automated message — please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `SecureVault Password Reset\n\nYour one-time code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nIf you didn't request this, please ignore this email.\n\n© ${new Date().getFullYear()} SecureVault`,
  });
};
