
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { BookOpen, DoorOpen, Users, HardHat, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Feedback } from "@/lib/data-contracts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const firestore = useFirestore();

  const unitsQuery = useMemo(() => firestore ? collection(firestore, 'units') : null, [firestore]);
  const { data: courseUnits, isLoading: loadingUnits } = useCollection(unitsQuery);
  
  const classroomsQuery = useMemo(() => firestore ? collection(firestore, 'classrooms') : null, [firestore]);
  const { data: classrooms, isLoading: loadingClassrooms } = useCollection(classroomsQuery);
  
  const usersQuery = useMemo(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: loadingUsers } = useCollection(usersQuery);

  const feedbackQuery = useMemo(() => firestore ? query(collection(firestore, 'feedback'), orderBy('timestamp', 'desc'), limit(3)) : null, [firestore]);
  const { data: recentFeedback, isLoading: loadingFeedback } = useCollection<Feedback>(feedbackQuery);


  const stats = [
    { title: "Total Units", value: courseUnits?.length ?? 0, icon: BookOpen, href: "/admin/units", isLoading: loadingUnits },
    { title: "Registered Users", value: users?.length ?? 0, icon: Users, href: "/admin/users", isLoading: loadingUsers },
    { title: "Classrooms", value: classrooms?.length ?? 0, icon: DoorOpen, href: "/admin/classrooms", isLoading: loadingClassrooms },
    { title: "Feedback Items", value: recentFeedback?.length ?? 0, icon: MessageSquare, href: "/admin/feedback", isLoading: loadingFeedback },
  ];

  return (
    <>
      <DashboardHeader title="Administrator Dashboard" />
      <main className="p-4 sm:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-1/2" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                 <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary">
                    View details
                 </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/admin/manage-schedule">Manage Schedule</Link>
                    </Button>
                     <Button asChild>
                        <Link href="/admin/users">Manage Users</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/units">Manage Units</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/classrooms">Manage Classrooms</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/resolve-conflicts">Resolve Conflicts</Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/admin/feedback">View Feedback</Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/admin/system-status">System Status</Link>
                    </Button>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Feedback</CardTitle>
                    <CardDescription>Latest submissions from users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {loadingFeedback && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                   {!loadingFeedback && recentFeedback?.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent feedback.</p>
                   )}
                   {recentFeedback?.map(item => (
                       <div key={item.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                             <AvatarFallback>{item.userId.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-sm font-medium truncate">{item.message}</p>
                             <p className="text-xs text-muted-foreground">{formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })}</p>
                          </div>
                       </div>
                   ))}
                </CardContent>
            </Card>
        </div>

      </main>
    </>
  );
}
