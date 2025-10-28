
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

const exampleCsv = `unitCode,unitName,lecturerName,room,day,time,studentEmails
CS101,Introduction to Computer Science,Dr. Alan Grant,Room 101,Monday,08:00 - 10:00,student1@example.com;student2@example.com
MAT203,Advanced Calculus,Dr. Ian Malcolm,Room 102,Tuesday,10:00 - 12:00,student1@example.com;student3@example.com
PHY301,Quantum Physics,Dr. Ellie Sattler,Lab A,Wednesday,11:00 - 13:00,student2@example.com
ENG201,Shakespeare,Dr. John Hammond,LT-02,Monday,14:00 - 16:00,student3@example.com`;

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

            // A real app would have proper IDs, here we create them from names
            const unitId = `unit-${row.unitCode.toLowerCase()}`;
            const lecturerId = `lecturer-${row.lecturerName.replace(/\s+/g, '-').toLowerCase()}`;
            const roomId = `room-${row.room.replace(/\s+/g, '-').toLowerCase()}`;


            const classData = {
              unitId: unitId,
              lecturerId: lecturerId,
              lecturerName: row.lecturerName,
              roomId: roomId,
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
            
            // A real app would look up student IDs from emails
            const studentIds = (row.studentEmails || '').split(';').filter(Boolean).map((email: string) => `student-${email.split('@')[0]}`);
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
