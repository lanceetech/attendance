
'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function ManageUsersPage() {
  return (
    <>
      <DashboardHeader title="Manage Users" />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Users</CardTitle>
            <CardDescription>
              View all student and lecturer accounts in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Feature Not Available in this Environment</AlertTitle>
              <AlertDescription>
                <p>
                  Listing all system users requires elevated administrator privileges that cannot be configured in this development environment.
                </p>
                <p className="mt-2">
                  In a production application, you would use a backend process (like a Cloud Function) to grant your admin account the necessary permissions to view all users.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
