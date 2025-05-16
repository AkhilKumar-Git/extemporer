'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have this or will add it
import { Label } from '@/components/ui/label'; // Assuming you have this or will add it
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming you have this or will add it
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';

// Example categories - you might fetch these from Firestore or define them elsewhere
const scenarioCategories = [
  { value: 'sales', label: 'Sales' },
  { value: 'interview', label: 'Job Interview' },
  { value: 'management', label: 'Management' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'conflict-resolution', label: 'Conflict Resolution' },
  { value: 'other', label: 'Other' },
];

export default function NewScenarioPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      setIsLoading(false);
      return;
    }

    try {
      await addDoc(collection(firestore, 'scenarios'), {
        title: title.trim(),
        description: description.trim(),
        category: category || 'other', // Default category if none selected
        createdAt: serverTimestamp(),
        // Add any other fields relevant to your scenario structure
      });
      // router.push('/admin/scenarios'); // Navigate back to the list after successful creation
      // For now, let's show a success message and clear form, allowing admin to add more.
      alert('Scenario created successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
    } catch (err: any) {
      console.error("Error creating scenario: ", err);
      setError(`Failed to create scenario: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-0 sm:px-4 max-w-2xl">
        <div className="mb-4">
            <Link href="/admin/scenarios">
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Scenarios
                </Button>
            </Link>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Scenario</CardTitle>
          <CardDescription>Fill in the details for the new practice scenario.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Scenario Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Cold Sales Call Introduction"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Prompt</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} 
                placeholder="Provide a brief overview or the specific prompt for the user..."
                rows={5}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will be shown to the user when they start the extempore.
              </p>
            </div>

            {/* Add more fields here as needed, e.g., difficulty, tags, specific instructions */}

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/scenarios')} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              Create Scenario
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 