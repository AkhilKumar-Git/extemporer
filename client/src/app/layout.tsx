'use client';

import React from 'react'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/components/client-providers'
import '@/styles/globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { usePathname } from 'next/navigation'
import { AuthManager } from '@/components/AuthManager'
import NextAuthProvider from '@/app/context/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

// Metadata cannot be exported from a Client Component.
// If you need to set global metadata, it should be in a Server Component,
// or you can use the <Head> component from 'next/head' within your client component
// for title and meta tags, though the static metadata object is preferred for App Router.
// For now, we will comment it out to resolve the error.
/*
export const metadata = {
  title: 'Extempore AI Coach',
  description: 'Improve your extempore speaking skills with AI-powered feedback',
}
*/

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NextAuthProvider>
          <AuthManager />
          <ClientProviders>
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
              {!isAuthPage && <Sidebar />}
              <div className="flex flex-col flex-grow">
                {!isAuthPage && <Header />}
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                  {children}
                </main>
              </div>
            </div>
          </ClientProviders>
        </NextAuthProvider>
      </body>
    </html>
  )
} 