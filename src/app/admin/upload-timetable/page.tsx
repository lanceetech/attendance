
'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2, Database, Upload, Check, Wand2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import mockUnits from '../../../../docs/mock-units.json';
import mockClassrooms from '../../../../docs/mock-classrooms.json';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const exampleCsv = `unitCode,unitName,lecturerName,room,day,time,studentEmails
CS101,Introduction to Computer Science,Dr. Alan Grant,Room 101,Monday,08:00 - 10:00,student1@example.com;student2@example.com
MAT203,Advanced Calculus,Dr. Ian Malcolm,Room 102,Tuesday,10:00 - 12:00,student1@example.com;student3@example.com
PHY301,Quantum Physics,Dr. Ellie Sattler,Lab A,Wednesday,11:00 - 13:00,student2@example.com
ENG201,Shakespeare,Dr. John Hammond,LT-02,Monday,14:00 - 16:00,student3@example.com`;

const requiredFields = {
    unitCode: 'Unit Code',
    unitName: 'Unit Name',
    lecturerName: 'Lecturer Name',
    room: 'Room',
    day: 'Day',
    time: 'Time',
};

export default function UploadTimetablePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'select' | 'map' | 'upload'>('select');


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        
        // Preview headers for mapping
        Papa.parse(selectedFile, {
            preview: 1,
            complete: (results) => {
                const headers = (results.data[0] as string[]).filter(Boolean);
                setCsvHeaders(headers);
                // Attempt to auto-map headers
                const initialMapping: Record<string, string> = {};
                Object.keys(requiredFields).forEach(field => {
                    const foundHeader = headers.find(h => h.toLowerCase().replace(/\s/g, '') === field.toLowerCase());
                    if (foundHeader) {
                        initialMapping[field] = foundHeader;
                    }
                });
                setColumnMapping(initialMapping);
                setStep('map');
            }
        });

      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select a valid CSV file.',
        });
        setFile(null);
        setStep('select');
      }
    }
  };

  const handleFileUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }

    if (Object.values(requiredFields).some(field => !columnMapping[field as keyof typeof requiredFields])) {
        const missing = Object.entries(requiredFields).find(([key]) => !columnMapping[key]);
        toast({
            variant: 'destructive',
            title: 'Column Mapping Incomplete',
            description: `Please map the "${missing ? missing[1] : ''}" field.`,
        });
        return;
    }


    processData(file);
  }

  const handleSeedData = () => {
    processData(exampleCsv, true);
  }

  const processData = (csvSource: string | File, seedCollections = false) => {
    setIsProcessing(true);

    const parseConfig = {
      header: true,
      skipEmptyLines: true,
      transformHeader: seedCollections ? undefined : (header: string) => {
          const matchedKey = Object.keys(columnMapping).find(key => columnMapping[key] === header);
          return matchedKey || header;
      },
      complete: async (results: Papa.ParseResult<any>) => {
        if (results.errors.length) {
          toast({
            variant: 'destructive',
            title: 'CSV Parsing Error',
            description: results.errors.map(e => e.message).join(', '),
          });
          setIsProcessing(false);
          return;
        }

        if (!firestore) {
          toast({ variant: 'destructive', title: 'Firestore not available' });
          setIsProcessing(false);
          return;
        }

        const batch = writeBatch(firestore);
        const allRows = results.data;
        
        let writeCount = 0;
        const validRows = allRows.filter(row => row.unitCode && String(row.unitCode).trim() !== '');

        if (validRows.length === 0 && !seedCollections) {
            toast({
                variant: 'destructive',
                title: 'No Valid Data Found',
                description: 'The CSV file does not contain any valid rows with a unitCode.',
            });
            setIsProcessing(false);
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
                const [startHour, endHour] = String(row.time).split(' - ').map((t: string) => parseInt(t.split(':')[0]));
                
                if (isNaN(startHour) || isNaN(endHour)) {
                    console.warn("Skipping row with invalid time format:", row);
                    continue; // Skip this row
                }

                const baseDate = new Date();
                baseDate.setMinutes(0);
                baseDate.setSeconds(0);
                baseDate.setMilliseconds(0);

                const startTime = new Date(baseDate);
                startTime.setHours(startHour);

                const endTime = new Date(baseDate);
                endTime.setHours(endHour);

                const unitId = `unit-${String(row.unitCode).toLowerCase()}`;
                const lecturerId = `lecturer-${String(row.lecturerName).replace(/\s+/g, '-').toLowerCase()}`;
                const roomId = `room-${String(row.room).replace(/\s+/g, '-').toLowerCase()}`;

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
                
                const studentEmails = row.studentEmails || row.students;
                const studentIds = (studentEmails || '').split(';').filter(Boolean).map((email: string) => `student-${email.split('@')[0]}`);

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
            setFile(null);
            if(fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            setStep('select');
            setCsvHeaders([]);
            setColumnMapping({});


        } catch (error) {
            console.error(error);
            const contextualError = new FirestorePermissionError({
                path: 'batch write',
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
            setIsProcessing(false);
        }
      },
      error: (error: Error) => {
        toast({
            variant: 'destructive',
            title: 'CSV Parsing Error',
            description: error.message,
        });
        setIsProcessing(false);
      }
    };
    Papa.parse(csvSource, parseConfig);
  };

  const resetSelection = () => {
    setFile(null);
    setCsvHeaders([]);
    setColumnMapping({});
    setStep('select');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }


  return (
    <>
      <DashboardHeader title="Upload Timetable" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload & Seed Data</CardTitle>
            <CardDescription>
              Use the button below to seed the database with mock data, or upload a CSV file to add timetable entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Seed Database with Mock Data</h3>
                <p className="text-sm text-muted-foreground mb-4">Click to populate Firestore with mock classrooms, course units, and a sample timetable.</p>
                 <Button onClick={handleSeedData} disabled={isProcessing}>
                  {isProcessing ? (
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
            
            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Upload Timetable CSV</h3>
              {step === 'select' && (
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="csv-file">1. Select CSV File</Label>
                    <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                    disabled={isProcessing} 
                    />
                </div>
              )}

              {step === 'map' && file && (
                <div className="space-y-6">
                    <Alert>
                        <Wand2 className="h-4 w-4" />
                        <AlertTitle>Map Your Columns</AlertTitle>
                        <AlertDescription>
                            Match the columns from your CSV file to the required timetable fields. We've tried to guess for you.
                        </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                        {Object.entries(requiredFields).map(([key, label]) => (
                            <div key={key} className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor={`map-${key}`}>{label}</Label>
                                <Select
                                    value={columnMapping[key] || ''}
                                    onValueChange={(value) => setColumnMapping(prev => ({...prev, [key]: value}))}
                                >
                                    <SelectTrigger id={`map-${key}`}>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {csvHeaders.map((header, index) => (
                                            <SelectItem key={`${header}-${index}`} value={header}>{header}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleFileUpload} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm & Upload
                          </>
                        )}
                        </Button>
                        <Button variant="ghost" onClick={resetSelection} disabled={isProcessing}>
                            Cancel
                        </Button>
                    </div>

                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
