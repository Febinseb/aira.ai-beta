// components/MoodsModal.jsx
import React from "react";

const MOODS = [
  {
    id: "FORMAL",
    icon: "💼",
    title: "Formal assistant",
    desc: "Professional, structured and concise. Best for work, school and serious questions.",
  },
  {
    id: "FRIEND",
    icon: "💬",
    title: "Friendly chat",
    desc: "Balanced, warm and helpful. Great for everyday conversation and mixed questions.",
  },
  {
    id: "PLAYFUL",
    icon: "✨",
    title: "Playful / creative",
    desc: "Lighter tone, a bit more humour and creativity. Still respectful and useful.",
  },
];

export default function MoodsModal({ open, onClose, mood, onChangeMood }) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Choose Aira&apos;s mood</h2>
          <button
            type="button"
            className="btn-ghost text-xs px-2 py-1"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="text-muted mb-3" style={{ fontSize: 12 }}>
          This only changes how Aira talks. Facts, safety and limits stay the same.
        </p>

        <div className="space-y-2">
          {MOODS.map((m) => {
            const active = m.id === mood;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeMood && onChangeMood(m.id)}
                className="mood-card"
                style={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 16,
                  padding: "10px 12px",
                  border: active
                    ? "1px solid rgba(37,99,235,0.8)"
                    : "1px solid rgba(148,163,184,0.5)",
                  background: active ? "rgba(37,99,235,0.06)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  transition: "background 0.15s ease, transform 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    background: active
                      ? "rgba(37,99,235,0.10)"
                      : "rgba(148,163,184,0.20)",
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
                {active && (
                  <div
                    style={{
                      fontSize: 11,
                      paddingInline: 8,
                      paddingBlock: 2,
                      borderRadius: 999,
                      background: "rgba(37,99,235,0.16)",
                    }}
                  >
                    Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
