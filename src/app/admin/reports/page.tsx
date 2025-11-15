
'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DoorOpen, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportsPage() {
  const router = useRouter();

  const reports = [
    {
      title: "User List Report",
      description: "View and download a list of all registered students and lecturers.",
      icon: Users,
      href: '/admin/users',
    },
    {
      title: "Full Timetable Report",
      description: "View and download the complete class schedule.",
      icon: Calendar,
      href: '/admin/manage-schedule',
    },
    {
      title: "Classroom Status Report",
      description: "View and download a current status report for all classrooms.",
      icon: DoorOpen,
      href: '/admin/classrooms',
    },
  ];

  return (
    <>
      <DashboardHeader title="System Reports" />
      <main className="p-4 sm:p-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Report Generation</CardTitle>
                <CardDescription>
                Select a report to view and download as a printable document.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                <Card key={report.title}>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <report.icon className="h-8 w-8 text-muted-foreground" />
                        <CardTitle className="text-lg font-semibold">
                            {report.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                        <Button asChild>
                           <Link href={report.href}>
                             View Report <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
                ))}
            </CardContent>
        </Card>
      </main>
    </>
  );
}
