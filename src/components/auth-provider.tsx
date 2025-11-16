
'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';
import Logo from './logo';

const protectedRoutes = ['/admin', '/lecturer', '/student', '/onboarding'];
const authRoutes = ['/', '/signup'];
const LOADING_TIMEOUT = 10000; // 10 seconds

const LoadingScreen = () => (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="flex items-center space-x-4">
        <Logo className="h-12 w-12 animate-pulse" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
);

const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="mt-4 font-headline">Connection Error</CardTitle>
                <CardDescription>
                    Could not connect to the authentication service. This might be a network issue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={onRetry}>Retry Connection</Button>
            </CardContent>
        </Card>
    </main>
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, user, isLoading, error: profileError } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
        if (isLoading) {
            setHasTimedOut(true);
        }
    }, LOADING_TIMEOUT);

    return () => clearTimeout(timer);
  }, [isLoading]);


  useEffect(() => {
    if (isLoading || hasTimedOut) {
      return;
    }

    if (profileError) {
        console.error("Auth Provider Error:", profileError);
        // Let the error screen handle this state
        return;
    }

    if (!user && isProtectedRoute) {
      router.replace('/');
      return;
    }
    
    if (user && !profile && pathname !== '/onboarding' && !isLoading) {
        return;
    }

    if (user && profile) {
      const rolePath = `/${profile.role}`;
      
      if (isAuthRoute) {
        router.replace(rolePath);
      } else if (isProtectedRoute && !pathname.startsWith(rolePath) && pathname !== '/onboarding') {
        router.replace(rolePath);
      }
    }

  }, [user, profile, isLoading, hasTimedOut, profileError, router, pathname, isProtectedRoute, isAuthRoute]);

  const handleRetry = () => {
    setHasTimedOut(false);
    // A full reload is the most reliable way to force a reconnection attempt
    window.location.reload();
  };

  if (hasTimedOut || (profileError && !isLoading)) {
    return <ErrorScreen onRetry={handleRetry} />;
  }

  if (isLoading || (isProtectedRoute && (!user || !profile))) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
