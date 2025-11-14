
'use client';

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
import { UserProfile } from "@/lib/data-contracts";

const mockUsers: UserProfile[] = [
    { id: 'student-1', uid: 'student-1-uid', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'student' },
    { id: 'lecturer-1', uid: 'lecturer-1-uid', name: 'Dr. Robert Smith', email: 'robert.s@example.com', role: 'lecturer' },
    { id: 'student-2', uid: 'student-2-uid', name: 'Bob Williams', email: 'bob.w@example.com', role: 'student' },
    { id: 'student-3', uid: 'student-3-uid', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'student' },
    { id: 'lecturer-2', uid: 'lecturer-2-uid', name: 'Prof. Emily Davis', email: 'emily.d@example.com', role: 'lecturer' },
    { id: 'student-4', uid: 'student-4-uid', name: 'Diana Miller', email: 'diana.m@example.com', role: 'student' },
];


export default function ManageUsersPage() {
  return (
    <>
      <DashboardHeader title="Manage Users" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Users</CardTitle>
            <CardDescription>
              View all student and lecturer accounts in the system. (Mock Data)
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
                        {mockUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.role === 'lecturer' ? 'secondary' : 'outline'}
                                        className={cn(
                                            user.role === 'lecturer' && 'bg-blue-100 text-blue-800',
                                            user.role === 'student' && 'bg-purple-100 text-purple-800'
                                        )}
                                    >
                                        {user.role}
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
