"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Shield, GraduationCap } from "lucide-react";
import { useAuth } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore }from "@/firebase";

export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleLogin = async (role: 'admin' | 'lecturer' | 'student') => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      if (user && firestore) {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          role: role,
          email: user.email,
          name: `Anonymous ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        }, { merge: true });
      }

      router.push(`/${role}`);
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleLogin('admin')}
        className="w-full"
        variant="outline"
      >
        <Shield className="mr-2 h-4 w-4" />
        Sign in as Administrator
      </Button>
      <Button
        onClick={() => handleLogin('lecturer')}
        className="w-full"
        variant="outline"
      >
        <User className="mr-2 h-4 w-4" />
        Sign in as Lecturer
      </Button>
      <Button
        onClick={() => handleLogin('student')}
        className="w-full"
      >
        <GraduationCap className="mr-2 h-4 w-4" />
        Sign in as Student
      </Button>
    </div>
  );
}
