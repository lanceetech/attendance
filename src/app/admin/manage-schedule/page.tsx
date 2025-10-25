"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { users, courseUnits } from "@/lib/data";
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

export default function ManageSchedulePage() {
  const currentUser = users.admin;
  const isMobile = useIsMobile();

  return (
    <>
      <DashboardHeader title="Manage Schedule" user={currentUser} />
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
            {isMobile ? (
              <div className="space-y-4">
                {courseUnits.map((unit) => (
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
                    <div className="mt-4 text-sm text-muted-foreground">
                        <p><strong>Lecturer:</strong> {unit.lecturer}</p>
                        <p><strong>Schedule:</strong> {`Year ${unit.year}, Sem ${unit.semester}`}</p>
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
                      <TableHead>Assigned Lecturer</TableHead>
                      <TableHead>Year/Semester</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.code}</TableCell>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>{unit.lecturer}</TableCell>
                        <TableCell>{`Year ${unit.year}, Sem ${unit.semester}`}</TableCell>
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
