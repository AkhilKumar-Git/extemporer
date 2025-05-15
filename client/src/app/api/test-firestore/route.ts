import { NextResponse } from 'next/server';
import { initializeApp, getApps, FirebaseOptions, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Reuse existing app
}
const db = getFirestore(app);

export async function GET() {
  try {
    console.log('[Test Route] Attempting to connect to Firestore with projectId:', firebaseConfig.projectId);
    
    // IMPORTANT: Replace 'REPLACE_WITH_A_KNOWN_USER_ID_OR_TEST_DOC_ID' 
    // with an actual UID of a user in your Firebase Auth if one exists,
    // or the ID of a document you manually create in a 'test_users' collection for this test.
    const testDocId = '9EuzVNSouGhJcJiReit1ZS03hYi1'; 
    const testDocRef = doc(db, 'users', testDocId);
    // If testing with a different collection, change 'users' to your test collection name.
    // const testDocRef = doc(db, 'test_collection', testDocId);

    console.log(`[Test Route] Attempting to fetch document: users/${testDocId}`);
    const docSnap = await getDoc(testDocRef);

    if (docSnap.exists()) {
      console.log('[Test Route] Document found:', docSnap.data());
      return NextResponse.json({ success: true, message: 'Successfully fetched test document.', data: docSnap.data() });
    } else {
      console.log('[Test Route] Document not found, but connection to Firestore was likely attempted.');
      return NextResponse.json({ success: true, message: `Connected to Firestore, but document users/${testDocId} does not exist.` });
    }

  } catch (error: any) {
    console.error('[Test Route] Firestore connection test error:', error.message);
    console.error('[Test Route] Full error object:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Firestore connection failed', 
        error: error.message, 
        code: error.code, 
        projectIdUsed: firebaseConfig.projectId 
      }, 
      { status: 500 }
    );
  }
} 