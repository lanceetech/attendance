
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScanLine } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['student', 'lecturer'], { required_error: 'You must select a role.' }),
  admissionNumber: z.string().optional(),
}).refine((data) => {
    if (data.role === 'student') {
        return data.admissionNumber && data.admissionNumber.length > 0;
    }
    return true;
}, {
    message: 'Admission number is required for students.',
    path: ['admissionNumber'],
});

const adminEmail = 'classSync.admin@umma.ac.ke';

export default function SignupForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      admissionNumber: '',
    },
  });

  const role = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again in a moment.',
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        const isFirstAdmin = values.email.toLowerCase() === adminEmail;
        const role = isFirstAdmin ? 'admin' : values.role;
        
        const studentAvatar = PlaceHolderImages.find(img => img.id === 'student_avatar');
        const lecturerAvatar = PlaceHolderImages.find(img => img.id === 'lecturer_avatar');
        const adminAvatar = PlaceHolderImages.find(img => img.id === 'admin_avatar');

        let avatarId;
        if (role === 'admin') {
            avatarId = adminAvatar?.id;
        } else if (role === 'lecturer') {
            avatarId = lecturerAvatar?.id;
        } else {
            avatarId = studentAvatar?.id;
        }

        const profileData: any = {
          uid: user.uid,
          name: values.name,
          email: values.email,
          role: role,
          avatar: avatarId
        };
        
        if (role === 'student') {
            profileData.admissionNumber = values.admissionNumber;
        }

        await setDoc(userDocRef, profileData, { merge: true });
        
        router.push('/onboarding');
      }
    } catch (error: any) {
      console.error('Sign-up failed:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Sign-up Failed',
          description: 'This email address is already in use. Please sign in or use a different email.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign-up Failed',
          description: error.message || 'Could not create your account. Please try again.',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a...</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === 'student' && (
             <FormField
                control={form.control}
                name="admissionNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Admission Number</FormLabel>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Input placeholder="e.g., SCI/0001/2024" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" disabled>
                            <ScanLine className="h-4 w-4" />
                            <span className="sr-only">Scan ID</span>
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}

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
            {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
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
        <Link href="/">Sign In to an Existing Account</Link>
      </Button>
    </div>
  );
}
