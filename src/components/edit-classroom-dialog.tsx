
'use client';

import { useEffect } from 'react';
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
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Input } from './ui/input';
import { Classroom } from '@/lib/data-contracts';

const formSchema = z.object({
  name: z.string().min(1, 'Room name is required.'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1.'),
  status: z.enum(['Available', 'In Use', 'Maintenance']),
});

const statusOptions: Classroom['status'][] = ['Available', 'In Use', 'Maintenance'];

interface EditClassroomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classroomData: Classroom | null;
}

export function EditClassroomDialog({ isOpen, onClose, classroomData }: EditClassroomDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      status: 'Available',
    },
  });

  useEffect(() => {
    if (classroomData) {
      form.reset(classroomData);
    } else {
      form.reset({
        name: '',
        capacity: 1,
        status: 'Available',
      });
    }
  }, [classroomData, form]);
  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    
    const docRef = classroomData 
      ? doc(firestore, 'classrooms', classroomData.id) 
      : doc(collection(firestore, 'classrooms'));
    
    try {
        await setDoc(docRef, values, { merge: true });

        toast({
            title: classroomData ? 'Classroom Updated' : 'Classroom Added',
            description: `${values.name} has been successfully saved.`,
        });
        onClose();
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Firestore Error',
            description: 'Could not save the classroom data. Please try again.',
        });
        console.error(error);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{classroomData ? 'Edit Classroom' : 'Add New Classroom'}</DialogTitle>
          <DialogDescription>
            {classroomData ? 'Update the details for this classroom.' : 'Fill out the form to add a new classroom.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classroom Name</FormLabel>
                   <FormControl>
                      <Input placeholder="e.g., Room 101, Lab A" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                   <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Classroom'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
