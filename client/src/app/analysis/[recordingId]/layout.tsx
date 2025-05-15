'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { db as firestore } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

// Updated interface to match Firestore data structure
interface RecordingData {
  id: string;
  topic: string;
  userId: string;
  videoUrl: string;
  fileName?: string;
  createdAt: string;
  status?: string;
  // For now, transcript will be handled by dummy data in child components or fetched separately
  // transcriptSnippets?: Array<{ time: string; text: string; highlighted?: string[] }>;
}

// Helper to format Firestore Timestamp
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Date not available';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Dummy transcript data - can be moved to a child component or fetched as needed
const dummyTranscriptSnippets = [
  { time: "0:00", text: "Give your 45 second elevator pitch to see your speaking baseline metrics!" },
  { time: "0:02", text: "Hi, um, Akhil Kumar. I would like to be part of the mentoring session at, uh, Middle School? I would love to know more about, uh, what else can I do and, uh, how can I actually think about multiple things?" },
  { time: "0:15", text: "Like, for example, uh, I would like to know the Duolingo practice sessions, and I would like to understand what is the customer requirements and kind of take it further ahead. And I would like to know more about what kind of things I would like to explore with regards to the mentoring aspect. And given the non-recording that I'm trying to serve, I would like to understand what kind of domain that I or use cases that I need to bring onto the table so they can understand much better comprehension. They can relate the dots or connect the dots much faster.", highlighted: ["what kind of things", "what kind of domain"] },
];

export default function AnalysisPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { recordingId: string };
}) {
  const pathname = usePathname();
  const { recordingId } = params;
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordingId) {
      const fetchRecordingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const recordingRef = doc(firestore, 'recordings', recordingId as string);
          const docSnap = await getDoc(recordingRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Omit<RecordingData, 'id' | 'createdAt'> & { createdAt: Timestamp };
            setRecording({
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt.toDate().toISOString(),
            } as RecordingData);
          } else {
            setError("Recording not found.");
          }
        } catch (err: any) {
          console.error("Error fetching recording data:", err);
          setError(`Failed to load recording data: ${err.message}`);
        }
        setIsLoading(false);
      };
      fetchRecordingData();
    }
  }, [recordingId]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Analysis</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/past-extempores">
          <Button variant="outline">Back to Past Extempores</Button>
        </Link>
      </div>
    );
  }

  if (!recording) {
    // This case should ideally be handled by the error state from fetchRecordingData
    // Or if recordingId was invalid from the start.
    return (
      <div className="flex flex-col justify-center items-center h-screen">
         <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Recording not found.</p>
        <Link href="/past-extempores" className="mt-4">
          <Button variant="outline">Back to Past Extempores</Button>
        </Link>
      </div>
    );
  }

  const coachingPath = `/analysis/${recording.id}/coaching`;
  const analyticsPath = `/analysis/${recording.id}/analytics`;

  const isCoachingActive = pathname === coachingPath;
  const isAnalyticsActive = pathname === analyticsPath;

  return (
    <div className="flex flex-col h-full">
      {/* Header section for Analysis Page */}
      <header className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/past-extempores">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold truncate max-w-md" title={recording.topic}>{recording.topic}</h1>
              <p className="text-xs text-muted-foreground">{formatDate(recording.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
            </Button>
            {/* Consider linking back to /record or a specific practice page */}
            <Link href={`/record?topic=${encodeURIComponent(recording.topic)}`}>
              <Button variant="outline" size="sm">
                Practice Again
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content area with video and tabbed children */}
      <div className="flex-grow overflow-auto p-2 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Video Player and Transcript Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-lg">
              <div className="aspect-video bg-slate-900">
                <video src={recording.videoUrl} controls className="w-full h-full" poster="/placeholder-video-thumb.png">
                  Your browser does not support the video tag.
                </video>
              </div>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Transcript</CardTitle>
                <Button variant="ghost" size="sm">
                  <Copy className="mr-2 h-4 w-4" /> Copy transcript
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-sm max-h-[300px] overflow-y-auto pr-2">
                {dummyTranscriptSnippets.map((snippet, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="font-mono text-xs text-muted-foreground whitespace-nowrap pt-0.5">{snippet.time}</span>
                    <p className="text-foreground">
                      {snippet.text.split(' ').map((word, i) => {
                        const isHighlighted = snippet.highlighted?.some(h => word.toLowerCase().includes(h.split(' ')[0].toLowerCase()));
                        return <span key={i} className={isHighlighted ? 'bg-yellow-200 dark:bg-yellow-700/70 rounded px-0.5' : ''}>{word} </span>;
                      })}
                    </p>
                  </div>
                ))}
                 {dummyTranscriptSnippets.length === 0 && (
                    <p className="text-muted-foreground">Transcript not available yet. It might be processing or this recording doesn't have one.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs and Content Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20"> {/* Adjust top value based on header height */}
              <div className="flex border-b mb-4">
                <Link href={coachingPath} className={`py-3 px-4 text-sm font-medium transition-colors ${isCoachingActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Coaching
                </Link>
                <Link href={analyticsPath} className={`py-3 px-4 text-sm font-medium transition-colors ${isAnalyticsActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  Analytics
                </Link>
              </div>
              {/* Pass recording data to children; consider React Context for deeper nesting */} 
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { recordingData: recording } as any);
                }
                return child;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 