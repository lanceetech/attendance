
'use client';

import { useState, useMemo } from 'react';
import {
  DashboardHeader
} from '@/components/dashboard-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { QrCode, Users, Download } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Class as TimetableEntry, AttendanceRecord } from '@/lib/data-contracts';
import { useUserProfile } from '@/hooks/use-user-profile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

export default function AttendancePage() {
  const {
    profile
  } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState < string | null > (null);
  const [isQrVisible, setIsQrVisible] = useState(false);

  const timetableQuery = useMemo(() => {
    if (!firestore || !profile) return null;
    return query(
      collection(firestore, 'lecturerTimetable'),
      where('lecturerId', '==', profile.uid)
    );
  }, [firestore, profile]);

  const {
    data: upcomingClasses,
    isLoading: isClassesLoading
  } =
  useCollection < TimetableEntry > (timetableQuery);

  const attendanceQuery = useMemo(() => {
    if (!firestore || !selectedClassId) return null;
    return collection(firestore, 'classes', selectedClassId, 'attendance');
  }, [firestore, selectedClassId]);

  const {
    data: attendanceList,
    isLoading: isAttendanceLoading
  } =
  useCollection < AttendanceRecord > (attendanceQuery);

  const getSelectedClassDetails = () => {
    if (!selectedClassId || !upcomingClasses) return null;
    return upcomingClasses.find((c) => c.id === selectedClassId);
  };

  const generatedQrCodeUrl = () => {
    const classDetails = getSelectedClassDetails();
    if (!classDetails) return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UnifiedScheduler';

    // The data includes the class ID for the student to write their attendance record to.
    const data = `unified-scheduler-attendance::${classDetails.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      data
    )}`;
  };
  
  const handleDownloadAttendance = () => {
    if (!attendanceList || attendanceList.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There is no attendance data to download.',
      });
      return;
    }

    const classDetails = getSelectedClassDetails();
    const formattedData = attendanceList.map(record => ({
      'Student Name': record.studentName,
      'Admission Number': record.admissionNumber || 'N/A',
      'Time Checked In': record.timestamp ? new Date(record.timestamp.seconds * 1000).toLocaleTimeString() : 'N/A',
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${classDetails?.unitCode || 'attendance'}-report-${date}.csv`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedClassDetails = getSelectedClassDetails();

  return (
    <>
      <DashboardHeader title="Class Attendance" />
      <main className="p-4 sm:p-6 grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Generate Attendance QR Code</CardTitle>
            <CardDescription>
              Select a class to generate a unique QR code for student attendance
              tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="font-medium text-sm">Select an upcoming class:</p>
              <Select
                onValueChange={setSelectedClassId}
                value={selectedClassId || ''}
                disabled={isClassesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isClassesLoading
                        ? 'Loading classes...'
                        : 'Choose a class session...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {upcomingClasses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.unitCode}: {c.unitName} - {c.day} @ {c.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setIsQrVisible(true)}
              disabled={!selectedClassId}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
           <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users />
                        Live Attendance
                    </CardTitle>
                    <CardDescription>
                        {selectedClassId ? `Showing attendance for ${selectedClassDetails?.unitCode}` : "Select a class to see live attendance."}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAttendance}
                    disabled={!attendanceList || attendanceList.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
           </CardHeader>
           <CardContent>
            <div className="border rounded-lg h-96 overflow-y-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-right">Time Checked In</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isAttendanceLoading && (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        )}
                        {!isAttendanceLoading && attendanceList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                    No students have checked in yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {attendanceList?.map(att => (
                            <TableRow key={att.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            {/* In a real app, you'd fetch the student's avatar */}
                                            <AvatarFallback>{att.studentName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{att.studentName}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {att.timestamp ? new Date(att.timestamp.seconds * 1000).toLocaleTimeString() : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
           </CardContent>
        </Card>

      </main>

      <Dialog open={isQrVisible} onOpenChange={setIsQrVisible}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-headline text-center">
              {selectedClassDetails?.unitCode} Attendance
            </DialogTitle>
            <DialogDescription className="text-center">
              {selectedClassDetails?.unitName}
              <br />
              {selectedClassDetails?.day} @ {selectedClassDetails?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Image
              src={generatedQrCodeUrl()}
              alt="Attendance QR Code"
              width={200}
              height={200}
              data-ai-hint={'qr code'}
              className="rounded-lg"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Students can scan this code to mark their attendance.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

    