// Example: client/src/app/context/NextAuthProvider.tsx (or client/src/providers/NextAuthProvider.tsx)
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface NextAuthProviderProps {
  children: React.ReactNode;
  // You can also pass the session object here as a prop if needed for SSR with App Router
  // session?: any; 
}

export default function NextAuthProvider({ children }: NextAuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}