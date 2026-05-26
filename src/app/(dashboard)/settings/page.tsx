"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { User, Bell, Shield, Palette, Check, Lock, Mail, AtSign, Briefcase, Camera, Loader2, CreditCard, Zap, Building2, ArrowRight, CheckCircle2, Download, Eye, EyeOff, Smartphone } from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/contexts/LanguageContext";

const TABS = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal information" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alert preferences" },
  { id: "security", label: "Security", icon: Shield, desc: "Password & 2FA" },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme & colors" },
  { id: "billing", label: "Billing", icon: CreditCard, desc: "Plan & subscription" },
];

const PLAN_DETAILS = {
  free:       { label: "Free",       color: "#4a5568", icon: Shield,    price: "₮0/сар",       projects: "5 projects",    tasks: "Unlimited tasks",   support: "Community support" },
  pro:        { label: "Pro",        color: "#6366f1", icon: Zap,       price: "₮99,000/сар",  projects: "Unlimited",     tasks: "Unlimited tasks",   support: "Priority support" },
  enterprise: { label: "Enterprise", color: "#f59e0b", icon: Building2, price: "₮299,000/сар", projects: "Unlimited",     tasks: "Unlimited tasks",   support: "Dedicated support" },
};

const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      position: "relative", width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: checked ? "linear-gradient(135deg, var(--accent), var(--accent-secondary))" : "rgba(255,255,255,0.1)",
      boxShadow: checked ? "0 0 12px var(--accent-glow)" : "none",
      transition: "all 0.3s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 3, width: 18, height: 18, background: "white", borderRadius: "50%",
        left: checked ? "calc(100% - 21px)" : "3px", transition: "left 0.3s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

