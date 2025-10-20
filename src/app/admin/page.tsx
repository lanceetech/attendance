import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { users, courseUnits, classrooms } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard-header";
import { BookOpen, DoorOpen, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  { title: "Total Units", value: courseUnits.length, icon: BookOpen, href: "/admin/manage-schedule" },
  { title: "Active Conflicts", value: 2, icon: AlertTriangle, href: "/admin/resolve-conflicts" },
  { title: "Classrooms", value: classrooms.length, icon: DoorOpen, href: "/admin/classrooms" },
  { title: "Total Users", value: Object.keys(users).length, icon: Users, href: "#" },
];

export default function AdminDashboard() {
  const currentUser = users.admin;
  return (
    <>
      <DashboardHeader title="Administrator Dashboard" user={currentUser} />
      <main className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary">
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/admin/manage-schedule">Manage Schedule</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/resolve-conflicts">Resolve Conflicts</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/admin/classrooms">View Classrooms</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">All systems are operational.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
