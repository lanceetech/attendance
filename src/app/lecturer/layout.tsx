import DashboardLayout from "@/components/dashboard-layout";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="lecturer">{children}</DashboardLayout>;
}
