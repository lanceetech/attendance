
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUserProfile } from '@/hooks/use-user-profile';

const settingsSchema = z.object({
  newFeedbackNotifications: z.boolean().default(true),
  newUserNotifications: z.boolean().default(false),
  conflictResolutionSummary: z.boolean().default(false),
});

type AdminSettings = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isLoading: isProfileLoading } = useUserProfile();

  const { control, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<AdminSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      newFeedbackNotifications: true,
      newUserNotifications: false,
      conflictResolutionSummary: false,
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const settingsDocRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');
      getDoc(settingsDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          reset(docSnap.data() as AdminSettings);
        }
      });
    }
  }, [user, firestore, reset]);

  const onSubmit = (data: AdminSettings) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    const settingsDocRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');
    setDocumentNonBlocking(settingsDocRef, data, { merge: true });
    toast({ title: 'Preferences Saved', description: 'Your administrator settings have been updated.' });
  };

  if (isProfileLoading) {
    return (
        <>
            <DashboardHeader title="Settings" />
            <main className="p-4 sm:p-6 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
            </main>
        </>
    )
  }

  return (
    <>
      <DashboardHeader title="Administrator Settings" />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Admin Notifications</CardTitle>
            <CardDescription>Manage notifications for key system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="newFeedbackNotifications" className="text-base">New Feedback Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when a user submits feedback.
                  </p>
                </div>
                <Controller
                  name="newFeedbackNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="newFeedbackNotifications"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="newUserNotifications" className="text-base">New User Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new student or lecturer signs up.
                  </p>
                </div>
                <Controller
                  name="newUserNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="newUserNotifications"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="conflictResolutionSummary" className="text-base">Conflict Resolution Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly email digest of resolved timetable conflicts.
                  </p>
                </div>
                <Controller
                  name="conflictResolutionSummary"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="conflictResolutionSummary"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

