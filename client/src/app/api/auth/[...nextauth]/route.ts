import NextAuth, { NextAuthOptions, User as NextAuthUser, DefaultSession, Account, Profile, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { FirestoreAdapter, FirebaseAdapterConfig } from "@next-auth/firebase-adapter";
import { doc, getDoc, setDoc, updateDoc, Timestamp, Firestore } from "firebase/firestore";
import { signInWithEmailAndPassword, User as FirebaseUser, getAuth } from "firebase/auth";
import { initializeApp, getApps, FirebaseOptions, deleteApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Import Firebase Admin SDK
import * as admin from 'firebase-admin';

// CRITICAL: Replace these placeholders with your actual Firebase project configuration!
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase Client App (for adapter and client-side auth simulation in Credentials)
// Ensure this doesn't conflict with a potential admin app name
const CLIENT_APP_NAME = '__client_app__';
let clientApp;
if (getApps().some(app => app.name === CLIENT_APP_NAME)) {
  clientApp = getApp(CLIENT_APP_NAME);
} else {
  clientApp = initializeApp(firebaseConfig, CLIENT_APP_NAME);
}
const db = getFirestore(clientApp) as Firestore;
const authClient = getAuth(clientApp);


// Initialize Firebase Admin SDK
// IMPORTANT: Set the FIREBASE_SERVICE_ACCOUNT_JSON environment variable
// with the stringified content of your Firebase service account JSON file.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com` // Optional: if using Realtime Database
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error:', e.message);
    // You might want to throw the error or handle it gracefully depending on your needs
    // For now, we'll log it and proceed, but custom token generation will fail.
  }
}


// Define a custom User type that includes 'role' and string-based 'emailVerified'
interface MyUser extends NextAuthUser {
  role?: string;
  emailVerified?: string | null;
  // id is already part of NextAuthUser
}

declare module "next-auth" {
  interface Session {
    firebaseCustomToken?: string;
    user?: MyUser & DefaultSession["user"]; // Use MyUser here
  }
  // No need to redeclare User here if MyUser serves the purpose
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string; // id is often preferred over sub for user identifier
    role?: string;
    firebaseCustomToken?: string;
    emailVerified?: string | null;
  }
}


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
      async authorize(credentials): Promise<MyUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        try {
          const userCredential = await signInWithEmailAndPassword(
            authClient,
            credentials.email,
            credentials.password
          );
          const firebaseUser: FirebaseUser = userCredential.user;

          if (firebaseUser) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            let userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              const creationTime = firebaseUser.metadata.creationTime ? Timestamp.fromDate(new Date(firebaseUser.metadata.creationTime)) : Timestamp.now();
              await setDoc(userDocRef, {
                name: firebaseUser.displayName || credentials.email.split('@')[0],
                email: firebaseUser.email,
                image: firebaseUser.photoURL,
                role: "user",
                emailVerified: firebaseUser.emailVerified ? creationTime : null, // Firestore stores Timestamp or null
              });
              userDocSnap = await getDoc(userDocRef);
            }
            
            const userData = userDocSnap.data();

            const formatTimestampToString = (ts: any): string | null => {
              if (ts instanceof Timestamp) {
                return ts.toDate().toISOString();
              }
              // Handle cases where it might already be a string (e.g., from direct Firestore data not via adapter initially)
              if (typeof ts === 'string') return ts;
              return null;
            };

            return {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              emailVerified: formatTimestampToString(userData?.emailVerified), // Ensure string | null
              name: userData?.name || firebaseUser.displayName,
              image: userData?.image || firebaseUser.photoURL,
              role: userData?.role || "user",
            } as MyUser; // Assert as MyUser
          }
          return null;
        } catch (error: any) {
          console.error("Credentials authorize error:", error.code, error.message);
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/network-request-failed' || error.code === 'unavailable') {
            throw new Error("Invalid email or password, or connection issue.");
          }
          throw new Error("Authentication failed during credentials sign-in.");
        }
      },
    }),
  ],
  adapter: FirestoreAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }: { token: JWT; user?: MyUser | AdapterUser; account?: Account | null; profile?: Profile }): Promise<JWT> {
      const formatTimestampForJWT = (ts: any): string | null => {
        if (ts instanceof Timestamp) { 
          return ts.toDate().toISOString();
        }
        if (ts && typeof ts.toDate === 'function' && !(ts instanceof Timestamp)) { // Handle non-Timestamp date-like objects from adapter
             return ts.toDate().toISOString();
        }
        if (ts === null || typeof ts === 'string') { 
          return ts;
        }
        return null; 
      };
      
      const adminApp = admin.apps.length > 0 ? admin.apps[0] : null;

      if (user) {
        token.id = user.id;
        const rawUser = user as MyUser; // Treat user consistently as MyUser within this block if possible
        token.role = rawUser.role || "user";
        if (rawUser.emailVerified !== undefined) { // emailVerified could be string, null, or Date from AdapterUser
          token.emailVerified = formatTimestampForJWT(rawUser.emailVerified);
        }
        
        if (adminApp && token.id) {
          try {
            token.firebaseCustomToken = await admin.auth(adminApp).createCustomToken(token.id);
            console.log("Firebase custom token generated for user:", token.id);
          } catch (e: any) {
            console.error("Error generating Firebase custom token in JWT callback:", e.message);
          }
        } else if (!adminApp) {
            console.warn("Firebase Admin SDK not initialized. Cannot generate custom token.");
        }
      }

      if (account?.provider === "google" && token.id) {
        const userDocRef = doc(db, "users", token.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          token.role = userData.role || token.role || "user"; 

          const googleName = profile?.name;
          const googleImage = (profile as any)?.picture || profile?.image;
          const updates: Record<string, any> = {};
          if (googleName && userData.name !== googleName) updates.name = googleName;
          if (googleImage && userData.image !== googleImage) updates.image = googleImage;
          if (!userData.role) updates.role = "user"; 

          if (Object.keys(updates).length > 0) await updateDoc(userDocRef, updates);
           // Ensure emailVerified in JWT is string | null for Google users after adapter might have processed
          if (userData.emailVerified !== undefined && token.emailVerified === undefined) {
             token.emailVerified = formatTimestampForJWT(userData.emailVerified);
          }

        } else {
          console.warn(`User document missing for Google user ${token.id} during JWT callback. FirestoreAdapter should handle creation.`);
          token.role = token.role || "user"; 
        }
        
        if (adminApp && token.id && !token.firebaseCustomToken) {
           try {
            token.firebaseCustomToken = await admin.auth(adminApp).createCustomToken(token.id);
            console.log("Firebase custom token generated for Google user in JWT callback:", token.id);
          } catch (e: any) {
            console.error("Error generating Firebase custom token for Google user in JWT callback:", e.message);
          }
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        (session.user as MyUser).role = token.role as string;
        if (token.emailVerified !== undefined) {
          (session.user as MyUser).emailVerified = token.emailVerified;
        }
      }
      if (token.firebaseCustomToken) {
        session.firebaseCustomToken = token.firebaseCustomToken;
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
