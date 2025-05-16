console.log('[AdminSDK] admin.ts module loading (top of file)...');
const rawJsonEnvVar = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
console.log('[AdminSDK] Raw FIREBASE_SERVICE_ACCOUNT_JSON (first 50 chars):', rawJsonEnvVar ? rawJsonEnvVar.substring(0,50) + '...' : 'NOT Found');
console.log('[AdminSDK] Raw GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Found' : 'NOT Found');
console.log(`[AdminSDK] NODE_ENV: ${process.env.NODE_ENV}`);

import * as admin from 'firebase-admin';

// IMPORTANT: Firebase Admin SDK Initialization
// ---------------------------------------------
// 1. Download your Service Account Key JSON file from:
//    Firebase Console > Project Settings > Service Accounts > Generate new private key.
// 2. DO NOT commit this file to your repository if you paste the credentials directly.
// 3. Recommended: Store the JSON key content as an environment variable (e.g., FIREBASE_SERVICE_ACCOUNT_JSON)
//    or the path to the file as an environment variable (e.g., GOOGLE_APPLICATION_CREDENTIALS).

function parseServiceAccount(): admin.ServiceAccount | undefined {
  const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJsonString) {
    console.log('[AdminSDK] parseServiceAccount: FIREBASE_SERVICE_ACCOUNT_JSON is NOT set.');
    return undefined;
  }
  console.log('[AdminSDK] parseServiceAccount: Attempting to parse FIREBASE_SERVICE_ACCOUNT_JSON...');
  try {
    const parsedConfig = JSON.parse(serviceAccountJsonString);
    if (!parsedConfig.project_id) {
      console.error('[AdminSDK] FATAL ERROR: Parsed FIREBASE_SERVICE_ACCOUNT_JSON is MISSING project_id.');
      throw new Error('Parsed FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id.');
    }
    console.log(`[AdminSDK] parseServiceAccount: Successfully parsed JSON for project: ${parsedConfig.project_id}.`);
    return parsedConfig as admin.ServiceAccount;
  } catch (e: any) {
    console.error('[AdminSDK] FATAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Ensure it is a valid single-line JSON string. Error:', e.message);
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
  }
}

let adminApp: admin.app.App | undefined = undefined;
let adminDbInstance: admin.firestore.Firestore | undefined = undefined;
let adminAuthInstance: admin.auth.Auth | undefined = undefined;
let adminStorageInstance: admin.storage.Storage | undefined = undefined;
let initializationError: Error | null = null;

if (process.env.NODE_ENV === 'development' && admin.apps.length > 0) {
    console.warn('[AdminSDK] Development mode: An admin app already exists. Attempting to delete it for re-initialization.');
    admin.apps.forEach(app => {
        if (app) {
            app.delete().catch(err => console.error('[AdminSDK] Error deleting existing app:', err));
        }
    });
    // After deletion, admin.apps should be empty or allow new default app.
    // This is a HACK for HMR issues. Use with caution.
}

if (admin.apps.length === 0) {
  console.log('[AdminSDK] No existing Firebase Admin app found. Attempting initialization...');
  try {
    const serviceAccount = parseServiceAccount();
    const appOptions: admin.AppOptions = {
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    };

    if (serviceAccount) {
      console.log('[AdminSDK] Initializing with explicit service account credentials.');
      appOptions.credential = admin.credential.cert(serviceAccount);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('[AdminSDK] Initializing with Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS found).');
      appOptions.credential = admin.credential.applicationDefault(); // Uses GOOGLE_APPLICATION_CREDENTIALS
    } else {
      console.error('[AdminSDK] FATAL: No credentials found (neither FIREBASE_SERVICE_ACCOUNT_JSON nor GOOGLE_APPLICATION_CREDENTIALS).');
      throw new Error('No Firebase Admin SDK credentials provided.');
    }

    adminApp = admin.initializeApp(appOptions);
    adminDbInstance = adminApp.firestore();
    adminAuthInstance = adminApp.auth();
    adminStorageInstance = adminApp.storage();
    console.log('[AdminSDK] Firebase Admin SDK initialized successfully.');
  } catch (e: any) {
    console.error('[AdminSDK] --- !!! Firebase Admin SDK FATAL INITIALIZATION ERROR !!! ---');
    console.error('[AdminSDK] Error Message:', e.message);
    console.error('[AdminSDK] Full Error Object:', e);
    initializationError = e;
  }
} else {
  console.log('[AdminSDK] Firebase Admin SDK already initialized (admin.apps.length > 0). Using existing app.');
  adminApp = admin.app(); // Get the default app
  adminDbInstance = adminApp.firestore();
  adminAuthInstance = adminApp.auth();
  adminStorageInstance = adminApp.storage();
}

// Exports that will throw if initialization failed
export const adminDb = adminDbInstance || (() => { throw initializationError || new Error("Admin SDK not initialized, Firestore unavailable."); })();
export const adminAuth = adminAuthInstance || (() => { throw initializationError || new Error("Admin SDK not initialized, Auth unavailable."); })();
export const adminStorage = adminStorageInstance || (() => { throw initializationError || new Error("Admin SDK not initialized, Storage unavailable."); })();
export { adminApp as admin, adminApp }; // Exporting adminApp for general use or type checking

export const isAdminSDKInitialized = () => !!adminApp && !initializationError; 