// pages/index.js
import React, { useEffect, useState } from "react";
import Aurora from "../components/Aurora";
import AiraChat from "../components/AiraChat";
import { auth, signInWithGooglePopup, signOutFirebase } from "../lib/firebaseClient";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import Header from "../components/Header";


export default function HomePage() {
  const [user, setUser] = useState(null);

  const [auroraEnabled, setAuroraEnabled] = React.useState(() => {
    try {
      return localStorage.getItem("aira_aurora") !== "0";
    } catch {
      return true;
    }
  });

useEffect(() => {
  if (!auth) return;
  const un = onAuthStateChanged(auth, (u) => {
    if (u) {
      const providerPhoto =
        (u.providerData &&
          u.providerData[0] &&
          u.providerData[0].photoURL) ||
        null;

      const photoURL = u.photoURL || providerPhoto || null;

      setUser({
        displayName: u.displayName,
        email: u.email,
        photoURL,
        uid: u.uid,
      });
    } else {
      setUser(null);
    }
  });
  return () => un();
}, []);

  // 🔥 sign-in handler
  async function onSignIn() {
    try {
      await signInWithGooglePopup();
    } catch (e) {
      alert(e.message);
    }
  }

  // 🔥 sign-out handler
  async function onSignOut() {
    await signOutFirebase();
    setUser(null);
  }

    // sendMessage – with history + mood
  async function sendMessage({ message, mood, history }) {
    let idToken = null;
    try {
      if (auth?.currentUser) {
        idToken = await getIdToken(auth.currentUser, true);
      }
    } catch (e) {
      console.warn("getIdToken error", e);
    }

    const resp = await fetch("/api/aira/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        message,
        mood,
        history, // 👈 important
      }),
    });

    const json = await resp.json();
    if (!resp.ok) {
      throw new Error(json.error || "AI error");
    }
    return json.reply;
  }


  // --------------------------
  //  ONE RETURN ONLY (important)
  // --------------------------
    return (
    <div className="min-h-screen relative">
      {auroraEnabled && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.45}
          />
        </div>
      )}

      {/* Header (imported above) */}
<Header
  user={user}
  onSignIn={onSignIn}
  onSignOut={onSignOut}
  onOpenMenu={() => window.dispatchEvent(new CustomEvent('aira:open-settings'))}
  onOpenAccount={() => window.dispatchEvent(new CustomEvent('aira:open-account'))}
/>


      {/* overlay the app UI over the aurora (ensure this container has higher z-index) */}
      <div style={{ position: "relative", zIndex: 5, paddingTop: 72 }}>
        <AiraChat user={user} onSignIn={onSignIn} onSignOut={onSignOut} sendMessage={sendMessage} />
      </div>
    </div>
  );
}