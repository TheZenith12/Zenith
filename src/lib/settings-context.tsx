"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AppSettings {
  accentColor: string;
  theme: "Dark" | "Light" | "System";
  density: "Compact" | "Default" | "Comfortable";
}

const DEFAULTS: AppSettings = {
  accentColor: "#6366f1",
  theme: "Dark",
  density: "Default",
};

// Hex → "r,g,b" string for rgba() usage
function hexToRgbStr(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// Slight hue shift for secondary gradient color
const SECONDARY_MAP: Record<string, string> = {
  "#6366f1": "#8b5cf6",
  "#8b5cf6": "#a78bfa",
  "#f43f5e": "#fb7185",
  "#10b981": "#34d399",
  "#f59e0b": "#fbbf24",
  "#06b6d4": "#22d3ee",
};

// Density → sidebar nav item padding
const DENSITY_PADDING: Record<string, string> = {
  Compact: "6px 10px",
  Default: "9px 10px",
  Comfortable: "13px 10px",
};

function applySettings(s: AppSettings) {
  const root = document.documentElement;
  const rgb = hexToRgbStr(s.accentColor);
  const secondary = SECONDARY_MAP[s.accentColor] || s.accentColor;

  root.style.setProperty("--accent", s.accentColor);
  root.style.setProperty("--accent-rgb", rgb);
  root.style.setProperty("--accent-secondary", secondary);
  root.style.setProperty("--accent-glow", `rgba(${rgb},0.4)`);
  root.style.setProperty("--accent-bg", `rgba(${rgb},0.08)`);
  root.style.setProperty("--nav-item-padding", DENSITY_PADDING[s.density]);

  // Theme: set data-theme attribute so CSS variables kick in
  root.setAttribute("data-theme", s.theme);

  // Body background
  if (s.theme === "Light") {
    document.body.style.background = "#f0f4ff";
    document.body.style.color = "#0f172a";
  } else {
    document.body.style.background = "#080b14";
    document.body.style.color = "#e8eaf6";
  }
}

interface SettingsCtx {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
}

const Ctx = createContext<SettingsCtx>({ settings: DEFAULTS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zenith-settings");
      const saved: AppSettings = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
      setSettings(saved);
      applySettings(saved);
    } catch {
      applySettings(DEFAULTS);
    }
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("zenith-settings", JSON.stringify(next));
      applySettings(next);
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
