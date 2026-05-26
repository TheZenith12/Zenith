/**
 * TOTP (Time-based One-Time Password) — RFC 6238
 * Pure Node.js implementation using the built-in crypto module.
 * No external dependencies needed.
 */

import { createHmac, randomBytes } from "crypto";

// ── Base32 codec ───────────────────────────────────────────────────────────

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0, val = 0, out = "";
  for (let i = 0; i < buf.length; i++) {
    val = (val << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_CHARS[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_CHARS[(val << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str: string): Buffer {
  str = str.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  const bytes: number[] = [];
  let bits = 0, val = 0;
  for (const ch of str) {
    const idx = BASE32_CHARS.indexOf(ch);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// ── HOTP (counter-based) ───────────────────────────────────────────────────

function hotp(keyBuf: Buffer, counter: number, digits = 6): string {
  // Encode counter as 8-byte big-endian
  const ctrBuf = Buffer.alloc(8);
  ctrBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  ctrBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac("sha1", keyBuf).update(ctrBuf).digest();

  // Dynamic truncation
  const offset = hmac[19] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % Math.pow(10, digits)).padStart(digits, "0");
}

// ── TOTP (time-based) ──────────────────────────────────────────────────────

const STEP = 30; // seconds per window

/**
 * Generate the current TOTP code for a base32-encoded secret.
 */
export function generateTotp(secret: string): string {
  const keyBuf = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / STEP);
  return hotp(keyBuf, counter);
}

/**
 * Verify a TOTP code against a secret.
 * Accepts ±1 window to tolerate clock skew.
 */
export function verifyTotp(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const keyBuf = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / STEP);
  for (const delta of [-1, 0, 1]) {
    if (hotp(keyBuf, counter + delta) === code) return true;
  }
  return false;
}

/**
 * Generate a new random TOTP secret (20 bytes → 32-char base32 string).
 */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/**
 * Build the otpauth:// URI used by authenticator apps (Google Authenticator, Authy, etc.)
 */
export function totpUri(email: string, secret: string, issuer = "Zenith"): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: String(STEP),
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params}`;
}

/**
 * Returns a URL for a QR code image of the given otpauth URI.
 * Uses the free qrserver.com API (no package needed).
 */
export function totpQrUrl(uri: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(uri)}`;
}
