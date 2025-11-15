// components/Sidebar.jsx
import React from "react";

export default function Sidebar({
  user,
  conversations,
  activeConvoId,
  onNewConversation,
  onOpenConversation,
  onRenameConversation,
  onOpenSettings,
  onOpenAccount,
  onSignIn,
  onSignOut,
  onDeleteConversation,
  onExportConversation,
}) {
  return (
    <>
      <div className="sidebar-header">
        <div className="sidebar-header-left">
          <div className="sidebar-title">Aira-Ai</div>
          <div className="sidebar-subtitle">A Febiverse Project</div>
        </div>

        {!user && (
          <button className="btn-ghost" onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={onNewConversation}>
        <span className="icon">＋</span>
        <span>New chat</span>
      </button>

      <div className="chat-history">
        {conversations.length === 0 ? (
          <div className="text-muted">No chats yet.</div>
        ) : (
          conversations.map((c) => {
            const title = c.title || "New chat";
            const preview = c.lastText
              ? c.lastText.slice(0, 60)
              : "Empty conversation";

            return (
              <div
                key={c.id}
                className={
                  "history-item" + (c.id === activeConvoId ? " active" : "")
                }
              >
                <button
                  className="history-main"
                  onClick={() => onOpenConversation(c.id)}
                >
                  <div className="history-title">{title}</div>
                  <div className="history-sub">{preview}</div>
                </button>

                <div className="history-actions">
                  <button
                    className="history-icon-btn"
                    title="Rename chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameConversation?.(c.id, title);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className="history-icon-btn danger"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation?.(c.id);
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="user-bar">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Avatar"}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-fallback">
                  {(user.displayName || user.email || "A")[0].toUpperCase()}
                </div>
              )}

              <div>
                <div className="user-name">
                  {user.displayName || "Aira user"}
                </div>
                <div className="user-email text-muted">{user.email}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button className="btn-ghost" onClick={onOpenSettings}>
                Settings
              </button>
              <button className="btn-ghost" onClick={onOpenAccount}>
                Account
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button className="btn-ghost" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <button className="btn-primary" onClick={onSignIn}>
            Sign in with Google
          </button>
        )}
      </div>
    </>
  );
}
