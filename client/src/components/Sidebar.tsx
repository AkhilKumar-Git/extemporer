'use client';
import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Users, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

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
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname === '/dashboard' || pathname === '/' ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/practice"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname.startsWith('/practice') ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Practice {/* This will be our scenarios page */}
            </Link>
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
    </div>
  );
} 