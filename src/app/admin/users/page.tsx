
'use client';

import { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserCircle } from "lucide-react";

// Mock data to represent users in the system
const mockUsers = [
  { id: '1', name: 'Dr. Alan Grant', email: 'alan.grant@example.com', role: 'lecturer' },
  { id: '2', name: 'Dr. Ian Malcolm', email: 'ian.malcolm@example.com', role: 'lecturer' },
  { id: '3', name: 'Dr. Ellie Sattler', email: 'ellie.sattler@example.com', role: 'lecturer' },
  { id: '4', name: 'Student One', email: 'student1@example.com', role: 'student' },
  { id: '5', name: 'Student Two', email: 'student2@example.com', role: 'student' },
  { id: '6', name: 'Student Three', email: 'student3@example.com', role: 'student' },
];

export default function UserManagementPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handlePasswordReset = async (email: string, id: string) => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase Error",
        description: "Authentication service is not available.",
      });
      return;
    }

    setResettingId(id);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${email} with instructions to reset their password.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description: error.message || "Could not send password reset email. Please try again.",
      });
      console.error("Password reset error:", error);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <>
      <DashboardHeader title="User Management" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Registered Users</CardTitle>
            <CardDescription>
              View all registered students and lecturers and manage their accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'lecturer' ? 'secondary' : 'outline'}
                          className={cn(user.role === 'lecturer' && "border-transparent bg-blue-100 text-blue-800")}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePasswordReset(user.email, user.id)}
                          disabled={resettingId === user.id}
                        >
                          {resettingId === user.id ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="mr-2 h-4 w-4" />
                          )}
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <p className="text-xs text-muted-foreground mt-4">
              Note: This page uses mock data for user display. The password reset functionality is live.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
