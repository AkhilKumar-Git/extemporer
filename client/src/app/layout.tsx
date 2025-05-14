import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Extempore AI Coach',
  description: 'Improve your extempore speaking skills with AI-powered feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 