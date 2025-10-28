
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, Database } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import mockUnits from '../../../../docs/mock-units.json';
import mockClassrooms from '../../../../docs/mock-classrooms.json';


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

  const handleCsvUpload = () => {
    if (!csvData.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'CSV data cannot be empty.',
      });
      return;
    }
    processData(csvData);
  }

  const handleSeedData = () => {
    processData(exampleCsv, true);
  }

  const processData = (csvContent: string, seedCollections = false) => {
    setIsUploading(true);

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
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
        
        let writeCount = 0;
        const validRows = allRows.filter(row => row.unitCode && row.unitCode.trim() !== '');

        if (validRows.length === 0 && !seedCollections) {
            toast({
                variant: 'destructive',
                title: 'No Valid Data Found',
                description: 'The CSV file does not contain any valid rows with a unitCode.',
            });
            setIsUploading(false);
            return;
        }

        try {
            if (seedCollections) {
              mockUnits.units.forEach(unit => {
                const unitRef = doc(firestore, `units/unit-${unit.code.toLowerCase()}`);
                batch.set(unitRef, unit);
                writeCount++;
              });
              mockClassrooms.classrooms.forEach(classroom => {
                const roomRef = doc(firestore, `classrooms/room-${classroom.name.replace(/\s+/g, '-').toLowerCase()}`);
                batch.set(roomRef, classroom);
                writeCount++;
              });
            }


            for (const row of validRows) {
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
                writeCount++;

                const lecturerTimetableRef = doc(collection(firestore, 'lecturerTimetable'));
                batch.set(lecturerTimetableRef, classData);
                writeCount++;
                
                // A real app would look up student IDs from emails
                const studentIds = (row.studentEmails || '').split(';').filter(Boolean).map((email: string) => `student-${email.split('@')[0]}`);
                if (studentIds.length > 0) {
                    const studentTimetableRef = doc(collection(firestore, 'studentTimetable'));
                    batch.set(studentTimetableRef, { ...classData, studentIds });
                    writeCount++;
                }
            }
            
            await batch.commit();

            toast({
                title: 'Upload Successful',
                description: `Successfully processed ${writeCount} documents.`,
            });
            setCsvData('');

        } catch (error) {
            const contextualError = new FirestorePermissionError({
                path: 'batch write', // Path is indicative for batch operations
                operation: 'write',
                requestResourceData: { 
                    message: `Batch write failed for ${validRows.length} documents.`,
                    sampleData: validRows.length > 0 ? validRows[0] : null
                },
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({
                variant: 'destructive',
                title: 'Firestore Write Error',
                description: 'Could not save timetable data. Check if data is valid and you have permissions.',
            });
        } finally {
            setIsUploading(false);
        }
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
            <CardTitle className="font-headline">Upload & Seed Data</CardTitle>
            <CardDescription>
              Use the button below to seed the entire database with mock data, including classrooms, units, and timetable entries.
              Alternatively, paste CSV data to bulk-upload timetable entries.
              <Button variant="link" className="p-1 h-auto" onClick={() => setCsvData(exampleCsv)}>
                Load example timetable data
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Seed Database</h3>
                <p className="text-sm text-muted-foreground mb-4">Click to populate Firestore with mock classrooms, course units, and timetable entries from the example data.</p>
                 <Button onClick={handleSeedData} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Seed Mock Data
                    </>
                  )}
                </Button>
            </div>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Upload Timetable CSV</h3>
              <Textarea
                placeholder="Paste CSV content here..."
                className="min-h-[250px] font-mono text-sm"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <Button onClick={handleCsvUpload} disabled={isUploading}>
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
