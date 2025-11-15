
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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUserProfile } from '@/hooks/use-user-profile';

const settingsSchema = z.object({
  lessonReminders: z.boolean().default(true),
  timetableChanges: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
});

type UserSettings = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const { control, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<UserSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      lessonReminders: true,
      timetableChanges: true,
      emailNotifications: false,
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const settingsDocRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');
      getDoc(settingsDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          reset(docSnap.data() as UserSettings);
        }
      });
    }
  }, [user, firestore, reset]);

  const onSubmit = (data: UserSettings) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    const settingsDocRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');
    setDocumentNonBlocking(settingsDocRef, data, { merge: true });
    toast({ title: 'Preferences Saved', description: 'Your notification settings have been updated.' });
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
      <DashboardHeader title="Settings" />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications from ClassSync.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="lessonReminders" className="text-base">Lesson Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get push notifications for your upcoming classes.
                  </p>
                </div>
                <Controller
                  name="lessonReminders"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="lessonReminders"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="timetableChanges" className="text-base">Timetable Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when your teaching schedule is updated.
                  </p>
                </div>
                <Controller
                  name="timetableChanges"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="timetableChanges"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important administrative updates via email.
                  </p>
                </div>
                <Controller
                  name="emailNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="emailNotifications"
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
