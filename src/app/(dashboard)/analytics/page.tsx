"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { TrendingUp, Activity, Target, CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";

interface StatsData {
  stats: { total: number; completed: number; inProgress: number; overdue: number };
  activity: { day: string; tasks: number }[];
  projects: { name: string; color: string; _count: { tasks: number } }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <p style={{ fontSize: 11, color: "#8892b0", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc" }}>{p.value} tasks</p>
      ))}
    </div>
  );
}

const Divider = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "4px 0" }}>
    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)" }} />
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#2a3a60", textTransform: "uppercase", padding: "4px 14px", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 20, background: "rgba(99,102,241,0.05)", whiteSpace: "nowrap" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)" }} />
  </div>
);

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { stats, activity, projects } = data;
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const pieData = [
    { name: "Completed", value: stats.completed, color: "#10b981" },
    { name: "In Progress", value: stats.inProgress, color: "#f59e0b" },
    { name: "To Do", value: stats.total - stats.completed - stats.inProgress, color: "#6366f1" },
    { name: "Overdue", value: stats.overdue, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const kpis = [
    { label: t.completionRateKpi, value: `${completionRate}%`, sub: t.ofTotalDone, trend: "+5%", up: true, icon: Target, color: "#6366f1" },
    { label: t.tasksThisWeek, value: activity.reduce((a, b) => a + b.tasks, 0), sub: t.activeTracked, trend: "+12%", up: true, icon: Activity, color: "#10b981" },
    { label: t.dailyAverage, value: (activity.reduce((a, b) => a + b.tasks, 0) / 7).toFixed(1), sub: t.tasksPerDay, trend: "+0.3", up: true, icon: TrendingUp, color: "#f59e0b" },
    { label: t.overdueRate, value: `${stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}%`, sub: t.needAttention, trend: "-2%", up: false, icon: AlertCircle, color: "#ef4444" },
  ];

  const card: React.CSSProperties = { background: "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="anal-header">
        <div>
          <h1 style={{ fontSize: "clamp(22px,5.5vw,38px)", fontWeight: 900, letterSpacing: -1, color: "white", marginBottom: 6 }}>{t.analyticsTitle}</h1>
          <p style={{ fontSize: 14, color: "#4a5568" }}>{t.productivityInsights}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Zap size={13} color="#6366f1" />
          <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{t.liveData}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {kpis.map(({ label, value, sub, trend, up, icon: Icon, color }) => (
          <div key={label} className="kpi-card-pad" style={{ ...card, padding: 22, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${color}15`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
            {/* Glow orb */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: up ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: up ? "#10b981" : "#ef4444", border: `1px solid ${up ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}` }}>{trend}</span>
            </div>
            <div className="kpi-card-val" style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#8892b0", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: "#4a5568" }}>{sub}</div>
          </div>
        ))}
      </div>

      <Divider label={t.trends} />

      {/* Charts row */}
      <div className="dash-charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Area Chart */}
        <div style={{ ...card, padding: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>{t.taskCompletionTrend}</h3>
          <p style={{ fontSize: 13, color: "#4a5568", marginBottom: 24 }}>{t.dailyCompletedPast7}</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activity} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a5568", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.15)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad2)"
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#a5b4fc", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ ...card, padding: 28 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>{t.taskDistribution}</h3>
          <p style={{ fontSize: 13, color: "#4a5568", marginBottom: 20 }}>{t.statusBreakdown}</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pieData.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}80` }} />
                  <span style={{ fontSize: 12, color: "#8892b0" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <Divider label={t.summary} />
      <div className="anal-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: t.completedTasks, value: stats.completed, icon: CheckCircle2, color: "#10b981", desc: t.tasksFinished },
          { label: t.inProgress, value: stats.inProgress, icon: Clock, color: "#f59e0b", desc: t.currentlyActive },
          { label: t.overdueLabel, value: stats.overdue, icon: AlertCircle, color: "#ef4444", desc: t.needsAttention },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} style={{ ...card, padding: 22, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#8892b0", marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Bar Chart */}
      {projects.length > 0 && (
        <>
          <Divider label={t.projectsLabel} />
          <div style={{ ...card, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>{t.tasksByProject}</h3>
            <p style={{ fontSize: 13, color: "#4a5568", marginBottom: 24 }}>{t.distributionAcross}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projects.map((p) => ({ name: p.name, tasks: p._count.tasks }))} barSize={36} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: "#4a5568", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4a5568", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="tasks" radius={[8, 8, 0, 0]}>
                  {projects.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
