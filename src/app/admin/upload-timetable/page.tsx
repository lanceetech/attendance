
'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

const exampleCsv = `CODE,TITLE,LECTURER,DAY,TIME,VENUE
CS101,Intro to CS,Dr. Alan Grant,Monday,09:00 - 11:00,Room 101`;

const columnFields: Record<string, { label: string, required: boolean }> = {
    CODE: { label: 'Unit Code', required: true },
    TITLE: { label: 'Unit Name', required: true },
    LECTURER: { label: 'Lecturer Name', required: true },
    VENUE: { label: 'Room', required: true },
    DAY: { label: 'Day', required: true },
    TIME: { label: 'Time', required: true },
    studentEmails: { label: 'Student Emails (optional)', required: false },
};

const requiredFields = Object.fromEntries(Object.entries(columnFields).filter(([, val]) => val.required));

type ParsedRow = Record<string, any>;

export default function UploadTimetablePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'select' | 'map' | 'upload'>('select');


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      if (selectedFile) {
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
          previewAndMapHeaders(selectedFile, 'csv');
        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
          previewAndMapHeaders(selectedFile, 'xlsx');
        } else if (selectedFile.type === 'application/pdf') {
            toast({
              title: "PDF Upload (Coming Soon)",
              description: "Parsing timetable data from PDFs is not yet supported. Please use CSV or XLSX.",
            });
            resetSelection();
        } else {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please select a valid CSV or XLSX file.',
          });
          resetSelection();
        }
      }
    }
  };
  
  const previewAndMapHeaders = (file: File, type: 'csv' | 'xlsx') => {
      const onHeaders = (headers: string[]) => {
          const filteredHeaders = headers.filter(Boolean);
          setFileHeaders(filteredHeaders);
          
          const initialMapping: Record<string, string> = {};
          Object.keys(columnFields).forEach(fieldKey => {
              const fieldLabel = columnFields[fieldKey].label.toLowerCase().replace(/ \(.+\)/, '').replace(/\s/g, '');
              const foundHeader = filteredHeaders.find(h => {
                  const normalizedHeader = h.toLowerCase().replace(/\s/g, '');
                  return normalizedHeader === fieldKey.toLowerCase() || normalizedHeader === fieldLabel;
              });
              if (foundHeader) {
                  initialMapping[fieldKey] = foundHeader;
              }
          });

          setColumnMapping(initialMapping);
          setStep('map');
      };

      if (type === 'csv') {
          Papa.parse(file, {
              preview: 1,
              complete: (results) => onHeaders(results.data[0] as string[]),
              error: () => toast({ variant: 'destructive', title: 'Error parsing CSV headers.'})
          });
      } else if (type === 'xlsx') {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (json.length > 0) {
                    onHeaders(json[0].map(String));
                } else {
                    toast({ variant: 'destructive', title: 'Empty XLSX file', description: 'The selected file appears to be empty.' });
                    resetSelection();
                }
              } catch (error) {
                toast({ variant: 'destructive', title: 'Error reading XLSX file.' });
                resetSelection();
              }
          };
          reader.readAsArrayBuffer(file);
      }
  };


  const handleFileUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a file to upload.',
      });
      return;
    }

    const missingFields = Object.keys(requiredFields).filter(key => !columnMapping[key]);
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(key => columnFields[key].label).join(', ');
      toast({
          variant: 'destructive',
          title: 'Column Mapping Incomplete',
          description: `Please map the following required fields: ${missingLabels}.`,
      });
      return;
    }

    processData(file);
  }

  const handleSeedData = () => {
    processData(exampleCsv, true);
  }

  const processData = (source: File | string, seedCollections = false) => {
      setIsProcessing(true);

      const onParsed = async (data: ParsedRow[]) => {
        if (!firestore) {
          toast({ variant: 'destructive', title: 'Firestore not available' });
          setIsProcessing(false);
          return;
        }

        const batch = writeBatch(firestore);
        let writeCount = 0;
        const validRows = data.filter(row => {
            const mappedUnitCodeKey = columnMapping['CODE'] || 'CODE';
            return row[mappedUnitCodeKey] && String(row[mappedUnitCodeKey]).trim() !== '';
        });

        if (validRows.length === 0 && !seedCollections) {
            toast({
                variant: 'destructive',
                title: 'No Valid Data Found',
                description: 'The uploaded file does not contain any valid rows with a mapped unit code.',
            });
            setIsProcessing(false);
            return;
        }
        
        const getRowValue = (row: ParsedRow, fieldKey: string) => {
            const header = columnMapping[fieldKey];
            return header ? row[header] : undefined;
        };

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
                const timeValue = String(getRowValue(row, 'TIME') || getRowValue(row, 'time') || '');
                const [startTimeStr, endTimeStr] = timeValue.replace(/am|pm/g, '').split(/[-–]/);

                let startHour = parseInt(startTimeStr, 10);
                let endHour = parseInt(endTimeStr, 10);
                
                if (timeValue.toLowerCase().includes('pm') && endHour < 12) {
                    endHour += 12;
                }
                if (endHour < startHour) { // Handles cases like 11-2pm
                    endHour += 12;
                }
                 if (startHour < 8) { // Handles 2-5am vs 2-5pm
                    startHour += 12;
                }


                if (isNaN(startHour) || isNaN(endHour)) {
                    console.warn("Skipping row with invalid time format:", row);
                    continue; 
                }

                const baseDate = new Date();
                baseDate.setMinutes(0);
                baseDate.setSeconds(0);
                baseDate.setMilliseconds(0);

                const startTime = new Date(baseDate);
                startTime.setHours(startHour);

                const endTime = new Date(baseDate);
                endTime.setHours(endHour);

                const unitCode = getRowValue(row, 'CODE') || getRowValue(row, 'code');
                const lecturerName = getRowValue(row, 'LECTURER') || getRowValue(row, 'lecturer');
                const roomName = getRowValue(row, 'VENUE') || getRowValue(row, 'venue');
                const unitName = getRowValue(row, 'TITLE') || getRowValue(row, 'title');
                const day = getRowValue(row, 'DAY') || getRowValue(row, 'day');

                if (!unitCode || !lecturerName || !roomName || !unitName || !day) {
                    console.warn("Skipping row with missing required fields:", row);
                    continue;
                }

                const unitId = `unit-${String(unitCode).toLowerCase().replace(/\s/g, '-')}`;
                const lecturerId = `lecturer-${String(lecturerName).replace(/\s+/g, '-').toLowerCase()}`;

                const timeString = `${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;

                const classData = {
                  unitId: unitId,
                  lecturerId: lecturerId,
                  lecturerName: lecturerName,
                  roomId: `room-${String(roomName).replace(/\s+/g, '-').toLowerCase()}`,
                  day: day,
                  time: timeValue || timeString,
                  unitCode: unitCode,
                  unitName: unitName,
                  room: roomName,
                  startTime: Timestamp.fromDate(startTime),
                  endTime: Timestamp.fromDate(endTime),
                };

                const classRef = doc(collection(firestore, 'classes'));
                batch.set(classRef, classData);
                writeCount++;

                const lecturerTimetableRef = doc(collection(firestore, 'lecturerTimetable'));
                batch.set(lecturerTimetableRef, classData);
                writeCount++;
                
                const studentEmails = getRowValue(row, 'studentEmails');
                if (studentEmails) {
                    const studentIds = String(studentEmails).split(';').map(e => e.trim()).filter(Boolean).map((email: string) => `student-${email.split('@')[0]}`);
                    if (studentIds.length > 0) {
                        const studentTimetableRef = doc(collection(firestore, 'studentTimetable'));
                        batch.set(studentTimetableRef, { ...classData, studentIds });
                        writeCount++;
                    }
                }
            }
            
            await batch.commit();

            toast({
                title: 'Upload Successful',
                description: `Successfully processed ${writeCount} documents.`,
            });
            resetSelection();

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
      };
      
      const onError = (error: Error) => {
        toast({
            variant: 'destructive',
            title: 'File Parsing Error',
            description: error.message,
        });
        setIsProcessing(false);
      };

      if (typeof source === 'string') {
          Papa.parse(source, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => onParsed(results.data),
              error: onError,
          });
      } else if (source instanceof File) {
          if (source.type === 'text/csv' || source.name.endsWith('.csv')) {
              Papa.parse(source, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => onParsed(results.data),
                  error: onError
              });
          } else if (source.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || source.name.endsWith('.xlsx')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  const data = e.target?.result;
                  const workbook = XLSX.read(data, { type: 'array' });
                  const sheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[sheetName];
                  const json = XLSX.utils.sheet_to_json(worksheet);
                  onParsed(json);
              };
              reader.onerror = () => onError(new Error("Error reading XLSX file."));
              reader.readAsArrayBuffer(source);
          }
      }
  };

  const resetSelection = () => {
    setFile(null);
    setFileHeaders([]);
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
              Use the button below to seed the database with mock data, or upload a CSV/XLSX file to add timetable entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Seed Database with Mock Data</h3>
                <p className="text-sm text-muted-foreground mb-4">Click to populate Firestore with mock classrooms, course units, and a sample timetable.</p>
                 <Button onClick={handleSeedData} disabled={isProcessing}>
                  {isProcessing && !file ? (
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
              <h3 className="font-semibold text-foreground">Upload Timetable File</h3>
              {step === 'select' && (
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="timetable-file">1. Select File (.csv, .xlsx)</Label>
                    <Input 
                    id="timetable-file" 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf" 
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
                            Match the columns from your file to the required timetable fields. We've tried to guess for you.
                        </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                        {Object.entries(columnFields).map(([key, {label, required}]) => (
                            <div key={key} className="grid grid-cols-2 items-center gap-2">
                                <Label htmlFor={`map-${key}`}>{label} {required && <span className="text-destructive">*</span>}</Label>
                                <Select
                                    value={columnMapping[key] || ''}
                                    onValueChange={(value) => setColumnMapping(prev => ({...prev, [key]: value}))}
                                >
                                    <SelectTrigger id={`map-${key}`}>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="--ignore--">-- Ignore this field --</SelectItem>
                                        {fileHeaders.map((header, index) => (
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
                            Uploading...
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
