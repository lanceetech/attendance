
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const exampleCsv = `unitId,lecturerId,lecturerName,roomId,day,time,unitCode,unitName,room,studentIds
unit-001,lec-001,Dr. Alan Grant,room-001,Monday,08:00 - 10:00,CS101,Introduction to Computer Science,Room 101,student-001;student-002
unit-002,lec-002,Dr. Ian Malcolm,room-002,Tuesday,10:00 - 12:00,MAT203,Advanced Calculus,Room 102,student-001;student-003`;

export default function UploadTimetablePage() {
  const [csvData, setCsvData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'CSV data cannot be empty.',
      });
      return;
    }

    setIsUploading(true);

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          toast({
            variant: 'destructive',
            title: 'CSV Parsing Error',
            description: results.errors.map(e => e.message).join(', '),
          });
          setIsUploading(false);
          return;
        }

        if (!firestore) {
          toast({ variant: 'destructive', title: 'Firestore not available' });
          setIsUploading(false);
          return;
        }

        const batch = writeBatch(firestore);
        const allRows = results.data as any[];

        for (const row of allRows) {
            const [startHour, endHour] = row.time.split(' - ').map((t: string) => parseInt(t.split(':')[0]));
            
            const baseDate = new Date();
            baseDate.setMinutes(0);
            baseDate.setSeconds(0);
            baseDate.setMilliseconds(0);

            const startTime = new Date(baseDate);
            startTime.setHours(startHour);

            const endTime = new Date(baseDate);
            endTime.setHours(endHour);

            const classData = {
              unitId: row.unitId,
              lecturerId: row.lecturerId,
              lecturerName: row.lecturerName,
              roomId: row.roomId,
              day: row.day,
              time: row.time,
              unitCode: row.unitCode,
              unitName: row.unitName,
              room: row.room,
              startTime: Timestamp.fromDate(startTime),
              endTime: Timestamp.fromDate(endTime),
            };

            const classRef = doc(collection(firestore, 'classes'));
            batch.set(classRef, classData);

            const lecturerTimetableRef = doc(collection(firestore, 'lecturerTimetable'));
            batch.set(lecturerTimetableRef, classData);
            
            const studentIds = (row.studentIds || '').split(';').filter(Boolean);
            if (studentIds.length > 0) {
                const studentTimetableRef = doc(collection(firestore, 'studentTimetable'));
                batch.set(studentTimetableRef, { ...classData, studentIds });
            }
        }
        
        batch.commit()
            .then(() => {
                toast({
                    title: 'Upload Successful',
                    description: `Successfully processed ${results.data.length} timetable entries.`,
                });
                setCsvData('');
            })
            .catch((error) => {
                const contextualError = new FirestorePermissionError({
                    path: 'batch write', // Path is indicative for batch operations
                    operation: 'write',
                    requestResourceData: { 
                        message: `Batch write failed for ${allRows.length} documents.`,
                        sampleData: allRows.length > 0 ? allRows[0] : null
                    },
                });
                errorEmitter.emit('permission-error', contextualError);
                toast({
                    variant: 'destructive',
                    title: 'Firestore Error',
                    description: 'Could not save timetable data. Check console for details.',
                });
            })
            .finally(() => {
                setIsUploading(false);
            });

      },
      error: (error) => {
        toast({
            variant: 'destructive',
            title: 'CSV Parsing Error',
            description: error.message,
        });
        setIsUploading(false);
      }
    });
  };

  return (
    <>
      <DashboardHeader title="Upload Timetable" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Spreadsheet Data</CardTitle>
            <CardDescription>
              Paste data from a spreadsheet (in CSV format) to bulk-upload the timetable. Ensure the column headers match the required format.
              <Button variant="link" className="p-1 h-auto" onClick={() => setCsvData(exampleCsv)}>
                Load example data
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste CSV content here..."
              className="min-h-[250px] font-mono text-sm"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              disabled={isUploading}
            />
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload and Process Timetable
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
