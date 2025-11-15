// components/RenameModal.jsx
import React, { useEffect, useState } from "react";

export default function RenameModal({ open, onClose, initialTitle = "", onSave }) {
  const [value, setValue] = useState(initialTitle || "");

  useEffect(() => {
    setValue(initialTitle || "");
  }, [initialTitle, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="glass p-5 z-60 w-full max-w-sm transform transition">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Rename conversation</h3>
          <button onClick={onClose} className="text-white/60">Close</button>
        </div>

        <input
          className="input-field w-full mb-3"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Conversation title"
        />

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => {
              const trimmed = (value || "").trim();
              if (!trimmed) return alert("Please enter a title.");
              onSave(trimmed);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
