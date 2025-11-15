// components/Header.jsx
import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ activeTitle }) {
  // ⬅️ fire a browser event when menu is clicked
  const handleMenuClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aira:toggle-sidebar"));
    }
  };

  // ⬅️ fire a browser event when Moods is clicked
  const handleMoodsClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aira:open-moods"));
    }
  };

  return (
    <header className="aira-header glass fade-in">
      {/* LEFT: menu + title */}
      <div className="flex items-center gap-3">
        <button
          className="menu-btn"
          onClick={handleMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <div className="flex flex-col">
          <div className="header-title">{activeTitle || "Aira"}</div>
          <div className="header-status">● Online</div>
        </div>
      </div>

      {/* RIGHT: moods + theme */}
      <div className="flex items-center gap-4">
        <button className="btn-ghost" onClick={handleMoodsClick}>
          Moods
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
