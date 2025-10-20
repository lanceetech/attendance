import { DashboardHeader } from "@/components/dashboard-header";
import ResolveConflictsClient from "@/components/resolve-conflicts-client";
import { users } from "@/lib/data";

export default function ResolveConflictsPage() {
  const currentUser = users.admin;

  return (
    <>
      <DashboardHeader title="Resolve Schedule Conflicts" user={currentUser} />
      <main className="p-4 sm:p-6">
        <ResolveConflictsClient />
      </main>
    </>
  );
}
