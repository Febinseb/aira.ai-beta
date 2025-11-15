// components/AiraChat.jsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";
import SettingsModal from "./SettingsModal";
import AccountModal from "./AccountModal";
import RenameModal from "./RenameModal";
import Header from "./Header";
import MoodsModal from "./MoodsModal";
import { db } from "../lib/firebaseClient";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function AiraChat({ user, onSignIn, onSignOut, sendMessage }) {
  /* ------------ STATE ------------ */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState({ id: null, title: "" });

  const [mood, setMood] = useState("FRIEND");
  const [moodsOpen, setMoodsOpen] = useState(false);

  const listRef = useRef(null);

  /* ------------ LAYOUT (desktop vs phone) ------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateLayout = () => {
      const desktop = window.innerWidth >= 900;
      setIsDesktop(desktop);
      setSidebarOpen(desktop); // open on desktop, closed on phone
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  /* ------------ LISTEN TO HEADER EVENTS ------------ */
  useEffect(() => {
    const toggleSidebar = () => {
      setSidebarOpen((prev) => !prev);
    };
    const openMoods = () => {
      setMoodsOpen(true);
    };

    window.addEventListener("aira:toggle-sidebar", toggleSidebar);
    window.addEventListener("aira:open-moods", openMoods);

    return () => {
      window.removeEventListener("aira:toggle-sidebar", toggleSidebar);
      window.removeEventListener("aira:open-moods", openMoods);
    };
  }, []);

  /* ------------ LOAD SAVED MOOD ------------ */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aira_mood");
      if (saved === "FORMAL" || saved === "FRIEND" || saved === "PLAYFUL") {
        setMood(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  /* ------------ THREAD LIST (SIDEBAR) ------------ */
  useEffect(() => {
    if (!user || !db) {
      setConversations([]);
      setActiveConvo(null);
      return;
    }

    const threadsCol = collection(db, "aira_chats", user.uid, "threads");
    const qThreads = query(
      threadsCol,
      orderBy("lastUpdated", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(
      qThreads,
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setConversations(arr);
        if (!activeConvo && arr[0]) setActiveConvo(arr[0].id);
      },
      (err) => console.error("threads snapshot error", err)
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ------------ MESSAGES FOR ACTIVE CONVO ------------ */
  useEffect(() => {
    if (!user) {
      setMessages([
        {
          id: "sys-1",
          role: "assistant",
          text: "Sign in to sync conversations and see your chat history.",
        },
      ]);
      return;
    }

    if (!activeConvo || !db) {
      setMessages([]);
      return;
    }

    const msgsCol = collection(
      db,
      "aira_chats",
      user.uid,
      "threads",
      activeConvo,
      "messages"
    );
    const qMsgs = query(msgsCol, orderBy("ts", "asc"));

    const unsub = onSnapshot(
      qMsgs,
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
        setMessages(arr.map((m) => ({ id: m.id, role: m.role, text: m.text })));
      },
      (err) => console.error("messages snapshot error", err)
    );

    return () => unsub();
  }, [user, activeConvo]);

  /* ------------ AUTO SCROLL ------------ */
  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------ TITLE GENERATION ------------ */
  function generateTitleFromMessage(msg) {
    if (!msg) return "Chat";
    const s = msg.trim().toLowerCase();

    const greetings = [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good evening",
      "good night",
    ];
    for (const g of greetings) if (s.includes(g)) return "Friendly greeting";

    if (
      s.startsWith("how") ||
      s.startsWith("what") ||
      s.startsWith("why") ||
      s.startsWith("where") ||
      s.startsWith("who")
    ) {
      const firstPart = s.split(/[.?!]/)[0];
      const words = firstPart.split(/\s+/).slice(0, 6).join(" ");
      return capitalizeTitle(words + " — question");
    }

    if (
      s.includes("recipe") ||
      s.includes("cook") ||
      s.includes("bake") ||
      s.includes("ingredients")
    )
      return "Recipe help";
    if (
      s.includes("code") ||
      s.includes("javascript") ||
      s.includes("python") ||
      s.includes("bug") ||
      s.includes("error")
    )
      return "Code help";
    if (s.includes("essay") || s.includes("write") || s.includes("paragraph"))
      return "Writing help";
    if (
      s.includes("summarize") ||
      s.includes("tl;dr") ||
      s.includes("summary")
    )
      return "Summary";
    if (s.includes("joke") || s.includes("meme") || s.includes("funny"))
      return "Jokes & memes";
    if (s.length < 25) return capitalizeTitle(s.slice(0, 22));

    const words = s.split(/\s+/).slice(0, 5).join(" ");
    return capitalizeTitle(words);
  }

  function capitalizeTitle(str) {
    return str
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  /* ------------ FIRESTORE HELPERS ------------ */
  async function createNewConversation() {
    if (!user || !db) {
      alert("Please sign in to create a conversation.");
      return null;
    }
    const threadsCol = collection(db, "aira_chats", user.uid, "threads");
    const newDoc = await addDoc(threadsCol, {
      title: "New chat",
      lastUpdated: serverTimestamp(),
      lastText: "",
    });
    setActiveConvo(newDoc.id);
    return newDoc.id;
  }

  async function saveMessage(convoId, role, text) {
    if (!user || !convoId || !db) return;
    const msgsCol = collection(
      db,
      "aira_chats",
      user.uid,
      "threads",
      convoId,
      "messages"
    );
    await addDoc(msgsCol, { role, text, ts: serverTimestamp() });
    const threadRef = doc(db, "aira_chats", user.uid, "threads", convoId);
    try {
      await updateDoc(threadRef, {
        lastText: text,
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      try {
        await threadRef.set?.(
          { lastText: text, lastUpdated: serverTimestamp() },
          { merge: true }
        );
      } catch (_) {}
    }
  }

  async function updateThreadTitle(convoId, newTitle) {
    if (!user || !convoId || !db) return;
    try {
      const threadRef = doc(db, "aira_chats", user.uid, "threads", convoId);
      await updateDoc(threadRef, { title: newTitle });
    } catch (err) {
      console.error("updateThreadTitle error", err);
      alert("Could not update title: " + (err.message || err));
    }
  }

  /* ------------ SEND MESSAGE ------------ */
      async function handleSend() {
    const text = input.trim();
    if (!text) return;

    // Take a snapshot of the current messages BEFORE adding the new one.
    // This is what we send as "history" to the backend.
    const historyForAI = messages
      .filter((m) => !String(m.id || "").startsWith("sys-"))
      .slice(-12); // last ~12 messages as context

    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setTyping(true);

    let convoId = activeConvo;

    if (!convoId) {
      convoId = await createNewConversation();
      if (!convoId) {
        setTyping(false);
        return;
      }
      setActiveConvo(convoId);
    }

    if (user && convoId) await saveMessage(convoId, "user", text);

    const currentThread = conversations.find((t) => t.id === convoId);
    if (
      currentThread &&
      (!currentThread.title || currentThread.title === "New chat")
    ) {
      try {
        const newTitle = generateTitleFromMessage(text);
        if (newTitle) await updateThreadTitle(convoId, newTitle);
      } catch (err) {
        console.warn("auto-title failed", err);
      }
    }

    try {
      let reply;
      if (typeof sendMessage === "function") {
        reply = await sendMessage({
          message: text,
          mood,            // 👈 current mood
          history: historyForAI, // 👈 pass recent messages
        });
      } else {
        reply = `Demo reply: ${text}`;
        await new Promise((r) => setTimeout(r, 500));
      }

      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);

      if (user && convoId) await saveMessage(convoId, "assistant", reply);
    } catch (err) {
      console.error("send failed", err);
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Couldn't reach AI.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }


  /* ------------ EXPORT / DELETE / RENAME ------------ */
  async function exportConversation(convoId) {
    if (!user || !convoId || !db)
      return alert("Sign in and open a conversation to export.");

    const msgsCol = collection(
      db,
      "aira_chats",
      user.uid,
      "threads",
      convoId,
      "messages"
    );
    const snap = await getDocs(query(msgsCol, orderBy("ts", "asc")));
    const lines = [];
    snap.forEach((d) => {
      const data = d.data();
      const who = data.role || "assistant";
      lines.push(`${who.toUpperCase()}: ${data.text || ""}`);
    });
    const text = lines.join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aira-conversation-${convoId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function deleteConversation(convoId) {
    if (!user || !convoId || !db) return;
    if (!confirm("Delete conversation? This cannot be undone.")) return;

    try {
      const msgsCol = collection(
        db,
        "aira_chats",
        user.uid,
        "threads",
        convoId,
        "messages"
      );
      const snap = await getDocs(query(msgsCol));
      for (const docSnap of snap.docs) {
        await deleteDoc(
          doc(
            db,
            "aira_chats",
            user.uid,
            "threads",
            convoId,
            "messages",
            docSnap.id
          )
        );
      }
      await deleteDoc(doc(db, "aira_chats", user.uid, "threads", convoId));
      setActiveConvo(null);
      setMessages([
        {
          id: "sys-del",
          role: "assistant",
          text: "Conversation deleted. Create a new chat.",
        },
      ]);
    } catch (err) {
      console.error("deleteConversation error", err);
      alert("Delete failed: " + (err.message || err));
    }
  }

  function handleOpenRename(convoId, title) {
    setRenameTarget({ id: convoId, title: title || "" });
    setRenameOpen(true);
  }

  /* ------------ DERIVED ------------ */
  const activeTitle =
    conversations.find((c) => c.id === activeConvo)?.title || "";

  const sidebarClass = `aira-sidebar ${sidebarOpen ? "open" : "closed"}`;
  const mainChatClass = `main-chat ${
    isDesktop && sidebarOpen ? "with-sidebar" : "no-sidebar"
  }`;

  /* ------------ RENDER ------------ */
  return (
    <div className="app-shell">
      <div className="app-layout">
        {/* SIDEBAR */}
        <aside className={sidebarClass}>
          <Sidebar
            user={user}
            conversations={conversations}
            activeConvoId={activeConvo}
            onNewConversation={createNewConversation}
            onOpenConversation={(id) => setActiveConvo(id)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenAccount={() => setAccountOpen(true)}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            onExportConversation={exportConversation}
            onDeleteConversation={deleteConversation}
            onRenameConversation={handleOpenRename}
            mood={mood}
          />
        </aside>

        {/* MAIN CHAT */}
        <main className={mainChatClass}>
          <Header activeTitle={activeTitle} />

          <div className="chat-panel">
            <div className="messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${
                    m.role === "assistant" ? "assistant" : "user"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={listRef} />
            </div>

            <div className="flex items-center justify-between">
              <TypingIndicator show={typing} />
              <div className="text-xs text-muted hide-mobile">
                Tip: Press Enter to send
              </div>
            </div>

            <div className="input-row mt-2">
              <input
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  user ? "Ask Aira anything..." : "Sign in to chat with Aira"
                }
              />
              <button className="btn-primary" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODALS */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mood={mood}
        onChangeMood={(newMood) => {
          setMood(newMood);
          try {
            localStorage.setItem("aira_mood", newMood);
          } catch {}
        }}
      />

      <MoodsModal
        open={moodsOpen}
        onClose={() => setMoodsOpen(false)}
        mood={mood}
        onChangeMood={(newMood) => {
          setMood(newMood);
          try {
            localStorage.setItem("aira_mood", newMood);
          } catch {}
          setMoodsOpen(false);
        }}
      />

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={user}
        onProfileUpdated={() => {}}
      />

      <RenameModal
        open={renameOpen}
        initialTitle={renameTarget.title}
        onClose={() => setRenameOpen(false)}
        onSave={(newTitle) => updateThreadTitle(renameTarget.id, newTitle)}
      />
    </div>
  );
}
