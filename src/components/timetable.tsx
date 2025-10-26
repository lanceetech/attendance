
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TimetableEntry } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "./ui/skeleton";

type TimetableProps = {
  schedule: TimetableEntry[];
  title: string;
  description: string;
  isLoading: boolean;
};

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeSlots = Array.from({ length: 6 }, (_, i) => {
  const startTime = 8 + i * 2;
  return `${String(startTime).padStart(2, '0')}:00 - ${String(startTime + 2).padStart(2, '0')}:00`;
});

export default function Timetable({ schedule, title, description, isLoading }: TimetableProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {daysOfWeek.map(day => (
              <AccordionItem value={day} key={day}>
                <AccordionTrigger>{day}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {schedule.filter(e => e.day === day).length > 0 ? (
                      schedule.filter(e => e.day === day).map(entry => (
                        <div key={entry.id} className="p-2 rounded-lg bg-secondary/50 border border-secondary">
                           <p className="font-bold text-primary">{entry.time}</p>
                           <p className="font-semibold text-foreground">{entry.unitCode}: {entry.unitName}</p>
                           <p className="text-sm text-muted-foreground">{entry.lecturer}</p>
                           <p className="text-sm text-muted-foreground mt-1">Room: {entry.room}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No classes scheduled for {day}.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Time</TableHead>
                {daysOfWeek.map(day => (
                  <TableHead key={day}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.map((timeSlotLabel) => {
                const startTime = parseInt(timeSlotLabel.split(':')[0], 10);
                return (
                  <TableRow key={timeSlotLabel}>
                    <TableCell className="font-medium text-muted-foreground">{timeSlotLabel}</TableCell>
                    {daysOfWeek.map(day => {
                      const entry = schedule.find(e => {
                        const entryStartHour = parseInt(e.time.split(':')[0], 10);
                        return e.day === day && entryStartHour >= startTime && entryStartHour < startTime + 2;
                      });

                      return (
                        <TableCell key={day}>
                          {entry ? (
                            <div className="p-2 rounded-lg bg-secondary/50 border border-secondary">
                              <p className="font-bold text-primary">{entry.unitCode}</p>
                              <p className="text-sm font-medium text-foreground">{entry.unitName}</p>
                              <p className="text-xs text-muted-foreground">{entry.lecturer}</p>
                              <p className="text-xs text-muted-foreground mt-1">Room: {entry.room}</p>
                            </div>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
