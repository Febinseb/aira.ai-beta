import { useEffect, useState } from 'react';
import { auth, signInWithGoogle, signOutUser } from '../lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthButton({ onToken }) {
  const [user, setUser] = useState(null);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && onToken) {
        const token = await u.getIdToken();
        onToken(token);
      } else if (onToken) {
        onToken(null);
      }
    });
    return () => unsub();
  }, [onToken]);

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="text-sm">{user.displayName}</div>
          <button onClick={() => signOutUser()} className="ml-2 px-3 py-1 rounded-full bg-gray-700 text-white text-sm">Sign out</button>
        </>
      ) : (
        <button onClick={()=> signInWithGoogle()} className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white">Sign in with Google</button>
      )}
    </div>
  );
}
