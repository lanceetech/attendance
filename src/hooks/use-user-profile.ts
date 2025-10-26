
'use client';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { User as AuthUser } from 'firebase/auth';

// Define the shape of your user profile data in Firestore
interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  role: 'admin' | 'lecturer' | 'student';
  avatar?: string;
}

// Define the return type of the hook
interface UseUserProfileResult {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A custom hook to get the current user and their profile from Firestore.
 * It combines the authentication state from `useUser` with the user's
 * profile document from the `users` collection.
 */
export function useUserProfile(): UseUserProfileResult {
  const { user, isUserLoading: isAuthLoading, userError } = useUser();
  const firestore = useFirestore();

  // Create a memoized document reference to the user's profile
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  // Use the useDoc hook to fetch the profile data in real-time
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const isLoading = isAuthLoading || isProfileLoading;
  const error = userError || profileError;

  return {
    user,
    profile,
    isLoading,
    error
  };
}
