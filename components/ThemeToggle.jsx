// components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  // same initial value on server + first client render
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // mark as mounted (for future tweaks if needed)
  useEffect(() => {
    setMounted(true);
  }, []);

  // apply theme to <html data-theme="...">
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("aira_theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  // after mount, read whatever was saved and update once
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aira_theme");
      if (saved === "light") {
        setDark(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const label = dark ? "Dark" : "Light";
  const icon = dark ? "🌙" : "☀️";

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark((v) => !v)}
      title="Switch theme"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
