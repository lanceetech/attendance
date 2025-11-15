
'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DoorOpen, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  const handleDownload = (path: string) => {
    // Navigate to the page and trigger print dialog
    const newWindow = window.open(path, '_blank');
    newWindow?.addEventListener('load', () => {
        setTimeout(() => {
            newWindow?.print();
        }, 500); // Small delay to ensure content is rendered
    });
  };

  const reports = [
    {
      title: "User List Report",
      description: "Generate a PDF list of all registered students and lecturers.",
      icon: Users,
      action: () => handleDownload('/admin/users'),
    },
    {
      title: "Full Timetable Report",
      description: "Download a PDF of the complete, denormalized class schedule.",
      icon: Calendar,
      action: () => handleDownload('/admin/manage-schedule'), // This page has no printable report yet. Good future enhancement.
    },
    {
      title: "Classroom Status Report",
      description: "Generate a current status report for all available classrooms.",
      icon: DoorOpen,
      action: () => handleDownload('/admin/classrooms'), // This page has no printable report yet. Good future enhancement.
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
                Select a report to generate and download as a PDF document.
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
                        <Button onClick={report.action}>
                            <Download className="mr-2 h-4 w-4" />
                            Generate & Download
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
