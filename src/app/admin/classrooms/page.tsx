
'use client';

import { useState, useMemo } from 'react';
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
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Classroom } from '@/lib/data-contracts';
import { Skeleton } from '@/components/ui/skeleton';
import { EditClassroomDialog } from '@/components/edit-classroom-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import PrintableReport from '@/components/printable-report';

export default function ClassroomsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Classroom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Classroom | null>(null);

  const classroomsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'classrooms');
  }, [firestore]);

  const { data: classrooms, isLoading } = useCollection<Classroom>(classroomsQuery);

  const handleAddNew = () => {
    setSelectedRoom(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (room: Classroom) => {
    setSelectedRoom(room);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (room: Classroom) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!firestore || !roomToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'classrooms', roomToDelete.id));
      toast({
        title: "Classroom Deleted",
        description: `${roomToDelete.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Error deleting classroom: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the classroom. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedRoom(null);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <DashboardHeader title="Manage Classrooms" />
      <main className="p-4 sm:p-6">
        <PrintableReport title="Classroom Status Report">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms?.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PrintableReport>
        
        <div className="non-printable">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Classroom Overview</CardTitle>
                <CardDescription>
                  View, add, or edit all available classrooms.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Classroom
                </Button>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="space-y-4">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                  </div>
              ) : isMobile ? (
                  <div className="space-y-4">
                      {classrooms?.map(room => (
                          <div key={room.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold text-primary">{room.name}</p>
                                      <p className="text-sm text-muted-foreground">Capacity: {room.capacity}</p>
                                      <Badge
                                          className={cn(
                                              "mt-2 border-transparent",
                                              room.status === "Available"
                                              ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                                              : room.status === "In Use"
                                              ? "bg-red-100 text-red-800 hover:bg-red-100/80"
                                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
                                          )}
                                      >
                                          {room.status}
                                      </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button variant="outline" size="icon" onClick={() => handleEdit(room)}>
                                          <Edit className="h-4 w-4"/>
                                          <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button variant="destructive" size="icon" onClick={() => handleDelete(room)}>
                                          <Trash2 className="h-4 w-4"/>
                                          <span className="sr-only">Delete</span>
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="rounded-lg border">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Room Name</TableHead>
                                  <TableHead>Capacity</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
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
                                  <TableCell className="text-right">
                                      <div className="flex gap-2 justify-end">
                                          <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>Edit</Button>
                                          <Button variant="destructive" size="sm" onClick={() => handleDelete(room)}>Delete</Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <EditClassroomDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        classroomData={selectedRoom}
      />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the classroom{' '}
              <span className="font-bold">{roomToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
