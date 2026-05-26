"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Zap, Shield, BarChart3, Users, ArrowRight, Check,
  Star, ChevronRight, Sparkles, Globe, Lock, Cpu,
  CheckCircle2, TrendingUp, Clock, Menu, X
} from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Lightning Fast", desc: "Sub-100ms response times with edge-optimized infrastructure", color: "#f59e0b" },
  { icon: Shield, title: "Enterprise Security", desc: "End-to-end encryption, SOC2 compliant, zero-trust architecture", color: "#10b981" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Real-time insights with AI-powered predictions and reports", color: "#6366f1" },
  { icon: Users, title: "Team Collaboration", desc: "Seamless real-time collaboration across unlimited workspaces", color: "#ec4899" },
  { icon: Globe, title: "Global Scale", desc: "Deploy worldwide with 99.99% uptime SLA guarantee", color: "#06b6d4" },
  { icon: Cpu, title: "AI Powered", desc: "Smart automation and intelligent task prioritization built-in", color: "#8b5cf6" },
];

const PLANS = [
  { name: "Starter", price: 0, desc: "Perfect for individuals", features: ["5 projects", "20 tasks/month", "Basic analytics", "Email support"] },
  { name: "Pro", price: 29, desc: "For growing teams", features: ["Unlimited projects", "Unlimited tasks", "Advanced analytics", "Priority support", "AI features", "Custom workflows"], popular: true },
  { name: "Enterprise", price: 99, desc: "For large organizations", features: ["Everything in Pro", "SSO & SAML", "Dedicated server", "SLA guarantee", "Custom integrations", "White labeling"] },
];

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.4 + 0.1,
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? "12px 0" : "22px 0",
      background: scrolled ? "rgba(8,11,20,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid #1a2540" : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            <Sparkles size={17} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Zenith</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {["Features", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "#8892b0", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8892b0")}>{item}</a>
          ))}
          <Link href="/docs" style={{ color: "#8892b0", fontSize: 14, textDecoration: "none" }}>Docs</Link>
          <Link href="/blog" style={{ color: "#8892b0", fontSize: 14, textDecoration: "none" }}>Blog</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="nav-ctas">
          <Link href="/login" style={{ color: "#8892b0", fontSize: 14, textDecoration: "none", padding: "8px 16px" }}>Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: 13, padding: "9px 20px", borderRadius: 10, gap: 6 }}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile dropdown */}
        <div className={`mobile-nav${menuOpen ? " open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <Link href="/docs" onClick={() => setMenuOpen(false)}>Docs</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "#8892b0" }}>Sign in</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} style={{ color: "#a5b4fc", fontWeight: 700 }}>Get started →</Link>
        </div>
      </div>
    </nav>
  );
}

function DashboardMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
      {/* Glow */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.2)", filter: "blur(80px)", top: "10%", left: "10%", pointerEvents: "none" }} />

      {/* Main card */}
      <div style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "#0d1117", border: "1px solid #1e2d4a",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.12)",
        transform: "perspective(1000px) rotateY(-3deg) rotateX(2deg)",
      }}>
        {/* Window bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", background: "#0a0e1a", borderBottom: "1px solid #1a2540" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
          <div style={{ flex: 1, background: "#080b14", borderRadius: 6, padding: "4px 12px", fontSize: 10, color: "#4a5568", marginLeft: 8 }}>zenith.io/dashboard</div>
        </div>

        <div style={{ padding: 16 }}>
          {/* Header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 3 }}>Good morning 👋</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>Welcome back, <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alex</span></div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Total Tasks", value: "142", color: "#6366f1" },
              { label: "Completed", value: "89", color: "#10b981" },
              { label: "In Progress", value: "38", color: "#f59e0b" },
              { label: "Overdue", value: "15", color: "#ef4444" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#080b14", border: "1px solid #1a2540", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ background: "#080b14", border: "1px solid #1a2540", borderRadius: 12, padding: "12px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#4a5568", marginBottom: 8 }}>Weekly Activity</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 52 }}>
              {[30, 55, 40, 85, 60, 72, 95].map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", height: `${h}%`, background: `linear-gradient(to top, #6366f1, #a78bfa)`, opacity: 0.5 + i * 0.07 }} />
              ))}
            </div>
          </div>

          {/* Task list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { t: "Redesign onboarding flow", c: "#10b981", s: "Done" },
              { t: "Fix API rate limiting bug", c: "#f59e0b", s: "In Progress" },
              { t: "Write Q2 release notes", c: "#4a5568", s: "Todo" },
            ].map(({ t, c, s }) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, background: "#080b14", border: "1px solid #1a2540", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#8892b0", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</span>
                <span style={{ fontSize: 9, color: c, background: `${c}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge 1 — top right */}
      <div className="animate-float" style={{
        position: "absolute", top: -12, right: -24,
        background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(16,185,129,0.4)", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 0 20px rgba(16,185,129,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>89 tasks done ✓</span>
        </div>
      </div>

      {/* Floating badge 2 — bottom left */}
      <div style={{
        position: "absolute", bottom: 40, left: -32,
        background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.4)", borderRadius: 14, padding: "10px 14px",
        boxShadow: "0 0 25px rgba(99,102,241,0.2)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={14} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>+12% faster</div>
          <div style={{ fontSize: 10, color: "#4a5568" }}>vs last week</div>
        </div>
      </div>

      {/* Floating badge 3 — middle right */}
      <div className="animate-float" style={{
        position: "absolute", top: "45%", right: -36,
        background: "rgba(10,14,26,0.9)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(245,158,11,0.35)", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 0 15px rgba(245,158,11,0.15)", animationDelay: "1.5s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>3 due today</div>
            <div style={{ fontSize: 9, color: "#4a5568" }}>Stay on track</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const px = isMobile ? "16px" : "20px";

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", overflowX: "hidden" }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: isMobile ? "auto" : "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: isMobile ? 90 : 0 }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
        {!isMobile && <HeroParticles />}
        <div style={{ position: "absolute", width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, borderRadius: "50%", background: "rgba(99,102,241,0.18)", filter: "blur(100px)", top: -60, left: -60, pointerEvents: "none" }} />

        <div style={{
          position: "relative", zIndex: 10, width: "100%", maxWidth: 1200,
          margin: "0 auto", padding: isMobile ? "40px 16px 48px" : "120px 20px 80px",
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 60,
          alignItems: "center",
          opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)",
          transition: "all 0.9s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(13,17,35,0.8)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(99,102,241,0.35)", borderRadius: 999,
              padding: isMobile ? "6px 12px" : "8px 16px", fontSize: isMobile ? 11 : 13,
              color: "#a5b4fc", marginBottom: isMobile ? 20 : 32,
            }}>
              <Sparkles size={11} /> Zenith 2.0 — The Future of Productivity <ChevronRight size={11} />
            </div>

            <h1 style={{ fontSize: isMobile ? 40 : "clamp(38px,6vw,68px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: isMobile ? 16 : 24 }}>
              <span style={{ color: "white", display: "block" }}>Work at the</span>
              <span style={{ display: "block", background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Speed of Thought.</span>
            </h1>

            <p style={{ fontSize: isMobile ? 14 : 17, color: "#8892b0", lineHeight: 1.65, marginBottom: isMobile ? 24 : 40, maxWidth: isMobile ? "100%" : 480 }}>
              The all-in-one workspace for high-performing teams. Ship projects faster than ever.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 24 : 36, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              <Link href="/register" className="btn-primary" style={{ fontSize: isMobile ? 14 : 15, padding: isMobile ? "11px 22px" : "13px 28px" }}>
                <Sparkles size={15} /> Start free <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn-secondary" style={{ fontSize: isMobile ? 14 : 15, padding: isMobile ? "10px 20px" : "12px 28px" }}>
                Sign in
              </Link>
            </div>

            <p style={{ fontSize: 11, color: "#4a5568", marginBottom: isMobile ? 28 : 40 }}>No credit card · Free plan · 2 min setup</p>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: isMobile ? 10 : 0, columnGap: isMobile ? 10 : 32 }}>
              {[{ v: "50K+", l: "Users" }, { v: "99.9%", l: "Uptime" }, { v: "2.5M+", l: "Tasks" }, { v: "150+", l: "Countries" }].map(({ v, l }) => (
                <div key={l} style={{ textAlign: isMobile ? "center" : "left", background: isMobile ? "rgba(255,255,255,0.03)" : "none", border: isMobile ? "1px solid #1a2540" : "none", borderRadius: isMobile ? 12 : 0, padding: isMobile ? "10px 6px" : 0 }}>
                  <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{v}</div>
                  <div style={{ fontSize: isMobile ? 10 : 12, color: "#4a5568", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DashboardMockup />
            </div>
          )}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ padding: isMobile ? "48px 16px" : "80px 20px", position: "relative" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(139,92,246,0.08)", filter: "blur(100px)", top: 0, right: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase" }}>Features</span>
            <h2 style={{ fontSize: isMobile ? 26 : "clamp(28px,5vw,48px)", fontWeight: 900, marginTop: 10, marginBottom: 10, lineHeight: 1.1 }}>
              Everything you need.{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nothing you don&apos;t.</span>
            </h2>
          </div>
          {/* auto-fill grid — guaranteed 2 cols on mobile, 3 on desktop */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: isMobile ? 10 : 18 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: "#0f1520", border: "1px solid #1a2540",
                borderRadius: isMobile ? 14 : 20,
                padding: isMobile ? "14px 12px" : 28,
                transition: "all 0.3s ease",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2a3a60"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1a2540"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                <div style={{ width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, borderRadius: isMobile ? 10 : 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? 10 : 16, background: `${f.color}18`, border: `1px solid ${f.color}30`, flexShrink: 0 }}>
                  <f.icon size={isMobile ? 16 : 20} color={f.color} />
                </div>
                <div style={{ fontSize: isMobile ? 12 : 16, fontWeight: 700, color: "white", marginBottom: isMobile ? 4 : 8 }}>{f.title}</div>
                {!isMobile && <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>}
                {isMobile && <p style={{ fontSize: 10, color: "#4a5568", lineHeight: 1.4, margin: 0 }}>{f.desc.split(" ").slice(0, 6).join(" ")}…</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: isMobile ? "48px 16px" : "80px 20px", position: "relative" }}>
        <div style={{ position: "absolute", width: 500, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.08)", filter: "blur(120px)", bottom: 0, left: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#6366f1", textTransform: "uppercase" }}>Pricing</span>
            <h2 style={{ fontSize: isMobile ? 26 : "clamp(28px,5vw,48px)", fontWeight: 900, marginTop: 10, marginBottom: 8 }}>
              Simple,{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>transparent</span> pricing
            </h2>
            <p style={{ fontSize: 13, color: "#8892b0" }}>Start free. Scale as you grow.</p>
          </div>

          {/* On mobile: compact horizontal scroll cards */}
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PLANS.map((plan) => (
                <div key={plan.name} style={{
                  position: "relative", borderRadius: 16, padding: "18px 18px 16px",
                  background: plan.popular ? "rgba(30,20,60,0.8)" : "#0f1520",
                  border: plan.popular ? "2px solid #6366f1" : "1px solid #1a2540",
                  boxShadow: plan.popular ? "0 0 40px rgba(99,102,241,0.25)" : "none",
                }}>
                  {plan.popular && (
                    <div style={{ position: "absolute", top: -11, left: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 9, fontWeight: 800, padding: "3px 12px", borderRadius: 999, letterSpacing: 1 }}>
                      MOST POPULAR
                    </div>
                  )}
                  {/* Row: name + price + button */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{plan.name}</div>
                      <div style={{ fontSize: 11, color: "#4a5568" }}>{plan.desc}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: plan.popular ? "#a5b4fc" : "white" }}>${plan.price}</span>
                      <span style={{ fontSize: 11, color: "#4a5568" }}>/mo</span>
                    </div>
                  </div>
                  {/* Features row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", margin: "12px 0 14px" }}>
                    {plan.features.slice(0, 4).map((feat) => (
                      <span key={feat} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8892b0" }}>
                        <Check size={10} color="#6366f1" />{feat}
                      </span>
                    ))}
                  </div>
                  <Link href="/register" className={plan.popular ? "btn-primary" : "btn-secondary"} style={{ justifyContent: "center", fontSize: 13, padding: "9px 16px", width: "100%", borderRadius: 10 }}>
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {PLANS.map((plan) => (
                <div key={plan.name} style={{
                  position: "relative", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column",
                  background: plan.popular ? "rgba(30,20,60,0.6)" : "#0f1520",
                  border: plan.popular ? "2px solid #6366f1" : "1px solid #1a2540",
                  boxShadow: plan.popular ? "0 0 60px rgba(99,102,241,0.2)" : "none",
                }}>
                  {plan.popular && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 999, letterSpacing: 1, whiteSpace: "nowrap" }}>
                      MOST POPULAR
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>{plan.desc}</p>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: "white" }}>${plan.price}</span>
                    <span style={{ fontSize: 15, color: "#8892b0" }}>/month</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, flex: 1, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                        <Check size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                        <span style={{ color: "#8892b0" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={plan.popular ? "btn-primary" : "btn-secondary"} style={{ justifyContent: "center" }}>
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═══ */}
      <section style={{ padding: isMobile ? "36px 16px" : "60px 20px", borderTop: "1px solid #1a2540" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} color="#f59e0b" fill="#f59e0b" />)}
          </div>
          <blockquote style={{ fontSize: isMobile ? 15 : 22, fontWeight: 500, color: "#e8eaf6", lineHeight: 1.6, marginBottom: 20 }}>
            &ldquo;Zenith completely transformed how our team operates. We ship 3x faster.&rdquo;
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>S</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Sarah Chen</div>
              <div style={{ fontSize: 11, color: "#8892b0" }}>CTO at DataFlow Inc.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: isMobile ? "40px 16px" : "80px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.14)", filter: "blur(100px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ background: "rgba(13,17,35,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: isMobile ? 20 : 28, padding: isMobile ? "32px 20px" : "64px 56px", boxShadow: "0 0 60px rgba(99,102,241,0.1)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Lock size={22} color="#a5b4fc" />
            </div>
            <h2 style={{ fontSize: isMobile ? 24 : "clamp(28px,5vw,46px)", fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
              Ready to reach the{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zenith?</span>
            </h2>
            <p style={{ fontSize: isMobile ? 13 : 16, color: "#8892b0", marginBottom: 24 }}>Join 50,000+ teams. Setup in 2 minutes.</p>
            <Link href="/register" className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }}>
              <Sparkles size={18} /> Start for free today <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "32px 20px", borderTop: "1px solid #1a2540" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={13} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: "white" }}>Zenith</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Security", "Status", "Docs"].map((item) => (
              <a key={item} href="#" style={{ fontSize: 13, color: "#4a5568", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}>{item}</a>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#4a5568" }}>© 2026 Zenith. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
