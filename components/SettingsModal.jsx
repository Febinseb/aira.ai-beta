// components/SettingsModal.jsx
import React from "react";

export default function SettingsModal({ open, onClose }) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            type="button"
            className="btn-ghost text-xs px-2 py-1"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          <section>
            <h3 className="text-sm font-semibold mb-1">
              Conversation behaviour
            </h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              In future updates, this is where you&apos;ll be able to adjust how
              much context Aira remembers, how long conversations are stored,
              and other smart behaviour.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-1">Privacy & safety</h3>
            <p className="text-muted" style={{ fontSize: 12 }}>
              For now, Aira processes your messages only to respond inside
              Febiverse. She follows strict safety rules and will not help with
              anything illegal, harmful or abusive.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
