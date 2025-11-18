
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Unit } from '@/lib/data-contracts';

const formSchema = z.object({
  name: z.string().min(1, 'Unit name is required.'),
  code: z.string().min(1, 'Unit code is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

interface EditUnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitData: Unit | null;
}

export function EditUnitDialog({ isOpen, onClose, unitData }: EditUnitDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (unitData) {
      form.reset(unitData);
    } else {
      form.reset({
        name: '',
        code: '',
        description: '',
      });
    }
  }, [unitData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    
    const docRef = unitData 
      ? doc(firestore, 'units', unitData.id) 
      : doc(collection(firestore, 'units'));
    
    try {
        await setDoc(docRef, values, { merge: true });

        toast({
            title: unitData ? 'Unit Updated' : 'Unit Added',
            description: `${values.name} has been successfully saved.`,
        });
        onClose();
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Firestore Error',
            description: 'Could not save the unit data. Please try again.',
        });
        console.error(error);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{unitData ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
          <DialogDescription>
            {unitData ? 'Update the details for this course unit.' : 'Fill out the form to add a new course unit.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Code</FormLabel>
                   <FormControl>
                      <Input placeholder="e.g., CS101" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Name</FormLabel>
                   <FormControl>
                      <Input placeholder="e.g., Introduction to Computer Science" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                   <FormControl>
                      <Textarea placeholder="A brief description of the course unit..." {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Unit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
