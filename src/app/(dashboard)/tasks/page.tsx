"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Trash2, CheckCircle2, Circle, Clock, Loader2, X, FolderOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Task {
  id: string; title: string; description?: string;
  status: string; priority: string; dueDate?: string;
  project?: { id: string; name: string; color: string } | null; createdAt: string;
}
interface Project { id: string; name: string; color: string; }

const STATUS_COLORS = {
  todo: { color: "#4a5568", bg: "rgba(74,85,104,0.15)" },
  in_progress: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  done: { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
};
const PRIORITY_COLOR: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

function TasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const projectFilter = searchParams.get("project");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", projectId: "" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Reset status filter and search when project changes
  useEffect(() => {
    setFilter("all");
    setSearch("");
    setPage(1);
  }, [projectFilter]);

  // Reset page when filter or search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const url = projectFilter ? `/api/tasks?project=${projectFilter}` : "/api/tasks";
      const res = await fetch(url);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => {
    fetchTasks();
    fetch("/api/projects").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setProjects(d); });
  }, [fetchTasks]);

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    setCreating(true);
    const body = { ...newTask, projectId: newTask.projectId || projectFilter || undefined };
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const t = await res.json();
      setTasks((p) => [t, ...p]);
      setNewTask({ title: "", description: "", priority: "medium", projectId: "" });
      setShowCreate(false);
    }
    setCreating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { const u = await res.json(); setTasks((p) => p.map((t) => t.id === id ? u : t)); }
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((p) => p.filter((t) => t.id !== id));
  };

  const filtered = tasks.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedTasks = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeProject = projectFilter ? projects.find((p) => p.id === projectFilter) : null;
  const card: React.CSSProperties = {
    background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px,5.5vw,38px)", fontWeight: 900, letterSpacing: -1, color: "white", marginBottom: 8 }}>{t.tasksTitle}</h1>

          {/* Active project breadcrumb */}
          {activeProject ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 20, background: `${activeProject.color}15`, border: `1px solid ${activeProject.color}30` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeProject.color, boxShadow: `0 0 6px ${activeProject.color}` }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: activeProject.color }}>{activeProject.name}</span>
                <span style={{ fontSize: 12, color: `${activeProject.color}80` }}>· {t.taskCount(tasks.length)}</span>
              </div>
              <button onClick={() => router.push("/tasks")} style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#4a5568",
                background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, transition: "color 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#8892b0"}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#4a5568"}>
                <X size={12} /> {t.clearFilter}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "#4a5568" }}>{t.totalTasksCount(tasks.length)}</p>
          )}
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: 13, padding: "10px 20px", borderRadius: 12 }}>
          <Plus size={15} /> {t.newTask}
        </button>
      </div>

      {/* Project quick-switch (when on all tasks) */}
      {!projectFilter && projects.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {projects.map((p) => (
            <button key={p.id} onClick={() => router.push(`/tasks?project=${p.id}`)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`,
              color: "#8892b0", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${p.color}12`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${p.color}30`; (e.currentTarget as HTMLButtonElement).style.color = p.color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "#8892b0"; }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter chips + Search */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { key: "all", label: t.allFilter, count: counts.all, color: "#6366f1" },
          { key: "todo", label: t.todoFilter, count: counts.todo, color: "#4a5568" },
          { key: "in_progress", label: t.inProgressFilter, count: counts.in_progress, color: "#f59e0b" },
          { key: "done", label: t.doneFilter, count: counts.done, color: "#10b981" },
        ].map(({ key, label, count, color }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10,
            background: filter === key ? `${color}20` : "rgba(255,255,255,0.03)",
            border: `1px solid ${filter === key ? color + "50" : "rgba(255,255,255,0.07)"}`,
            color: filter === key ? color : "#8892b0", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
          }}>
            {label}
            <span style={{ fontSize: 11, background: filter === key ? `${color}30` : "rgba(255,255,255,0.05)", padding: "1px 7px", borderRadius: 20, color: filter === key ? color : "#4a5568" }}>{count}</span>
          </button>
        ))}

        {/* Search */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minWidth: 160 }}>
          <Search size={13} color="#4a5568" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={activeProject ? t.searchIn(activeProject.name) : t.searchTasks}
            style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 13, flex: 1 }} />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: 0, display: "flex" }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      <div style={{ ...card, overflow: "hidden" }}>
        {/* Column headers */}
        <div className="task-header-row">
          {["", t.taskTitle, t.project, t.status, ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "var(--accent, #6366f1)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#4a5568" }}>
              {activeProject ? t.loadingProject(activeProject.name) : t.loadingTasks}
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4a5568" }}>
            {activeProject
              ? <FolderOpen size={48} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
              : <CheckCircle2 size={48} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            }
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {search ? t.noTasksMatch(search) : activeProject ? t.noTasksInProject(activeProject.name) : t.noTasksFound}
            </p>
            <p style={{ fontSize: 13 }}>
              {activeProject ? t.createTaskHint(activeProject.name) : t.getStarted}
            </p>
          </div>
        ) : pagedTasks.map((task, i) => (
          <div key={task.id}
            className="task-row"
            style={{ borderBottom: i < pagedTasks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"}
            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>

            {/* Status toggle */}
            <button onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done")}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, transition: "transform 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}>
              {task.status === "done" ? <CheckCircle2 size={22} color="#10b981" /> : task.status === "in_progress" ? <Clock size={22} color="#f59e0b" /> : <Circle size={22} color="#4a5568" />}
            </button>

            {/* Title + mobile meta */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: task.status === "done" ? "#4a5568" : "white", textDecoration: task.status === "done" ? "line-through" : "none", marginBottom: 2 }}>{task.title}</p>
              {task.description && <p style={{ fontSize: 12, color: "#4a5568", marginBottom: 2 }}>{task.description}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: PRIORITY_COLOR[task.priority] || "#4a5568" }} />
                <span style={{ fontSize: 10, color: "#4a5568", textTransform: "capitalize" }}>{task.priority}</span>
              </div>
              {/* Mobile-only: project + status chips */}
              <div className="task-mobile-meta">
                {task.project && (
                  <span style={{ fontSize: 10, color: task.project.color, background: `${task.project.color}18`, border: `1px solid ${task.project.color}30`, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>
                    ● {task.project.name}
                  </span>
                )}
                <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.color || "#4a5568", background: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.bg || "transparent", padding: "2px 8px", borderRadius: 5 }}>
                  {task.status === "todo" ? t.todoFilter : task.status === "in_progress" ? t.inProgressFilter : t.doneFilter}
                </span>
              </div>
            </div>

            {/* Project — desktop only */}
            <div className="task-project-cell">
              {task.project ? (
                <button onClick={() => router.push(`/tasks?project=${task.project!.id}`)} style={{
                  fontSize: 11, color: task.project.color, background: `${task.project.color}18`,
                  border: `1px solid ${task.project.color}30`, padding: "3px 8px", borderRadius: 6,
                  cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${task.project!.color}30`}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${task.project!.color}18`}>
                  ● {task.project.name}
                </button>
              ) : <span style={{ fontSize: 11, color: "#2a3a60" }}>—</span>}
            </div>

            {/* Status select — desktop only */}
            <div className="task-status-cell">
              <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)}
                style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.color || "#4a5568", background: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.bg || "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", outline: "none", width: "100%" }}>
                <option value="todo">{t.todoFilter}</option>
                <option value="in_progress">{t.inProgressFilter}</option>
                <option value="done">{t.doneFilter}</option>
              </select>
            </div>

            {/* Delete */}
            <button onClick={() => deleteTask(task.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#2a3a60", display: "flex", padding: 4, borderRadius: 6, transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#2a3a60"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderRadius: 14, background: "linear-gradient(135deg, #0d1117, #0f1420)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: 12, color: "#4a5568" }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} tasks
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: page === 1 ? "#2a3a60" : "#8892b0" }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: p === page ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${p === page ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: p === page ? "#a5b4fc" : "#4a5568", minWidth: 36 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: page === totalPages ? "#2a3a60" : "#8892b0" }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="task-modal-inner">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{t.newTask}</h3>
                {activeProject && (
                  <p style={{ fontSize: 12, color: activeProject.color, marginTop: 2 }}>
                    {t.willBeAddedTo(activeProject.name)}
                  </p>
                )}
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, cursor: "pointer", color: "#8892b0", padding: 6, display: "flex" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8892b0", display: "block", marginBottom: 6 }}>{t.taskTitleLabel}</label>
                <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder={t.whatNeedsDone} autoFocus
                  onKeyDown={(e) => e.key === "Enter" && createTask()}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent, #6366f1)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8892b0", display: "block", marginBottom: 6 }}>{t.descriptionLabel}</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder={t.addDetails} rows={3}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent, #6366f1)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>

              {/* Project selector — pre-selected if filtering */}
              {projects.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#8892b0", display: "block", marginBottom: 6 }}>{t.projectLabel}</label>
                  <select value={newTask.projectId || projectFilter || ""}
                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, outline: "none", cursor: "pointer" }}>
                    <option value="">{t.noProject}</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8892b0", display: "block", marginBottom: 8 }}>{t.priorityLabel}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button key={p} onClick={() => setNewTask({ ...newTask, priority: p })}
                      style={{ flex: 1, padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s", background: newTask.priority === p ? `${PRIORITY_COLOR[p]}20` : "rgba(255,255,255,0.03)", border: `1px solid ${newTask.priority === p ? PRIORITY_COLOR[p] + "60" : "rgba(255,255,255,0.08)"}`, color: newTask.priority === p ? PRIORITY_COLOR[p] : "#8892b0" }}>
                      {p === "low" ? t.low : p === "medium" ? t.medium : t.high}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowCreate(false)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#8892b0" }}>
                {t.cancel}
              </button>
              <button onClick={createTask} disabled={creating || !newTask.title.trim()} className="btn-primary"
                style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px", borderRadius: 10, opacity: creating || !newTask.title.trim() ? 0.5 : 1 }}>
                {creating ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> {t.creating}</> : t.createTask}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
        <div style={{ width: 28, height: 28, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14, color: "#4a5568" }}>Loading...</span>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
