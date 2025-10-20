import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/login-form';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex flex-col items-center gap-4 mb-6 text-center">
        <Logo className="h-20 w-20" />
        <div >
          <h1 className="text-4xl font-headline font-bold text-foreground">
            Umma University
          </h1>
          <p className="text-muted-foreground">Fostering Knowledge and Innovation</p>
        </div>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">ClassSync</CardTitle>
          <CardDescription>Select your role to sign in to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Umma University. All rights reserved.</p>
      </footer>
    </main>
  );
}
