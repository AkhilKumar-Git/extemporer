'use client';

import React from 'react';
import { RecordingInterface } from '@/components/RecordingInterface';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { storage, db as firestore } from '@/lib/firebase'; // Assuming your firebase init exports 'storage' and 'firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Recording } from '@/types'; // Import the Recording type

export default function RecordExtemporePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

  const extemporeTopic = "Tell me about a time you faced a significant challenge and how you overcame it."; // Example topic

  const handleRecordingComplete = async (blobUrl: string, blob: Blob | null, durationInSeconds?: number) => {
    if (!blob) {
      setError("No recording data received. Please try again.");
      setIsSubmitting(false);
      setUploadProgress(null);
      return;
    }
    if (!session?.user?.id) {
      setError("User not authenticated. Please log in.");
      setIsSubmitting(false);
      setUploadProgress(null);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);

    const userId = session.user.id;
    
    try {
      const fileName = `${userId}_${Date.now()}.webm`; 
      const storageRef = ref(storage, `recordings/${userId}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log('Upload is ' + progress + '% done');
        },
        (uploadError: any) => {
          console.error("Upload failed:", uploadError);
          setError(`Upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
          setUploadProgress(null);
        },
        async () => {
          const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', videoUrl);
          setUploadProgress(100); 

          const recordingsCol = collection(firestore, 'recordings');
          // Use a more specific type, aligning with the Recording interface
          const docData: Partial<Recording> = {
            userId,
            title: extemporeTopic, // Using 'title' as per Recording interface, assuming topic is the title for now
            videoUrl,
            createdAt: serverTimestamp(),
            uploadStatus: 'completed', // Renamed from 'status'
            
            // Initialize AI Analysis Fields
            processingStatus: 'pending',
            transcript: undefined, 
            transcriptText: undefined,
            eyeContact: undefined,
            centering: undefined,
            pacing: undefined,
            pauses: undefined,
            selectedScenario: undefined,
            achievedGoals: undefined,
            coachFeedback: undefined,
            overallAnalysis: undefined,
            processingError: undefined,
            // thumbnailUrl, transcodedVideoUrl, audioUrl will be populated by backend functions
          };

          if (durationInSeconds && isFinite(durationInSeconds) && durationInSeconds > 0) {
            docData.durationSeconds = parseFloat(durationInSeconds.toFixed(2));
            console.log('[RecordPage] Saving timer-based duration to Firestore:', docData.durationSeconds);
          } else {
            console.warn('[RecordPage] Timer-based duration not valid or <=0, not saving. Received:', durationInSeconds);
          }
          
          const docRef = await addDoc(recordingsCol, docData);
          console.log(`Recording metadata saved with ID: ${docRef.id}`);
          router.push(`/analysis/${docRef.id}/coaching`); 
        }
      );

    } catch (e: any) {
      console.error("Error during submission process setup:", e);
      setError(`Submission failed: ${e.message || "Unknown error"}`);
      setIsSubmitting(false);
      setUploadProgress(null);
    }
    // setIsSubmitting will be handled by the uploadTask's error/complete callbacks
  };

  // If already submitting (e.g. after recording stopped and processing started),
  // RecordingInterface will show its own submitting state via the isSubmitting prop.
  // This page mostly orchestrates.

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full max-w-2xl" role="alert">
          <strong className="font-bold\">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isSubmitting && uploadProgress !== null && (
        <div className="mb-4 w-full max-w-2xl">
          <p className="text-center mb-2">Uploading video: {Math.round(uploadProgress)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}
      <RecordingInterface 
        extemporeTopic={extemporeTopic} 
        onRecordingComplete={handleRecordingComplete}
        isSubmitting={isSubmitting} 
      />
      <div className="mt-8 text-center">
        <Link href="/practice">
            <Button variant="outline" disabled={isSubmitting}>Back to Practice Scenarios</Button>
        </Link>
      </div>
    </div>
  );
} 