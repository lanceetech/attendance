
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
import { UserProfile } from '@/lib/data-contracts';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle } from 'lucide-react';

export default function ManageUsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  return (
    <>
      <DashboardHeader title="Manage Users" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Users</CardTitle>
            <CardDescription>
              View all student and lecturer accounts in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      </TableRow>
                    ))}
                    {users?.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                             <UserCircle className="h-8 w-8 text-muted-foreground" />
                             <span className="font-medium">{user.name}</span>
                           </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "capitalize",
                                user.role === "admin" && "bg-blue-100 text-blue-800",
                                user.role === "lecturer" && "bg-green-100 text-green-800",
                                user.role === "student" && "bg-purple-100 text-purple-800",
                            )}
                        >
                            {user.role}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                    {!isLoading && users?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
