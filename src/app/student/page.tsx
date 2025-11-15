
"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import Timetable from "@/components/timetable";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Class as TimetableEntry } from "@/lib/data-contracts";
import { useUserProfile } from "@/hooks/use-user-profile";
import UpcomingClasses from "@/components/upcoming-classes";
import PrintableReport from "@/components/printable-report";

export default function StudentDashboard() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const firestore = useFirestore();

  const timetableQuery = useMemo(() => {
    if (!firestore) return null;
    // In a real app, you would filter by studentId.
    // For this demo, we'll fetch the general student timetable and rely on client-side filtering if needed.
    // A more scalable solution would involve a subcollection on the student document or a query on an 'enrolledStudentIds' array.
    // For now, this query fetches a denormalized collection intended for students.
    const ref = collection(firestore, "studentTimetable");
    if (!profile) {
        // If the profile is not yet loaded, we return a query that will yield no results
        // by creating a condition that is impossible to satisfy.
        return query(ref, where("studentId", "==", ""));
    }
    // A real implementation would use something like `where('studentIds', 'array-contains', profile.uid)`
    // but for now we fetch the whole collection.
    return query(ref);

  }, [firestore, profile]);

  const { data: schedule, isLoading: isScheduleLoading } = useCollection<TimetableEntry>(timetableQuery);

  const isLoading = isProfileLoading || isScheduleLoading;
  const welcomeTitle = isLoading || !profile ? "Welcome" : `Welcome, ${profile.name}`;
  const description = "Here is your class schedule for the week.";

  return (
    <>
      <DashboardHeader title="My Timetable" />
      <main className="p-4 sm:p-6">
        <PrintableReport title="Student Timetable">
            <Timetable 
                schedule={schedule || []}
                isLoading={false}
                title={welcomeTitle}
                description={description}
            />
        </PrintableReport>
        <div className="non-printable">
            <UpcomingClasses schedule={schedule || []} isLoading={isLoading} />
            <Timetable
            schedule={schedule || []}
            isLoading={isLoading}
            title={welcomeTitle}
            description={description}
            />
        </div>
      </main>
    </>
  );
}
