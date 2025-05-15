'use client'; // Ensure this is at the top

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress is here
import Link from 'next/link';
import React, { useEffect, useState } from 'react'; // Added React, useEffect, useState
import { useSession } from 'next-auth/react'; // For getting user ID
import { db as firestore } from '@/lib/firebase'; // Firebase instance
import { collection, query, where, orderBy, getDocs, Timestamp, limit } from 'firebase/firestore'; // Added limit
import { Loader2, VideoIcon, AlertTriangle } from 'lucide-react'; // Added icons

// Interface for Recording data (can be shared or defined locally)
interface Recording {
  id: string;
  title?: string;
  topic: string;
  createdAt: string; // Store as ISO string after fetching
  videoUrl: string;
  fileName?: string;
  // Placeholder for insights - in a real app, this would be more structured
  topInsights?: string[]; 
}

// Helper to format Firestore Timestamp (if needed, but we'll convert to ISO string)
const formatDate = (timestampString: string | undefined | null): string => {
  if (!timestampString) return 'Date not available';
  return new Date(timestampString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);

  // Dummy data for coaching report
  const coachingReport = {
    repetition: {
      value: "5%",
      message: "You averaged 5% repetition in the past week. You're on a roll!",
    },
    weakWords: {
      value: "3.5%",
      message: "You averaged 3.5% weak word usage in the past week. You're doing great!",
    },
    fillerWords: {
      value: "4.8%",
      message: "You averaged 4.8% filler word usage in the past week.",
    },
    sentenceStarters: {
      value: "2 times",
      message: "In the past week, you used repeated sentence starters on average of 2 times per yoodli.",
    },
  };

  useEffect(() => {
    if (authStatus === 'loading') {
      setRecordingsLoading(true);
      return;
    }

    if (authStatus === 'unauthenticated' || !session?.user?.id) {
      setRecordingsError("Please log in to view your recent recordings.");
      setRecentRecordings([]);
      setRecordingsLoading(false);
      return;
    }
    
    const userId = session.user.id;

    const fetchRecentRecordings = async () => {
      setRecordingsLoading(true);
      setRecordingsError(null);
      try {
        const recordingsRef = collection(firestore, 'recordings');
        const q = query(
          recordingsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(2) // Fetch only the 2 most recent recordings
        );
        const querySnapshot = await getDocs(q);
        const fetchedRecordings = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<Recording, 'id' | 'createdAt' | 'topInsights'> & { createdAt: Timestamp }; // Adjust type
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(),
            // Dummy insights for now - replace with actual insight data if available
            topInsights: [
              `Insight 1 for ${data.topic || 'video'}`, 
              `Insight 2 for ${data.topic || 'video'}`
            ],
          } as Recording;
        });
        setRecentRecordings(fetchedRecordings);
      } catch (err: any) {
        console.error("Error fetching recent recordings:", err);
        setRecordingsError(err.message || "Failed to fetch recent recordings.");
      }
      setRecordingsLoading(false);
    };

    fetchRecentRecordings();
  }, [session, authStatus]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your coaching report from the last week</h1>
        {/* Add a dropdown for week/month/year later if needed */}
        <Link href="/dashboard/focus-analytics">
          <Button variant="outline">See dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>REPETITION</CardDescription>
            <CardTitle className="text-4xl">{coachingReport.repetition.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{coachingReport.repetition.message}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WEAK WORDS</CardDescription>
            <CardTitle className="text-4xl">{coachingReport.weakWords.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{coachingReport.weakWords.message}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>FILLER WORDS</CardDescription>
            <CardTitle className="text-4xl">{coachingReport.fillerWords.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{coachingReport.fillerWords.message}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SENTENCE STARTERS</CardDescription>
            <CardTitle className="text-4xl">{coachingReport.sentenceStarters.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{coachingReport.sentenceStarters.message}</p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Section - Updated */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Videos</h2>
            <Link href="/past-extempores">
                <Button variant="outline" size="sm">View All</Button>
            </Link>
        </div>
        
        {recordingsLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading videos...</p>
          </div>
        )}

        {!recordingsLoading && recordingsError && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <CardTitle className="text-base">Error</CardTitle>
            </div>
            <CardContent className="pt-2 text-sm text-destructive-foreground">
              {recordingsError}
            </CardContent>
          </Card>
        )}

        {!recordingsLoading && !recordingsError && recentRecordings.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <VideoIcon className="h-12 w-12 mx-auto mb-2" />
              No recent videos found.
              <div className="mt-4">
                <Link href="/record">
                  <Button>Record New Extempore</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!recordingsLoading && !recordingsError && recentRecordings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {recentRecordings.map((recording) => (
              <Card key={recording.id} className="overflow-hidden">
                <div className="grid md:grid-cols-2 items-start">
                  {/* Left: Video Preview */}
                  <div className="relative aspect-video bg-muted">
                    <video 
                        src={recording.videoUrl} 
                        className="object-cover w-full h-full" 
                        controls 
                        preload="metadata"
                    />
                    {/* You might want a play icon overlay here */}
                  </div>
                  {/* Right: Details & Insights */}
                  <div className="p-4">
                    <CardTitle className="text-lg mb-1 truncate" title={recording.topic}>
                      {recording.title || recording.topic}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mb-3">
                      Recorded on: {formatDate(recording.createdAt)}
                    </CardDescription>
                    <h4 className="text-sm font-semibold mb-1">Top Insights:</h4>
                    {recording.topInsights && recording.topInsights.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {recording.topInsights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No insights available yet.</p>
                    )}
                    <div className="mt-4 flex gap-2">
                        <Link href={`/analysis/${recording.id}/coaching`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">Coaching</Button>
                        </Link>
                        <Link href={`/analysis/${recording.id}/analytics`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">Analytics</Button>
                        </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Yoodli for video calls Placeholder - Renamed to Extempore for video calls */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Extempore for video calls</h2>
        <Card>
          <CardHeader>
            <CardTitle>Invite us to join your meeting as a participant</CardTitle>
            <CardDescription>
            Receive feedback and communications coaching for everyone on the call - best for speech coaches and corporate teams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Paste your meeting link to try recording an ongoing call.</p>
            {/* Input for meeting link - functionality to be added */}
            <div className="flex items-center space-x-2">
              <input type="text" placeholder="ex: us05web.zoom.us/j/1234abcd" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1" />
              <Button>Join</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Works with Zoom, Google Meet, MS Teams</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button variant="outline">Watch Video</Button>
            {/* Language selector - functionality to be added */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 