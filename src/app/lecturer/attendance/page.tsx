"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { QrCode } from "lucide-react";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { TimetableEntry } from "@/lib/data";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function AttendancePage() {
  const { profile } = useUserProfile();
  const firestore = useFirestore();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr_code');

  const timetableQuery = useMemo(() => {
    if (!firestore || !profile) return null;
    return query(collection(firestore, "lecturerTimetable"), where("lecturer", "==", profile.name));
  }, [firestore, profile]);

  const { data: upcomingClasses, isLoading } = useCollection<TimetableEntry>(timetableQuery);

  const getSelectedClassDetails = () => {
    if (!selectedClass || !upcomingClasses) return null;
    return upcomingClasses.find(c => c.id === selectedClass);
  }

  const generatedQrCodeUrl = () => {
    const classDetails = getSelectedClassDetails();
    if(!classDetails) return qrCodeImage?.imageUrl;

    const data = `ClassSync-Attendance-${classDetails.unitCode}-${new Date().toISOString()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  }

  return (
    <>
      <DashboardHeader title="Class Attendance" />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Generate Attendance QR Code</CardTitle>
            <CardDescription>Select a class to generate a unique QR code for student attendance tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
                <p className="font-medium text-sm">Select an upcoming class:</p>
                <Select onValueChange={setSelectedClass} value={selectedClass || ""} disabled={isLoading}>
                  <SelectTrigger className="w-full max-w-sm mx-auto">
                    <SelectValue placeholder={isLoading ? "Loading classes..." : "Choose a class session..."} />
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
            
            <Button onClick={() => setIsQrVisible(true)} disabled={!selectedClass}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isQrVisible} onOpenChange={setIsQrVisible}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-headline text-center">{getSelectedClassDetails()?.unitCode} Attendance</DialogTitle>
            <DialogDescription className="text-center">
                {getSelectedClassDetails()?.unitName}<br/>
                {getSelectedClassDetails()?.day} @ {getSelectedClassDetails()?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {generatedQrCodeUrl() && (
              <Image 
                src={generatedQrCodeUrl()!} 
                alt="Attendance QR Code" 
                width={200}
                height={200}
                data-ai-hint={qrCodeImage?.imageHint || 'qr code'}
                className="rounded-lg"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">Students can scan this code to mark their attendance.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
