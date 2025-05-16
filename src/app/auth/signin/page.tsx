'use client';

import { getProviders, signIn, getCsrfToken } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProviderButtonProps {
  providerId: string;
  name: string;
  csrfToken?: string; // CSRF token might be needed for credentials
}

function ProviderButton({ providerId, name, csrfToken }: ProviderButtonProps) {
  if (providerId === 'credentials') {
    // Credentials form will handle its own submission with signIn
    return null;
  }
  return (
    <Button onClick={() => signIn(providerId)} className="w-full">
      Sign in with {name}
    </Button>
  );
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof getProviders>> | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchProvidersAndToken() {
      const providerData = await getProviders();
      setProviders(providerData);
      const csrf = await getCsrfToken();
      setCsrfToken(csrf);
    }
    fetchProvidersAndToken();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/'); // or '/dashboard'
    }
  }, [status, router]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await signIn('credentials', {
      redirect: false, // Handle redirect manually or based on error
      email,
      password,
      // csrfToken: csrfToken, // NextAuth usually handles CSRF for credentials automatically with POST
    });

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok && result?.url) {
      // Successful sign-in, NextAuth default is to redirect to previous page or root
      // You can force a redirect here if needed: window.location.href = '/';
      window.location.href = '/'; // Or wherever you want to redirect
    } else if (result?.ok && !result?.url) {
       // this case can happen if redirect is false and there is no error, but also no specific url (e.g. already on a protected page)
       window.location.href = '/';
    }
  };

  if (!providers) {
    return <div>Loading providers...</div>; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {providers.credentials && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Sign in with Email</Button>
            </form>
          )}
          {Object.values(providers).map((provider) => {
            if (provider.id === 'credentials') return null; // Already handled
            return (
              <ProviderButton 
                key={provider.id} 
                providerId={provider.id} 
                name={provider.name} 
              />
            );
          })}
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="underline">
              Register / Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 