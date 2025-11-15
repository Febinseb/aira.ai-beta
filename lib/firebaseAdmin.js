// lib/firebaseAdmin.js
import admin from 'firebase-admin';

let firebaseAdmin = null;

function looksLikeBase64(str) {
  // basic heuristic: base64 strings are typically long, no leading '{', and contain only base64 chars
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed[0] === '{') return false;
  // allow = padding at end
  return /^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 100;
}

export function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  // Support either:
  //  - FIREBASE_SERVICE_ACCOUNT_JSON (raw single-line JSON), or
  //  - FIREBASE_SERVICE_ACCOUNT_B64 (base64), or
  //  - FIREBASE_SERVICE_ACCOUNT_JSON containing base64 (some users put it here).
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

  let serviceAccountObj = null;

  try {
    if (rawB64 && rawB64.trim().length > 0) {
      // decode B64 env var if provided
      const decoded = Buffer.from(rawB64, 'base64').toString('utf8');
      serviceAccountObj = JSON.parse(decoded);
    } else if (rawJson && looksLikeBase64(rawJson)) {
      // user accidentally stored base64 string in FIREBASE_SERVICE_ACCOUNT_JSON
      const decoded = Buffer.from(rawJson.trim(), 'base64').toString('utf8');
      serviceAccountObj = JSON.parse(decoded);
    } else if (rawJson && rawJson.trim().startsWith('{')) {
      // raw JSON string
      serviceAccountObj = JSON.parse(rawJson);
    } else {
      throw new Error('Missing or invalid FIREBASE_SERVICE_ACCOUNT env var. Provide either FIREBASE_SERVICE_ACCOUNT_B64 (preferred) or FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON).');
    }
  } catch (err) {
    // rethrow with more helpful message
    throw new Error('Failed to parse Firebase service account JSON from environment: ' + (err && err.message ? err.message : err));
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountObj),
  });

  firebaseAdmin = admin;
  return admin;
}
