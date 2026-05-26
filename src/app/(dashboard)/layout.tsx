"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { SettingsProvider } from "@/lib/settings-context";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Sparkles, Menu, X, Mail } from "lucide-react";
import Link from "next/link";

function getPageTitle(pathname: string) {
  const last = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const map: Record<string, string> = {
    dashboard: 'Overview', tasks: 'Tasks', projects: 'Projects',
    calendar: 'Calendar', analytics: 'Analytics', settings: 'Settings',
    team: 'Team', reports: 'Reports',
  };
  return map[last] || last.charAt(0).toUpperCase() + last.slice(1);
}

function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; emailVerified?: boolean } }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifyBanner, setVerifyBanner] = useState(!user.emailVerified);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="dash-shell" style={{ background: "var(--t-app-bg, #080b14)" }}>
      {/* Sidebar */}
      <div className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay for mobile */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <main className="dash-main">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(99,102,241,0.55)" }}>
              <Sparkles size={15} color="white" />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: -0.3 }}>Zenith</span>
          </Link>
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", pointerEvents: "none", letterSpacing: 0.1 }}>
            {getPageTitle(pathname)}
          </span>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", boxShadow: "0 2px 10px rgba(99,102,241,0.15),inset 0 1px 0 rgba(255,255,255,0.08)" }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Background pattern */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Email verification banner */}
        {verifyBanner && (
          <div style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))", borderBottom: "1px solid rgba(245,158,11,0.25)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mail size={15} color="#f59e0b" />
              <p style={{ fontSize: 13, color: "#f59e0b", fontWeight: 500 }}>
                Please verify your email address to secure your account.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={async () => {
                  if (resending || resent) return;
                  setResending(true);
                  try {
                    await fetch("/api/auth/verify", { method: "POST" });
                    setResent(true);
                    setTimeout(() => setResent(false), 10000);
                  } catch { /* silent */ }
                  setResending(false);
                }}
                disabled={resending || resent}
                style={{ fontSize: 12, fontWeight: 700, color: resent ? "#10b981" : "#f59e0b", background: resent ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.12)", border: `1px solid ${resent ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`, borderRadius: 8, padding: "5px 14px", cursor: "pointer" }}>
                {resent ? "✓ Email sent!" : resending ? "Sending..." : "Resend email"}
              </button>
              <button onClick={() => setVerifyBanner(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", display: "flex", padding: 2 }}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; emailVerified?: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.ok ? r.json() : null;
      })
      .then(d => { if (d) setUser({ name: d.name || "User", email: d.email || "", emailVerified: !!d.emailVerified }); });
  }, [router]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <SettingsProvider>
        <DashboardShell user={user}>{children}</DashboardShell>
      </SettingsProvider>
    </LanguageProvider>
  );
}
