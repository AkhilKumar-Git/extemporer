'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListFilter, MoreHorizontal, Trash2, Edit, Eye, Search } from 'lucide-react';
import {
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import {
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase'; // Correct import for firestore instance

interface Scenario {
  id: string;
  title: string;
  category?: string;
  description?: string;
  createdAt?: string; // Changed from Timestamp to string
  // Add other fields as necessary
}

// Helper to format Firestore Timestamp or return a placeholder
const formatDate = (timestamp: string | undefined | null): string => { // Changed to expect string
  if (!timestamp) return 'Not available';
  return new Date(timestamp).toLocaleDateString('en-US', { // Use new Date() for string
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const scenariosCollection = collection(firestore, 'scenarios');
    const q = query(scenariosCollection, orderBy('createdAt', 'desc'));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedScenarios = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<Scenario, 'id' | 'createdAt'> & { createdAt?: Timestamp }; // Expect Timestamp from Firestore
          return {
          id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined, // Convert to ISO string if exists
          };
        });
        setScenarios(fetchedScenarios as Scenario[]);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching scenarios: ", err);
        setError("Failed to load scenarios. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleDeleteScenario = async (scenarioId: string) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      try {
        await deleteDoc(doc(firestore, 'scenarios', scenarioId));
        // The onSnapshot listener will automatically update the UI
        console.log(`Scenario ${scenarioId} deleted`);
      } catch (err) {
        console.error("Error deleting scenario: ", err);
        alert("Failed to delete scenario.");
      }
    }
  };

  const filteredScenarios = scenarios.filter(scenario => 
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (scenario.category && scenario.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6 px-0 sm:px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Scenarios</h1>
        <Link href="/admin/scenarios/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Scenario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario List</CardTitle>
          <CardDescription>View, edit, or delete practice scenarios.</CardDescription>
            <div className="mt-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search scenarios by title or category..."
                    className="pl-8 w-full md:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-muted-foreground py-4">Loading scenarios...</p>}
          {error && <p className="text-center text-destructive py-4">{error}</p>}
          {!loading && !error && filteredScenarios.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No scenarios found. {searchTerm ? 'Try adjusting your search.' : 'Click "Add New Scenario" to create one.'}
            </p>
          )}
          {!loading && !error && filteredScenarios.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="hidden md:table-cell">{formatDate(scenario.createdAt)}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={scenario.title}>{scenario.title}</TableCell>
                      <TableCell>
                        {scenario.category ? <Badge variant="outline">{scenario.category}</Badge> : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-sm truncate" title={scenario.description}>{scenario.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/scenarios/${scenario.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> View (implement later)
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteScenario(scenario.id)} className="text-destructive cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {/* Optional: Pagination if list becomes very long */}
        {/* <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-10</strong> of <strong>{scenarios.length}</strong> scenarios
          </div>
        </CardFooter> */}
      </Card>

    </div>
  );
} 