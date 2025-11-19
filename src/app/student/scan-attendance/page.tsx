
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsQR from 'jsqr';

export default function ScanAttendancePage() {
  const { user } = useUser();
  const { profile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const animationFrameId = useRef<number>();

  const scanFrame = useCallback(() => {
    if (!isScanning || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      return;
    }
  
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }
  
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
  
      if (code) {
        handleScanResult(code.data);
      }
    }
    
    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [isScanning]);


  const startScan = async () => {
    setIsScanning(true);
    setHasCameraPermission(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setIsScanning(false);
      }
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isScanning && hasCameraPermission) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, hasCameraPermission, scanFrame]);

  const handleScanResult = async (data: string) => {
    stopScan();
    setProcessing(true);

    if (!data.startsWith('unified-scheduler-attendance::')) {
      toast({
        variant: 'destructive',
        title: 'Invalid QR Code',
        description: 'This is not a valid attendance QR code for this system.',
      });
      setProcessing(false);
      return;
    }
    
    const classId = data.split('::')[1];

    if (!user || !firestore || !profile) {
       toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to mark attendance.',
      });
      setProcessing(false);
      return;
    }

    try {
        const classRef = doc(firestore, 'classes', classId);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
            toast({ variant: 'destructive', title: 'Invalid Class', description: 'The class specified in the QR code does not exist.' });
            setProcessing(false);
            return;
        }

        const attendanceRef = collection(firestore, 'classes', classId, 'attendance');
        await addDocumentNonBlocking(attendanceRef, {
            studentId: user.uid,
            studentName: profile.name,
            admissionNumber: profile.admissionNumber,
            timestamp: serverTimestamp(),
            status: 'Present',
        });
        toast({
            title: 'Attendance Marked!',
            description: `You have been marked present for ${classSnap.data().unitCode}.`,
            className: 'bg-green-100 text-green-800'
        });

    } catch (error) {
        console.error("Error marking attendance: ", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not mark attendance. Please try again.',
        });
    } finally {
        setProcessing(false);
    }
  };

  const handleButtonClick = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };


  return (
    <>
      <DashboardHeader title="Scan Attendance" />
      <main className="p-4 sm:p-6 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline">Scan QR Code</CardTitle>
            <CardDescription>
              Point your camera at the QR code displayed by your lecturer to mark your attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <video ref={videoRef} className={`w-full h-full object-cover ${!isScanning && 'hidden'}`} autoPlay playsInline muted onCanPlay={() => scanFrame()} />
                {!isScanning && (
                    <div className="text-center text-muted-foreground p-4">
                        <Camera className="h-12 w-12 mx-auto" />
                        <p>Camera is off. Click below to start scanning.</p>
                    </div>
                )}
             </div>

             {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please grant camera permissions in your browser settings to scan the QR code.
                  </AlertDescription>
                </Alert>
             )}

             <Button 
                onClick={handleButtonClick}
                className="w-full"
                disabled={hasCameraPermission === false || processing}
             >
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
             </Button>

            {processing && (
                 <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Processing...</AlertTitle>
                    <AlertDescription>
                        Verifying QR code and marking your attendance. Please wait.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
