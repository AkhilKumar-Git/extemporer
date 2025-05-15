import NextAuth, { NextAuthOptions, User as NextAuthUser, DefaultSession, Account, Profile, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { auth as firebaseAuthInstance } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, Timestamp, Firestore } from "firebase/firestore";
import { signInWithEmailAndPassword, User as FirebaseUser, getAuth } from "firebase/auth";
import { initializeApp, getApps, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// CRITICAL: Replace these placeholders with your actual Firebase project configuration!
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Example: Using environment variables
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app); // This is the Firestore client instance the adapter needs
const authClient = getAuth(app); // Get auth instance from the same app

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AdapterUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        try {
          const userCredential = await signInWithEmailAndPassword(
            authClient, // Use the locally derived auth instance
            credentials.email,
            credentials.password
          );
          const firebaseUser: FirebaseUser = userCredential.user;

          if (firebaseUser) {
            const userDocRef = doc(db, "users", firebaseUser.uid); // Use the global db instance
            let userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              const creationTime = firebaseUser.metadata.creationTime ? Timestamp.fromDate(new Date(firebaseUser.metadata.creationTime)) : Timestamp.now();
              await setDoc(userDocRef, {
                name: firebaseUser.displayName || credentials.email.split('@')[0],
                email: firebaseUser.email,
                image: firebaseUser.photoURL,
                role: "user",
                emailVerified: firebaseUser.emailVerified ? creationTime : null,
              });
              userDocSnap = await getDoc(userDocRef);
            }
            
            const userData = userDocSnap.data();

            const formatTimestamp = (ts: any): string | null => {
              if (ts && typeof ts.toDate === 'function') {
                return ts.toDate().toISOString();
              }
              if (ts === null || typeof ts === 'string') {
                return ts;
              }
              return null;
            };

            return {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              emailVerified: formatTimestamp(userData?.emailVerified),
              name: userData?.name || firebaseUser.displayName,
              image: userData?.image || firebaseUser.photoURL,
              role: userData?.role || "user",
            } as AdapterUser & { role?: string };
          }
          return null;
        } catch (error: any) {
          console.error("Raw authorize error:", error);
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/network-request-failed' || error.code === 'unavailable') {
            throw new Error("Invalid email or password, or connection issue.");
          }
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],
  adapter: FirestoreAdapter(db as any), // Explicitly cast db to any to bypass stubborn type error
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }: { token: JWT; user?: AdapterUser | NextAuthUser; account?: Account | null; profile?: Profile }): Promise<JWT> {
      const formatTimestampForJWT = (ts: any): string | null => {
        if (ts && typeof ts.toDate === 'function') { 
          return ts.toDate().toISOString();
        }
        if (ts === null || typeof ts === 'string') { 
          return ts;
        }
        return null; 
      };

      if (user) {
        token.id = user.id;
        const rawUser = user as any;
        token.role = rawUser.role || "user";
        if (rawUser.emailVerified !== undefined) {
          token.emailVerified = formatTimestampForJWT(rawUser.emailVerified);
        }
      }
      if (account?.provider === "google" && token.id) {
        const userDocRef = doc(db, "users", token.id); // Use the global db instance
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const currentRole = userData.role;
          if (!currentRole) {
            await updateDoc(userDocRef, { role: "user" });
            token.role = "user";
          } else {
            token.role = currentRole;
          }
          const googleName = profile?.name;
          const googleImage = (profile as any)?.picture || profile?.image;
          const updates: Record<string, any> = {};
          if (googleName && userData.name !== googleName) updates.name = googleName;
          if (googleImage && userData.image !== googleImage) updates.image = googleImage;
          if (Object.keys(updates).length > 0) await updateDoc(userDocRef, updates);
        } else {
          console.warn(`User document missing for Google user ${token.id}, adapter might need review.`);
          token.role = token.role || "user"; 
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.emailVerified !== undefined) {
          (session.user as any).emailVerified = token.emailVerified;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
