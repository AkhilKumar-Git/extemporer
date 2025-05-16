import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin'; // Import the initialized Admin SDK Firestore instance
import { FieldValue } from 'firebase-admin/firestore'; // For serverTimestamp
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

export async function POST(request: Request) {
  try {
    // Ensure Admin SDK is initialized (it should be by importing adminDb)
    // but a log in admin.ts would confirm if it ran successfully on first API call.
    console.log('[API /api/save-recording-metadata] Route handler invoked.');

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      console.warn('[API /api/save-recording-metadata] User not authenticated or session missing user ID.');
      return NextResponse.json({ error: 'User not authenticated.', success: false }, { status: 401 });
    }
    const userId = session.user.id;
    console.log(`[API /api/save-recording-metadata] Authenticated user ID: ${userId}`);

    const body = await request.json();
    const {
      storagePath,
      downloadURL,
      fileName,
      contentType,
      size,
      createdAt // Assuming this is already an ISO string from the client
    } = body;

    if (!storagePath || !downloadURL || !fileName || !contentType || !size || !createdAt) {
      console.error('[API /api/save-recording-metadata] Missing required metadata fields:', body);
      return NextResponse.json({ error: 'Missing required metadata fields.', success: false }, { status: 400 });
    }

    const recordingData = {
      storagePath,
      downloadURL,
      fileName,
      contentType,
      size,
      userId: userId, // Add the authenticated user's ID
      createdAt: new Date(createdAt), // Convert ISO string to Firebase Timestamp or Date object
      updatedAt: FieldValue.serverTimestamp(), // Use server timestamp for updatedAt
      title: `Extempore - ${fileName.substring(0, Math.max(0,fileName.lastIndexOf('.')) || fileName.length)}`,
      description: `Recording made on ${new Date(createdAt).toLocaleDateString()}`,
      status: 'uploaded', // Initial status after successful upload and metadata creation
      analysis: null, 
      transcript: null, // Explicitly set transcript to null initially
      // Add any other default fields you need
    };

    console.log('[API /api/save-recording-metadata] Preparing to add document with data:', recordingData);

    const docRef = await adminDb.collection('recordings').add(recordingData);
    
    console.log('[API /api/save-recording-metadata] Document written to Firestore with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Recording metadata saved successfully.',
      // You can optionally return the full data written if the client needs it immediately
      // data: { ...recordingData, id: docRef.id, updatedAt: new Date().toISOString() } // Approximate updatedAt for client
    });

  } catch (error) {
    console.error('[API /api/save-recording-metadata] Error saving metadata to Firestore:', error);
    let errorMessage = 'Internal Server Error while saving metadata.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Consider logging the error to a more persistent logging service in production
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
} 