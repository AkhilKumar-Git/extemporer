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

export default function DashboardPage() {
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

      {/* Videos Section Placeholder */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        <Card className="overflow-hidden">
          {/* Replace with actual video component or image */}
          <div className="bg-gray-300 h-60 w-full flex items-center justify-center">
            <span className="text-gray-500">Video Thumbnail Here</span>
          </div>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>8 Courses</CardDescription>
          </CardHeader>
        </Card>
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