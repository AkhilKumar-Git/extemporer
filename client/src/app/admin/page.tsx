'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListChecks, Users, PlusCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Manage Scenarios
            </CardTitle>
            <CardDescription>Create, edit, and manage extempore practice scenarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/scenarios">
              <Button className="w-full">Go to Scenarios</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Manage Personas (Coming Soon)
            </CardTitle>
            <CardDescription>Define and manage AI personas for roleplay scenarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Go to Personas
            </Button>
          </CardContent>
        </Card>
        
        {/* Future card for User Management */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Manage Users (Coming Soon)
            </CardTitle>
            <CardDescription>View user list and manage user roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Go to Users
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
} 