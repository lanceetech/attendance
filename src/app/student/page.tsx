
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

export default function StudentDashboard() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const firestore = useFirestore();

  const timetableQuery = useMemo(() => {
    if (!firestore || !profile) return null;
    // In a real app, you would filter by studentId. We are assuming some denormalization or a function to get student classes.
    // For this demo, we can't filter directly on an array of student IDs in a simple query.
    // Let's assume the 'studentTimetable' is pre-filtered or small enough for client-side filtering.
    // A more scalable solution would involve a subcollection on the student document.
    // For now, let's query where the student's ID might be in a hypothetical 'studentIds' array field.
    // This is a common pattern but requires Firestore array-contains query.
    // As a placeholder for a more complex backend, we'll fetch a general student timetable.
    return collection(firestore, "studentTimetable");
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
          description="Here is your class schedule for the week."
        />
      </main>
    </>
  );
}
