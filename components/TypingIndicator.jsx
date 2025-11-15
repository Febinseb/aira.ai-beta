// components/TypingIndicator.jsx
import React from "react";

export default function TypingIndicator({ show }) {
  if (!show) return null;
  return (
    <div className="inline-flex items-center gap-2 text-xs text-white/60">
      <div className="w-8 h-6 flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{animationDelay: '0s'}} />
        <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{animationDelay: '.15s'}} />
        <span className="inline-block w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{animationDelay: '.3s'}} />
      </div>
      Aira is typing…
    </div>
  );
}
