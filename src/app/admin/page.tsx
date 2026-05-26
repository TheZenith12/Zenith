"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, Clock, CheckCircle2, XCircle, Shield, Zap, Building2, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

interface User {
  id: string; name: string | null; email: string;
  role: string; plan: string; planStatus: string;
  planRequested: string | null; planRequestedAt: string | null;
  createdAt: string;
  _count: { tasks: number; projects: number };
}

const PLAN_COLOR: Record<string, string> = { free: "#4a5568", pro: "#6366f1", enterprise: "#f59e0b" };
const PLAN_BG: Record<string, string> = { free: "rgba(74,85,104,0.15)", pro: "rgba(99,102,241,0.15)", enterprise: "rgba(245,158,11,0.15)" };
const PLAN_ICON: Record<string, typeof Zap> = { free: Shield, pro: Zap, enterprise: Building2 };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.status === 403) { setError("Access denied — admin only"); setLoading(false); return; }
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handlePlan = async (userId: string, action: "approve" | "reject" | "set", plan?: string) => {
    setActionLoading(userId + action);
    await fetch("/api/admin/users/plan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, plan }),
    });
    await fetchUsers();
    setActionLoading(null);
  };

  const stats = {
    total: users.length,
    free: users.filter((u) => u.plan === "free").length,
    pro: users.filter((u) => u.plan === "pro").length,
    enterprise: users.filter((u) => u.plan === "enterprise").length,
    pending: users.filter((u) => u.planStatus === "pending").length,
  };

  const allDisplayed = tab === "pending" ? users.filter((u) => u.planStatus === "pending") : users;
  const totalPages = Math.max(1, Math.ceil(allDisplayed.length / PAGE_SIZE));
  const displayed = allDisplayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const card: React.CSSProperties = { background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Shield size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#ef4444", fontSize: 20, fontWeight: 700 }}>{error}</p>
        <button onClick={() => router.push("/dashboard")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "#6366f1", border: "none", color: "white", cursor: "pointer" }}>← Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", padding: "clamp(16px, 3vw, 40px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
              <ArrowLeft size={14} /> Dashboard
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Crown size={18} color="white" />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: -0.5 }}>Admin Panel</h1>
              </div>
              <p style={{ fontSize: 13, color: "#4a5568", marginTop: 2 }}>Manage users, plans and subscriptions</p>
            </div>
          </div>
          <button onClick={fetchUsers} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8892b0", cursor: "pointer", fontSize: 13 }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid-5" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Users", value: stats.total, color: "#6366f1", icon: Users },
            { label: "Free Plan", value: stats.free, color: "#4a5568", icon: Shield },
            { label: "Pro Plan", value: stats.pro, color: "#6366f1", icon: Zap },
            { label: "Enterprise", value: stats.enterprise, color: "#f59e0b", icon: Building2 },
            { label: "Pending", value: stats.pending, color: "#ef4444", icon: Clock },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ ...card, padding: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={14} color={color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: -1 }}>{value}</div>
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Pending banner */}
        {stats.pending > 0 && (
          <div style={{ marginBottom: 20, padding: "14px 20px", borderRadius: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Clock size={16} color="#f59e0b" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{stats.pending} upgrade request{stats.pending > 1 ? "s" : ""} waiting for approval</span>
            </div>
            <button onClick={() => setTab("pending")} style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
              Review now →
            </button>
          </div>
        )}

        {/* Tab filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "all" as const, label: `All Users (${stats.total})` }, { key: "pending" as const, label: `Pending (${stats.pending})` }].map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setPage(1); }} style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: tab === key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${tab === key ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: tab === key ? "#a5b4fc" : "#8892b0",
            }}>{label}</button>
          ))}
        </div>

        {/* Users table */}
        <div style={{ ...card, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 80px 140px 180px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {["User", "Plan", "Projects", "Tasks", "Joined", "Actions"].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12 }}>
              <Loader2 size={20} color="#6366f1" style={{ animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#4a5568" }}>Loading users...</span>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#4a5568" }}>
              <Users size={36} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
              <p>{tab === "pending" ? "No pending upgrade requests" : "No users found"}</p>
            </div>
          ) : displayed.map((u, i) => {
            const PlanIcon = PLAN_ICON[u.plan] || Shield;
            const isLoading = actionLoading?.startsWith(u.id);
            return (
              <div key={u.id} style={{
                display: "grid", gridTemplateColumns: "1fr 120px 80px 80px 140px 180px", gap: 12,
                padding: "14px 20px", alignItems: "center",
                borderBottom: i < displayed.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: u.planStatus === "pending" ? "rgba(245,158,11,0.03)" : "transparent",
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => { if (u.planStatus !== "pending") (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = u.planStatus === "pending" ? "rgba(245,158,11,0.03)" : "transparent"; }}>

                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
                    {(u.name || u.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name || "—"}
                      {u.role === "admin" && <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "1px 6px", borderRadius: 6 }}>ADMIN</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#4a5568" }}>{u.email}</div>
                  </div>
                </div>

                {/* Plan badge */}
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: PLAN_COLOR[u.plan], background: PLAN_BG[u.plan], padding: "4px 10px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4, textTransform: "capitalize" }}>
                    <PlanIcon size={10} />
                    {u.plan}
                    {u.planStatus === "pending" && <span style={{ color: "#f59e0b", fontSize: 9 }}>⏳</span>}
                  </span>
                </div>

                {/* Counts */}
                <div style={{ fontSize: 13, color: "#8892b0", fontWeight: 600 }}>{u._count.projects}</div>
                <div style={{ fontSize: 13, color: "#8892b0", fontWeight: 600 }}>{u._count.tasks}</div>

                {/* Joined */}
                <div style={{ fontSize: 12, color: "#4a5568" }}>{timeAgo(u.createdAt)}</div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {u.planStatus === "pending" ? (
                    <>
                      <div style={{ fontSize: 10, color: "#f59e0b", marginRight: 4 }}>→ {u.planRequested}</div>
                      <button onClick={() => handlePlan(u.id, "approve", u.planRequested || "pro")} disabled={!!isLoading}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", opacity: isLoading ? 0.5 : 1 }}>
                        {isLoading ? <Loader2 size={10} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle2 size={11} />} OK
                      </button>
                      <button onClick={() => handlePlan(u.id, "reject")} disabled={!!isLoading}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", opacity: isLoading ? 0.5 : 1 }}>
                        <XCircle size={11} /> No
                      </button>
                    </>
                  ) : (
                    <select onChange={(e) => { if (e.target.value) handlePlan(u.id, "set", e.target.value); }}
                      defaultValue=""
                      style={{ fontSize: 11, color: "#8892b0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", outline: "none" }}>
                      <option value="" disabled>Set plan...</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 20px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 12, color: "#4a5568" }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allDisplayed.length)} of {allDisplayed.length} users
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === 1 ? "#2a3a60" : "#8892b0", transition: "all 0.15s" }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: p === page ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${p === page ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: p === page ? "#a5b4fc" : "#4a5568", minWidth: 36 }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === totalPages ? "#2a3a60" : "#8892b0", transition: "all 0.15s" }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Footer tip */}
        <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", fontSize: 12, color: "#4a5568", display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={12} color="#6366f1" />
          <span>To make yourself admin: POST to <code style={{ color: "#a5b4fc", background: "rgba(99,102,241,0.1)", padding: "1px 6px", borderRadius: 4 }}>/api/admin/init</code> while logged in — only works if no admin exists yet.</span>
        </div>
      </div>
    </div>
  );
}
