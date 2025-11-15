// lib/firebaseClient.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
if (!getApps().length && clientConfig.apiKey) {
  app = initializeApp(clientConfig);
} else if (getApps().length) {
  app = getApps()[0];
}

export const auth = app ? getAuth(app) : null;
if (auth) {
  auth.onAuthStateChanged((u) => {
    console.log("AUTH_STATE_CHANGED:", u);
  });
}

export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export async function signInWithGooglePopup() {
  if (!auth) throw new Error("Firebase auth not initialized");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
}

export async function signOutFirebase() {
  if (!auth) return;
  await fbSignOut(auth);
}

// helper: upload avatar file and return download URL
export async function uploadAvatarFile(uid, file) {
  if (!storage) throw new Error("Firebase storage not configured");
  const path = `avatars/${uid}/${Date.now()}_${file.name}`;
  const sref = storageRef(storage, path);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);
  return url;
}
