
'use client';

import { useMemo, useState } from 'react';
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
import { Mail, RefreshCw, UserCircle, Download, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/data-contracts';
import { Skeleton } from '@/components/ui/skeleton';
import PrintableReport from '@/components/printable-report';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AddLecturerDialog } from '@/components/add-lecturer-dialog';

export default function UserManagementPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isAddLecturerOpen, setIsAddLecturerOpen] = useState(false);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

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
  
  const handleDownload = () => {
    window.print();
  };

  const confirmDelete = async () => {
    if (!firestore || !userToDelete) return;

    try {
      // NOTE: This only deletes the Firestore record.
      // Deleting the Firebase Auth user requires admin privileges and a backend function,
      // which is beyond the current scope.
      await deleteDoc(doc(firestore, 'users', userToDelete.uid));
      toast({
        title: "User Deleted",
        description: `${userToDelete.name}'s profile has been removed from the database.`,
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error Deleting User",
        description: error.message || "Could not delete the user. Please try again.",
      });
      console.error("User deletion error:", error);
    } finally {
      setUserToDelete(null);
    }
  }

  return (
    <>
      <DashboardHeader title="User Management" />
      <main className="p-4 sm:p-6">
        <PrintableReport title="User List Report">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
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
                      className={cn(
                        user.role === 'lecturer' && "border-transparent bg-blue-100 text-blue-800",
                        user.role === 'admin' && "border-transparent bg-primary/20 text-primary"
                        )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PrintableReport>

        <div className="non-printable">
            <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Registered Users</CardTitle>
                    <CardDescription>
                    View all registered students and lecturers and manage their accounts.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddLecturerOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Lecturer
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
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
                    {isLoading && [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-9 w-36" /></TableCell>
                        </TableRow>
                    ))}
                    {users?.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={PlaceHolderImages.find(img => img.id === user.avatar)?.imageUrl} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge
                            variant={user.role === 'lecturer' ? 'secondary' : 'outline'}
                            className={cn(
                                user.role === 'lecturer' && "border-transparent bg-blue-100 text-blue-800",
                                user.role === 'admin' && "border-transparent bg-primary/20 text-primary"
                                )}
                            >
                            {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
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
                                <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setUserToDelete(user)}
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </div>
        <AddLecturerDialog isOpen={isAddLecturerOpen} onClose={() => setIsAddLecturerOpen(false)} />
        <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user profile for <span className="font-bold">{userToDelete?.name}</span>. Their authentication account will remain, but they will lose all profile data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Confirm Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}
