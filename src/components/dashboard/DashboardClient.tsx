"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus, ArrowUpRight, Folder, Zap, Target, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Task {
  id: string; title: string; status: string; priority: string;
  createdAt: Date; project?: { name: string; color: string } | null;
}
interface Project {
  id: string; name: string; color: string; _count: { tasks: number };
}
interface Props {
  user: { name: string };
  stats: { total: number; completed: number; inProgress: number; overdue: number };
  activity: { day: string; tasks: number }[];
  tasks: Task[];
  projects: Project[];
}

const PRIORITY_COLORS: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
const STATUS_COLORS: Record<string, string> = { todo: "#4a5568", in_progress: "#f59e0b", done: "#10b981" };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,14,26,0.95)", border: "1px solid #2a3a60", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(20px)" }}>
      <p style={{ fontSize: 11, color: "#8892b0", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#a5b4fc" }}>{payload[0].value} <span style={{ fontSize: 12, fontWeight: 400 }}>tasks</span></p>
    </div>
  );
}

const PROJECT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#f43f5e", "#84cc16"];

export default function DashboardClient({ user, stats, activity, tasks, projects: initialProjects }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [projects, setProjects] = useState(initialProjects);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;

  const createProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor }),
    });
    if (res.ok) {
      const p = await res.json();
      setProjects((prev) => [p, ...prev].slice(0, 4));
      setNewName("");
      setNewColor("#6366f1");
      setShowNewProject(false);
      router.refresh();
    } else {
      const d = await res.json();
      setCreateError(d.limitReached ? t.freePlanLimit : (d.error || t.error));
    }
    setCreating(false);
  };

  const statCards = [
    { label: t.totalTasks, value: stats.total, icon: TrendingUp, color: "#6366f1", glow: "rgba(99,102,241,0.3)" },
    { label: t.completedTasks, value: stats.completed, icon: CheckCircle2, color: "#10b981", glow: "rgba(16,185,129,0.3)" },
    { label: t.inProgress, value: stats.inProgress, icon: Clock, color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
    { label: t.overdueLabel, value: stats.overdue, icon: AlertTriangle, color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#4a5568" }}>{greeting}</span>
            <span style={{ fontSize: 16 }}>👋</span>
          </div>
          <h1 style={{ fontSize: "clamp(22px,5.5vw,38px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
            Welcome back,{" "}
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {user.name.split(" ")[0]}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "#4a5568" }}>
            {stats.inProgress > 0 ? t.tasksInProgress(stats.inProgress) : t.allCaughtUp}
          </p>
        </div>
        <Link href="/tasks" className="btn-primary" style={{ fontSize: 13, padding: "10px 20px", borderRadius: 12, gap: 6, flexShrink: 0 }}>
          <Plus size={15} /> {t.newTask}
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="dash-stat-grid">
        {statCards.map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} className="dash-stat-card" style={{
            background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)",
            border: "1px solid rgba(255,255,255,0.07)", cursor: "default",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${color}30`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
            {/* Background glow */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="dash-stat-icon" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                <Icon size={17} color={color} />
              </div>
              {label === "Completed" && stats.total > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "2px 6px", borderRadius: 5 }}>
                  {completionRate}%
                </span>
              )}
            </div>
            <div className="dash-stat-val" style={{ color }}>{value}</div>
            <div style={{ fontSize: 11, color: "#4a5568", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Zap size={11} color="#6366f1" />
          <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{t.activityOverview}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(99,102,241,0.2), transparent)" }} />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="dash-charts-grid">
        {/* Area Chart */}
        <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3 }}>{t.weeklyActivity}</h3>
              <p style={{ fontSize: 12, color: "#4a5568" }}>{t.tasksCompletedWeek}</p>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#a5b4fc", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", padding: "4px 12px", borderRadius: 8 }}>{t.thisWeek}</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)"
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#a5b4fc", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Ring */}
        <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ alignSelf: "flex-start", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3 }}>{t.completionRate}</h3>
            <p style={{ fontSize: 12, color: "#4a5568" }}>{t.overallProgress}</p>
          </div>

          {/* SVG Ring */}
          <div style={{ position: "relative", width: 140, height: 140, marginBottom: 20 }}>
            <svg viewBox="0 0 140 140" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="70" cy="70" r="54" fill="none"
                stroke="url(#ringGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - completionRate / 100)}`}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 30, fontWeight: 900, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{completionRate}%</span>
              <span style={{ fontSize: 11, color: "#4a5568" }}>Done</span>
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "10px 20px", justifyContent: "center" }}>
            {[
              { label: t.done, val: stats.completed, color: "#10b981" },
              { label: t.inProgress, val: stats.inProgress, color: "#f59e0b" },
              { label: t.remaining, val: stats.total - stats.completed - stats.inProgress, color: "#6366f1" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#8892b0" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIVIDER 2 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Target size={11} color="#10b981" />
          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>{t.tasksAndProjects}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(99,102,241,0.2), transparent)" }} />
      </div>

      {/* ── TASKS + PROJECTS ── */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Tasks */}
        <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "22px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{t.recentTasks}</h3>
              <p style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{t.tasksShown(tasks.length)}</p>
            </div>
            <Link href="/tasks" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 600, padding: "5px 10px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.1)"; }}>
              {t.viewAll} <ArrowUpRight size={12} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#4a5568" }}>
                <CheckCircle2 size={36} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>{t.noTasksYet}</p>
                <Link href="/tasks" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>{t.createNewTask}</Link>
              </div>
            ) : tasks.map((task) => (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.2s", cursor: "default",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"; }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[task.status] || "#4a5568", flexShrink: 0, boxShadow: `0 0 6px ${STATUS_COLORS[task.status] || "#4a5568"}80` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: task.status === "done" ? "#4a5568" : "white", textDecoration: task.status === "done" ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</p>
                  {task.project && <p style={{ fontSize: 11, color: task.project.color, marginTop: 2 }}>● {task.project.name}</p>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[task.priority], background: `${PRIORITY_COLORS[task.priority]}18`, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "22px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{t.projects}</h3>
              <p style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{t.activeProjects(projects.length)}</p>
            </div>
            <button onClick={() => setShowNewProject(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.2)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)"}>
              <Plus size={12} /> New
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#4a5568" }}>
                <Folder size={36} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>{t.noProjects}</p>
              </div>
            ) : projects.map((project) => {
              const pct = project._count.tasks > 0
                ? Math.min(100, Math.round((project.id.charCodeAt(0) % 80) + 10))
                : 0;
              return (
                <div key={project.id} style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s", cursor: "default",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${project.color}18`, border: `1px solid ${project.color}35`, flexShrink: 0 }}>
                      <Folder size={15} color={project.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
                      <p style={{ fontSize: 11, color: "#4a5568", marginTop: 1 }}>{project._count.tasks} tasks</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: project.color }}>{pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(to right, ${project.color}, ${project.color}aa)`, borderRadius: 2, transition: "width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── NEW PROJECT MODAL ── */}
      {showNewProject && (
        <div onClick={() => setShowNewProject(false)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, calc(100vw - 32px))", borderRadius: 22, background: "linear-gradient(135deg, #0d1117, #0f1420)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08)", padding: "clamp(16px,4vw,28px)", position: "relative" }}>
            <button onClick={() => setShowNewProject(false)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
              <X size={13} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Folder size={16} color="#a5b4fc" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{t.newProject}</div>
            </div>

            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>{t.projectName.toUpperCase()}</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              placeholder={t.projectNamePlaceholder}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />

            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>{t.colorLabel.toUpperCase()}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {PROJECT_COLORS.map((c) => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 26, height: 26, borderRadius: 8, background: c, border: newColor === c ? "2px solid white" : "2px solid transparent", cursor: "pointer", padding: 0, boxShadow: newColor === c ? `0 0 10px ${c}80` : "none", transition: "all 0.15s" }} />
              ))}
            </div>

            {createError && (
              <div style={{ fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
                {createError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNewProject(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t.cancel}
              </button>
              <button onClick={createProject} disabled={creating || !newName.trim()} style={{ flex: 2, padding: "11px", borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: creating || !newName.trim() ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={14} /> {creating ? t.creating : t.createProject}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
