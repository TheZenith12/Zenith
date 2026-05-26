/**
 * Email utility — uses nodemailer.
 * Configure SMTP via env vars. If not configured, logs the email to console
 * (useful for local dev without an email server).
 *
 * Required env vars for real email:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: { user, pass },
  });
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions): Promise<boolean> {
  const from = process.env.SMTP_FROM || "Zenith <noreply@zenith.app>";
  const transporter = getTransporter();

  if (!transporter) {
    // Dev fallback: print to console so the dev can test flows without SMTP
    console.log("\n─── [EMAIL — not sent, no SMTP configured] ─────────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${html.replace(/<[^>]+>/g, "").trim().slice(0, 300)}`);
    console.log("─────────────────────────────────────────────────────────────\n");
    return true;
  }

  try {
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

// ── Email templates ────────────────────────────────────────────────────────

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; background: #080b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
    .card { background: linear-gradient(135deg, #0d1117, #0f1420); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 20px; font-weight: 800; color: white; }
    h1 { font-size: 24px; font-weight: 900; color: white; margin: 0 0 8px; }
    p { font-size: 15px; color: #8892b0; line-height: 1.6; margin: 0 0 20px; }
    .btn { display: inline-block; padding: 14px 28px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-weight: 700; font-size: 15px; text-decoration: none; }
    .footer { margin-top: 32px; font-size: 12px; color: #4a5568; text-align: center; }
    .code { font-size: 36px; font-weight: 900; color: #a5b4fc; letter-spacing: 8px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; margin: 24px 0; display: block; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">✦</div>
        <span class="logo-text">Zenith</span>
      </div>
      ${content}
    </div>
    <div class="footer">© 2026 Zenith Inc. · You received this because you signed up at zenith.app</div>
  </div>
</body>
</html>
`;

export function verificationEmail(name: string, verifyUrl: string) {
  return {
    subject: "Verify your Zenith email",
    html: base(`
      <h1>Verify your email</h1>
      <p>Hi ${name}, thanks for signing up! Click below to verify your email address and activate your account.</p>
      <a href="${verifyUrl}" class="btn">Verify Email →</a>
      <p style="margin-top:20px;font-size:13px;color:#4a5568">Link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
    `),
  };
}

export function passwordChangedEmail(name: string) {
  return {
    subject: "Your Zenith password was changed",
    html: base(`
      <h1>Password changed</h1>
      <p>Hi ${name}, your Zenith account password was just changed.</p>
      <p>If this was you, no action is needed. If you didn't make this change, <a href="mailto:support@zenith.app" style="color:#a5b4fc">contact support immediately</a>.</p>
    `),
  };
}

export function twoFactorSetupEmail(name: string) {
  return {
    subject: "Two-factor authentication enabled on Zenith",
    html: base(`
      <h1>2FA enabled</h1>
      <p>Hi ${name}, two-factor authentication has been enabled on your Zenith account.</p>
      <p>You'll now need your authenticator app every time you sign in. If you didn't do this, <a href="mailto:support@zenith.app" style="color:#a5b4fc">contact support immediately</a>.</p>
    `),
  };
}
