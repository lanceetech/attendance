
'use client';

import { useMemo } from 'react';
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Classroom } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClassroomsPage() {
  const firestore = useFirestore();
  const classroomsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'classrooms');
  }, [firestore]);

  const { data: classrooms, isLoading } = useCollection<Classroom>(classroomsQuery);

  return (
    <>
      <DashboardHeader title="Classroom Status" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Classroom Overview</CardTitle>
            <CardDescription>
              Monitor the real-time status of all classrooms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      </TableRow>
                    ))}
                    {classrooms?.map((room) => (
                    <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>
                        <Badge
                            className={cn(
                                "border-transparent",
                                room.status === "Available"
                                ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                                : room.status === "In Use"
                                ? "bg-red-100 text-red-800 hover:bg-red-100/80"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
                            )}
                        >
                            {room.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
