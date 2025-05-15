'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Users, ShieldAlert, Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button'; // For potential mobile nav toggle

// Local SidebarItem and SidebarGroup for Admin Layout
const AdminSidebarItem = ({ icon, text, href, currentPath }: { icon: React.ReactNode, text: string, href: string, currentPath: string }) => {
  const isActive = currentPath === href || (href !== '/admin' && currentPath.startsWith(href));
  return (
    (<Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>

      {icon}
      {text}

    </Link>)
  );
};

const AdminSidebarGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-2">
    {title && <h3 className="mb-1 px-3 text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider">{title}</h3>}
    <div className="flex flex-col gap-0.5">
        {children}
    </div>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // To determine active sidebar item
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading admin area...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session || session.user?.role !== 'admin') {
    if (typeof window !== 'undefined') { 
        router.replace('/dashboard');
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <p className="text-muted-foreground mt-2">Redirecting...</p>
        </div>
    ); 
  }

  const adminNavLinks = [
    { href: '/admin', icon: <LayoutDashboard size={20} />, text: 'Dashboard', group: 'Overview' },
    { href: '/admin/scenarios', icon: <ListChecks size={20} />, text: 'Scenarios', group: 'Content Management' },
    // { href: '/admin/personas', icon: <Users size={20} />, text: 'Personas', group: 'Content Management' },
    // { href: '/admin/users', icon: <Users size={20} />, text: 'Users', group: 'User Management' },
  ];

  const groupedLinks: { [key: string]: typeof adminNavLinks } = adminNavLinks.reduce((acc, link) => {
    const group = link.group || 'General';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(link);
    return acc;
  }, {} as { [key: string]: typeof adminNavLinks });

  const sidebarContent = (
    <nav className="flex flex-col gap-2 p-4 sm:p-0">
        <Link href="/admin" className="mb-4 hidden sm:block">
            <h2 className="text-xl font-semibold tracking-tight text-primary">Admin Panel</h2>
        </Link>
        {Object.entries(groupedLinks).map(([groupName, links]) => (
            <AdminSidebarGroup title={groupName} key={groupName}>
                {links.map(link => (
                    <AdminSidebarItem key={link.href} href={link.href} text={link.text} icon={link.icon} currentPath={pathname} />
                ))}
            </AdminSidebarGroup>
        ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 sm:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 flex-col border-r bg-background sm:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Sheet or similar could be used here too) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={() => setIsMobileNavOpen(false)}></div>
      )}
      {isMobileNavOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-60 flex-col border-r bg-background p-4 sm:hidden">
            <Link href="/admin" className="mb-4 flex items-center">
                <h2 className="text-xl font-semibold tracking-tight text-primary">Admin Panel</h2>
            </Link>
            {sidebarContent}
        </aside>
      )}
      
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Button 
             variant="outline" 
             size="icon" 
             className="sm:hidden" 
             onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
             <Menu className="h-5 w-5" />
             <span className="sr-only">Toggle Menu</span>
           </Button>
           {/* <h1 className="text-xl font-semibold hidden sm:block">Admin Section</h1> */}
           {/* Can add Breadcrumbs or User menu here */}
        </header>
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// Basic SidebarItem component if not using a shared one.
// It's better to import from a shared components directory.
// const SidebarItem = ({ icon, text, active }: { icon: React.ReactNode, text: string, active?: boolean }) => (
//   <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${active ? 'bg-muted text-primary' : ''}`}>
//     {icon}
//     {text}
//   </div>
// );

// const SidebarGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
//   <div className="mb-2">
//     <h3 className="mb-1 px-3 text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider">{title}</h3>
//     {children}
//   </div>
// );

// Note: The above SidebarItem and SidebarGroup are illustrative.
// The code currently refers to '@/components/layout/Sidebar' which is preferred if it exists and is suitable.
// If Sidebar.tsx does not export SidebarItem and SidebarGroup, these simple ones can be used or Sidebar.tsx adapted. 