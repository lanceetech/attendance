'use client';

import Logo from './logo';

interface PrintableReportProps {
  title: string;
  children: React.ReactNode;
}

/**
 * This component is designed to be used for creating a printable report.
 * It is hidden by default and will only be visible when the page is printed.
 * Use CSS with `@media print` to control the visibility and layout.
 */
export default function PrintableReport({ title, children }: PrintableReportProps) {
  return (
    <div className="printable-report-container hidden print:block">
      <header className="mb-8">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <Logo className="h-16 w-16" />
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">
                        Umma University
                    </h1>
                    <p className="text-muted-foreground">ClassSync System</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-headline font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
        <hr className="mt-4" />
      </header>
      <main>
        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Umma University. All rights reserved.</p>
      </footer>
    </div>
  );
}
