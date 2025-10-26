'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { profile, isLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!profile) {
      // Not logged in, redirect to login page
      router.replace('/');
      return;
    }

    // Redirect based on role
    switch (profile.role) {
      case 'admin':
        router.replace('/admin');
        break;
      case 'lecturer':
        router.replace('/lecturer');
        break;
      case 'student':
        router.replace('/student');
        break;
      default:
        // Fallback if role is not recognized
        router.replace('/');
        break;
    }
  }, [profile, isLoading, router]);

  // Display a loading state while we determine the user's role
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
