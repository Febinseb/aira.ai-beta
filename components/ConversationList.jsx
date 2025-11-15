// components/ConversationList.jsx
import React from "react";

export default function ConversationList({
  conversations = [],
  onOpen = () => {},
  activeId = null,
  onExport,
  onDelete,
  onRename
}) {
  if (!conversations || conversations.length === 0) {
    return <div className="text-xs text-white/60">No conversations yet</div>;
  }

  return (
    <div className="convo-list">
      {conversations.map((c) => (
        <div
          key={c.id}
          className={`convo-item ${c.id === activeId ? "bg-white/3" : ""}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8
          }}
        >
          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onOpen(c.id)}>
            <div className="text-sm font-medium">{c.title || "Chat"}</div>
            <div className="text-xs text-white/60">{(c.lastText || "").slice(0, 60)}</div>
          </div>

          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <button title="Rename" onClick={() => onRename && onRename(c.id, c.title)} className="text-xs btn-ghost">✏️</button>
            <button title="Export conversation" onClick={() => onExport && onExport(c.id)} className="text-xs btn-ghost">⬇️</button>
            <button title="Delete conversation" onClick={() => onDelete && onDelete(c.id)} className="text-xs btn-ghost">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}