function AdminInitCard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleInit = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/init", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMsg(t.adminSuccessMsg(data.user?.email ?? ""));
      } else {
        setStatus("error");
        setMsg(data.error || t.qpayErrorGeneric);
      }
    } catch {
      setStatus("error");
      setMsg("Network error");
    }
  };

  return (
    <div style={{ padding: "20px", borderRadius: 14, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Shield size={16} color="#f59e0b" />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t-text, white)" }}>{t.becomeAdmin}</p>
      </div>
      <p style={{ fontSize: 12, color: "var(--t-text-3, #4a5568)", marginBottom: 14, lineHeight: 1.6 }}>
        {t.becomeAdminDesc}
      </p>
      {msg && (
        <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: status === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${status === "ok" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, fontSize: 12, color: status === "ok" ? "#10b981" : "#ef4444" }}>
          {msg}
        </div>
      )}
      <button
        onClick={handleInit}
        disabled={status === "loading" || status === "ok"}
        style={{ fontSize: 12, fontWeight: 700, padding: "9px 20px", borderRadius: 8, cursor: status === "ok" ? "default" : "pointer", color: "white", background: "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none", opacity: status === "loading" ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
        {status === "loading" ? <><Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> {t.loading}</> : status === "ok" ? t.becameAdmin : t.becomeAdminBtn}
      </button>
    </div>
  );
}

function SettingsInner() {
  const searchParams = useSearchParams();
  const { settings, update } = useSettings();
  const { t } = useLanguage();
  const [tab, setTab] = useState(() => searchParams.get("tab") || "profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true, mentions: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "", email: "", username: "", jobTitle: "", bio: "", image: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Billing state
  const [billing, setBilling] = useState<{ plan: string; planStatus: string; planRequested: string | null; projectCount: number } | null>(null);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [qpay, setQpay] = useState<{ invoiceId: string; qrImage: string; qrText: string; urls: {name:string;link:string}[]; plan: string; amount: number } | null>(null);
  const [qpayStatus, setQpayStatus] = useState<"idle"|"loading"|"pending"|"paid"|"error">("idle");
  const [qpayError, setQpayError] = useState("");

  // Security — password change
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Security — 2FA
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; qrUrl: string; enabled: boolean } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaSuccess, setTwoFaSuccess] = useState("");
  const [twoFaLoaded, setTwoFaLoaded] = useState(false);

  // Load profile (and role) — eagerly on mount, data reused for profile tab
  useEffect(() => {
    if (profileLoaded) return;
    fetch("/api/user/profile")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          jobTitle: data.jobTitle || "",
          bio: data.bio || "",
          image: data.image || "",
        });
        setIsAdmin(data.role === "admin");
        setProfileLoaded(true);
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        setProfileLoaded(true); // prevent infinite retry
      });
  }, [profileLoaded]);

  // Load 2FA info when security tab is opened
  useEffect(() => {
    if (tab === "security" && !twoFaLoaded) {
      fetch("/api/auth/2fa")
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) { setTwoFaSetup(data); setTwoFaLoaded(true); } })
        .catch(() => { setTwoFaLoaded(true); });
    }
  }, [tab, twoFaLoaded]);

  // Load billing info
  useEffect(() => {
    if (tab === "billing" && !billingLoaded) {
      fetch("/api/user/plan")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setBilling({ plan: data.plan, planStatus: data.planStatus, planRequested: data.planRequested, projectCount: data._count?.projects ?? 0 });
          setBillingLoaded(true);
        })
        .catch(() => setBillingLoaded(true));
    }
  }, [tab, billingLoaded]);

  const handleQPay = async (targetPlan: string) => {
    setQpayStatus("loading");
    setQpayError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok) { setQpayError(data.error || t.qpayErrorGeneric); setQpayStatus("error"); return; }
      setQpay({ invoiceId: data.invoiceId, qrImage: data.qrImage, qrText: data.qrText, urls: data.urls || [], plan: data.plan, amount: data.amount });
      setQpayStatus("pending");
    } catch {
      setQpayError(t.networkError); setQpayStatus("error");
    }
  };

  // Poll QPay payment status every 3 s while modal is open
  useEffect(() => {
    if (qpayStatus !== "pending" || !qpay) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/check?invoiceId=${qpay.invoiceId}`);
        const data = await res.json();
        if (data.status === "paid") {
          setQpayStatus("paid");
          setBilling(prev => prev ? { ...prev, plan: qpay.plan, planStatus: "active", planRequested: null } : prev);
          clearInterval(iv);
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(iv);
  }, [qpayStatus, qpay]);

  // Photo upload handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setProfile((p) => ({ ...p, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    setPwError(""); setPwSuccess("");
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError("All fields are required"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match"); return; }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "Failed to change password"); }
      else { setPwSuccess("Password changed successfully!"); setPwForm({ current: "", next: "", confirm: "" }); setTimeout(() => setPwSuccess(""), 4000); }
    } catch { setPwError("Network error"); }
    setPwLoading(false);
  };

  const handle2FAEnable = async () => {
    if (!twoFaCode || twoFaCode.length !== 6) { setTwoFaError("Enter the 6-digit code from your authenticator app"); return; }
    setTwoFaLoading(true); setTwoFaError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) { setTwoFaError(data.error || "Invalid code"); }
      else { setTwoFaSetup(prev => prev ? { ...prev, enabled: true } : prev); setTwoFaCode(""); setTwoFaSuccess("2FA enabled successfully!"); setTimeout(() => setTwoFaSuccess(""), 4000); }
    } catch { setTwoFaError("Network error"); }
    setTwoFaLoading(false);
  };

  const handle2FADisable = async () => {
    if (!twoFaCode || twoFaCode.length !== 6) { setTwoFaError("Enter your 6-digit authenticator code to disable 2FA"); return; }
    setTwoFaLoading(true); setTwoFaError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode }),
      });
      const data = await res.json();
      if (!res.ok) { setTwoFaError(data.error || "Invalid code"); }
      else { setTwoFaSetup(prev => prev ? { ...prev, enabled: false } : prev); setTwoFaCode(""); setTwoFaSuccess("2FA has been disabled."); setTimeout(() => setTwoFaSuccess(""), 4000); }
    } catch { setTwoFaError("Network error"); }
    setTwoFaLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      if (tab === "profile") {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        if (!res.ok) {
          const err = await res.json();
          setSaveError(err.error || "Save failed");
          setSaving(false);
          return;
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Network error");
    }
    setSaving(false);
  };

  const card: React.CSSProperties = { background: "var(--t-card-bg, linear-gradient(135deg, #0d1117 0%, #0f1420 100%))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))", borderRadius: 20 };
  const inputBase: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, background: "var(--t-input-bg, rgba(255,255,255,0.04))", border: "1px solid var(--t-input-border, rgba(255,255,255,0.1))", color: "var(--t-text, white)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "clamp(22px,5.5vw,38px)", fontWeight: 900, letterSpacing: -1, color: "var(--t-text, white)", marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--t-text-3, #4a5568)" }}>Manage your account and preferences</p>
      </div>

      <div className="settings-layout">

        {/* Tab nav */}
        <div style={{ ...card, padding: 10, display: "flex", flexDirection: "column", gap: 4, overflowX: "auto" }}>
          {TABS.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none",
              background: tab === id ? `linear-gradient(135deg, rgba(var(--accent-rgb,99,102,241),0.18), rgba(var(--accent-rgb,99,102,241),0.06))` : "transparent",
              outline: tab === id ? `1px solid rgba(var(--accent-rgb,99,102,241),0.3)` : "1px solid transparent",
              color: tab === id ? "var(--accent, #a5b4fc)" : "var(--t-text-2, #8892b0)", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { if (tab !== id) (e.currentTarget as HTMLButtonElement).style.background = "var(--t-muted-bg, rgba(255,255,255,0.04))"; }}
              onMouseLeave={(e) => { if (tab !== id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: tab === id ? `rgba(var(--accent-rgb,99,102,241),0.2)` : "var(--t-muted-bg, rgba(255,255,255,0.06))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                <Icon size={15} color={tab === id ? "var(--accent)" : "var(--t-text-2, #8892b0)"} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: tab === id ? 600 : 400, lineHeight: 1.2, color: "var(--t-text, white)" }}>{label}</div>
                <div style={{ fontSize: 10, color: "var(--t-text-3, #4a5568)", marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ ...card, padding: "clamp(16px,4vw,32px)" }}>

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--t-text, white)", marginBottom: 4 }}>Profile Settings</h2>
                <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>Changes are saved to your account</p>
              </div>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, borderRadius: 14, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {profile.image ? (
                    <img src={profile.image} alt="Profile" style={{ width: 64, height: 64, borderRadius: 18, objectFit: "cover", boxShadow: "0 0 20px rgba(0,0,0,0.4)" }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, var(--accent), var(--accent-secondary, #8b5cf6))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "white", boxShadow: "0 0 24px var(--accent-glow)" }}>
                      {profile.name ? profile.name[0].toUpperCase() : "Z"}
                    </div>
                  )}
                  {/* Camera overlay */}
                  <button onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", inset: 0, borderRadius: 18, background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = "0"}>
                    <Camera size={18} color="white" />
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t-text, white)", marginBottom: 4 }}>Profile Photo</p>
                  <p style={{ fontSize: 12, color: "var(--t-text-3, #4a5568)", marginBottom: 10 }}>JPG, PNG or GIF. Max 2MB.</p>
                  <button onClick={() => fileInputRef.current?.click()} style={{ fontSize: 12, fontWeight: 600, color: "var(--accent, #a5b4fc)", background: "rgba(var(--accent-rgb,99,102,241),0.1)", border: "1px solid rgba(var(--accent-rgb,99,102,241),0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
                    {profile.image ? "Change photo" : "Upload photo"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                {[
                  { label: "Full Name", key: "name", placeholder: "Your full name", icon: User },
                  { label: "Username", key: "username", placeholder: "@username", icon: AtSign },
                  { label: "Email", key: "email", placeholder: "you@company.com", icon: Mail, type: "email" },
                  { label: "Job Title", key: "jobTitle", placeholder: "e.g. Product Manager", icon: Briefcase },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t-text-2, #8892b0)", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type || "text"} placeholder={placeholder}
                      value={profile[key as keyof typeof profile]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      style={inputBase}
                      onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb,99,102,241),0.12)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "var(--t-input-border, rgba(255,255,255,0.1))"; e.target.style.boxShadow = "none"; }} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t-text-2, #8892b0)", display: "block", marginBottom: 6 }}>Bio</label>
                <textarea placeholder="Tell us about yourself..." rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  style={{ ...inputBase, resize: "none" } as React.CSSProperties}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb,99,102,241),0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--t-input-border, rgba(255,255,255,0.1))"; e.target.style.boxShadow = "none"; }} />
              </div>

              {/* Data Export */}
              <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Download size={15} color="var(--t-text-2, #8892b0)" />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--t-text, white)" }}>Export Your Data</p>
                </div>
                <p style={{ fontSize: 12, color: "var(--t-text-3, #4a5568)", marginBottom: 14 }}>Download all your tasks and projects as a file.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href="/api/export?format=csv" download
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "8px 16px", textDecoration: "none", cursor: "pointer" }}>
                    <Download size={13} /> Export CSV
                  </a>
                  <a href="/api/export?format=json" download
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--accent, #a5b4fc)", background: "rgba(var(--accent-rgb,99,102,241),0.1)", border: "1px solid rgba(var(--accent-rgb,99,102,241),0.3)", borderRadius: 8, padding: "8px 16px", textDecoration: "none", cursor: "pointer" }}>
                    <Download size={13} /> Export JSON
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--t-text, white)", marginBottom: 4 }}>Notification Preferences</h2>
                <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>Choose what alerts you receive</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive task updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "weekly", label: "Weekly Digest", desc: "Summary of your weekly activity" },
                  { key: "mentions", label: "Mentions & Comments", desc: "When someone mentions you" },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 12, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--t-text, white)", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: "var(--t-text-3, #4a5568)" }}>{desc}</p>
                    </div>
                    <Toggle checked={notifications[key as keyof typeof notifications]}
                      onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--t-text, white)", marginBottom: 4 }}>Security Settings</h2>
                <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>Manage your password and two-factor authentication</p>
              </div>

              {/* ── Change Password ── */}
              <div style={{ padding: 22, borderRadius: 16, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock size={15} color="#a5b4fc" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t-text, white)", marginBottom: 1 }}>Change Password</p>
                    <p style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)" }}>Use a strong password with letters and numbers</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {([
                    { key: "current" as const, label: "Current Password", placeholder: "Your current password" },
                    { key: "next" as const, label: "New Password", placeholder: "Min. 8 characters" },
                    { key: "confirm" as const, label: "Confirm New Password", placeholder: "Repeat new password" },
                  ]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t-text-2, #8892b0)", display: "block", marginBottom: 6 }}>{label}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPw[key] ? "text" : "password"}
                          placeholder={placeholder}
                          value={pwForm[key]}
                          onChange={(e) => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                          style={{ ...inputBase, paddingRight: 42 }}
                          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb,99,102,241),0.12)"; }}
                          onBlur={(e) => { e.target.style.borderColor = "var(--t-input-border, rgba(255,255,255,0.1))"; e.target.style.boxShadow = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--t-text-3, #4a5568)", padding: 2, display: "flex" }}>
                          {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pwError && (
                  <div style={{ marginTop: 12, padding: "9px 13px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13, color: "#ef4444" }}>
                    {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ marginTop: 12, padding: "9px 13px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 13, color: "#10b981", display: "flex", alignItems: "center", gap: 7 }}>
                    <Check size={13} /> {pwSuccess}
                  </div>
                )}

                <button
                  onClick={handlePasswordChange}
                  disabled={pwLoading}
                  style={{ marginTop: 16, fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 10, border: "none", cursor: pwLoading ? "not-allowed" : "pointer", color: "white", background: "linear-gradient(135deg, var(--accent, #6366f1), var(--accent-secondary, #8b5cf6))", opacity: pwLoading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {pwLoading ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> Updating...</> : <><Lock size={13} /> Update Password</>}
                </button>
              </div>

              {/* ── Two-Factor Authentication ── */}
              <div style={{ padding: 22, borderRadius: 16, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: twoFaSetup?.enabled ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Smartphone size={15} color={twoFaSetup?.enabled ? "#10b981" : "#f59e0b"} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t-text, white)", marginBottom: 1 }}>Two-Factor Authentication</p>
                      <p style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)" }}>Extra security via authenticator app (TOTP)</p>
                    </div>
                  </div>
                  {twoFaSetup && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: twoFaSetup.enabled ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)", color: twoFaSetup.enabled ? "#10b981" : "#4a5568", border: `1px solid ${twoFaSetup.enabled ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                      {twoFaSetup.enabled ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </div>

                {!twoFaLoaded ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--t-text-3, #4a5568)", fontSize: 13 }}>
                    <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Loading...
                  </div>
                ) : twoFaSetup ? (
                  <>
                    {!twoFaSetup.enabled ? (
                      <>
                        <p style={{ fontSize: 13, color: "var(--t-text-2, #8892b0)", marginBottom: 16, lineHeight: 1.6 }}>
                          Scan the QR code with <strong style={{ color: "var(--t-text, white)" }}>Google Authenticator</strong>, <strong style={{ color: "var(--t-text, white)" }}>Authy</strong>, or any TOTP app, then enter the 6-digit code to enable.
                        </p>

                        {/* QR code */}
                        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
                          <div style={{ padding: 10, background: "white", borderRadius: 12, display: "inline-block", flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={twoFaSetup.qrUrl} alt="2FA QR Code" width={160} height={160} style={{ display: "block", borderRadius: 4 }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t-text-3, #4a5568)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Manual entry key</p>
                            <code style={{ fontSize: 12, background: "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", display: "block", wordBreak: "break-all", color: "#a5b4fc", letterSpacing: 1 }}>
                              {twoFaSetup.secret}
                            </code>
                            <p style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)", marginTop: 8, lineHeight: 1.5 }}>If you can&apos;t scan the QR code, copy this key into your authenticator app.</p>
                          </div>
                        </div>

                        {/* Code input + enable button */}
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t-text-2, #8892b0)", display: "block", marginBottom: 6 }}>Verification Code</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="000000"
                              value={twoFaCode}
                              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                              style={{ ...inputBase, letterSpacing: 6, fontWeight: 700, fontSize: 18, textAlign: "center" }}
                              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb,99,102,241),0.12)"; }}
                              onBlur={(e) => { e.target.style.borderColor = "var(--t-input-border, rgba(255,255,255,0.1))"; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                          <button
                            onClick={handle2FAEnable}
                            disabled={twoFaLoading || twoFaCode.length !== 6}
                            style={{ fontSize: 13, fontWeight: 700, padding: "11px 20px", borderRadius: 10, border: "none", cursor: (twoFaLoading || twoFaCode.length !== 6) ? "not-allowed" : "pointer", color: "white", background: "linear-gradient(135deg, #10b981, #059669)", opacity: (twoFaLoading || twoFaCode.length !== 6) ? 0.6 : 1, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                            {twoFaLoading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                            Enable 2FA
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                          <Check size={14} color="#10b981" />
                          <p style={{ fontSize: 13, color: "#10b981" }}>Your account is protected with two-factor authentication.</p>
                        </div>

                        <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)", marginBottom: 14 }}>
                          To disable 2FA, enter a code from your authenticator app.
                        </p>

                        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t-text-2, #8892b0)", display: "block", marginBottom: 6 }}>Authenticator Code</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="000000"
                              value={twoFaCode}
                              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                              style={{ ...inputBase, letterSpacing: 6, fontWeight: 700, fontSize: 18, textAlign: "center" }}
                              onFocus={(e) => { e.target.style.borderColor = "#ef4444"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)"; }}
                              onBlur={(e) => { e.target.style.borderColor = "var(--t-input-border, rgba(255,255,255,0.1))"; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                          <button
                            onClick={handle2FADisable}
                            disabled={twoFaLoading || twoFaCode.length !== 6}
                            style={{ fontSize: 13, fontWeight: 700, padding: "11px 20px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", cursor: (twoFaLoading || twoFaCode.length !== 6) ? "not-allowed" : "pointer", color: "#ef4444", background: "rgba(239,68,68,0.08)", opacity: (twoFaLoading || twoFaCode.length !== 6) ? 0.6 : 1, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                            {twoFaLoading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Shield size={13} />}
                            Disable 2FA
                          </button>
                        </div>
                      </>
                    )}

                    {twoFaError && (
                      <div style={{ marginTop: 12, padding: "9px 13px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13, color: "#ef4444" }}>
                        {twoFaError}
                      </div>
                    )}
                    {twoFaSuccess && (
                      <div style={{ marginTop: 12, padding: "9px 13px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 13, color: "#10b981", display: "flex", alignItems: "center", gap: 7 }}>
                        <Check size={13} /> {twoFaSuccess}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>Could not load 2FA settings. Please refresh the page.</p>
                )}
              </div>

              {/* Admin init — only visible to the admin account */}
              {isAdmin && <AdminInitCard />}
            </div>
          )}

          {/* ── APPEARANCE TAB ── */}
          {tab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--t-text, white)", marginBottom: 4 }}>Appearance</h2>
                <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>Customize your visual experience</p>
              </div>

              {/* Accent color */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t-text-2, #8892b0)", marginBottom: 4 }}>Accent Color</p>
                <p style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)", marginBottom: 14 }}>Updates buttons, highlights and glow effects instantly</p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {ACCENT_COLORS.map((c) => {
                    const active = settings.accentColor === c.value;
                    return (
                      <button key={c.value} onClick={() => update({ accentColor: c.value })} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 14, background: c.value, boxShadow: active ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 28px ${c.value}90` : "none", transform: active ? "scale(1.18)" : "scale(1)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {active && <Check size={18} color="white" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 11, color: active ? c.value : "var(--t-text-2, #8892b0)", fontWeight: active ? 700 : 400, transition: "color 0.2s" }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live preview */}
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--t-text-2, #8892b0)" }}>Preview:</span>
                <button className="btn-primary" style={{ fontSize: 12, padding: "8px 18px", borderRadius: 10 }}>Sample Button</button>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" }} />
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, fontFamily: "monospace" }}>{settings.accentColor}</span>
              </div>

              {/* Theme */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t-text-2, #8892b0)", marginBottom: 14 }}>Theme</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {([{ key: "Dark" as const, emoji: "🌑", desc: "Easy on the eyes" }, { key: "Light" as const, emoji: "☀️", desc: "Clean & bright" }, { key: "System" as const, emoji: "💻", desc: "Follows OS" }]).map(({ key, emoji, desc }) => {
                    const active = settings.theme === key;
                    return (
                      <button key={key} onClick={() => update({ theme: key })} style={{
                        padding: "16px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: active ? `rgba(var(--accent-rgb,99,102,241),0.12)` : "var(--t-muted-bg, rgba(255,255,255,0.03))",
                        border: `1px solid ${active ? "rgba(var(--accent-rgb,99,102,241),0.4)" : "var(--t-card-border, rgba(255,255,255,0.07))"}`,
                        color: active ? "var(--accent)" : "var(--t-text-2, #8892b0)", transition: "all 0.2s",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      }}>
                        <span style={{ fontSize: 20 }}>{emoji}</span>
                        <span>{key}</span>
                        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t-text-2, #8892b0)", marginBottom: 4 }}>Sidebar Density</p>
                <p style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)", marginBottom: 14 }}>Controls spacing between sidebar items</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {(["Compact", "Default", "Comfortable"] as const).map((d) => {
                    const active = settings.density === d;
                    return (
                      <button key={d} onClick={() => update({ density: d })} style={{
                        padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: active ? `rgba(var(--accent-rgb,99,102,241),0.12)` : "var(--t-muted-bg, rgba(255,255,255,0.03))",
                        border: `1px solid ${active ? "rgba(var(--accent-rgb,99,102,241),0.4)" : "var(--t-card-border, rgba(255,255,255,0.07))"}`,
                        color: active ? "var(--accent)" : "var(--t-text-2, #8892b0)", transition: "all 0.2s",
                      }}>{d}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING TAB ── */}
          {tab === "billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--t-text, white)", marginBottom: 4 }}>{t.planBilling}</h2>
                <p style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>{t.manageSubscription}</p>
              </div>

              {!billingLoaded ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--t-text-3, #4a5568)", padding: "24px 0" }}>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  {t.loadingBilling}
                </div>
              ) : billing ? (() => {
                const plan = billing.plan as keyof typeof PLAN_DETAILS;
                const info = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
                const PlanIcon = info.icon;
                const isPending = billing.planStatus === "pending";
                const projectLimit = plan === "free" ? 5 : Infinity;

                return (
                  <>
                    {/* Current plan card */}
                    <div style={{ padding: 24, borderRadius: 16, background: `${info.color}08`, border: `1px solid ${info.color}30`, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${info.color}20 0%, transparent 70%)` }} />
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${info.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <PlanIcon size={18} color={info.color} />
                            </div>
                            <div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--t-text, white)" }}>{t.currentPlan(info.label)}</div>
                              <div style={{ fontSize: 12, color: info.color, fontWeight: 600 }}>{info.price}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 20 }}>
                            {[info.projects, info.tasks, info.support].map(f => (
                              <div key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--t-text-3, #8892b0)" }}>
                                <CheckCircle2 size={11} color={info.color} />{f}
                              </div>
                            ))}
                          </div>
                        </div>
                        {isPending && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", padding: "4px 10px", borderRadius: 8 }}>
                            {t.upgradePending}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Usage */}
                    <div style={{ padding: 20, borderRadius: 14, background: "var(--t-muted-bg, rgba(255,255,255,0.03))", border: "1px solid var(--t-card-border, rgba(255,255,255,0.07))" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t-text, white)", marginBottom: 14 }}>{t.usageLabel}</div>
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--t-text-2, #8892b0)", marginBottom: 8 }}>
                          <span>Projects</span>
                          <span style={{ color: billing.projectCount >= (projectLimit === Infinity ? 999 : projectLimit) ? "#ef4444" : "var(--t-text-2, #8892b0)" }}>
                            {billing.projectCount} / {projectLimit === Infinity ? "∞" : projectLimit}
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            background: billing.projectCount >= (projectLimit === Infinity ? 999 : projectLimit)
                              ? "#ef4444"
                              : `linear-gradient(90deg, ${info.color}, ${info.color}aa)`,
                            width: `${projectLimit === Infinity ? 20 : Math.min(100, (billing.projectCount / projectLimit) * 100)}%`,
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)", marginTop: 8 }}>{t.tasksUnlimited}</div>
                    </div>

                    {/* QPay upgrade options */}
                    {plan !== "enterprise" && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t-text, white)", marginBottom: -8 }}>
                          {t.payMonthly}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: plan === "free" ? "1fr 1fr" : "1fr", gap: 14 }}>
                          {(plan === "free" ? ["pro", "enterprise"] as const : ["enterprise"] as const).map(targetPlan => {
                            const planInfo = PLAN_DETAILS[targetPlan];
                            const TIcon = planInfo.icon;
                            const rawPrices: Record<string,string> = { pro: "$29", enterprise: "$99" };
                            const isLoading = qpayStatus === "loading";
                            return (
                              <div key={targetPlan} style={{ padding: 20, borderRadius: 14, background: "var(--t-muted-bg, rgba(255,255,255,0.02))", border: `1px solid ${planInfo.color}30` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                  <TIcon size={15} color={planInfo.color} />
                                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--t-text, white)" }}>{planInfo.label}</span>
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: planInfo.color, marginBottom: 10 }}>{t.pricePerMonth(rawPrices[targetPlan])}</div>
                                <div style={{ fontSize: 11, color: "var(--t-text-3, #4a5568)", marginBottom: 14, lineHeight: 1.7 }}>
                                  {planInfo.projects} · {planInfo.tasks} · {planInfo.support}
                                </div>
                                <button onClick={() => handleQPay(targetPlan)} disabled={isLoading}
                                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, color: "white", background: "linear-gradient(135deg, #1a56db, #0e9f6e)", opacity: isLoading ? 0.7 : 1, boxShadow: "0 0 20px rgba(26,86,219,0.3)" }}>
                                  {isLoading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <span style={{ fontSize: 15 }}>📱</span>}
                                  {isLoading ? t.processingQpay : t.payWithQpay}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {qpayError && (
                      <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13, color: "#ef4444" }}>{qpayError}</div>
                    )}

                    {plan === "enterprise" && (
                      <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 13, color: "#f59e0b" }}>
                        {t.enterpriseActive}
                      </div>
                    )}

                    {/* QPay QR Modal */}
                    {qpay && qpayStatus !== "idle" && qpayStatus !== "error" && (
                      <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={() => { if (qpayStatus !== "pending") { setQpay(null); setQpayStatus("idle"); } }}>
                        <div onClick={e => e.stopPropagation()} style={{ width: 400, borderRadius: 24, background: "linear-gradient(135deg, #0d1117, #0f1420)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", padding: 32, textAlign: "center" }}>

                          {qpayStatus === "paid" ? (
                            <>
                              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✅</div>
                              <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 8 }}>{t.qpaySuccess}</div>
                              <div style={{ fontSize: 14, color: "#10b981", marginBottom: 24 }}>
                                {t.planActivated(PLAN_DETAILS[qpay.plan as keyof typeof PLAN_DETAILS]?.label ?? "")}
                              </div>
                              <button onClick={() => { setQpay(null); setQpayStatus("idle"); setBillingLoaded(false); }}
                                style={{ padding: "11px 32px", borderRadius: 12, background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                                {t.close}
                              </button>
                            </>
                          ) : (
                            <>
                              {/* QPay header */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
                                <div style={{ fontSize: 20, fontWeight: 900, color: "#1a56db" }}>QPay</div>
                                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
                                <div style={{ fontSize: 13, color: "#8892b0" }}>{PLAN_DETAILS[qpay.plan as keyof typeof PLAN_DETAILS]?.label}</div>
                              </div>
                              <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 20 }}>
                                ${qpay.amount.toLocaleString()}
                              </div>

                              {/* QR code */}
                              {qpay.qrImage ? (
                                <div style={{ display: "inline-block", padding: 12, background: "white", borderRadius: 16, marginBottom: 20 }}>
                                  <img src={`data:image/png;base64,${qpay.qrImage}`} alt="QPay QR" style={{ width: 200, height: 200, display: "block" }} />
                                </div>
                              ) : (
                                <div style={{ width: 224, height: 224, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 12, color: "#4a5568" }}>
                                  QR code
                                </div>
                              )}

                              {/* Status */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#8892b0" }}>
                                <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite", color: "#1a56db" }} />
                                {t.waitingPayment}
                              </div>

                              {/* Bank app deep links */}
                              {qpay.urls && qpay.urls.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                  <div style={{ fontSize: 11, color: "#2a3a60", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{t.bankApp}</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                                    {qpay.urls.slice(0, 6).map(u => (
                                      <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                                        style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(26,86,219,0.1)", border: "1px solid rgba(26,86,219,0.25)", fontSize: 11, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
                                        {u.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div style={{ fontSize: 11, color: "#2a3a60" }}>
                                {t.qpayScanHint}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })() : (
                <div style={{ fontSize: 13, color: "var(--t-text-3, #4a5568)" }}>{t.couldNotLoadBilling}</div>
              )}
            </div>
          )}

          {/* Error message */}
          {saveError && (
            <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: 13, color: "#ef4444" }}>
              {saveError}
            </div>
          )}

          {/* Save button — hidden on billing and security tabs */}
          {tab !== "billing" && tab !== "security" && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--t-section-border, rgba(255,255,255,0.05))" }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{
              fontSize: 14, padding: "11px 28px", borderRadius: 12, justifyContent: "center", opacity: saving ? 0.7 : 1,
              ...(saved ? { background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.4)", border: "1px solid rgba(16,185,129,0.5)" } : {}),
            }}>
              {saving ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Saving...</>
                : saved ? <><Check size={15} /> Saved!</>
                  : "Save Changes"}
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#4a5568" }}>Loading...</div>}>
      <SettingsInner />
    </Suspense>
  );
}
