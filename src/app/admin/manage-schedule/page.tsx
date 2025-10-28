
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
import { PlusCircle, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Class as ClassEntry } from "@/lib/data-contracts";
import { Skeleton } from "@/components/ui/skeleton";
import { EditClassDialog } from "@/components/edit-class-dialog";

export default function ManageSchedulePage() {
  const isMobile = useIsMobile();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassEntry | null>(null);

  const classesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "classes");
  }, [firestore]);

  const { data: classes, isLoading } = useCollection<ClassEntry>(classesQuery);

  const handleAddNew = () => {
    setSelectedClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (classEntry: ClassEntry) => {
    setSelectedClass(classEntry);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedClass(null);
  }

  return (
    <>
      <DashboardHeader title="Manage Schedule" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-headline">Class Schedule</CardTitle>
              <CardDescription>
                View, add, or edit scheduled classes.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Class
            </Button>
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
                        <Button variant="outline" size="icon" onClick={() => handleEdit(classEntry)}>
                            <Edit className="h-4 w-4"/>
                            <span className="sr-only">Edit</span>
                        </Button>
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
                      <TableHead><span className="sr-only">Actions</span></TableHead>
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
                          <Button variant="outline" size="sm" onClick={() => handleEdit(classEntry)}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <EditClassDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        classData={selectedClass}
      />
    </>
  );
}
