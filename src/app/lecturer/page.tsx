
"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import Timetable from "@/components/timetable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Class as TimetableEntry } from "@/lib/data-contracts";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function LecturerDashboard() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const firestore = useFirestore();

  const timetableQuery = useMemo(() => {
    if (!firestore || !profile) return null;
    return query(
      collection(firestore, "lecturerTimetable"),
      where("lecturerId", "==", profile.uid)
    );
  }, [firestore, profile]);

  const { data: schedule, isLoading: isScheduleLoading } = useCollection<TimetableEntry>(timetableQuery);

  const handleDownload = () => {
    window.print();
  };

  const isLoading = isProfileLoading || isScheduleLoading;

  return (
    <>
      <DashboardHeader title="My Timetable" />
      <main className="p-4 sm:p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Timetable
          </Button>
        </div>
        <Timetable 
          schedule={schedule || []}
          isLoading={isLoading}
          title={isLoading || !profile ? "Welcome" : `Welcome, ${profile.name}`}
          description="Here is your teaching schedule for the week."
        />
      </main>
    </>
  );
}
