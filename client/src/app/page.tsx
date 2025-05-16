'use client';

import { useSession } from 'next-auth/react';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

export default function HomePage() {
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   if (status === 'loading') return; // Do nothing while loading
  //   if (!session) {
  //     router.replace('/auth/signin');
  //   }
  // }, [session, status, router]);

 

  if (status === 'loading') {
    return <p>Loading session...</p>; // Or a spinner
  }

  if (!session) {
    // This will be briefly visible before redirect, or if redirect fails
    // You could also return null or a loading spinner here
    return <p>Redirecting to sign in...</p>; 
  }

  // If session exists, user is authenticated
  return (
    <div className="container mx-auto py-8">

      <p className="mb-6">Welcome, {session.user?.name || session.user?.email}!</p>
      
      {/* Placeholder for other dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
          <p>No recent activity to display.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Statistics</h2>
          <p>No statistics available yet.</p>
        </div>
      </div>
      {/* You might list past extempores here or link to a separate page */}
    </div>
  );
}
