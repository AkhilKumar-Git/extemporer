'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client'; // Import auth as well
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import ReactPlayer from 'react-player/lazy'; // No longer needed here
// import CustomReactPlayer from '@/components/VideoPlayer/CustomReactPlayer'; // No longer needed in page.tsx

// Define an interface for your recording data structure
interface RecordingDetails {
  id: string;
  downloadURL?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  createdAt?: string | Date; // Store as ISO string or Firebase Timestamp
  updatedAt?: string | Date; // Added updatedAt
  title?: string;
  description?: string;
  status?: string;
  transcript?: string; // Placeholder for now
  userId?: string; // Ensure userId is in the interface if you expect it
  // Add other fields like userId, analysis results etc. as they become available
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const recordingId = params?.recordingId as string | undefined;
  const [recording, setRecording] = useState<RecordingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isClient, setIsClient] = useState(false); // No longer needed here

  // useEffect(() => {
  //   setIsClient(true); // No longer needed here
  // }, []);

  useEffect(() => {
    if (recordingId) {
      const fetchRecordingData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Log current Firebase client auth state
          console.log('[AnalysisPage] Current Firebase Client SDK Auth User:', auth.currentUser);
          if (auth.currentUser) {
            console.log('[AnalysisPage] Firebase Client SDK User UID:', auth.currentUser.uid);
          }

          console.log(`[AnalysisPage] Fetching recording data for ID: ${recordingId}`);
          const docRef = doc(db, 'recordings', recordingId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("[AnalysisPage] Raw data from Firestore:", data);
            const formattedData: RecordingDetails = {
              id: docSnap.id,
              ...data,
              // Ensure createdAt and updatedAt are handled correctly if they are Firestore Timestamps
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as RecordingDetails;
            console.log("[AnalysisPage] Formatted data for state:", formattedData);
            setRecording(formattedData);
          } else {
            console.warn(`[AnalysisPage] Recording not found for ID: ${recordingId}`);
            setError('Recording not found. It may have been deleted or the ID is incorrect.');
            setRecording(null);
          }
        } catch (err) {
          console.error("[AnalysisPage] Error fetching recording data:", err);
          if (err instanceof Error) {
            // Check for permission-denied specifically if possible, though Firestore errors can be generic
            if (err.message.toLowerCase().includes('permission-denied') || err.message.toLowerCase().includes('insufficient permissions')) {
              setError('Failed to load recording data: Missing or insufficient permissions. Please check Firestore security rules.');
            } else {
              setError(`Failed to load recording: ${err.message}`);
            }
          } else {
            setError('An unknown error occurred while fetching the recording.');
          }
          setRecording(null);
        }
        setLoading(false);
      };

      fetchRecordingData();
    } else {
      console.log('[AnalysisPage] No recording ID provided in URL params.');
      setError('No recording ID provided.');
      setLoading(false);
    }
  }, [recordingId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading recording analysis...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center text-center">
         <div className="w-full max-w-lg bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Error Loading Analysis</h2>
            <p className="text-sm mb-6">{error}</p>
            <Button onClick={() => router.push('/past-extempores')} variant="outline">
              Back to Past Extempores
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>No recording data available for this ID.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Extempore Analysis: {recording.title || recording.fileName || 'Untitled Recording'}
      </h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column (2/3 width) */} 
        <div className="w-full md:w-2/3 bg-muted/20 p-4 rounded-lg shadow">
          {/* Video Preview Section Removed - Now handled by layout.tsx */}
          
          {/* Transcript Placeholder */} 
          <div>
            <h2 className="text-2xl font-semibold mb-3">Transcript</h2>
            <div className="p-4 bg-white rounded shadow min-h-[200px] text-gray-700">
              <p>{recording.transcript || "Transcript will be generated and displayed here once available..."}</p>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */} 
        <div className="w-full md:w-1/3 bg-muted/20 p-4 rounded-lg shadow">
          {/* Analysis Placeholder */} 
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">AI Analysis</h2>
            <div className="p-4 bg-white rounded shadow min-h-[150px] text-gray-700">
              <p>AI-driven analysis and feedback will appear here shortly...</p>
              {/* Example: Overall score, key strengths, areas for improvement */} 
            </div>
          </div>

          {/* Coaching Insights Placeholder */} 
          <div>
            <h2 className="text-2xl font-semibold mb-3">Coaching Insights</h2>
            <div className="p-4 bg-white rounded shadow min-h-[150px] text-gray-700">
              <p>Personalized coaching insights and tips will be shown here soon...</p>
              {/* Example: Specific suggestions based on the analysis */} 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 