
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

interface UserSettings {
  lessonReminders?: boolean;
  timetableChanges?: boolean;
  emailNotifications?: boolean;
}


// Define the return type of the hook
interface UseUserProfileResult {
  user: AuthUser | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A custom hook to get the current user and their profile from Firestore.
 * It combines the authentication state from `useUser` with the user's
 * profile document and settings from Firestore.
 */
export function useUserProfile(): UseUserProfileResult {
  const { user, isUserLoading: isAuthLoading, userError } = useUser();
  const firestore = useFirestore();

  // Create a memoized document reference to the user's profile
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const settingsDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'settings', 'preferences');
  }, [user, firestore]);

  // Use the useDoc hook to fetch the profile and settings data in real-time
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);
  const { data: settings, isLoading: areSettingsLoading, error: settingsError } = useDoc<UserSettings>(settingsDocRef);


  const isLoading = isAuthLoading || isProfileLoading || areSettingsLoading;
  const error = userError || profileError || settingsError;

  return {
    user,
    profile,
    settings,
    isLoading,
    error
  };
}
