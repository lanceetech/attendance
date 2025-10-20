"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import Timetable from "@/components/timetable";
import { users, lecturerTimetable } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function LecturerDashboard() {
  const currentUser = users.lecturer;

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
          schedule={lecturerTimetable}
          title={`Welcome, ${currentUser.name}`}
          description="Here is your teaching schedule for the week."
        />
      </main>
    </>
  );
}
