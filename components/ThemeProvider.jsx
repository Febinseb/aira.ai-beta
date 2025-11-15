// components/ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children, defaultTheme = "dark" }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = typeof window !== "undefined" && localStorage.getItem("aira_theme");
      if (saved) return saved;
    } catch {}
    // default: dark
    return defaultTheme;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aira_theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    // initialize attribute
    try {
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch {}
  }, []); // run once

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    isDark: theme === "dark",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
