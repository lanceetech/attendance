
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
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Download } from "lucide-react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Unit } from '@/lib/data-contracts';
import { Skeleton } from '@/components/ui/skeleton';
import { EditUnitDialog } from '@/components/edit-unit-dialog';
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

export default function UnitsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const unitsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'units');
  }, [firestore]);

  const { data: units, isLoading } = useCollection<Unit>(unitsQuery);

  const handleAddNew = () => {
    setSelectedUnit(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!firestore || !unitToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'units', unitToDelete.id));
      toast({
        title: "Unit Deleted",
        description: `${unitToDelete.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Error deleting unit: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the unit. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedUnit(null);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <DashboardHeader title="Manage Course Units" />
      <main className="p-4 sm:p-6">
        <PrintableReport title="Course Units Report">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units?.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{unit.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PrintableReport>
        
        <div className="non-printable">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Course Unit Overview</CardTitle>
                <CardDescription>
                  View, add, or edit all available course units.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Unit
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
                      {units?.map(unit => (
                          <div key={unit.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold text-primary">{unit.code}</p>
                                      <p className="font-semibold">{unit.name}</p>
                                      <p className="text-sm text-muted-foreground mt-1">{unit.description}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button variant="outline" size="icon" onClick={() => handleEdit(unit)}>
                                          <Edit className="h-4 w-4"/>
                                          <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button variant="destructive" size="icon" onClick={() => handleDelete(unit)}>
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
                                  <TableHead>Code</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {units?.map((unit) => (
                              <TableRow key={unit.id}>
                                  <TableCell className="font-medium">{unit.code}</TableCell>
                                  <TableCell>{unit.name}</TableCell>
                                  <TableCell className="max-w-xs truncate">{unit.description}</TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex gap-2 justify-end">
                                          <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>Edit</Button>
                                          <Button variant="destructive" size="sm" onClick={() => handleDelete(unit)}>Delete</Button>
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
      <EditUnitDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        unitData={selectedUnit}
      />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the unit{' '}
              <span className="font-bold">{unitToDelete?.name}</span>.
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
