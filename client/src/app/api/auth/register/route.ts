import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Ensure your Firebase config is correctly set up, preferably using environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (client SDK for this route)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Optionally update the user's profile in Firebase Auth (e.g., displayName)
    if (name) {
      await updateProfile(firebaseUser, { displayName: name });
    }

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userData = {
      name: name || firebaseUser.displayName || email.split('@')[0],
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified ? Timestamp.now() : null, // Firebase Auth handles emailVerified, this is for adapter consistency
      image: firebaseUser.photoURL, // Will be null for email/password unless set later
      role: 'user', // Default role
      createdAt: Timestamp.now(), // Optional: track creation date
    };
    await setDoc(userDocRef, userData);

    // Return the Firebase user info (or a subset)
    // IMPORTANT: Do NOT return the password or other sensitive credential details
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500;

    // Handle Firebase specific errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          statusCode = 409; // Conflict
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          statusCode = 400;
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          statusCode = 400;
          break;
        default:
          errorMessage = 'Failed to register user.';
          statusCode = 500;
      }
    }
    return NextResponse.json({ message: errorMessage, error: error.code || error.message }, { status: statusCode });
  }
} 