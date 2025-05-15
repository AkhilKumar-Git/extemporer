'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from 'lucide-react'; // Example chart icons
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Dummy data for analytics
const analyticsData = {
  weakWords: {
    count: 3,
    percentage: 1,
    words: ["actually", "so"],
    mostFrequent: "actually",
    funFact: "Your closest match was Justin Timberlake!",
  },
  fillerWords: {
    count: 7,
    percentage: 5, // Example: 5% of total words
    mostUsed: ["uh", "like"],
  },
  conciseness: {
    percentageExcess: 49, // Example: 49% more words than ideal
  },
  sentenceStarters: {
    common: ["And"], // Example: Sentences starting with "And"
    percentage: 29,
  },
  // Add more dummy analytics sections based on Yoodli screenshots
  // Pacing, Questions Asked, Eye Contact (video feature), Centering (video feature)
  // Talk Time, Monologues etc.
};

// A simple placeholder for a chart component
const PlaceholderChart = ({ title }: { title: string }) => (
  <div className="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
    <p className="text-sm text-muted-foreground">{title} Chart Placeholder</p>
  </div>
);

export default function AnalyticsPage() {
  // const params = useParams(); // to get recordingId if needed for fetching

  return (
    <div className="space-y-6">
      {/* Weak Words Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weak Words</CardTitle>
          <CardDescription>
            You used {analyticsData.weakWords.count} weak words ({analyticsData.weakWords.percentage}% of your speech).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Nice job! It's natural to have fewer than 4% weak words.</p>
          <Link href="#" className="text-xs text-primary hover:underline"><p>How to avoid weak words</p></Link>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium">{analyticsData.weakWords.count} kind of <span className="text-muted-foreground">({analyticsData.weakWords.words.join(", ")})</span></p>
            {/* Render more details if needed */}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Fun Fact: {analyticsData.weakWords.funFact}</p>
        </CardContent>
      </Card>

      {/* Filler Words Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filler Words</CardTitle>
          <CardDescription>You used {analyticsData.fillerWords.count} filler words, making up {analyticsData.fillerWords.percentage}% of your speech.</CardDescription>
        </CardHeader>
        <CardContent>
            <PlaceholderChart title="Filler Words Trend" />
            <div className="mt-3">
                <p className="text-sm font-medium">Most Used: <span className="text-muted-foreground">{analyticsData.fillerWords.mostUsed.join(", ")}</span></p>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">See suggestions</Button>
        </CardContent>
      </Card>

      {/* Conciseness Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conciseness</CardTitle>
          <CardDescription>Your speech was {analyticsData.conciseness.percentageExcess}% longer than ideal.</CardDescription>
        </CardHeader>
        <CardContent>
            <PlaceholderChart title="Conciseness Over Time" />
            <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">Learn how to be more concise</Button>
        </CardContent>
      </Card>
      
      {/* Sentence Starters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sentence Starters</CardTitle>
          <CardDescription>{analyticsData.sentenceStarters.percentage}% of your sentences started with common patterns like "{analyticsData.sentenceStarters.common.join(", ")}".</CardDescription>
        </CardHeader>
        <CardContent>
            <PlaceholderChart title="Sentence Starter Variety" />
            <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">Tips for varied sentence starters</Button>
        </CardContent>
      </Card>

       {/* Focus Analytics Dashboard style (simplified) */}
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Focus Analytics: Filler Words</CardTitle>
            <Link href="/dashboard/focus-analytics">
                <Button variant="outline" size="sm">Choose a focus</Button>
            </Link>
          </div>
          <CardDescription>Overall Average: {analyticsData.fillerWords.percentage}%</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-medium">Next Step:</p>
            <p className="text-sm text-muted-foreground mb-4">If you need time to think, try slowing down and pausing instead!</p>
            <PlaceholderChart title={`Filler Words Trend (e.g., ${analyticsData.fillerWords.mostUsed.join('/')})`} />
             <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Insights</h4>
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    <p>29% of your sentences start with "And"</p>
                    <Link href="#" className="text-xs text-primary hover:underline">Check out our free course on speech delivery</Link>
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground mt-2">
                    <p>This week you had a lower filler word percentage than Justin Timberlake</p>
                    <Link href="#" className="text-xs text-primary hover:underline">View Justin Timberlake's speech summary</Link>
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
} 