import { DashboardHeader } from "@/components/dashboard-header";
import { users, classrooms } from "@/lib/data";
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

export default function ClassroomsPage() {
  const currentUser = users.admin;

  return (
    <>
      <DashboardHeader title="Classroom Status" user={currentUser} />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Classroom Overview</CardTitle>
            <CardDescription>
              Monitor the real-time status of all classrooms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classrooms.map((room) => (
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
