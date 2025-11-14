
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
import { doc, setDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const adminEmail = 'classSync.admin@umma.ac.ke';
const adminPassword = 'Password123';

export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Firebase not initialized' });
      return;
    }
    setIsSubmitting(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .catch((error) => {
        let description = 'An unknown error occurred.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          description = 'Invalid email or password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
          description = 'This account does not exist. Please create an account.';
        }
        toast({ variant: 'destructive', title: 'Authentication Failed', description });
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleAdminSignIn = async () => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Firebase not initialized' });
      return;
    }
    setIsAdminSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      // AuthProvider will handle redirect
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        // First time admin login or if credentials are just wrong, try creating
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const user = userCredential.user;
          const adminAvatar = PlaceHolderImages.find(img => img.id === 'admin_avatar');
          await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            name: 'Admin User',
            email: adminEmail,
            role: 'admin',
            avatar: adminAvatar?.id
          });
          // The onAuthStateChanged listener in AuthProvider will handle the redirect.
        } catch (createError: any) {
          // This might fail if the user exists but password was wrong.
           if (createError.code === 'auth/email-already-in-use') {
             toast({ variant: 'destructive', title: 'Admin Sign-In Failed', description: 'Invalid password for the admin account.' });
           } else {
             toast({ variant: 'destructive', title: 'Admin Setup Failed', description: createError.message });
           }
        }
      } else {
        toast({ variant: 'destructive', title: 'Admin Sign-In Failed', description: error.message });
      }
    } finally {
      setIsAdminSubmitting(false);
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/signup">Create an Account</Link>
      </Button>
      <Button variant="secondary" className="w-full" onClick={handleAdminSignIn} disabled={isAdminSubmitting}>
        {isAdminSubmitting ? 'Signing In...' : 'Sign In as Administrator'}
      </Button>
    </div>
  );
}
