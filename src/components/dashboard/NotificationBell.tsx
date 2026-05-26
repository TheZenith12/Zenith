"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertCircle, Info, Zap, X, CheckCheck, Trash2 } from "lucide-react";

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  warning: { icon: AlertCircle,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  error:   { icon: AlertCircle,  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  info:    { icon: Info,          color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  plan:    { icon: Zap,           color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications || []);
      setUnread(data.unread || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30_000); // poll every 30s
    return () => clearInterval(iv);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const deleteRead = async () => {
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifs((prev) => prev.filter((n) => !n.read));
  };

  const markOne = async (id: string) => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((u) => Math.max(0, u - 1));
  };

  const deleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const notif = notifs.find((n) => n.id === id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.read) setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        style={{
          position: "relative", width: 36, height: 36, borderRadius: 10, border: "none",
          background: open ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
          color: "var(--t-text-2, #8892b0)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444, #f87171)",
            fontSize: 9, fontWeight: 800, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 6px rgba(239,68,68,0.6)",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", left: "100%", top: 0, marginLeft: 8,
          width: 320, zIndex: 200,
          background: "linear-gradient(135deg, #0d1117, #0f1420)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={14} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Notifications</span>
              {unread > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "1px 6px" }}>{unread} new</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all read"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: 4, borderRadius: 6, display: "flex" }}>
                  <CheckCheck size={13} />
                </button>
              )}
              {notifs.some((n) => n.read) && (
                <button onClick={deleteRead} title="Clear read"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: 4, borderRadius: 6, display: "flex" }}>
                  <Trash2 size={13} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: 4, borderRadius: 6, display: "flex" }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center" }}>
                <Bell size={28} color="rgba(255,255,255,0.08)" style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, color: "#4a5568" }}>No notifications yet</p>
              </div>
            ) : notifs.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 16px", cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(99,102,241,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: `3px solid ${n.read ? "transparent" : "var(--accent, #6366f1)"}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(99,102,241,0.04)"; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon size={12} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: n.read ? "#8892b0" : "white", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: "#4a5568", lineHeight: 1.4, marginBottom: 4 }}>{n.message}</p>
                    <p style={{ fontSize: 10, color: "#2a3a60" }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  <button onClick={(e) => deleteOne(n.id, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#2a3a60", padding: 2, borderRadius: 4, display: "flex", flexShrink: 0, marginTop: 2, opacity: 0 }}
                    className="notif-delete-btn">
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
