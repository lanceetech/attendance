
"use client";

import { useMemo } from "react";
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
import { Unit } from "@/lib/data-contracts";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageSchedulePage() {
  const isMobile = useIsMobile();
  const firestore = useFirestore();

  const courseUnitsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "units");
  }, [firestore]);

  const { data: courseUnits, isLoading } = useCollection<Unit>(courseUnitsQuery);

  return (
    <>
      <DashboardHeader title="Manage Schedule" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-headline">Course Units</CardTitle>
              <CardDescription>
                View, add, or edit course units and their assignments.
              </CardDescription>
            </div>
            <Button>
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
                {courseUnits?.map((unit) => (
                  <div key={unit.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-primary">{unit.code}</p>
                            <p className="font-semibold text-foreground">{unit.name}</p>
                        </div>
                        <Button variant="outline" size="icon">
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
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseUnits?.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.code}</TableCell>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>{unit.description}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Edit</Button>
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
    </>
  );
}
