
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const adminEmail = 'admin@classsync.app';
const adminPassword = 'password123';

export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('user');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAdminSetup = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again in a moment.',
      });
      return false;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;
      const adminAvatar = PlaceHolderImages.find(img => img.id === 'umma_logo_avatar');
      
      const profileData = {
          uid: user.uid,
          name: 'Admin User',
          email: adminEmail,
          role: 'admin' as const,
          avatar: adminAvatar?.id
      };
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, profileData);
      return true; // Setup was successful
    } catch (createError: any) {
        toast({
            variant: 'destructive',
            title: 'Admin Setup Failed',
            description: 'Could not create the default administrator account.',
        });
        return false;
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again in a moment.',
      });
      return;
    }

    const emailToSignIn = activeTab === 'admin' ? adminEmail : values.email;

    signInWithEmailAndPassword(auth, emailToSignIn, values.password)
    .then((userCredential) => {
        // The AuthProvider will handle redirection
    })
    .catch(async (error: any) => {
        console.error('Authentication failed:', error);
        
        // Special handling for first-time admin login
        if (activeTab === 'admin' && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
             toast({
                title: 'Setting up Admin Account...',
                description: 'First-time admin login. Creating default account.',
            });
            const setupSuccess = await handleAdminSetup();
            if (setupSuccess) {
                // Try signing in again after setup
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            }
            return;
        }

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

  const onTabChange = (value: string) => {
    setActiveTab(value);
    form.reset(); // Reset form when switching tabs
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="user">User</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
      </TabsList>
      <div className="space-y-4 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      {...field}
                      value={activeTab === 'admin' ? adminEmail : field.value}
                      disabled={activeTab === 'admin'}
                    />
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
                    <Input 
                      type="password" 
                      placeholder={activeTab === 'admin' ? "Default is 'password123'" : "••••••••"}
                      {...field} 
                    />
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
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
         <Button variant="outline" className="w-full" asChild>
          <Link href="/signup">Create an Account</Link>
        </Button>
      </div>
    </Tabs>
  );
}
