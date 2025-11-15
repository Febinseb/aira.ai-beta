export default function handler(req, res) {
  res.status(200).json({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "(missing)",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "(missing)",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "(missing)"
  });
}
