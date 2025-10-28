
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { BookOpen, DoorOpen, AlertTriangle, Users, HardHat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const firestore = useFirestore();

  const unitsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'units');
  }, [firestore]);
  const { data: courseUnits, isLoading: loadingUnits } = useCollection(unitsQuery);
  
  const classroomsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'classrooms');
  }, [firestore]);
  const { data: classrooms, isLoading: loadingClassrooms } = useCollection(classroomsQuery);
  
  const stats = [
    { title: "Total Units", value: courseUnits?.length ?? 0, icon: BookOpen, href: "/admin/manage-schedule", isLoading: loadingUnits },
    { title: "Total Students", value: 134, icon: Users, href: "#", isLoading: false }, // Mocked value
    { title: "Active Conflicts", value: 2, icon: AlertTriangle, href: "/admin/resolve-conflicts", isLoading: false }, // Mocked for now
    { title: "Classrooms", value: classrooms?.length ?? 0, icon: DoorOpen, href: "/admin/classrooms", isLoading: loadingClassrooms },
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
                 {stat.href !== '#' ? (
                   <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary">
                      View details
                   </Link>
                 ) : (
                    <p className="text-xs text-muted-foreground">Mock data</p>
                 )}
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
                    <Button asChild variant="secondary">
                        <Link href="/admin/resolve-conflicts">Resolve Conflicts</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/classrooms">View Classrooms</Link>
                    </Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <HardHat className="h-5 w-5 text-muted-foreground" />
                        System Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">All systems are operational.</p>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/system-status">View Status</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </main>
    </>
  );
}
