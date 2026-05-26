"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle2, Circle, Clock, Folder, X, Hash, ArrowRight, Loader2 } from "lucide-react";

interface Task {
  id: string; title: string; description?: string;
  status: string; priority: string;
  project?: { id: string; name: string; color: string } | null;
}
interface Project { id: string; name: string; color: string; _count: { tasks: number } }

type Result =
  | { kind: "project"; id: string; title: string; sub: string; color: string; href: string }
  | { kind: "task"; id: string; title: string; sub: string; color: string; status: string; href: string };

const PRIORITY_COLOR: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

function StatusIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle2 size={14} color="#10b981" />;
  if (status === "in_progress") return <Clock size={14} color="#f59e0b" />;
  return <Circle size={14} color="#4a5568" />;
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  // Fetch data when modal opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(0);
    setTimeout(() => inputRef.current?.focus(), 50);
    setLoading(true);
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()).catch(() => []),
      fetch("/api/projects").then((r) => r.json()).catch(() => []),
    ]).then(([t, p]) => {
      setTasks(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, [open]);

  // Build result list
  const results: Result[] = query.trim().length === 0
    // Empty state: show 5 recent tasks
    ? tasks.slice(0, 6).map((t) => ({
        kind: "task", id: t.id, title: t.title,
        sub: t.project?.name || "No project",
        color: t.project?.color || "#4a5568",
        status: t.status,
        href: t.project ? `/tasks?project=${t.project.id}` : "/tasks",
      } as Result))
    : [
        ...projects
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map((p): Result => ({
            kind: "project", id: p.id, title: p.name,
            sub: `${p._count.tasks} task${p._count.tasks !== 1 ? "s" : ""}`,
            color: p.color, href: `/tasks?project=${p.id}`,
          })),
        ...tasks
          .filter((t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 6)
          .map((t): Result => ({
            kind: "task", id: t.id, title: t.title,
            sub: t.project?.name || "No project",
            color: t.project?.color || "#4a5568",
            status: t.status,
            // Navigate to project-filtered view if task has a project
            href: t.project ? `/tasks?project=${t.project.id}` : "/tasks",
          })),
      ];

  const navigate = useCallback((r: Result) => {
    router.push(r.href);
    onClose();
  }, [router, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && results[selected]) navigate(results[selected]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, navigate, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  const showProjectSection = query && results.some((r) => r.kind === "project");
  const showTaskSection = results.some((r) => r.kind === "task");
  const projectResults = results.filter((r) => r.kind === "project");
  const taskResults = results.filter((r) => r.kind === "task");
  const projectOffset = 0;
  const taskOffset = projectResults.length;

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 580,
          background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20,
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(99,102,241,0.08)",
          overflow: "hidden",
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* Search input row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {loading
            ? <Loader2 size={18} color="#6366f1" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
            : <Search size={18} color="#6366f1" style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search tasks, projects..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "white", fontSize: 16, fontFamily: "inherit",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: 2, display: "flex", borderRadius: 4 }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{ fontSize: 11, color: "#4a5568", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 400, overflowY: "auto" }}>
          {/* No query empty state label */}
          {!query && tasks.length > 0 && (
            <div style={{ padding: "10px 20px 6px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>
              Recent Tasks
            </div>
          )}

          {/* Projects section */}
          {showProjectSection && (
            <div style={{ padding: "10px 20px 6px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>
              Projects
            </div>
          )}
          {projectResults.map((r, i) => (
            <ResultRow
              key={r.id}
              result={r}
              index={projectOffset + i}
              selected={selected === projectOffset + i}
              onSelect={() => navigate(r)}
              onHover={() => setSelected(projectOffset + i)}
            />
          ))}

          {/* Tasks section */}
          {query && showTaskSection && (
            <div style={{ padding: "10px 20px 6px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>
              Tasks
            </div>
          )}
          {taskResults.map((r, i) => (
            <ResultRow
              key={r.id}
              result={r}
              index={taskOffset + i}
              selected={selected === taskOffset + i}
              onSelect={() => navigate(r)}
              onHover={() => setSelected(taskOffset + i)}
            />
          ))}

          {/* Empty */}
          {!loading && results.length === 0 && query && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <Search size={32} color="rgba(255,255,255,0.1)" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, color: "#4a5568" }}>No results for "<span style={{ color: "#8892b0" }}>{query}</span>"</p>
            </div>
          )}

          {!loading && tasks.length === 0 && !query && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#4a5568" }}>No tasks yet — create one to get started</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { keys: ["↑", "↓"], label: "navigate" },
            { keys: ["↵"], label: "open" },
            { keys: ["Esc"], label: "close" },
          ].map(({ keys, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {keys.map((k) => (
                <kbd key={k} style={{ fontSize: 10, color: "#4a5568", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px" }}>{k}</kbd>
              ))}
              <span style={{ fontSize: 11, color: "#2a3a60" }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#2a3a60" }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ result, index, selected, onSelect, onHover }: {
  result: Result; index: number; selected: boolean;
  onSelect: () => void; onHover: () => void;
}) {
  return (
    <div
      onMouseMove={onHover}
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 20px", cursor: "pointer",
        background: selected ? "rgba(99,102,241,0.1)" : "transparent",
        borderLeft: `2px solid ${selected ? "var(--accent, #6366f1)" : "transparent"}`,
        transition: "background 0.1s",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: result.kind === "project" ? `${result.color}20` : "rgba(255,255,255,0.05)",
        border: `1px solid ${result.kind === "project" ? `${result.color}30` : "rgba(255,255,255,0.07)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {result.kind === "project"
          ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: result.color, boxShadow: `0 0 6px ${result.color}80` }} />
          : <StatusIcon status={result.status} />
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: selected ? "white" : "#e8eaf6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
          {result.title}
        </p>
        <p style={{ fontSize: 11, color: "#4a5568", display: "flex", alignItems: "center", gap: 4 }}>
          {result.kind === "project"
            ? <><Folder size={10} /> {result.sub}</>
            : <><span style={{ width: 6, height: 6, borderRadius: "50%", background: result.color, display: "inline-block", boxShadow: `0 0 4px ${result.color}80` }} /> {result.sub}</>
          }
        </p>
      </div>

      {/* Arrow on selected */}
      {selected && <ArrowRight size={14} color="var(--accent, #6366f1)" style={{ flexShrink: 0 }} />}
    </div>
  );
}
