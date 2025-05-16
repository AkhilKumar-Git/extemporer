'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Use useState to ensure a stable QueryClient instance per session
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
