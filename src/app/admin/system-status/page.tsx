import { DashboardHeader } from "@/components/dashboard-header";
import { users } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

const services = [
  { name: "Authentication Service", status: "Operational", icon: CheckCircle, color: "text-green-500" },
  { name: "Database Service", status: "Operational", icon: CheckCircle, color: "text-green-500" },
  { name: "AI Conflict Resolver", status: "Operational", icon: CheckCircle, color: "text-green-500" },
  { name: "QR Code Generation", status: "Degraded Performance", icon: AlertTriangle, color: "text-yellow-500" },
  { name: "Attendance Tracking", status: "Under Maintenance", icon: Clock, color: "text-blue-500" },
];

export default function SystemStatusPage() {
  const currentUser = users.admin;

  return (
    <>
      <DashboardHeader title="System Status" user={currentUser} />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Live Service Status</CardTitle>
            <CardDescription>
              Monitor the real-time status of all application services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <service.icon className={`h-6 w-6 ${service.color}`} />
                    <span className="font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                    <p className={`font-semibold ${service.color}`}>{service.status}</p>
                </div>
              </div>
            ))}
             <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Last checked: {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
