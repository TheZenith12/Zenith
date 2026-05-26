"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2, Check, Zap, Shield, BarChart3, Users } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

const PERKS = [
  { icon: Zap, text: "10x faster task management", color: "#f59e0b" },
  { icon: Shield, text: "Enterprise-grade security", color: "#10b981" },
  { icon: BarChart3, text: "Real-time analytics & insights", color: "#6366f1" },
  { icon: Users, text: "Unlimited team collaboration", color: "#ec4899" },
];

const AVATARS = [
  { letter: "S", color: "#6366f1" },
  { letter: "M", color: "#8b5cf6" },
  { letter: "A", color: "#ec4899" },
  { letter: "J", color: "#06b6d4" },
  { letter: "K", color: "#10b981" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google"|"github"|null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, []);

  const handleOAuth = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `/api/auth/${provider}`;
  };

  const pwLen = form.password.length;
  const strength: "strong" | "good" | "weak" | "" = pwLen >= 12 ? "strong" : pwLen >= 8 ? "good" : pwLen >= 4 ? "weak" : "";
  const strengthColor = strength ? { strong: "#10b981", good: "#f59e0b", weak: "#ef4444" }[strength] : "#1a2540";
  const strengthLabel = strength ? { strong: "Strong", good: "Good", weak: "Weak" }[strength] : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">

      {/* ══ LEFT PANEL (desktop only) ══ */}
      <div className="auth-left" style={{
        background: "linear-gradient(160deg, #0c0f1e 0%, #0f1428 40%, #0a0d1c 100%)",
        borderRight: "1px solid #1a2540",
      }}>
        {/* Background effects */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", top: -120, left: -120, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", bottom: 50, right: -80, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

        {/* Top: Logo */}
        <div style={{ position: "relative", zIndex: 2, padding: "36px 44px 0" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(99,102,241,0.45)" }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>Zenith</span>
          </Link>
        </div>

        {/* Middle: Content */}
        <div style={{ flex: 1, position: "relative", zIndex: 2, padding: "0 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase" }}>Get started free</span>
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            <span style={{ color: "white" }}>Join the future</span><br />
            <span style={{ color: "white" }}>of </span>
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>productivity.</span>
          </h2>
          <p style={{ fontSize: 15, color: "#8892b0", lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
            Thousands of high-performing teams trust Zenith to manage their work and ship great things faster.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
            {PERKS.map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 14, color: "#c7d2fe", fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540", borderRadius: 14 }}>
            <div style={{ display: "flex" }}>
              {AVATARS.map(({ letter, color }, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", marginLeft: i === 0 ? 0 : -8, border: "2px solid #0c0f1e" }}>
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>50,000+ teams</div>
              <div style={{ fontSize: 12, color: "#4a5568" }}>already on Zenith</div>
            </div>
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 44px 40px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
            </div>
            <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.65, marginBottom: 14, fontStyle: "italic" }}>
              &ldquo;Zenith cut our project delivery time in half. It&apos;s the only tool our team actually enjoys using.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>S</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Sarah Chen</div>
                <div style={{ fontSize: 11, color: "#4a5568" }}>CTO, DataFlow Inc.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="auth-right">
        {/* Subtle bg glow */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", top: "10%", right: "10%", pointerEvents: "none" }} />

        {/* Mobile-only top bar */}
        <div className="auth-mobile-top">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.5)" }}>
              <Sparkles size={15} color="white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: -0.3 }}>Zenith</span>
          </Link>
          <Link href="/login" style={{ fontSize: 13, color: "#a5b4fc", textDecoration: "none", fontWeight: 600, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 20, padding: "5px 14px" }}>
            Sign in →
          </Link>
        </div>

        <div className="auth-form-wrap">
          {/* Mobile-only tagline badge */}
          <div className="auth-mobile-badge">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 999, padding: "5px 14px", fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>
              <Sparkles size={10} /> Free forever · No card needed
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 900, color: "white", marginBottom: 8, letterSpacing: -0.5 }}>Create account</h1>
            <p style={{ fontSize: 14, color: "#8892b0" }}>Start your free journey today — no card needed.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 8 }}>Full name</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Johnson"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d4a", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; e.target.style.background = "rgba(99,102,241,0.05)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e2d4a"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 8 }}>Work email</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d4a", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; e.target.style.background = "rgba(99,102,241,0.05)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e2d4a"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required value={form.password} minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d4a", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; e.target.style.background = "rgba(99,102,241,0.05)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#1e2d4a"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a5568", display: "flex", padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {["weak", "good", "strong"].map((lvl, i) => {
                      const filled = ["weak", "good", "strong"].indexOf(strength) >= i;
                      return <div key={lvl} style={{ flex: 1, height: 3, borderRadius: 2, background: filled ? strengthColor : "#1a2540", transition: "background 0.3s" }} />;
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel} password</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading
                ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
                : <><Sparkles size={17} /> Create free account <ArrowRight size={17} /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1a2540" }} />
            <span style={{ fontSize: 12, color: "#4a5568" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#1a2540" }} />
          </div>

          {/* Social */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading} className="btn-secondary"
              style={{ justifyContent: "center", fontSize: 14, padding: "11px 16px", borderRadius: 12, gap: 8, opacity: oauthLoading ? 0.7 : 1, cursor: oauthLoading ? "not-allowed" : "pointer" }}>
              {oauthLoading === "google" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <GoogleIcon />}
              Google
            </button>
            <button onClick={() => handleOAuth("github")} disabled={!!oauthLoading} className="btn-secondary"
              style={{ justifyContent: "center", fontSize: 14, padding: "11px 16px", borderRadius: 12, gap: 8, opacity: oauthLoading ? 0.7 : 1, cursor: oauthLoading ? "not-allowed" : "pointer" }}>
              {oauthLoading === "github" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <GitHubIcon />}
              GitHub
            </button>
          </div>

          {/* Footer links */}
          <p style={{ fontSize: 12, textAlign: "center", color: "#4a5568", marginBottom: 14 }}>
            By signing up, you agree to our{" "}
            <a href="#" style={{ color: "#818cf8", textDecoration: "none" }}>Terms</a> and{" "}
            <a href="#" style={{ color: "#818cf8", textDecoration: "none" }}>Privacy Policy</a>
          </p>
          <p style={{ fontSize: 14, textAlign: "center", color: "#8892b0" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>Sign in →</Link>
          </p>

          {/* Mini perks */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 16px", marginTop: 20 }}>
            {["Free forever", "No card needed", "2 min setup"].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4a5568" }}>
                <Check size={10} color="#6366f1" /> {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
