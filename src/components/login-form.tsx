"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Shield, GraduationCap } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = (role: 'admin' | 'lecturer' | 'student') => {
    // In a real app, you would handle authentication here.
    // For this demo, we'll just redirect.
    router.push(`/${role}`);
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
