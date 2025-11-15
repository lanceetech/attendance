import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'ClassSync: Smart Academic Scheduler & Attendance System',
  description: 'Manage and resolve timetable conflicts, track attendance with QR codes, and monitor classroom status.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3182CE" />
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <FirebaseClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
