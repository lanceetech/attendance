import { DashboardHeader } from "@/components/dashboard-header";
import ResolveConflictsClient from "@/components/resolve-conflicts-client";

export default function ResolveConflictsPage() {

  return (
    <>
      <DashboardHeader title="Resolve Schedule Conflicts" />
      <main className="p-4 sm:p-6">
        <ResolveConflictsClient />
      </main>
    </>
  );
}
