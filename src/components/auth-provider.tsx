'use client';

import { useUserProfile } from '@/hooks/use-user-profile';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

const protectedRoutes = ['/admin', '/lecturer', '/student'];
const authRoutes = ['/', '/signup', '/onboarding'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, user, isLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (user && profile) {
      // User is logged in and has a profile
      const rolePath = `/${profile.role}`;
      
      if (authRoutes.includes(pathname)) {
        // If on an auth page, redirect to their role dashboard
        router.replace(rolePath);
      } else if (isProtectedRoute && !pathname.startsWith(rolePath)) {
        // If on a protected page for another role, redirect to their own dashboard
        router.replace(rolePath);
      }
    } else if (!user) {
        // User is not logged in
        if (isProtectedRoute) {
            // If trying to access a protected page, redirect to login
            router.replace('/');
        }
    }

  }, [profile, user, isLoading, router, pathname]);

  if (isLoading) {
    return (
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
  }

  return <>{children}</>;
}
