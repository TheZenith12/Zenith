"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, TrendingUp, Clock, Smartphone, ShieldCheck } from "lucide-react";

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

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google"|"github"|null>(null);
  const [error, setError] = useState("");

  // 2FA step
  const [twoFaStep, setTwoFaStep] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, []);

  const handleOAuth = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `/api/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // 2FA required — show code step
      if (data.requires2fa && data.pendingToken) {
        setPendingToken(data.pendingToken);
        setTwoFaStep(true);
        setLoading(false);
        return;
      }
      router.push(data.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
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
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", top: -100, left: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", bottom: 0, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 2, padding: "36px 44px 0" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(99,102,241,0.45)" }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>Zenith</span>
          </Link>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, position: "relative", zIndex: 2, padding: "0 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase" }}>Welcome back</span>
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            <span style={{ color: "white" }}>Let&apos;s get</span><br />
            <span style={{ color: "white" }}>back to </span>
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>work.</span>
          </h2>
          <p style={{ fontSize: 15, color: "#8892b0", lineHeight: 1.7, marginBottom: 40, maxWidth: 320 }}>
            Your tasks, projects, and team are waiting. Sign in to pick up right where you left off.
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
            {[
              { value: "50K+", label: "Active teams", color: "#6366f1" },
              { value: "2.5M+", label: "Tasks done", color: "#10b981" },
              { value: "99.9%", label: "Uptime SLA", color: "#f59e0b" },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540", borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 11, color: "#4a5568" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4a5568", textTransform: "uppercase", marginBottom: 16 }}>Recent Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: CheckCircle2, text: "Sprint #12 completed", time: "2h ago", color: "#10b981" },
                { icon: TrendingUp, text: "Analytics report ready", time: "4h ago", color: "#6366f1" },
                { icon: Clock, text: "3 tasks due tomorrow", time: "Today", color: "#f59e0b" },
              ].map(({ icon: Icon, text, time, color }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon size={13} color={color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: "#c7d2fe" }}>{text}</span>
                  <span style={{ fontSize: 11, color: "#4a5568" }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 44px 32px" }}>
          <p style={{ fontSize: 11, color: "#4a5568" }}>
            © 2026 Zenith Inc. ·{" "}
            <a href="#" style={{ color: "#4a5568", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "white")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}>Privacy</a>
            {" · "}
            <a href="#" style={{ color: "#4a5568", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "white")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}>Terms</a>
          </p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="auth-right">
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", top: "5%", right: "5%", pointerEvents: "none" }} />

        {/* Mobile-only top bar */}
        <div className="auth-mobile-top">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.5)" }}>
              <Sparkles size={15} color="white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: -0.3 }}>Zenith</span>
          </Link>
          <Link href="/register" style={{ fontSize: 13, color: "#a5b4fc", textDecoration: "none", fontWeight: 600, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 20, padding: "5px 14px" }}>
            Sign up free →
          </Link>
        </div>

        <div className="auth-form-wrap">
          {/* ══ 2FA CODE STEP ══ */}
          {twoFaStep ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Smartphone size={28} color="#a5b4fc" />
                </div>
                <h1 style={{ fontSize: "clamp(22px,5vw,28px)", fontWeight: 900, color: "white", marginBottom: 8, letterSpacing: -0.5 }}>Two-Factor Auth</h1>
                <p style={{ fontSize: 14, color: "#8892b0", lineHeight: 1.6 }}>Open your authenticator app and enter the 6-digit code for your Zenith account.</p>
              </div>

              {error && (
                <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 14 }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleTwoFaSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 8 }}>Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d4a", color: "white", fontSize: 28, fontWeight: 800, letterSpacing: 12, outline: "none", boxSizing: "border-box", textAlign: "center", transition: "all 0.2s" }}
                    onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#1e2d4a"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <button type="submit" disabled={loading || twoFaCode.length !== 6} className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", opacity: (loading || twoFaCode.length !== 6) ? 0.6 : 1, cursor: (loading || twoFaCode.length !== 6) ? "not-allowed" : "pointer" }}>
                  {loading
                    ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</>
                    : <><ShieldCheck size={17} /> Verify & Sign in</>}
                </button>

                <button type="button" onClick={() => { setTwoFaStep(false); setPendingToken(""); setTwoFaCode(""); setError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#8892b0", fontSize: 13, textAlign: "center" }}>
                  ← Back to login
                </button>
              </form>
            </>
          ) : (
          <>
          {/* Mobile-only welcome badge */}
          <div className="auth-mobile-badge">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 999, padding: "5px 14px", fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>
              <Sparkles size={10} /> Welcome back to Zenith
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 900, color: "white", marginBottom: 8, letterSpacing: -0.5 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: "#8892b0" }}>Enter your credentials to continue.</p>
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 8 }}>Email address</label>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#8892b0" }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d4a", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; e.target.style.background = "rgba(99,102,241,0.05)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#1e2d4a"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a5568", display: "flex", padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading
                ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
                : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1a2540" }} />
            <span style={{ fontSize: 12, color: "#4a5568" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#1a2540" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
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

          <p style={{ fontSize: 14, textAlign: "center", color: "#8892b0" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>Sign up free →</Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
