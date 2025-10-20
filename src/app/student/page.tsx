"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import Timetable from "@/components/timetable";
import { users, studentTimetable } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function StudentDashboard() {
  const currentUser = users.student;

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <DashboardHeader title="My Timetable" user={currentUser} />
      <main className="p-4 sm:p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Timetable
          </Button>
        </div>
        <Timetable
          schedule={studentTimetable}
          title={`Welcome, ${currentUser.name}`}
          description="Here is your class schedule for the week."
        />
      </main>
    </>
  );
}
