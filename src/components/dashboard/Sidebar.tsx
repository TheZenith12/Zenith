"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CheckSquare, BarChart3, Settings, Sparkles, LogOut, Search, Plus, X, CheckCircle2, Zap, ArrowRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { NotificationBell } from "./NotificationBell";
import { useLanguage } from "@/contexts/LanguageContext";

// NAV is built dynamically inside the component using t()

interface Project { id: string; name: string; color: string; _count: { tasks: number } }

export default function Sidebar({ user, onClose }: { user: { name: string; email: string }; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setProjects(d); });
  }, [pathname]);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjectName, color: newProjectColor }),
    });
    if (res.ok) {
      const p = await res.json();
      setProjects((prev) => [p, ...prev]);
      setNewProjectName("");
      setShowNewProject(false);
    } else {
      const data = await res.json();
      if (data.limitReached) {
        setShowNewProject(false);
        setNewProjectName("");
        setShowUpgradeModal(true);
      }
    }
    setCreating(false);
  };

  const deleteProject = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    }
    setDeletingId(null);
  };

  const NAV = [
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { href: "/tasks", icon: CheckSquare, label: t.tasks },
    { href: "/analytics", icon: BarChart3, label: t.analytics },
    { href: "/settings", icon: Settings, label: t.settings },
  ];

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const PROJECT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#f43f5e", "#84cc16"];

  return (
    <>
    <aside style={{
      width: 240, minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "var(--t-sidebar-bg, #070a12)",
      borderRight: "1px solid var(--t-sidebar-border, rgba(255,255,255,0.06))",
      position: "relative", flexShrink: 0,
    }}>
      {/* Top glow */}
      <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--t-sidebar-border, rgba(255,255,255,0.05))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.5)", flexShrink: 0 }}>
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: -0.3, lineHeight: 1 }}>Zenith</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{t.workspace}</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="show-mobile" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button onClick={() => setShowSearch(true)} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, width: "100%",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
          transition: "all 0.2s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(var(--accent-rgb,99,102,241),0.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", flex: 1, textAlign: "left" }}>{t.search}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)" }}>⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", padding: "8px 8px 6px" }}>{t.main}</div>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "var(--nav-item-padding, 9px 10px)",
              borderRadius: 10, marginBottom: 2, textDecoration: "none",
              background: active ? "linear-gradient(135deg, rgba(var(--accent-rgb,99,102,241),0.2), rgba(var(--accent-rgb,99,102,241),0.08))" : "transparent",
              border: `1px solid ${active ? "rgba(var(--accent-rgb,99,102,241),0.3)" : "transparent"}`,
              color: active ? "var(--accent, #a5b4fc)" : "rgba(255,255,255,0.5)",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; } }}
              onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; } }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />}
            </Link>
          );
        })}

        {/* Projects */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 8px 6px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{t.projects}</span>
          <button onClick={() => {
              setShowNewProject(!showNewProject);
          }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2, borderRadius: 4, display: "flex", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"}>
            <Plus size={12} />
          </button>
        </div>

        {showNewProject && (
          <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 8 }}>
            <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..." autoFocus
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {PROJECT_COLORS.map((c) => (
                <button key={c} onClick={() => setNewProjectColor(c)} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: newProjectColor === c ? "2px solid white" : "2px solid transparent", cursor: "pointer", padding: 0, boxShadow: newProjectColor === c ? `0 0 8px ${c}80` : "none" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowNewProject(false)} style={{ flex: 1, padding: "5px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>Cancel</button>
              <button onClick={createProject} disabled={creating || !newProjectName.trim()} style={{ flex: 1, padding: "5px", fontSize: 11, borderRadius: 6, cursor: "pointer", background: "var(--accent)", border: "none", color: "white", fontWeight: 600, opacity: creating || !newProjectName.trim() ? 0.5 : 1 }}>{creating ? "..." : "Create"}</button>
            </div>
          </div>
        )}

        {projects.map((p) => (
          <div key={p.id}
            style={{ position: "relative", marginBottom: 2, background: "transparent", borderRadius: 10, transition: "background 0.2s" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)";
              const btn = (e.currentTarget as HTMLDivElement).querySelector(".del-btn") as HTMLElement;
              if (btn) btn.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
              const btn = (e.currentTarget as HTMLDivElement).querySelector(".del-btn") as HTMLElement;
              if (btn) btn.style.opacity = "0";
            }}>
            <Link href={`/tasks?project=${p.id}`} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", paddingRight: 32,
              borderRadius: 10, textDecoration: "none", color: "rgba(255,255,255,0.5)",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, boxShadow: `0 0 6px ${p.color}80` }} />
              <span style={{ fontSize: 12, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 8 }}>{p._count.tasks}</span>
            </Link>
            <button className="del-btn" onClick={(e) => { e.preventDefault(); setConfirmDeleteId(p.id); }}
              style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", opacity: 0, transition: "opacity 0.15s", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}

        {projects.length === 0 && !showNewProject && (
          <div style={{ padding: "12px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginBottom: 4 }}>{t.noProjects}</p>
            <button onClick={() => setShowNewProject(true)} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>{t.createOne}</button>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--t-sidebar-border, rgba(255,255,255,0.05))" }}>

        {/* Notification bell + user card row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <NotificationBell />
        </div>

        {/* User card */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 4, display: "flex", borderRadius: 6, transition: "all 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>

    {/* Global search modal — covers full screen */}
    <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />

    {/* Delete confirmation modal */}
    {confirmDeleteId && (
      <div onClick={() => setConfirmDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 340, borderRadius: 20, background: "#0d1117", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", padding: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Trash2 size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>{t.deleteProject}</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 24 }}>
            {t.deleteProjectDesc}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {t.cancel}
            </button>
            <button onClick={() => deleteProject(confirmDeleteId)} disabled={deletingId === confirmDeleteId} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: deletingId === confirmDeleteId ? 0.6 : 1 }}>
              {deletingId === confirmDeleteId ? t.deleting : t.delete}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Upgrade modal */}
    {showUpgradeModal && (
      <div onClick={() => setShowUpgradeModal(false)} style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: 420, borderRadius: 24,
          background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.1)",
          padding: 32, position: "relative",
        }}>
          {/* Close */}
          <button onClick={() => setShowUpgradeModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={13} />
          </button>

          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Zap size={24} color="#a5b4fc" />
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 8 }}>{t.projectLimitReached}</div>
          <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7, marginBottom: 24 }}>
            {t.freePlanLimit}
          </p>

          {/* Plan cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { name: "Pro", price: "$29/mo", color: "#6366f1", features: ["Unlimited projects", "Priority support"] },
              { name: "Enterprise", price: "$99/mo", color: "#f59e0b", features: ["Everything in Pro", "Dedicated server"] },
            ].map(({ name, price, color, features }) => (
              <div key={name} style={{ padding: 16, borderRadius: 14, background: `${color}08`, border: `1px solid ${color}25` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 12, color: "#8892b0", marginBottom: 10 }}>{price}</div>
                {features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4a5568", marginBottom: 4 }}>
                    <CheckCircle2 size={9} color={color} /> {f}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setShowUpgradeModal(false); router.push("/settings?tab=billing"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "white", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
            <Zap size={15} /> {t.upgradeNow} <ArrowRight size={14} />
          </button>

          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#2a3a60" }}>
            Request an upgrade and an admin will activate your plan.
          </div>
        </div>
      </div>
    )}
    </>
  );
}
