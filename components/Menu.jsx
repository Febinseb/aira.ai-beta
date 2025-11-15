// components/Menu.jsx
import React from "react";

export default function Menu({
  open,
  onClose,
  onOpenMoods,
  onOpenSettings,
  onSignOut,
}) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  return (
    <div
      className="menu-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        background: "transparent", // click-through backdrop
      }}
    >
      <div
        className="menu-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 64,
          right: 16,
          width: 230,
          borderRadius: 18,
          background: "var(--aira-surface)",
          border: "1px solid var(--aira-border-subtle)",
          boxShadow: "var(--aira-shadow-soft)",
          padding: 8,
          fontSize: 13,
        }}
      >
        <div
          className="menu-list"
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {/* 🎭 Moods */}
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              onOpenMoods && onOpenMoods();
              onClose && onClose();
            }}
          >
            <span className="menu-icon">🎭</span>
            <span className="menu-label">Moods</span>
          </button>

          {/* ⚙️ Settings */}
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              onOpenSettings && onOpenSettings();
              onClose && onClose();
            }}
          >
            <span className="menu-icon">⚙️</span>
            <span className="menu-label">Settings</span>
          </button>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(148,163,184,0.35)",
              margin: "4px 0",
            }}
          />

          {/* ⏏ Sign out */}
          {onSignOut && (
            <button
              type="button"
              className="menu-item menu-signout"
              onClick={() => {
                onSignOut();
                onClose && onClose();
              }}
            >
              <span className="menu-icon">⏏</span>
              <span className="menu-label">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
