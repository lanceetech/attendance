
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
import { doc, setDoc } from 'firebase/firestore';
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
    .then((userCredential) => {
        router.push('/dashboard');
    })
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
      router.push('/dashboard');
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
            await setDoc(userDocRef, profileData, { merge: true });
            router.push('/dashboard');
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
              description: 'Could not sign in as administrator.',
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
