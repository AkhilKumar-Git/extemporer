'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayCircle, MessageSquareText, BarChart3, Loader2 } from "lucide-react"; // Icons
import { useSession } from 'next-auth/react';
import { db as firestore } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

interface Recording {
  id: string;
  title?: string; // Assuming topic can serve as title, or you might add a specific title field
  topic: string;
  createdAt: string; // Changed from Timestamp to string
  videoUrl: string;
  fileName?: string;
  // Add other fields you expect, like duration if you store it
  duration?: string; // Example, if you calculate and store this
}

// Helper to format Firestore Timestamp
const formatDate = (timestamp: string | undefined | null): string => { // Changed from Timestamp to string
  if (!timestamp) return 'Date not available';
  return new Date(timestamp).toLocaleDateString('en-US', { // Use new Date() for string
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Dummy data for past extempores
// const pastExtempores = [
//   {
//     id: "1",
//     title: "Mentoring Goals",
//     date: "May 12, 2025 at 8:43 PM",
//     duration: "0:57",
//     thumbnailUrl: "/placeholder-video-thumb.png", // Replace with actual thumbnail
//   },
//   {
//     id: "2",
//     title: "Sales Pitch Practice",
//     date: "May 10, 2025 at 2:15 PM",
//     duration: "1:23",
//     thumbnailUrl: "/placeholder-video-thumb.png",
//   },
//   {
//     id: "3",
//     title: "Impromptu Speech on AI",
//     date: "May 8, 2025 at 10:00 AM",
//     duration: "2:05",
//     thumbnailUrl: "/placeholder-video-thumb.png",
//   },
// ];

export default function PastExtemporesPage() {
  const { data: session, status: authStatus } = useSession();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'loading') {
      setLoading(true);
      return;
    }

    if (authStatus === 'unauthenticated' || !session || !session.user || !session.user.id) {
      setError("Please log in to view your past extempores.");
      setRecordings([]);
      setLoading(false);
      return;
    }
    
    const userId = session.user.id; // Assign to a constant after checks

    // At this point, user is authenticated and userId is available
    const fetchRecordings = async () => {
      setLoading(true);
      setError(null);
      try {
        const recordingsRef = collection(firestore, 'recordings');
        const q = query(
          recordingsRef,
          where("userId", "==", userId), // Use the constant userId
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedRecordings = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<Recording, 'id' | 'createdAt'> & { createdAt: Timestamp }; // Expect Timestamp from Firestore
          return {
          id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(), // Convert Timestamp to ISO string
          };
        });
        setRecordings(fetchedRecordings as Recording[]);
      } catch (err: any) {
        console.error("Error fetching recordings:", err);
        setError(err.message || "Failed to fetch recordings.");
      }
      setLoading(false);
    };
    fetchRecordings();

  }, [session, authStatus]);

  if (loading) { // Simplified loading check
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your extempores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <MessageSquareText className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-destructive">{error}</p>
        {authStatus !== 'authenticated' && (
             <Link href="/auth/signin" className="mt-4">
                <Button>Login</Button>
            </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Past Extempores</h1>
        {/* Maybe a filter/sort button here later */}
      </div>

      {recordings.length === 0 && (
        <div className="text-center py-10">
          <MessageSquareText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold ">No extempores yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by recording a new extempore.</p>
          <div className="mt-6">
            <Link href="/record"> 
              <Button>
                <PlayCircle className="mr-2 h-4 w-4" /> Start Recording
              </Button>
            </Link>
          </div>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recordings.map((extempore) => (
            <Card key={extempore.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-muted">
                {/* Placeholder for video thumbnail or a generic icon */}
                {/* You might generate thumbnails or use a default one */}
                <video src={extempore.videoUrl} className="object-cover w-full h-full" preload="metadata"></video>
                {/* <img 
                  src={"/placeholder-video-thumb.png"} 
                  alt={`Thumbnail for ${extempore.topic}`}
                  className="object-cover w-full h-full"
                /> */}
                {extempore.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {extempore.duration}
                    </div>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base truncate" title={extempore.topic}>{extempore.title || extempore.topic}</CardTitle>
                <CardDescription className="text-xs">{formatDate(extempore.createdAt)}</CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                <Link href={`/analysis/${extempore.id}/coaching`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquareText className="mr-1.5 h-4 w-4" /> Coaching
                  </Button>
                </Link>
                <Link href={`/analysis/${extempore.id}/analytics`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="mr-1.5 h-4 w-4" /> Analytics
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
