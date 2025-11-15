// components/AccountModal.jsx
import React, { useState } from "react";
import { uploadAvatarFile } from "../lib/firebaseClient";
import { auth, db } from "../lib/firebaseClient";
import { updateProfile } from "firebase/auth";

export default function AccountModal({ open, onClose, user, onProfileUpdated }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatarFile(user.uid, file);
      // update Firebase Auth profile if available
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      onProfileUpdated?.(url);
    } catch (err) {
      console.error("avatar upload failed", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${open ? "" : "pointer-events-none"}`}>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`glass p-5 w-full max-w-md z-50 transform transition-all ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Account</h3>
          <button onClick={onClose} className="text-white/60">Close</button>
        </div>

        <div className="flex gap-4 items-center">
          <img src={user?.photoURL || "/favicon.ico"} alt="avatar" className="w-20 h-20 rounded-lg object-cover" />
          <div>
            <div className="font-medium">{user?.displayName || "Unknown"}</div>
            <div className="text-xs text-white/60">{user?.email}</div>
            <div className="mt-3">
              <label className="btn-ghost cursor-pointer inline-flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                {uploading ? "Uploading..." : "Change picture"}
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-white/60">Your display picture will update after upload.</div>
      </div>
    </div>
  );
}
