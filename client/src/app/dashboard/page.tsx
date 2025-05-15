'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Settings2, Mic, MessageSquare, Target, Plus, LayoutGrid } from "lucide-react"; // Added icons
import Link from "next/link";

export default function FocusAnalyticsDashboardPage() {
  // Placeholder data - in a real app, this would come from state/props/API
  const fillerWordsData = {
    overallAverage: "4.8%",
    nextStep: "If you need time to think, try slowing down and pausing instead!",
    mostUsed: ["uh", "like"],
    chartDataPoint: { date: "Monday, May 12", value: "4.8%", yoodliCount: 1, target: "3%" },
  };

  const insights = [
    {
      title: "29% of your sentences start with \"And\"",
      actionText: "Check out our free course on speech delivery",
      actionLink: "#", // Placeholder link
    },
    {
      title: "This week you had a lower filler word percentage than Justin Timberlake",
      actionText: "View Justin Timberlake's speech summary",
      actionLink: "#", // Placeholder link
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-muted-foreground">FOCUS ANALYTICS</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show data from the last</span>
          <Select defaultValue="7days">
            <SelectTrigger className="w-[100px] h-8 text-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 days</SelectItem>
              <SelectItem value="30days">30 days</SelectItem>
              <SelectItem value="90days">90 days</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">by</span>
           <Select defaultValue="all">
            <SelectTrigger className="w-[80px] h-8 text-sm">
              <SelectValue placeholder="By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="me">me</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs and Main Content Area */}
      <Tabs defaultValue="filler-words" className="flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="filler-words">Filler Words</TabsTrigger>
            <TabsTrigger value="pacing">Pacing</TabsTrigger>
            <TabsTrigger value="questions-asked">Questions Asked</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Choose a focus
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" /> {/* Placeholder for the rightmost icon */}
            </Button>
          </div>
        </div>

        <TabsContent value="filler-words" className="flex-grow">
          <Card className="h-full">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Details */}
              <div className="md:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">Filler Words</h2>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </div>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-0.5 h-auto border-sky-400 text-sky-600 bg-sky-50 hover:bg-sky-100">
                        <Settings2 className="mr-1 h-3 w-3" />
                        AUTHORITY
                    </Button>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Overall Average: <strong>{fillerWordsData.overallAverage}</strong></span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Mic className="h-5 w-5 text-primary" />
                    <span>Next Step:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{fillerWordsData.nextStep}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>Most used filler words</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {fillerWordsData.mostUsed.map(word => (
                      <span key={word} className="text-xs bg-muted px-2 py-1 rounded">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Chart Placeholder */}
              <div className="md:col-span-2 bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center min-h-[300px] relative">
                {/* Chart components would go here */}
                <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-muted-foreground">
                  Chart Placeholder
                </div>
                <div className="absolute" style={{ bottom: '20%', left: '55%'}}> {/* Approximate position from image */}
                    <div className="bg-white p-3 rounded-lg shadow-lg border text-xs w-40">
                        <p className="font-semibold">{fillerWordsData.chartDataPoint.date} • {fillerWordsData.chartDataPoint.yoodliCount} YOODLI</p>
                        <p className="text-2xl font-bold my-1 text-purple-600">{fillerWordsData.chartDataPoint.value}</p>
                        <p className="text-green-600">TARGET: {fillerWordsData.chartDataPoint.target}</p>
                    </div>
                </div>
                <div className="text-center mt-4">
                  <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                    Practice to see your speaking trends over time
                  </Button>
                </div>
                 {/* Dashed lines for target average and daily averages - simplified */}
                <div className="absolute w-full top-1/3 left-0 px-4">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>--- Target average</span>
                        <span>Daily averages ---</span>
                    </div>
                    <hr className="border-dashed border-green-500 my-1" style={{width: "calc(100% - 2rem)" }}/>
                </div>
                 <div className="absolute w-full top-1/2 left-0 px-4 mt-2"> {/* Second dashed line */}
                    <hr className="border-dashed border-green-500 my-1" style={{width: "calc(100% - 2rem)" }}/>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pacing">
          <Card>
            <CardHeader>
              <CardTitle>Pacing</CardTitle>
              <CardDescription>Pacing analytics will be shown here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Content for Pacing */}
              <p>Pacing chart and insights placeholder.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="questions-asked">
          <Card>
            <CardHeader>
              <CardTitle>Questions Asked</CardTitle>
              <CardDescription>Analysis of questions asked will be shown here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Content for Questions Asked */}
              <p>Questions Asked chart and insights placeholder.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights Section */}
      <div className="mt-auto pt-6"> {/* Pushes insights to the bottom if content above is not filling height */}
        <h2 className="text-lg font-semibold mb-3">INSIGHTS</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="font-semibold mb-2">{insight.title}</p>
                <Link href={insight.actionLink} className="text-sm text-primary hover:underline">
                  {insight.actionText} &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 