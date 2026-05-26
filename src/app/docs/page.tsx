"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Book, Zap, FolderKanban, BarChart3, Settings,
  ChevronRight, Search, ArrowLeft, CheckCircle2, Terminal,
  Users, Shield, Bell, Palette, Key, Hash, ExternalLink, Copy, Check,
} from "lucide-react";

const NAV = [
  {
    section: "Getting Started",
    icon: Zap,
    color: "#6366f1",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick Start" },
      { id: "concepts", label: "Core Concepts" },
    ],
  },
  {
    section: "Features",
    icon: FolderKanban,
    color: "#10b981",
    items: [
      { id: "projects", label: "Projects" },
      { id: "tasks", label: "Tasks" },
      { id: "analytics", label: "Analytics" },
    ],
  },
  {
    section: "Configuration",
    icon: Settings,
    color: "#f59e0b",
    items: [
      { id: "settings", label: "Settings & Themes" },
      { id: "notifications", label: "Notifications" },
      { id: "security", label: "Security" },
    ],
  },
  {
    section: "Plans & Billing",
    icon: Shield,
    color: "#ec4899",
    items: [
      { id: "plans", label: "Plans Overview" },
      { id: "upgrading", label: "Upgrading" },
      { id: "admin", label: "Admin Panel" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  introduction: {
    title: "Introduction to Zenith",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>
          Zenith is a modern productivity platform designed to help individuals and teams manage projects, track tasks, and gain deep insights through analytics — all in one beautifully designed workspace.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { icon: FolderKanban, color: "#6366f1", title: "Projects", desc: "Organize work into focused projects with custom colors and descriptions." },
            { icon: CheckCircle2, color: "#10b981", title: "Tasks", desc: "Create, assign and track tasks with priorities, due dates and statuses." },
            { icon: BarChart3, color: "#f59e0b", title: "Analytics", desc: "Visualize productivity trends and project progress in real-time." },
            { icon: Palette, color: "#ec4899", title: "Themes", desc: "Personalize your workspace with accent colors, light/dark mode and density." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
        <Callout type="info" text="Zenith is built with Next.js, Prisma and SQLite — meaning your data stays local and secure by default." />
      </div>
    ),
  },
  "quick-start": {
    title: "Quick Start",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>
          Get up and running with Zenith in under 5 minutes. Follow these steps:
        </p>
        {[
          { step: 1, title: "Create your account", desc: "Visit the register page and sign up with your email. A secure JWT session is created automatically.", href: "/register" },
          { step: 2, title: "Create your first project", desc: "Click the + button in the sidebar, give your project a name and pick a color. Free plan includes up to 5 projects.", href: "/dashboard" },
          { step: 3, title: "Add tasks", desc: "Navigate to Tasks and click 'New Task'. Set a title, priority, status and optional due date.", href: "/tasks" },
          { step: 4, title: "Explore analytics", desc: "Head to Analytics to see charts of your task completion rate, project distribution and weekly trends.", href: "/analytics" },
        ].map(({ step, title, desc, href }) => (
          <div key={step} style={{ display: "flex", gap: 20, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0 }}>{step}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>{title} <Link href={href} style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", marginLeft: 6 }}>→ Go</Link></div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          </div>
        ))}
        <Callout type="tip" text="Use ⌘K or Ctrl+K to open the command palette at any time and quickly navigate between projects and tasks." />
      </div>
    ),
  },
  concepts: {
    title: "Core Concepts",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 28 }}>Understanding these key concepts will help you get the most out of Zenith.</p>
        {[
          { term: "Projects", def: "A project is a container for related tasks. Each project has a name, description, color identifier and a task counter. Projects belong to individual users — team sharing is coming in a future release." },
          { term: "Tasks", def: "Tasks are the core unit of work. Each task has a title, optional description, status (Todo / In Progress / Done), priority (Low / Medium / High / Urgent), and an optional due date and project assignment." },
          { term: "Plan Limits", def: "Free accounts can create up to 5 projects. Pro and Enterprise accounts have unlimited projects. Task creation is always unlimited regardless of plan." },
          { term: "Sessions", def: "Authentication is handled via secure httpOnly JWT cookies. Sessions are stored in the database and can be revoked. Cookies never expire on the client — only server-side invalidation can log you out." },
          { term: "Themes", def: "Zenith supports Dark, Light and System themes, plus 6 accent colors and 3 sidebar density levels. All preferences are saved to localStorage and applied instantly via CSS custom properties." },
        ].map(({ term, def }) => (
          <div key={term} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 8 }}><Hash size={12} color="#6366f1" style={{ marginRight: 6, display: "inline" }} />{term}</div>
            <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.8 }}>{def}</div>
          </div>
        ))}
      </div>
    ),
  },
  projects: {
    title: "Projects",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Projects help you organize your work into focused areas. Each project acts as a workspace for a set of related tasks.</p>
        <SectionHeading>Creating a Project</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 20, fontSize: 13 }}>
          Click the <strong style={{ color: "white" }}>+</strong> button next to "Projects" in the sidebar. A small form will appear where you can enter the project name and choose a color. Press Enter or click Create.
        </p>
        <SectionHeading>Project Limits by Plan</SectionHeading>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Plan", "Max Projects", "Price"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#4a5568", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[["Free", "5", "$0/mo"], ["Pro", "Unlimited", "$29/mo"], ["Enterprise", "Unlimited", "$99/mo"]].map(([plan, limit, price]) => (
              <tr key={plan} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "white", fontWeight: 600 }}>{plan}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#10b981" }}>{limit}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#8892b0" }}>{price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <SectionHeading>Filtering by Project</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 16 }}>
          Click any project in the sidebar to filter the Tasks page to show only that project's tasks. A breadcrumb appears at the top of the task list. Click "Clear filter" to return to all tasks.
        </p>
        <Callout type="tip" text="You can also filter by project from search results — click any task result to jump directly into its project context." />
      </div>
    ),
  },
  tasks: {
    title: "Tasks",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Tasks are the building blocks of your productivity workflow. They support statuses, priorities, due dates and project assignments.</p>
        <SectionHeading>Task Fields</SectionHeading>
        <div style={{ marginBottom: 24 }}>
          {[
            { field: "Title", req: true, desc: "Short descriptive name of the task (required)." },
            { field: "Description", req: false, desc: "Optional longer text describing the work in detail." },
            { field: "Status", req: true, desc: "One of: Todo, In Progress, or Done. Tasks start as Todo." },
            { field: "Priority", req: true, desc: "One of: Low, Medium, High, or Urgent. Displayed as a colored badge." },
            { field: "Due Date", req: false, desc: "Optional deadline. Overdue tasks are highlighted in the notification panel." },
            { field: "Project", req: false, desc: "Assign the task to a project. Enables project-based filtering." },
          ].map(({ field, req, desc }) => (
            <div key={field} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 110 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{field}</span>
                {req && <span style={{ fontSize: 9, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>REQ</span>}
              </div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <SectionHeading>Filtering &amp; Sorting</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 16 }}>Use the status filter tabs (All / Todo / In Progress / Done) and the search box on the Tasks page to narrow down your view. The search box filters by title in real time.</p>
        <Callout type="info" text="Tasks are always scoped to your account. You cannot see or edit other users' tasks." />
      </div>
    ),
  },
  analytics: {
    title: "Analytics",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>The Analytics page gives you a visual overview of your productivity data through interactive charts and KPI cards.</p>
        <SectionHeading>KPI Cards</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 20 }}>Four summary cards at the top of the Analytics page display: <strong style={{ color: "white" }}>Total Tasks</strong>, <strong style={{ color: "white" }}>Completed</strong>, <strong style={{ color: "white" }}>In Progress</strong>, and <strong style={{ color: "white" }}>Total Projects</strong>. Percentages show the ratio relative to total tasks.</p>
        <SectionHeading>Charts</SectionHeading>
        <div style={{ marginBottom: 24 }}>
          {[
            { name: "Area Chart — Task Trend", desc: "Shows tasks created vs completed over the last 7 days. Helps you spot busy periods and backlog growth." },
            { name: "Donut Chart — Status Split", desc: "Visualizes the percentage breakdown of Todo / In Progress / Done tasks." },
            { name: "Bar Chart — By Project", desc: "Compares task counts across your projects so you can see where the most work lives." },
          ].map(({ name, desc }) => (
            <div key={name} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <Callout type="tip" text="Analytics data updates in real time — refreshing the page will always show the latest numbers from the database." />
      </div>
    ),
  },
  settings: {
    title: "Settings & Themes",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>The Settings page has four tabs: Profile, Notifications, Security and Appearance. All appearance preferences take effect instantly without a page reload.</p>
        <SectionHeading>Appearance Options</SectionHeading>
        <div style={{ marginBottom: 24 }}>
          {[
            { label: "Accent Color", desc: "Choose from 6 colors: Indigo, Violet, Rose, Emerald, Amber, Cyan. Applied to buttons, badges, chart lines and glow effects via CSS custom properties." },
            { label: "Theme", desc: "Dark (default), Light or System. System follows your OS dark-mode preference. Light mode changes background, card, and text colors across the entire dashboard." },
            { label: "Sidebar Density", desc: "Compact tightens nav item padding, Default is the standard spacing, Comfortable adds extra breathing room." },
          ].map(({ label, desc }) => (
            <div key={label} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <SectionHeading>Profile</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 16 }}>Update your display name, email, username, job title, bio and profile photo. Profile photo is stored as a base64 string — keep images under 2 MB.</p>
        <Callout type="info" text="Appearance preferences are persisted to localStorage and restored on every page load." />
      </div>
    ),
  },
  notifications: {
    title: "Notifications",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Zenith's notification system surfaces important task events through the bell icon in the sidebar.</p>
        <SectionHeading>Notification Types</SectionHeading>
        <div style={{ marginBottom: 24 }}>
          {[
            { color: "#ef4444", label: "Overdue", desc: "Tasks whose due date has passed and are not yet Done. Shown with a red indicator." },
            { color: "#10b981", label: "Completed", desc: "Tasks that were completed recently (within the last 7 days). Shown with a green indicator." },
            { color: "#6366f1", label: "New Tasks", desc: "Tasks created in the last 24 hours. Shown with an indigo indicator." },
          ].map(({ color, label, desc }) => (
            <div key={label} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <SectionHeading>In-app Settings</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13 }}>The Notifications tab in Settings allows you to toggle email notifications, push alerts, weekly digest, and mention alerts. These preferences are saved per-user.</p>
      </div>
    ),
  },
  security: {
    title: "Security",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Zenith takes security seriously. Here's how your account and data are protected.</p>
        {[
          { icon: Key, color: "#f59e0b", title: "Password Hashing", desc: "Passwords are hashed using bcryptjs with a salt factor of 12 before being stored. Plain-text passwords are never stored." },
          { icon: Shield, color: "#6366f1", title: "JWT Sessions", desc: "Login creates a signed JWT stored in an httpOnly cookie. The token cannot be accessed by JavaScript, protecting against XSS attacks." },
          { icon: Users, color: "#10b981", title: "Session Revocation", desc: "Each session is stored in the database. Logging out deletes the session record, invalidating the cookie server-side." },
          { icon: Terminal, color: "#ec4899", title: "Admin Isolation", desc: "Admin endpoints require role === 'admin'. Regular users cannot access /api/admin/* routes — they receive a 403 Forbidden response." },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} style={{ display: "flex", gap: 16, marginBottom: 22, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          </div>
        ))}
        <Callout type="warning" text="Two-factor authentication (2FA) is shown in the UI but is not yet implemented — it's coming in the next release." />
      </div>
    ),
  },
  plans: {
    title: "Plans Overview",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Zenith offers three subscription tiers. You start on Free and can request an upgrade at any time from the Settings → Billing tab.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
          {[
            { name: "Free", color: "#4a5568", price: "$0", features: ["5 projects", "Unlimited tasks", "Basic analytics", "Community support"] },
            { name: "Pro", color: "#6366f1", price: "$29/mo", features: ["Unlimited projects", "Unlimited tasks", "Advanced analytics", "Priority support", "AI features"] },
            { name: "Enterprise", color: "#f59e0b", price: "$99/mo", features: ["Everything in Pro", "SSO & SAML", "SLA guarantee", "Dedicated support", "Custom integrations"] },
          ].map(({ name, color, price, features }) => (
            <div key={name} style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 16 }}>{price}</div>
              {features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <CheckCircle2 size={12} color={color} />
                  <span style={{ fontSize: 12, color: "#8892b0" }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Callout type="info" text="Upgrade requests go to an admin for manual approval. You'll stay on your current plan until the admin approves." />
      </div>
    ),
  },
  upgrading: {
    title: "Upgrading Your Plan",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>Requesting a plan upgrade is simple and can be done from within the Settings page.</p>
        {[
          { step: 1, title: "Go to Settings → Billing", desc: "Navigate to Settings from the sidebar, then click the Billing tab. Your current plan and usage is shown." },
          { step: 2, title: "Choose a plan and click Upgrade", desc: "Select Pro or Enterprise and click the upgrade button. Your request is submitted with status 'Pending'." },
          { step: 3, title: "Wait for admin approval", desc: "An admin reviews requests on the Admin Panel. You'll remain on your current plan until it's approved." },
          { step: 4, title: "Plan is activated", desc: "Once approved, your plan upgrades instantly. New limits apply immediately — no page reload needed." },
        ].map(({ step, title, desc }) => (
          <div key={step} style={{ display: "flex", gap: 20, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>{step}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          </div>
        ))}
        <Callout type="tip" text="If you're already at the 5-project limit on Free, you'll see an upgrade prompt when you try to create a new project." />
      </div>
    ),
  },
  admin: {
    title: "Admin Panel",
    body: (
      <div>
        <p style={{ color: "#8892b0", lineHeight: 1.8, marginBottom: 24 }}>The Admin Panel is a private dashboard for managing all users, reviewing plan upgrade requests, and manually setting plans.</p>
        <SectionHeading>Getting Admin Access</SectionHeading>
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 16 }}>If no admin exists yet, any logged-in user can become the first admin by making a POST request to:</p>
        <CodeBlock code="POST /api/admin/init" />
        <p style={{ color: "#8892b0", lineHeight: 1.8, fontSize: 13, marginBottom: 24 }}>This endpoint only works if zero admins exist in the database — it's a one-time bootstrap operation.</p>
        <SectionHeading>Admin Features</SectionHeading>
        <div style={{ marginBottom: 24 }}>
          {[
            { label: "User Overview", desc: "See all registered users with their plan, project count, task count and join date." },
            { label: "Pending Requests", desc: "A highlighted banner appears when users are waiting for plan approval. A dedicated 'Pending' tab filters to show only these users." },
            { label: "Approve / Reject", desc: "Click OK to approve a pending upgrade request (promotes to the requested plan), or No to reject it (resets status to active, keeps current plan)." },
            { label: "Set Plan Directly", desc: "Use the dropdown on any user row to directly set their plan to Free, Pro or Enterprise without them needing to request it." },
          ].map(({ label, desc }) => (
            <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <Callout type="warning" text="The /admin route is protected client-side — only visible to logged-in admins. The API routes enforce role checks server-side." />
      </div>
    ),
  },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: 0.5, marginBottom: 12, marginTop: 28, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{children}</div>;
}

function Callout({ type, text }: { type: "info" | "tip" | "warning"; text: string }) {
  const styles = {
    info: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", color: "#a5b4fc", label: "ℹ Note" },
    tip: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", color: "#6ee7b7", label: "💡 Tip" },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", color: "#fcd34d", label: "⚠ Warning" },
  }[type];
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, background: styles.bg, border: `1px solid ${styles.border}`, marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: styles.color, marginBottom: 6 }}>{styles.label}</div>
      <div style={{ fontSize: 13, color: styles.color, opacity: 0.85, lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{ background: "#0a0e1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 44px 14px 16px", fontFamily: "monospace", fontSize: 13, color: "#a5b4fc" }}>{code}</div>
      <button onClick={copy} style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#8892b0", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
        {copied ? <Check size={10} color="#10b981" /> : <Copy size={10} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState("introduction");
  const [search, setSearch] = useState("");

  const allItems = NAV.flatMap(n => n.items);
  const filtered = search
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const content = CONTENT[activeId];

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "white", fontFamily: "system-ui, sans-serif" }}>
      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(8,11,20,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", alignItems: "center", gap: 24, height: 60 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Zenith</span>
        </Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Book size={14} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc" }}>Documentation</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8892b0", textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "28px 0", position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto" }}>
          {/* Search */}
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Search size={12} color="#4a5568" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search docs..."
                style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "#8892b0", width: "100%" }}
              />
            </div>
          </div>

          {filtered ? (
            <div style={{ padding: "0 12px" }}>
              {filtered.length === 0
                ? <div style={{ fontSize: 12, color: "#4a5568", padding: "8px 8px" }}>No results</div>
                : filtered.map(item => (
                  <button key={item.id} onClick={() => { setActiveId(item.id); setSearch(""); }}
                    style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontSize: 13, color: "#a5b4fc", background: "rgba(99,102,241,0.1)", border: "none", cursor: "pointer", marginBottom: 4 }}>
                    {item.label}
                  </button>
                ))}
            </div>
          ) : NAV.map(({ section, icon: Icon, color, items }) => (
            <div key={section} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", marginBottom: 8 }}>
                <Icon size={12} color={color} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase" }}>{section}</span>
              </div>
              {items.map(item => (
                <button key={item.id} onClick={() => setActiveId(item.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeId === item.id ? 600 : 400,
                    color: activeId === item.id ? "white" : "#4a5568",
                    background: activeId === item.id ? "rgba(99,102,241,0.12)" : "transparent",
                    borderLeft: `2px solid ${activeId === item.id ? "#6366f1" : "transparent"}`,
                    transition: "all 0.15s",
                  }}>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "40px 56px", maxWidth: 780 }}>
          {content && (
            <>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#2a3a60", marginBottom: 20 }}>
                <span>Docs</span>
                <ChevronRight size={12} />
                <span style={{ color: "#6366f1" }}>{content.title}</span>
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: -0.5, marginBottom: 8 }}>{content.title}</h1>
              <div style={{ height: 3, width: 40, borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", marginBottom: 32 }} />

              {content.body}

              {/* Prev / Next nav */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {(() => {
                  const all = NAV.flatMap(n => n.items);
                  const idx = all.findIndex(i => i.id === activeId);
                  const prev = all[idx - 1];
                  const next = all[idx + 1];
                  return (
                    <>
                      {prev ? <button onClick={() => setActiveId(prev.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#8892b0", fontSize: 13 }}>← {prev.label}</button> : <div />}
                      {next ? <button onClick={() => setActiveId(next.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#8892b0", fontSize: 13 }}>{next.label} →</button> : <div />}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </main>

        {/* Right TOC (desktop) */}
        <div style={{ width: 200, flexShrink: 0, padding: "40px 24px", position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#2a3a60", textTransform: "uppercase", marginBottom: 12 }}>On this page</div>
          <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4a5568", textDecoration: "none", marginBottom: 8, padding: "6px 8px", borderRadius: 6, transition: "color 0.2s" }}>
            <ExternalLink size={10} /> Blog
          </Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4a5568", textDecoration: "none", marginBottom: 8, padding: "6px 8px", borderRadius: 6 }}>
            <ExternalLink size={10} /> Homepage
          </Link>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4a5568", textDecoration: "none", padding: "6px 8px", borderRadius: 6 }}>
            <ExternalLink size={10} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
