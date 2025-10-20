import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TimetableEntry } from "@/lib/data";

type TimetableProps = {
  schedule: TimetableEntry[];
  title: string;
  description: string;
};

const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timetable({ schedule, title, description }: TimetableProps) {
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
              {Array.from({ length: 6 }).map((_, hourIndex) => {
                const startTime = 8 + hourIndex * 2;
                const timeSlotLabel = `${String(startTime).padStart(2, '0')}:00 - ${String(startTime + 2).padStart(2, '0')}:00`;

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
