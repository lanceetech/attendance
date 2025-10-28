
'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, query, setDoc, where, Timestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from './ui/input';
import { UserProfile, Unit, Classroom, Class } from '@/lib/data-contracts';

const formSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit.'),
  lecturerId: z.string().min(1, 'Please select a lecturer.'),
  roomId: z.string().min(1, 'Please select a room.'),
  day: z.string().min(1, 'Please select a day.'),
  time: z.string().min(1, 'Please enter a time slot (e.g., 09:00 - 11:00).'),
});

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface EditClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
}

export function EditClassDialog({ isOpen, onClose, classData }: EditClassDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitId: '',
      lecturerId: '',
      roomId: '',
      day: '',
      time: '',
    },
  });

  const unitsQuery = useMemo(() => firestore ? collection(firestore, 'units') : null, [firestore]);
  const roomsQuery = useMemo(() => firestore ? collection(firestore, 'classrooms') : null, [firestore]);
  const lecturersQuery = useMemo(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'lecturer')) : null, [firestore]);

  const { data: units, isLoading: unitsLoading } = useCollection<Unit>(unitsQuery);
  const { data: rooms, isLoading: roomsLoading } = useCollection<Classroom>(roomsQuery);
  const { data: lecturers, isLoading: lecturersLoading } = useCollection<UserProfile>(lecturersQuery);

  useEffect(() => {
    if (classData) {
      form.reset({
        unitId: units?.find(u => u.code === classData.unitCode)?.id || '',
        lecturerId: classData.lecturerId,
        roomId: rooms?.find(r => r.name === classData.room)?.id || '',
        day: classData.day,
        time: classData.time,
      });
    } else {
      form.reset();
    }
  }, [classData, form, units, rooms]);
  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    
    const selectedUnit = units?.find(u => u.id === values.unitId);
    const selectedLecturer = lecturers?.find(l => l.id === values.lecturerId);
    const selectedRoom = rooms?.find(r => r.id === values.roomId);

    if (!selectedUnit || !selectedLecturer || !selectedRoom) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find selected unit, lecturer, or room.',
      });
      return;
    }

    const [startHour, endHour] = values.time.split(' - ').map((t: string) => parseInt(t.split(':')[0]));
    const baseDate = new Date();
    baseDate.setMinutes(0);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    const startTime = new Date(baseDate);
    startTime.setHours(startHour);
    const endTime = new Date(baseDate);
    endTime.setHours(endHour);

    const newClassData = {
      unitId: selectedUnit.id,
      unitCode: selectedUnit.code,
      unitName: selectedUnit.name,
      lecturerId: selectedLecturer.id,
      lecturerName: selectedLecturer.name,
      roomId: selectedRoom.id,
      room: selectedRoom.name,
      day: values.day,
      time: values.time,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
    };
    
    const docRef = classData ? doc(firestore, 'classes', classData.id) : doc(collection(firestore, 'classes'));
    
    try {
        await setDoc(docRef, newClassData, { merge: true });

        // Denormalize for timetables
        const timetableData = { ...newClassData, id: docRef.id };
        const lecturerTimetableRef = doc(firestore, 'lecturerTimetable', docRef.id);
        await setDoc(lecturerTimetableRef, timetableData, { merge: true });

        // This is a simplification. A real app would need a more robust way to handle student enrollments.
        // For now, we'll just ensure the entry exists in studentTimetable.
        const studentTimetableRef = doc(firestore, 'studentTimetable', docRef.id);
        await setDoc(studentTimetableRef, timetableData, { merge: true });

        toast({
            title: classData ? 'Class Updated' : 'Class Added',
            description: `${selectedUnit.code} has been successfully scheduled.`,
        });
        onClose();
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Firestore Error',
            description: 'Could not save the class data. Please try again.',
        });
        console.error(error);
    }
  };

  const isLoading = unitsLoading || roomsLoading || lecturersLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{classData ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          <DialogDescription>
            {classData ? 'Update the details for this class.' : 'Fill out the form to schedule a new class.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select a unit"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lecturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lecturer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select a lecturer"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lecturers?.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classroom</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select a room"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms?.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} (Capacity: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of the Week</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 09:00 - 11:00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Class'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
