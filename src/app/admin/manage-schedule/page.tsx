
"use client";

import { useMemo, useState } from "react";
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
import { PlusCircle, Edit, Trash2, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, deleteDoc, query, where } from "firebase/firestore";
import { Class as ClassEntry, UserProfile, Unit, Classroom } from "@/lib/data-contracts";
import { Skeleton } from "@/components/ui/skeleton";
import { EditClassDialog } from "@/components/edit-class-dialog";
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
import { useToast } from "@/hooks/use-toast";
import PrintableReport from "@/components/printable-report";


export default function ManageSchedulePage() {
  const isMobile = useIsMobile();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassEntry | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassEntry | null>(null);

  const classesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "classes");
  }, [firestore]);

  const { data: classes, isLoading: classesLoading } = useCollection<ClassEntry>(classesQuery);

  const lecturersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'lecturer'));
  }, [firestore]);

  const { data: lecturers, isLoading: lecturersLoading } = useCollection<UserProfile>(lecturersQuery);

  const unitsQuery = useMemo(() => firestore ? collection(firestore, 'units') : null, [firestore]);
  const roomsQuery = useMemo(() => firestore ? collection(firestore, 'classrooms') : null, [firestore]);

  const { data: units, isLoading: unitsLoading } = useCollection<Unit>(unitsQuery);
  const { data: rooms, isLoading: roomsLoading } = useCollection<Classroom>(roomsQuery);


  const isLoading = classesLoading || lecturersLoading || unitsLoading || roomsLoading;

  const handleAddNew = () => {
    setSelectedClass(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (classEntry: ClassEntry) => {
    setSelectedClass(classEntry);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (classEntry: ClassEntry) => {
    setClassToDelete(classEntry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!firestore || !classToDelete) return;

    try {
      // Delete from primary classes collection
      const classDocRef = doc(firestore, 'classes', classToDelete.id);
      await deleteDoc(classDocRef);
      
      // Delete from denormalized timetable collections
      const lecturerTimetableRef = doc(firestore, 'lecturerTimetable', classToDelete.id);
      await deleteDoc(lecturerTimetableRef);
      const studentTimetableRef = doc(firestore, 'studentTimetable', classToDelete.id);
      await deleteDoc(studentTimetableRef);

      toast({
        title: "Class Deleted",
        description: `${classToDelete.unitCode} has been removed from the schedule.`,
      });
    } catch (error) {
      console.error("Error deleting class: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the class. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedClass(null);
  }

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <DashboardHeader title="Manage Schedule" />
      <main className="p-4 sm:p-6">
        <PrintableReport title="Full Timetable Report">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Day & Time</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.map((classEntry) => (
                <TableRow key={classEntry.id}>
                  <TableCell>
                    <div className="font-medium">{classEntry.unitCode}</div>
                    <div className="text-sm text-muted-foreground">{classEntry.unitName}</div>
                  </TableCell>
                  <TableCell>{classEntry.lecturerName}</TableCell>
                  <TableCell>
                      <div>{classEntry.day}</div>
                      <div className="text-sm text-muted-foreground">{classEntry.time}</div>
                  </TableCell>
                  <TableCell>{classEntry.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PrintableReport>
        
        <div className="non-printable">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Class Schedule</CardTitle>
                <CardDescription>
                  View, add, or edit scheduled classes.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Class
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
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {classes?.map((classEntry) => (
                    <div key={classEntry.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="font-bold text-primary">{classEntry.unitCode}</p>
                              <p className="font-semibold text-foreground">{classEntry.unitName}</p>
                              <p className="text-sm text-muted-foreground">{classEntry.lecturerName} - {classEntry.day} {classEntry.time}</p>
                              <p className="text-sm text-muted-foreground">Room: {classEntry.room}</p>
                          </div>
                          <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(classEntry)}>
                                  <Edit className="h-4 w-4"/>
                                  <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(classEntry)}>
                                  <Trash2 className="h-4 w-4"/>
                                  <span className="sr-only">Delete</span>
                              </Button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Lecturer</TableHead>
                        <TableHead>Day & Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes?.map((classEntry) => (
                        <TableRow key={classEntry.id}>
                          <TableCell>
                            <div className="font-medium">{classEntry.unitCode}</div>
                            <div className="text-sm text-muted-foreground">{classEntry.unitName}</div>
                          </TableCell>
                          <TableCell>{classEntry.lecturerName}</TableCell>
                          <TableCell>
                              <div>{classEntry.day}</div>
                              <div className="text-sm text-muted-foreground">{classEntry.time}</div>
                          </TableCell>
                          <TableCell>{classEntry.room}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(classEntry)}>Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(classEntry)}>Delete</Button>
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
      <EditClassDialog 
        isOpen={isEditDialogOpen} 
        onClose={handleEditDialogClose} 
        classData={selectedClass}
        units={units || []}
        lecturers={lecturers || []}
        rooms={rooms || []}
        isLoading={isLoading}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class for{' '}
              <span className="font-bold">{classToDelete?.unitCode} - {classToDelete?.unitName}</span> and remove it from all related timetables.
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
