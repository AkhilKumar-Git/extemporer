'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, MessageCircle, Zap, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dummy data - in a real app, this would come from the recording analysis
const coachingData = {
  strengths: [
    { id: 1, text: "You demonstrated genuine enthusiasm for learning and self-improvement.", details: "Nice job!" },
  ],
  growthAreas: [
    {
      id: 1,
      title: "Focus on organizing your main ideas",
      text: "Instead of listing multiple unrelated aspects, prioritize three key points that articulate your purpose clearly. For example, focus on why you want to join the mentoring session, what you bring to it, and what you hope to achieve.",
    },
    {
      id: 2,
      title: "Simplify your language",
      text: "Avoid vague phrases like \"kind of things\" and add concrete examples to eliminate ambiguity. This will make your message stronger and more memorable.",
    },
  ],
  followUpQuestions: [
    "What specific goals or outcomes are you hoping to achieve through the mentoring session at the middle school?",
  ],
  demeanor: {
    overall: "Sincere", // Could be Sincere, Warm, Nervous, etc.
    suggestions: [],
  },
  conciseness: {
    notes: "For example, I'd like to explore Duolingo practice sessions, understand customer requirements, and build from there. I also want to look into what I can explore around mentoring. Considering the customer requirements, I'd like to identify the right domains or use cases to make things clearer and help them connect the dots more easily.",
    percentageExcess: 25, // Example
  },
};

export default function CoachingPage() {
  // In a real app, you might fetch specific coaching data using useParams to get recordingId
  // const params = useParams();
  // const { recordingId } = params;

  return (
    <div className="space-y-6">
      {/* What went well */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5 text-green-500" /> What went well
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {coachingData.strengths.map((strength) => (
            <div key={strength.id} className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">{strength.text}</p>
              {strength.details && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{strength.details}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Growth Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="mr-2 h-5 w-5 text-amber-500" /> Growth Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coachingData.growthAreas.map((area) => (
            <div key={area.id} className="p-3 border border-amber-300 dark:border-amber-700 rounded-md bg-amber-50 dark:bg-amber-900/30">
              <h4 className="font-semibold text-amber-700 dark:text-amber-300">{area.title}</h4>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{area.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Follow-up Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageCircle className="mr-2 h-5 w-5 text-blue-500" /> Follow-up Questions
          </CardTitle>
          <CardDescription>Here are some follow-up questions you should be prepared for:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
            {coachingData.followUpQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">Practice</Button> {/* Link to a practice mode? */}
          </div>
        </CardContent>
      </Card>

      {/* Demeanor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demeanor</CardTitle>
          <CardDescription>Overall impression of your delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            {["Sincere", "Clear", "Warm", "Nervous"].map(tag => (
                <span key={tag} className={`px-3 py-1 text-xs font-medium rounded-full ${coachingData.demeanor.overall === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {tag}
                </span>
            ))}
          </div>
          {coachingData.demeanor.suggestions.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm">
              {/* coachingData.demeanor.suggestions.map((s, i) => <li key={i}>{s}</li>) */}
            </ul>
          )}
          <Button variant="link" size="sm" className="p-0 h-auto text-xs">See more</Button>
        </CardContent>
      </Card>

      {/* Conciseness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conciseness</CardTitle>
          {coachingData.conciseness.percentageExcess > 0 && (
             <CardDescription>
                You were <span className="font-semibold text-orange-500">{coachingData.conciseness.percentageExcess}%</span> less concise than ideal.
             </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm italic bg-muted p-3 rounded-md">{coachingData.conciseness.notes}</p>
          <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2">See more</Button>
        </CardContent>
      </Card>

    </div>
  );
} 