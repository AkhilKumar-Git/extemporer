'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { auth as firebaseAuth } from '@/lib/firebase'; // Your Firebase client auth instance
import { signInWithCustomToken, signOut } from 'firebase/auth'; // Corrected import

export function AuthManager() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncFirebaseAuth = async () => {
      if (status === 'authenticated' && session?.firebaseCustomToken) {
        if (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== session.user?.id) {
          try {
            console.log("Attempting to sign into Firebase with custom token...");
            await signInWithCustomToken(firebaseAuth, session.firebaseCustomToken);
            console.log("Successfully signed into Firebase client SDK. UID:", firebaseAuth.currentUser?.uid);
          } catch (error) {
            console.error("Error signing into Firebase with custom token:", error);
            // Optionally, sign out from NextAuth if Firebase sign-in fails critically
            // import { signOut as nextAuthSignOut } from "next-auth/react";
            // nextAuthSignOut();
          }
        } else if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid === session.user?.id) {
          // Already signed in with the correct user
          console.log("Firebase Auth already synchronized with NextAuth session.");
        }
      } else if (status === 'unauthenticated') {
        if (firebaseAuth.currentUser) {
          console.log("NextAuth session ended, signing out from Firebase client SDK.");
          await signOut(firebaseAuth); // Use the signOut from firebase/auth
        }
      }
    };

    syncFirebaseAuth();

  }, [session, status]);

  return null; // This component does not render anything
}
