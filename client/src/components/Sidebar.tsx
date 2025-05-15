'use client';
import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Users, BookOpen, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [showCookingAlert, setShowCookingAlert] = useState(false);

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-6 w-6" />
            <span>Extempore AI</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/home"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === '/home' ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname == '/dashboard' ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setShowCookingAlert(true)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname.startsWith('/scenarios') ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Scenarios
            </button>
            <Link
              href="/past-extempores"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === '/past-extempores' ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Past Extempores
            </Link>
            {/* Add other links like My Learning, Builder (if different from Practice) later */}
          </nav>
        </div>
        <div className="mt-auto p-4">
          {/* User profile / Upgrade button can go here */}
        </div>
      </div>
      {showCookingAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert variant="default" className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200">Heads up!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Something interesting is cooking up behind the scenes.
            </AlertDescription>
            <button
              className="ml-auto mt-2 text-green-600 dark:text-green-400 underline"
              onClick={() => setShowCookingAlert(false)}
            >
              Dismiss
            </button>
          </Alert>
        </div>
      )}
    </div>
  );
} 