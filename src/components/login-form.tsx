
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again in a moment.',
      });
      return;
    }

    signInWithEmailAndPassword(auth, values.email, values.password)
    .catch((error: any) => {
        console.error('Authentication failed:', error);
        let description = 'Could not sign in. Please check your credentials.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'Invalid email or password. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
          description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
        }
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description,
        });
    });
  };

  const seedSampleData = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);

    // Sample Users
    const studentAvatar = PlaceHolderImages.find(img => img.id === 'student_avatar');
    const lecturerAvatar = PlaceHolderImages.find(img => img.id === 'lecturer_avatar');

    const lecturerId = 'lec-001';
    const lecturerRef = doc(firestore, 'users', lecturerId);
    batch.set(lecturerRef, {
        uid: lecturerId,
        name: 'Dr. Evelyn Reed',
        email: 'lec.evelyn.reed@classsync.app',
        role: 'lecturer',
        avatar: lecturerAvatar?.id
    });

    const studentId = 'stu-001';
    const studentRef = doc(firestore, 'users', studentId);
    batch.set(studentRef, {
        uid: studentId,
        name: 'Sam Carter',
        email: 'stu.sam.carter@classsync.app',
        role: 'student',
        avatar: studentAvatar?.id
    });
    
    // Sample Classrooms
    const room1Ref = doc(firestore, "classrooms", "room-101");
    batch.set(room1Ref, { name: "Room 101", capacity: 50, status: "Available" });
    const room2Ref = doc(firestore, "classrooms", "room-102");
    batch.set(room2Ref, { name: "Room 102", capacity: 30, status: "Available" });
    const room3Ref = doc(firestore, "classrooms", "room-205");
    batch.set(room3Ref, { name: "Room 205", capacity: 120, status: "In Use" });
    const room4Ref = doc(firestore, "classrooms", "lab-a");
    batch.set(room4Ref, { name: "Lab A", capacity: 25, status: "Maintenance" });


    // Sample Units
    const unit1Ref = doc(firestore, "units", "cs101");
    batch.set(unit1Ref, { name: "Introduction to Computer Science", description: "Fundamentals of programming and computer science.", code: "CS101" });
    const unit2Ref = doc(firestore, "units", "mat203");
    batch.set(unit2Ref, { name: "Advanced Calculus", description: "Exploring multi-variable calculus and differential equations.", code: "MAT203" });
    const unit3Ref = doc(firestore, "units", "phy301");
    batch.set(unit3Ref, { name: "Quantum Physics", description: "The strange world of the very small.", code: "PHY301" });

    // Sample Classes
    const createClass = (id: string, day: string, time: string, unitCode: string, unitName: string, roomName: string, lecturerId: string, lecturerName: string, studentIds: string[]) => {
        const [startHour] = time.split(' - ')[0].split(':').map(Number);
        const [endHour] = time.split(' - ')[1].split(':').map(Number);
        const baseDate = new Date();
        baseDate.setMinutes(0);
        baseDate.setSeconds(0);
        baseDate.setMilliseconds(0);
        const startTime = new Date(baseDate);
        startTime.setHours(startHour);
        const endTime = new Date(baseDate);
        endTime.setHours(endHour);

        const classData = {
            id: id,
            day, time, unitCode, unitName, room: roomName,
            lecturerId, lecturerName, studentIds,
            startTime: Timestamp.fromDate(startTime),
            endTime: Timestamp.fromDate(endTime),
        };
        
        const classRef = doc(firestore, "classes", id);
        batch.set(classRef, classData);
        const lectTimetableRef = doc(firestore, "lecturerTimetable", id);
        batch.set(lectTimetableRef, classData);
        const stuTimetableRef = doc(firestore, "studentTimetable", id);
        batch.set(stuTimetableRef, classData);
    };
    
    createClass("class-001", "Monday", "08:00 - 10:00", "CS101", "Introduction to Computer Science", "Room 101", lecturerId, "Dr. Evelyn Reed", [studentId]);
    createClass("class-002", "Wednesday", "10:00 - 12:00", "MAT203", "Advanced Calculus", "Room 102", lecturerId, "Dr. Evelyn Reed", [studentId]);

    await batch.commit();
  }

  const handleAdminLogin = async () => {
    const adminEmail = 'admin@classsync.app';
    const adminPassword = 'password123';

    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again in a moment.',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error: any) {
       if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            const user = userCredential.user;
            const adminAvatar = PlaceHolderImages.find(img => img.id === 'admin_avatar');
            const profileData = {
                uid: user.uid,
                name: 'Admin User',
                email: adminEmail,
                role: 'admin' as const,
                avatar: adminAvatar?.id
            };
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, profileData);
            await seedSampleData();
             toast({
                title: 'Welcome, Administrator!',
                description: 'We have created an account for you and added some sample data.',
            });
          } catch (createError: any) {
               toast({
                  variant: 'destructive',
                  title: 'Admin Setup Failed',
                  description: 'Could not create the administrator account.',
              });
          }
       } else {
          toast({
              variant: 'destructive',
              title: 'Admin Login Failed',
              description: 'Could not sign in as administrator. Please check the console for details.',
          });
          console.error(error);
       }
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>
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
       <Button variant="outline" className="w-full" asChild>
        <Link href="/signup">Create an Account</Link>
      </Button>
      <Separator className="my-4" />
      <Button variant="secondary" className="w-full" onClick={handleAdminLogin}>
        Sign In as Administrator
      </Button>
    </div>
  );
}

    