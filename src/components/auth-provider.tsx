
'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

const protectedRoutes = ['/admin', '/lecturer', '/student', '/onboarding'];
const authRoutes = ['/', '/signup'];

const LoadingScreen = () => (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, user, isLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until user state is resolved
    }

    if (!user && isProtectedRoute) {
      // If user is not logged in and trying to access a protected route, redirect to login
      router.replace('/');
      return;
    }
    
    if (user && !profile && pathname !== '/onboarding' && !isLoading) {
        // This can happen briefly while the profile is loading after auth is confirmed.
        // Or if profile creation failed. For now, we wait or could redirect to an error/setup page.
        // A loading screen is shown below, so we can just wait.
        return;
    }

    if (user && profile) {
      // User is logged in and has a profile
      const rolePath = `/${profile.role}`;
      
      if (isAuthRoute) {
        // If on an auth page (login/signup), redirect to their role dashboard
        router.replace(rolePath);
      } else if (isProtectedRoute && !pathname.startsWith(rolePath) && pathname !== '/onboarding') {
        // If on a protected page for another role, redirect to their own dashboard
        router.replace(rolePath);
      }
    }

  }, [user, profile, isLoading, router, pathname, isProtectedRoute, isAuthRoute]);

  // If loading, or if we are on a protected route but don't have the user/profile yet, show a loading screen.
  if (isLoading || (isProtectedRoute && (!user || !profile))) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
