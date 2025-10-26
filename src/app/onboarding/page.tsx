
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-headline mt-4">Welcome to ClassSync!</CardTitle>
          <CardDescription>Your account has been created successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : (
            <p className="text-muted-foreground">
              Hello <span className="font-semibold text-foreground">{profile?.name}</span>, you are now ready to access your {profile?.role} dashboard.
            </p>
          )}
          <Button onClick={handleContinue} className="w-full max-w-xs mx-auto">
            Go to My Dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
