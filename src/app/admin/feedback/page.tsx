
'use client';

import { useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Feedback } from '@/lib/data-contracts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

type EnrichedFeedback = Feedback & {
    userName?: string;
    userRole?: string;
    userEmail?: string;
};

export default function ViewFeedbackPage() {
  const firestore = useFirestore();

  const feedbackQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: feedbackList, isLoading } = useCollection<EnrichedFeedback>(feedbackQuery);

  return (
    <>
      <DashboardHeader title="User Feedback" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Feedback Submissions</CardTitle>
            <CardDescription>Review feedback and issue reports from students and lecturers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading &&
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 rounded-lg border p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-3 w-1/5" />
                  </div>
                </div>
              ))}
            {!isLoading && (!feedbackList || feedbackList.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                <p>There is no feedback to display right now.</p>
              </div>
            )}
            {feedbackList?.map((feedback) => (
              <div key={feedback.id} className="flex items-start gap-4 rounded-lg border p-4">
                <Avatar>
                  <AvatarFallback>{feedback.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{feedback.userName || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{feedback.userEmail}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feedback.timestamp
                        ? formatDistanceToNow(feedback.timestamp.toDate(), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>
                   <p className="text-xs text-muted-foreground capitalize my-2">{feedback.userRole}</p>
                  <p className="text-sm text-foreground">{feedback.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
