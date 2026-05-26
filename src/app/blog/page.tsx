"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Clock, Tag, ChevronRight,
  TrendingUp, Zap, Users, Shield, BarChart3, BookOpen, ArrowRight,
} from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  tag: string;
  tagColor: string;
  author: { name: string; role: string; initials: string; gradient: string };
  featured?: boolean;
  body: string[];
}

const POSTS: Post[] = [
  {
    id: "1",
    slug: "introducing-zenith",
    title: "Introducing Zenith: The Productivity Platform Built for the Modern Era",
    excerpt: "We've been quietly building something we're incredibly proud of. Today, we're excited to share Zenith with the world — a task management and analytics platform that rethinks how you work.",
    date: "May 20, 2025",
    readTime: "5 min read",
    category: "Product",
    tag: "Launch",
    tagColor: "#6366f1",
    author: { name: "Nakie Z.", role: "Founder & CEO", initials: "NZ", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
    featured: true,
    body: [
      "Productivity tools shouldn't be complicated. They should get out of your way, give you clarity, and help you focus on what actually matters. That was the founding principle behind Zenith.",
      "We've spent months obsessing over every pixel, every interaction, every data flow. The result is a platform that feels fast, looks stunning and scales from a solo freelancer all the way to an enterprise team.",
      "Zenith is built on Next.js with a Prisma-backed SQLite database, which means your data stays local by default. No external cloud dependency, no vendor lock-in.",
      "Today we're launching with Projects, Tasks, Analytics and a full Settings system including live theming. We already have a Pro and Enterprise plan in place, with an admin dashboard for plan management.",
      "We're just getting started. AI-powered task suggestions, real-time collaboration, and calendar integration are all on the roadmap. Stay tuned.",
    ],
  },
  {
    id: "2",
    slug: "five-ways-to-use-analytics",
    title: "5 Ways to Use Zenith Analytics to 10x Your Productivity",
    excerpt: "Most people open an analytics page, look at a chart, and close it. Here's how to actually use the data Zenith surfaces to make smarter decisions about your work.",
    date: "May 18, 2025",
    readTime: "4 min read",
    category: "Tips",
    tag: "Productivity",
    tagColor: "#10b981",
    author: { name: "Aria L.", role: "Head of Product", initials: "AL", gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
    body: [
      "The Analytics page in Zenith isn't just eye candy — it's a decision-making engine. Let's walk through five concrete ways to use it.",
      "1. Track completion rate over time. The area chart shows tasks created vs completed for the last 7 days. If the gap between them is growing, your intake is outpacing your output — time to re-prioritize.",
      "2. Spot your biggest project backlog. The bar chart at the bottom compares task counts per project. If one project has 40 open tasks and another has 5, you know where to focus this week.",
      "3. Use the donut chart as a health check. A healthy task breakdown is roughly 20% Todo, 30% In Progress, 50% Done. Heavy Todo bias means you're not finishing things. Heavy In Progress means too much WIP.",
      "4. Create a weekly review ritual. Every Friday, open Analytics and review the week's numbers before you create next week's tasks. This creates a feedback loop that compounds over time.",
      "5. Set project-level targets. Decide in advance what percentage of tasks you want done by a deadline, then use the analytics to hold yourself accountable.",
    ],
  },
  {
    id: "3",
    slug: "dark-mode-design",
    title: "Why We Went All-In on a Dark-First Design System",
    excerpt: "Most design systems default to light mode and add dark mode as an afterthought. We did the opposite — and here's why we think it was the right call for a productivity tool.",
    date: "May 14, 2025",
    readTime: "6 min read",
    category: "Design",
    tag: "Design",
    tagColor: "#8b5cf6",
    author: { name: "Nakie Z.", role: "Founder & CEO", initials: "NZ", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
    body: [
      "When we sat down to design Zenith, we asked ourselves: who is our core user? The answer was someone who works long hours, often at night, often in low-light environments. Dark mode wasn't optional for them — it was essential.",
      "So we built the entire design system dark-first. Every color, every glow, every gradient was designed against a #080b14 background. Light mode was then derived from the dark system rather than the other way around.",
      "This approach has a surprising benefit: dark mode looks intentional rather than inverted. The glows, the subtle background gradients, the iridescent card borders — none of these translate well when you just invert CSS colors. Dark-first design means dark mode always looks beautiful.",
      "We used CSS custom properties (variables) throughout, which made light mode a pure override layer. The result is instant theme switching with zero re-renders and zero layout shifts.",
      "Our theme system exposes tokens like --t-app-bg, --t-card-bg, --t-text and --t-border. Swapping the data-theme attribute on the HTML element flips everything at once. It's elegant, performant and maintainable.",
    ],
  },
  {
    id: "4",
    slug: "plan-system-deep-dive",
    title: "How We Built the Plan & Subscription System",
    excerpt: "Behind the scenes of Zenith's Free/Pro/Enterprise tier system — how plan limits are enforced, how upgrade requests flow through the admin panel, and what's coming next.",
    date: "May 10, 2025",
    readTime: "7 min read",
    category: "Engineering",
    tag: "Engineering",
    tagColor: "#f59e0b",
    author: { name: "Dev B.", role: "Lead Engineer", initials: "DB", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    body: [
      "Building a subscription system is one of those things that sounds simple and turns out to be surprisingly nuanced. Here's how we approached it in Zenith.",
      "The first decision was where to enforce plan limits. We chose the API layer rather than the UI layer. The UI shows prompts and warnings, but the actual enforcement happens in the POST /api/projects route which checks the user's plan and current project count before allowing creation.",
      "Plan data lives on the User model: plan (free/pro/enterprise), planStatus (active/pending), planRequested (what they asked for) and planRequestedAt (when). When a user submits an upgrade request, planStatus becomes 'pending' and an admin is notified via the admin panel.",
      "The admin panel reads these fields and surfaces them as actionable cards. Approving a request promotes the user's plan and resets the pending state. Rejecting clears the pending state without changing the plan.",
      "One thing we deliberately avoided: Stripe or any external payment processor at this stage. The manual approval flow lets us validate demand and iterate quickly. Stripe integration is planned for Q3 2025.",
    ],
  },
  {
    id: "5",
    slug: "keyboard-shortcuts-guide",
    title: "Master Zenith with Keyboard Shortcuts",
    excerpt: "Power users know that the mouse is slow. Here's every keyboard shortcut in Zenith and how to use them to navigate your workspace at the speed of thought.",
    date: "May 6, 2025",
    readTime: "3 min read",
    category: "Tips",
    tag: "Tips",
    tagColor: "#06b6d4",
    author: { name: "Aria L.", role: "Head of Product", initials: "AL", gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
    body: [
      "The fastest way to use any tool is to keep your hands on the keyboard. Here are all the shortcuts available in Zenith today.",
      "⌘K / Ctrl+K — Open the command palette. This is the single most powerful shortcut in Zenith. From here you can search all tasks, jump to any project, or navigate to any page in the app.",
      "Escape — Close any modal, dropdown or the command palette. Works everywhere.",
      "↑↓ — Navigate search results in the command palette. Press Enter to select the highlighted result.",
      "When the task creation modal is open, Tab moves between fields and Enter can submit the form from the title field.",
      "We're planning to add more shortcuts in upcoming releases — including N for new task, P for new project, and number keys for switching between views.",
    ],
  },
  {
    id: "6",
    slug: "security-model",
    title: "Zenith's Security Model: How We Protect Your Data",
    excerpt: "Security isn't a feature — it's a foundation. Here's a transparent look at how Zenith handles authentication, session management, and data protection.",
    date: "April 29, 2025",
    readTime: "5 min read",
    category: "Security",
    tag: "Security",
    tagColor: "#ef4444",
    author: { name: "Dev B.", role: "Lead Engineer", initials: "DB", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    body: [
      "We believe you deserve to understand exactly how your data is protected. This post is our commitment to transparency about Zenith's security model.",
      "Authentication is handled with JWT tokens signed using the jose library. Tokens are stored in httpOnly cookies, which means client-side JavaScript cannot access them. This eliminates an entire class of XSS token theft attacks.",
      "Passwords are hashed with bcryptjs at a salt factor of 12. We never log, store or transmit plain-text passwords. The hashed value is what lives in the database.",
      "Sessions are database-backed. When you log out, the session record is deleted server-side. Even if someone copied your cookie value, it would immediately become invalid after logout.",
      "Admin routes are double-protected: the UI redirects non-admins, and every API endpoint under /api/admin/* checks the user's role server-side before processing any request.",
    ],
  },
];

const CATEGORIES = ["All", "Product", "Tips", "Design", "Engineering", "Security"];

const CAT_ICONS: Record<string, typeof Zap> = {
  Product: Zap, Tips: TrendingUp, Design: Sparkles,
  Engineering: BarChart3, Security: Shield, All: BookOpen,
};

function PostCard({ post, onSelect, featured = false }: { post: Post; onSelect: (p: Post) => void; featured?: boolean }) {
  return (
    <div
      onClick={() => onSelect(post)}
      style={{
        padding: featured ? 32 : 24, borderRadius: 18, cursor: "pointer",
        background: featured ? "linear-gradient(135deg, #0d1117 0%, #0f1420 100%)" : "rgba(255,255,255,0.02)",
        border: featured ? `1px solid ${post.tagColor}30` : "1px solid rgba(255,255,255,0.06)",
        boxShadow: featured ? `0 0 60px ${post.tagColor}10` : "none",
        transition: "all 0.2s", gridColumn: featured ? "1 / -1" : undefined,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${post.tagColor}50`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = featured ? `1px solid ${post.tagColor}30` : "1px solid rgba(255,255,255,0.06)"; }}
    >
      {featured && (
        <div style={{ fontSize: 10, fontWeight: 800, color: post.tagColor, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>★ Featured Post</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: post.tagColor, background: `${post.tagColor}15`, padding: "3px 10px", borderRadius: 20 }}>{post.tag}</span>
        <span style={{ fontSize: 11, color: "#2a3a60" }}>·</span>
        <span style={{ fontSize: 11, color: "#2a3a60" }}>{post.category}</span>
      </div>
      <h2 style={{ fontSize: featured ? 24 : 17, fontWeight: 800, color: "white", letterSpacing: -0.3, marginBottom: 12, lineHeight: 1.35 }}>{post.title}</h2>
      <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.75, marginBottom: 20 }}>{post.excerpt}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: post.author.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white" }}>{post.author.initials}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8892b0" }}>{post.author.name}</div>
            <div style={{ fontSize: 11, color: "#2a3a60" }}>{post.author.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#2a3a60" }}><Clock size={10} />{post.readTime}</div>
          <div style={{ fontSize: 11, color: "#2a3a60" }}>{post.date}</div>
        </div>
      </div>
    </div>
  );
}

function PostDetail({ post, onBack }: { post: Post; onBack: () => void }) {
  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#4a5568", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, marginBottom: 36 }}>
        <ArrowLeft size={13} /> All Posts
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: post.tagColor, background: `${post.tagColor}15`, padding: "3px 10px", borderRadius: 20 }}>{post.tag}</span>
        <span style={{ fontSize: 11, color: "#2a3a60" }}>·</span>
        <span style={{ fontSize: 11, color: "#2a3a60" }}>{post.category}</span>
      </div>

      <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: -1, lineHeight: 1.2, marginBottom: 24 }}>{post.title}</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: post.author.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{post.author.initials}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{post.author.name}</div>
            <div style={{ fontSize: 12, color: "#4a5568" }}>{post.author.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2a3a60" }}><Clock size={11} />{post.readTime}</div>
          <div style={{ fontSize: 12, color: "#2a3a60" }}>{post.date}</div>
        </div>
      </div>

      <div style={{ fontSize: 15, color: "#8892b0", lineHeight: 1.9 }}>
        {post.body.map((para, i) => (
          <p key={i} style={{ marginBottom: 24 }}>{para}</p>
        ))}
      </div>

      <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8892b0", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>← Back to blog</button>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "white", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: "8px 16px", textDecoration: "none" }}>
          Try Zenith <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [category, setCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filtered = category === "All" ? POSTS : POSTS.filter(p => p.category === category);
  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "white", fontFamily: "system-ui, sans-serif" }}>
      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(8,11,20,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", alignItems: "center", gap: 24, height: 60 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Zenith</span>
        </Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <BookOpen size={14} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc" }}>Blog</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/docs" style={{ fontSize: 13, color: "#8892b0", textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", marginRight: 8 }}>
          Docs
        </Link>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8892b0", textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </div>

      {selectedPost ? (
        <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase", marginBottom: 16 }}>Zenith Blog</div>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "white", letterSpacing: -1.5, marginBottom: 16 }}>
              Product, Design &<br />
              <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Engineering Insights</span>
            </h1>
            <p style={{ fontSize: 16, color: "#4a5568", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Stories, tutorials and deep dives from the team building Zenith.</p>
          </div>

          {/* Category filters */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => {
              const Icon = CAT_ICONS[cat] || BookOpen;
              const active = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: active ? "#a5b4fc" : "#4a5568",
                  transition: "all 0.15s",
                }}>
                  <Icon size={12} />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Posts grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#2a3a60" }}>
              <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p>No posts in this category yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {featured && category === "All" && <PostCard post={featured} onSelect={setSelectedPost} featured />}
              {rest.map(post => <PostCard key={post.id} post={post} onSelect={setSelectedPost} />)}
              {category !== "All" && filtered.map(post => <PostCard key={post.id} post={post} onSelect={setSelectedPost} />)}
            </div>
          )}

          {/* Footer CTA */}
          <div style={{ marginTop: 80, textAlign: "center", padding: "48px 32px", borderRadius: 24, background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 12 }}>Ready to try Zenith?</div>
            <p style={{ fontSize: 14, color: "#4a5568", marginBottom: 24 }}>Join thousands of teams managing their work smarter.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/register" style={{ padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                Get started free <ArrowRight size={14} />
              </Link>
              <Link href="/docs" style={{ padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#8892b0", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
