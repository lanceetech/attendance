'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, MapPin } from "lucide-react";
import type { Class as TimetableEntry } from "@/lib/data-contracts";
import { Skeleton } from "./ui/skeleton";

interface UpcomingClassesProps {
  schedule: TimetableEntry[];
  isLoading: boolean;
}

export default function UpcomingClasses({ schedule, isLoading }: UpcomingClassesProps) {
  const getTodayUpcomingClasses = () => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    return schedule
      .filter(c => c.day === today)
      .filter(c => {
        const endTimeString = c.time.split(/[-–]/)[1]?.trim();
        if (!endTimeString) return false;
        const [endHour, endMinute] = endTimeString.split(':').map(Number);
        const classEndTime = new Date();
        classEndTime.setHours(endHour, endMinute || 0, 0, 0);
        return now < classEndTime;
      })
      .sort((a, b) => {
        const startTimeA = parseInt(a.time.split(/[-–]/)[0]?.trim().split(':')[0]);
        const startTimeB = parseInt(b.time.split(/[-–]/)[0]?.trim().split(':')[0]);
        return startTimeA - startTimeB;
      });
  };

  if (isLoading) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="font-headline">Today's Upcoming Classes</CardTitle>
                <CardDescription>A quick look at your schedule for the rest of today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
  }

  const upcomingClasses = getTodayUpcomingClasses();

  if (upcomingClasses.length === 0) {
    return null; // Don't render the card if there are no upcoming classes today
  }

  return (
    <Card className="mb-6 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-primary">Today's Upcoming Classes</CardTitle>
        <CardDescription>A quick look at your schedule for the rest of today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingClasses.map(entry => (
          <div key={entry.id} className="p-4 rounded-lg bg-background border flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted text-muted-foreground w-20 text-center">
                    <Clock className="h-5 w-5 mb-1"/>
                    <span className="text-sm font-semibold">{entry.time.split(/[-–]/)[0]?.trim()}</span>
                </div>
                <div>
                    <p className="font-bold text-foreground">{entry.unitCode}: {entry.unitName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>{entry.lecturerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.room}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
